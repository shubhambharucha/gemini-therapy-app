import { useState, useEffect, useRef } from "react";
import { getGeminiResponse } from "../gemini";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import { welcomeMessage } from "../utils/constants";

export default function TherapyChatbot() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("therapy-chat-messages");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed.length > 0) setMessages(parsed);
        else setMessages([welcomeMessage]);
      } catch {
        setMessages([welcomeMessage]);
      }
    } else {
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("therapy-chat-messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    const userMsg = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Updated Gemini prompt for calm, empathetic tone
    const systemPrompt = `
You are a kind, calm, and empathetic assistant.
When the user expresses emotions, respond with warmth and reassurance.
Avoid being overly analytical or technical.
Focus on listening and comforting the user.
Keep responses short and soothing.
`;

    try {
      const response = await getGeminiResponse(text, systemPrompt);
      const aiMsg = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
    localStorage.removeItem("therapy-chat-messages");
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Therapy Chat</h1>
          <p className="text-sm text-gray-500">Your safe space to talk</p>
        </div>
        <button
          onClick={clearChat}
          className="text-gray-500 hover:text-gray-700 px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors"
        >
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
}
