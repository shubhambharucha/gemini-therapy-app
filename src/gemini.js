import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Use the latest text-capable model
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Store conversation history for context
let conversationHistory = [];

export async function getGeminiResponse(userMessage) {
  try {
    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: userMessage });

    // Create a comprehensive therapeutic prompt
    const systemPrompt = `You are Dr. Sarah, a warm, empathetic, and experienced licensed therapist. Your role is to provide emotional support, active listening, and gentle guidance to people seeking help.

Key characteristics of your therapeutic approach:
- Always respond with genuine empathy and warmth
- Use "I" statements and validate the person's feelings
- Ask thoughtful, open-ended questions to encourage reflection
- Avoid giving direct advice; instead, guide them to discover their own insights
- Use a conversational, supportive tone - not clinical or cold
- Acknowledge their courage in sharing
- Be patient and non-judgmental
- Focus on their strengths and resilience
- Keep responses concise but meaningful (2-4 sentences typically)

Remember: You're having a real conversation with someone who may be struggling. Be human, be present, and be caring.

Previous conversation context: ${conversationHistory.slice(-6).map(msg => 
  `${msg.role === 'user' ? 'User' : 'Therapist'}: ${msg.content}`
).join('\n')}

Current user message: ${userMessage}

Respond as Dr. Sarah with empathy and therapeutic insight:`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();

    // Add therapist response to conversation history
    conversationHistory.push({ role: "assistant", content: response });

    // Keep conversation history manageable (last 20 messages)
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    return response;
  } catch (error) {
    console.error("Gemini API error details:", error);
    return `I'm sorry, I'm experiencing some technical difficulties right now. Please know that I'm here for you, and we can continue our conversation once this is resolved. How are you feeling about what we were discussing?`;
  }
}

// Function to reset conversation history (useful for new sessions)
export function resetConversationHistory() {
  conversationHistory = [];
}
