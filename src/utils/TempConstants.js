// src/utils/Constants.js

// Default welcome message for new sessions
export const WELCOME_MESSAGE = {
  id: 1,
  text: "Hello! I'm here to listen and support you. What would you like to talk about today?",
  isUser: false,
};

// Default error message when AI fails
export const ERROR_MESSAGE = {
  text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
  isUser: false,
};

// Utility function to generate a timestamp
export const getTimestamp = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
