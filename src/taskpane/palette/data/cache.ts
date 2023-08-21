import * as CryptoJS from "crypto-js";
// import embedding from "../data/example.embedding";

/*global localStorage*/
/* global console*/

// const entries = Object.entries(embedding);
// for (const [key, value] of entries) {
//   localStorage.setItem(key, JSON.stringify(value));
// }
// exceeded the quota

function hashcode(text: string): string {
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Base64);
}

export function cacheResponse(prompt: string, result: string): void {
  const hash = hashcode(prompt);
  localStorage.setItem(hash, result);
  console.log("write cache: " + result);
}

export function cachEmbedding(query: string, value: number[]) {
  const hash = hashcode(query);
  localStorage.setItem(hash, JSON.stringify(value));
  console.log("write cache: " + query);
}

export function readResponse(prompt: string): string | null {
  const hash = hashcode(prompt);
  const response = localStorage.getItem(hash);
  return response ? response : null;
}

export function readEmbedding(query: string): number[] | null {
  const hash = hashcode(query);
  const embedding = localStorage.getItem(hash);
  return embedding ? JSON.parse(embedding) : null;
}
