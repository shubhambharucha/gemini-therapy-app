import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Use the latest text-capable model
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getGeminiResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error details:", error);
    return `Error: ${error.message || "Something went wrong"}`;
  }
}
