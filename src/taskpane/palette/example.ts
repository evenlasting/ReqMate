import { fetchEmbedding } from "./gptAPI";
import brandnewJson from "./data/example.brandnew";
import refinementJson from "./data/example.refinement";
import embedJson from "./data/example.embedding";
import { cachEmbedding, readEmbedding } from "./data/cache";
import { RequirementType } from "./requirementType";
import exampleEmbedding from "./data/example.embedding";

const minExampleNum = 3;

export interface IPaletteExample {
  query: string;
  oldColors: string[];
  newColors?: string[];
  requirementType: number;
}

const requirementTypeValueMap = {
  style: 0,
  specificObject: 1,
  emotion: 2,
  specificAction: 3,
};

export async function findBestExample(
  query: string,
  type: "new" | "refine",
  queryType: RequirementType,
  openAIKey: string
): Promise<IPaletteExample[]> {
  const embeddingType = requirementTypeValueMap[queryType];
  let inputEmbedding = readEmbedding(query) ?? exampleEmbedding[query];
  if (!inputEmbedding) {
    inputEmbedding = await fetchEmbedding(query, openAIKey);
    cachEmbedding(query, inputEmbedding);
  }

  const array = [] as { query: string; distance: number }[];
  for (const [exampleQuery, exampleEmbedding] of Object.entries(embedJson)) {
    const dist = distance(inputEmbedding, exampleEmbedding);
    array.push({ query: exampleQuery, distance: dist });
  }
  const examples = (type === "new" ? brandnewJson : refinementJson).filter(
    (example) => example.requirementType === embeddingType
  ) as IPaletteExample[];
  const sortedArray = array.sort((a, b) => b.distance - a.distance).map((v) => v.query);
  const result = [] as IPaletteExample[];
  for (const query of sortedArray) {
    for (const hitExample of examples.filter((e) => e.query === query)) {
      result.push(hitExample);
      if (result.length >= minExampleNum) {
        return result;
      }
    }
  }

  return result;
  // throw "cannot find enough examples";
}

function distance(a: number[], b: number[]): number {
  let sum = 0;
  for (var i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}
