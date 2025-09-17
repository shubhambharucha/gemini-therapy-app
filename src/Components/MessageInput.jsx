import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const MessageInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const { isDark } = useTheme();

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share your thoughts..."
          disabled={disabled}
          rows={1}
          className={`w-full resize-none rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-base ${
            isDark
              ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-500'
              : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white disabled:bg-gray-100 disabled:text-gray-400'
          }`}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!input.trim() || disabled}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-3 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;
