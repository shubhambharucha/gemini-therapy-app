// src/utils/Constants.js

// Default welcome message for new sessions
export const WELCOME_MESSAGE = {
  id: 1,
  text: "Hello, I'm Dr. Sarah. I'm here to listen and support you in a safe, judgment-free space. What would you like to talk about today?",
  isUser: false,
};

// Default error message when AI fails
export const ERROR_MESSAGE = {
  text: "I'm experiencing some technical difficulties right now, but please know that I'm still here for you. Your feelings and what you're sharing matter deeply to me. Let's try again in just a moment - I don't want to miss anything important you have to say.",
  isUser: false,
};

// Utility function to generate a timestamp
export const getTimestamp = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
