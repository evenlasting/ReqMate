/* eslint-disable no-redeclare */
import { cacheResponse, readResponse } from "./data/cache";
import { IPaletteExample, findBestExample } from "./example";
import { fetchChat } from "./gptAPI";
import getRequirementInfo, { RequirementType } from "./requirementType";

const newIntro = `I have a chart, but I am not satisfied with its color palette. So I want to create a new and unified color palette that is completely different from the original palette.
Please generate the new color palette according to the original color palette of the chart and my requirement.
The new color palette should have the same number of unique colors as the original palette and should not include any colors from the original palette.
Please generate a new color palette that is clearly distinct from my original palette. Avoid using hues that are similar to my original colors, and aim for a combination of colors that is noticeably different from what I provided.
The colors in the new palette should also maintain the relationships between the colors in the original palette, such as the analogous relationship, complementary relationship, split-complementary relationship, etc.
For example, if two colors in the original palette are complementary, then the two corresponding colors in the new palette should also maintain the same complementary color relationship.
The colors should be carefully selected and coordinated to create a cohesive and visually pleasing scheme.
\n\n`;

const refineIntro = `I have a chart, but I am not satisfied with its color palette. So I want to create a new and unified color palette that is completely different from the original palette.
Please generate the new color palette according to the original color palette of the chart and my requirement.
The new color palette should have the same number of unique colors as the original palette, where each color in the new palette corresponds to a color in the original palette.
The new palette should maintain the same hue as the corresponding color in the original palette, but the saturation and brightness values can be adjusted.
The colors should be carefully selected and coordinated to create a cohesive and visually pleasing scheme. 
\n\n`;

const requirementDiscriptionMap = {
  style:
    "My requirements are about a specific style, such as the industrial style, which means that the colors used should be suitable for displaying industrial-related insights.",
  specificObject:
    "I am seeking a particular style, namely the Coca-Cola style, which requires the use of classic Coca-Cola colors, including red, black, and white, to represent the brand's image and identity.",
  emotion:
    "My requirements are centered around a specific emotion, such as romance, which necessitates the use of pink color tones to create a soft, intimate, and passionate atmosphere.",
  specificAction:
    "The focus of my requirements is on specific instructions, such as increasing contrast, which involves elevating the color saturation of the original color palette to make it more visually appealing and eye-catching.",
};

const intros = {
  new: newIntro,
  refine: refineIntro,
};

const generateRequirementJson = (requirement: string, colorsList: string[], requirementType: RequirementType) => {
  return `{
    "originalColorPalette": "${colorsList.join(", ")}", 
    requirement:"${requirement}", 
    requirementType:"${requirementType}",
    newColorPalette:"", //${colorsList.length} unique colors are needed here
  }`;
};

export async function gptPalette(requirement: string, colors: string[], openAIKey: string): Promise<string[][]> {
  const requirementInfo = await getRequirementInfo(requirement, openAIKey);
  const type = requirementInfo.colorChangingPlan;
  const requirementType = requirementInfo.requirementType;
  // const requirementDiscription = ""; //requirementDiscriptionMap[requirementType];
  const requirementDiscription = requirementDiscriptionMap[requirementType];

  const examples = await findBestExample(requirement, type, requirementType, openAIKey);
  let sample = "There are few shots:";
  for (const ex of examples) {
    sample += stringifyExample(ex);
  }
  sample += "Now help me to solve the following question in the json object.";
  const requirementIntro =
    // `Let us work this out in a step by step way to be sure we have the right answer.` +
    `Please give the answer as an json object in the following format, and nothing else:` +
    generateRequirementJson(requirement, colors, requirementType);
  const resultList = await getResult(intros[type] + requirementDiscription + sample + requirementIntro, openAIKey);
  const colorList = resultList
    .map((result) => {
      const json = collectJson(result);
      if (!json) return null;
      return collectHexColors(JSON.stringify(json["newColorPalette"]));
    })
    .filter((color) => !!color);
  return colorList;
}

export const split_char = "+++";

async function getResult(prompt: string, openAIKey: string): Promise<string[]> {
  debugger
  let result = readResponse(prompt);
  if (result) {
    return result.split(split_char);
  } else {
    const resultList = await fetchChat(prompt, openAIKey, 5);
    cacheResponse(prompt, resultList.join(split_char));
    return resultList;
  }
}

function collectHexColors(text: string): string[] {
  const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
  const hexColors = text.match(hexRegex);
  return hexColors || [];
}

function collectJson(text: string): object {
  const rE = /{([^{}]+)}/;
  try {
    const json = text.match(rE)[0];
    const result = JSON.parse(json);
    return result;
  } catch (error) {
    return null;
    // no legal json
  }
}

function stringifyExample(ex: IPaletteExample): string {
  let sample = "";
  sample += `Original color palette: ${ex.oldColors.join(", ")}\n`;
  sample += `Requirement: ${ex.query}\n`;
  sample += `New color palette: ${ex.newColors ? ex.newColors.join(", ") : ""}\n\n`;
  return sample;
}
