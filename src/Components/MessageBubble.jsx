import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "../contexts/ThemeContext";

const MessageBubble = ({ message, isUser, timestamp }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] md:max-w-2xl px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-blue-500 text-white"
            : isDark
              ? "bg-gray-800 text-gray-100 border border-gray-700 shadow-sm"
              : "bg-white text-gray-900 border border-gray-200/50 shadow-sm"
        }`}>
        <div className="prose prose-sm max-w-none text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.text}
          </ReactMarkdown>
        </div>
        <p className={`text-xs mt-2 opacity-60 ${
          isUser 
            ? "text-blue-100" 
            : isDark 
              ? "text-gray-400" 
              : "text-gray-500"
        }`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
