/* eslint-disable no-redeclare */
import { OpenAI, OpenAIClient } from "@fern-api/openai";

/* global fetch*/

const embeddingEnd = "http://msra-sa-35:8321/embed";
const chatEnd = "http://msra-sa-35:8321/chat";

function postRequest(data: any): RequestInit {
  return {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
}

export async function msraEmbedding(text: string): Promise<number[]> {
  const response = await fetch(embeddingEnd, postRequest({ text }));
  const result = (await response.json()) as OpenAI.CreateEmbeddingResponse;
  return result.data[0].embedding;
}

export async function msraChat(prompt: string): Promise<string>;
export async function msraChat(prompt: string, count: number): Promise<string[]>;
export async function msraChat(prompt: string, count?: number): Promise<string | string[]> {
  if (typeof count === "undefined") {
    return (await realChat(prompt, 1))[0];
  } else {
    if (count < 1) {
      throw "count is less than 1";
    }
    return realChat(prompt, count);
  }
}

async function realChat(text: string, count: number = 5): Promise<string[]> {
  const response = await fetch(chatEnd, postRequest({ text, count }));
  var result = (await response.json()) as OpenAI.CreateChatCompletionResponse;
  return result.choices.map((c) => c.message.content);
}

export async function fetchEmbedding(value: string, openAIKey: string): Promise<number[]> {
  if (!openAIKey.startsWith("sk-")) {
    return msraEmbedding(value);
  }
  const client = new OpenAIClient({ token: openAIKey });

  const result = await client.embedding.create({
    model: "text-embedding-ada-002",
    input: value,
  });
  return result.data[0].embedding;
}

export async function fetchChat(prompt: string, openAIKey: string): Promise<string>;
export async function fetchChat(prompt: string, openAIKey: string, count: number): Promise<string[]>;
export async function fetchChat(prompt: string, openAIKey: string, count?: number): Promise<string | string[]> {
  if (!openAIKey.startsWith("sk-")) {
    return count ? msraChat(prompt, count) : msraChat(prompt);
  }
  if (typeof count === "undefined") {
    return (await fetchReply(prompt, openAIKey, 1))[0];
  } else {
    if (count < 1) {
      throw "count is less than 1";
    }
    return fetchReply(prompt, openAIKey, count);
  }
}

async function fetchReply(question: string, openAIKey: string, count: number = 5): Promise<string[]> {
  const model = "gpt-3.5-turbo";
  const client = new OpenAIClient({ token: openAIKey });

  const result = await client.chat.createCompletion({
    model,
    messages: [
      {
        role: OpenAI.AuthorRole.System,
        content:
          "You are a professional powerpoint designer and good at single page style designs, and willing to help people with questions about single page style design.",
      },
      {
        role: OpenAI.AuthorRole.User,
        content: question,
      },
    ],
    maxTokens: 1000,
    n: count,
  });
  return result.choices.map((choice) => choice.message.content);
}
