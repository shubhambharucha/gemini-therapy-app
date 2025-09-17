import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const TypingIndicator = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex justify-start">
      <div className={`border rounded-2xl px-4 py-3 shadow-sm ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200/50'
      }`}>
        <div className="flex space-x-1">
          <div className={`w-2 h-2 rounded-full animate-bounce ${
            isDark ? 'bg-gray-400' : 'bg-gray-400'
          }`}></div>
          <div className={`w-2 h-2 rounded-full animate-bounce ${
            isDark ? 'bg-gray-400' : 'bg-gray-400'
          }`} style={{ animationDelay: '0.1s' }}></div>
          <div className={`w-2 h-2 rounded-full animate-bounce ${
            isDark ? 'bg-gray-400' : 'bg-gray-400'
          }`} style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
