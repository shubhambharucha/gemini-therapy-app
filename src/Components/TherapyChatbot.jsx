// src/Components/TherapyChatbot.jsx
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { getGeminiResponse } from "../gemini";

// ✅ lowercase import to match your file
import { WELCOME_MESSAGE, ERROR_MESSAGE } from "../utils/Constants";

const TherapyChatbot = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);

    try {
      const response = await getGeminiResponse(text);

      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);

      const errorMessage = {
        id: Date.now() + 2,
        text: ERROR_MESSAGE,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-8 pb-32 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isUser={msg.isUser} />
          ))}
          {loading && <TypingIndicator />}
        </div>
      </div>

      {/* Input - Fixed at bottom */}
      <div className={`fixed bottom-20 left-0 right-0 backdrop-blur-xl border-t px-4 py-3 md:bottom-0 md:px-6 md:py-4 z-40 ${
        isDark 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-white/95 border-gray-200/50'
      }`}>
        <div className="max-w-4xl mx-auto">
          <MessageInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default TherapyChatbot;
