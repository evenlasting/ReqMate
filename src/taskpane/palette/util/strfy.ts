const stringOrChar = /("(?:[^\\"]|\\.)*")|[:,]/g;

export interface StringfyOption {
  indent?: number | string;
  maxLength?: number;
  replacer?: ((this: any, key: string, value: any) => any) | (number | string)[];
  forceLine?: (path: string[]) => boolean;
  chunkArray?: (path: string[]) => number;
}

function convertBack(str: string): string {
  return str.replace(stringOrChar, (match, stringLiteral) => {
    return stringLiteral || `${match} `;
  });
}

export default function stringify(passedObj: any, options: StringfyOption = {}) {
  const indent = JSON.stringify([1], undefined, options.indent === undefined ? 2 : options.indent).slice(2, -3);

  const maxLength = indent === "" ? Infinity : options.maxLength === undefined ? 80 : options.maxLength;

  let { replacer } = options;

  return (function _stringify(obj, currentIndent, reserved, path: string[]): string {
    if (obj && typeof obj.toJSON === "function") {
      obj = obj.toJSON();
    }

    const str = JSON.stringify(obj, replacer as any);

    if (str === undefined) {
      return str;
    }

    const length = maxLength - currentIndent.length - reserved;

    const forceline = options.forceLine ? options.forceLine(path) : false;
    if (str.length <= length || forceline) {
      const prettified = convertBack(str);
      if (prettified.length <= length || forceline) {
        return prettified;
      }
    }

    if (replacer != null) {
      obj = JSON.parse(str);
      replacer = undefined;
    }

    if (typeof obj === "object" && obj !== null) {
      const nextIndent = currentIndent + indent;
      const items = [];
      let index = 0;
      let start;
      let end;

      if (Array.isArray(obj)) {
        start = "[";
        end = "]";
        const { length } = obj;
        if (options.chunkArray?.(path)) {
          const chunkSize = options.chunkArray?.(path);
          for (let i = 0; i < obj.length; i += chunkSize) {
            const chunk = obj.slice(i, i + chunkSize);
            const str = convertBack(JSON.stringify(chunk));
            items.push(str.substring(1, str.length - 1));
          }
        } else {
          for (; index < length; index++) {
            const newPath = [...path, index.toString()];
            items.push(_stringify(obj[index], nextIndent, index === length - 1 ? 0 : 1, newPath) || "null");
          }
        }
      } else {
        start = "{";
        end = "}";
        const keys = Object.keys(obj);
        const { length } = keys;
        for (; index < length; index++) {
          const key = keys[index];
          const keyPart = `${JSON.stringify(key)}: `;
          const newPath = [...path, key];
          const value = _stringify(obj[key], nextIndent, keyPart.length + (index === length - 1 ? 0 : 1), newPath);
          if (value !== undefined) {
            items.push(keyPart + value);
          }
        }
      }

      if (items.length > 0) {
        return [start, indent + items.join(`,\n${nextIndent}`), end].join(`\n${currentIndent}`);
      }
    }
    return str;
  })(passedObj, "", 0, []);
}
