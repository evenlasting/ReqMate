import { fetchChat } from "./gptAPI";

// const comment = `I like a professional style.`;
const comment = `I like it to be more professional.`;
// const comment = `Please make it more bright.`;
// const comment = `Please make it like Microsoft logo`;
const prompt = `A customer comes to me with a chart, but the colors in it is far from good. He said 'I do not like the colors. ${comment}'. 
Just considering this requirement, do you think the customer wants us to tweak the existing colors or create a new color palette purely based on the requirement?
At the same time, do you think the customer wants us to modify the colors based on a certain style or a specific object, or to evoke a certain emotion with the colors, or to perform some specific actions related to the colors?
Let us work this out in a step by step way to be sure we have the right answer.
Please give the answer as an json object in the following format, and nothing else:
{
    "color changing plan": "improve" | "brand new",
    "explanation": ,//reason for the answer
    "requirementType": "style" | "specificObject" | "emotion" | "specificAction",
}`;

// (async () => {
//   const answer = await fetchChat(prompt);
//   console.log(answer);
// })();
