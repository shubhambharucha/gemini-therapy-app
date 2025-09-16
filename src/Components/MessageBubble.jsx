import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MessageBubble = ({ message, isUser, timestamp }) => {
  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? "bg-blue-500 text-white rounded-br-md"
            : "bg-gray-200 text-gray-800 rounded-bl-md"
        }`}>
        <div className="prose prose-sm max-w-none text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message}
          </ReactMarkdown>
        </div>
        <p className={`text-xs mt-1 opacity-70 ${isUser ? "text-blue-100" : "text-gray-500"}`}>
          {timestamp}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
