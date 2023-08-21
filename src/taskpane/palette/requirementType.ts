import { cacheResponse, readResponse } from "./data/cache";
import { fetchChat } from "./gptAPI";

export enum RequirementType {
  Style = "style",
  SpecificObject = "specificObject",
  Emotion = "emotion",
  SpecificAction = "specificAction",
}

export interface RequirementInfo {
  colorChangingPlan: "refine" | "new";
  explanation: string;
  requirementType: RequirementType;
}

export default async function getRequirementInfo(requirement: string, openAIKey: string, useCache = true) {
  const prompt = `A customer comes to me with a chart, but the colors in it is far from good. He said 'I do not like the colors. ${requirement}'. 
Just considering this requirement, do you think the customer wants us to tweak the existing colors or create a new color palette purely based on the requirement?
At the same time, do you think the customer wants us to modify the colors based on a certain style or a specific object, or to evoke a certain emotion with the colors, or to perform some specific actions related to the colors?

There are few shots:
The chart is too dark: {"colorChangingPlan": "refine", "requirementType": "specificAction"};
Make it more professional: {"colorChangingPlan": "refine", "requirementType": "style"};
I think the figures should be more cartoon-style but not to industrial:{"colorChangingPlan": "new", "requirementType": "style"};
I hope the color of this chart is similar to that of the logo of Microsoft:{"colorChangingPlan": "new", "requirementType": "object"};
reflect sad mood: {"colorChangingPlan": "new", "requirementType": "emotion"};

Let us work this out in a step by step way to be sure we have the right answer.
Please give the answer as an json object in the following format, and nothing else:
{
    "colorChangingPlan": "refine" | "new",
    "requirementType": "style" | "specificObject" | "emotion" | "specificAction",
}`;
  let result: string;
  if (useCache) {
    result = readResponse(prompt) ?? (await fetchChat(prompt, openAIKey));
    if (!readResponse(prompt)) cacheResponse(prompt, result);
  } else {
    result = await fetchChat(prompt, openAIKey);
    cacheResponse(prompt, result);
  }
  const jsonStart = result.indexOf("{");
  const jsonEnd = result.lastIndexOf("}");
  const json = result.substring(jsonStart, jsonEnd + 1);
  const data = JSON.parse(json) as RequirementInfo;
  return data;
}
