// src/Components/TherapyChatbot.jsx
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getEnhancedGeminiResponse, generatePatternSuggestions } from "../utils/aiPatternAnalysis";
import { WELCOME_MESSAGE, ERROR_MESSAGE } from "../utils/Constants";
import { supabase } from "../supabaseClient";
import { getSessionId } from "../utils";
import SideBar from "./SideBar";

const TherapyChatbot = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [patternSuggestions, setPatternSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const { isDark } = useTheme();

  // Conversations
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkPatternSuggestions();
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadConversationMessages(activeConversationId);
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [activeConversationId]);

  // Load conversations
  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const sessionId = getSessionId();

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
            id,
            title,
            created_at,
            updated_at,
            messages(content, created_at)
          `
        )
        .eq('session_id', sessionId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const conversationsWithPreview = data.map((conv) => {
        const latestMessage = conv.messages?.[conv.messages.length - 1];
        return {
          ...conv,
          preview:
            latestMessage?.content?.substring(0, 100) + "..." ||
            "No messages yet",
        };
      });

      setConversations(conversationsWithPreview);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Load messages
  const loadConversationMessages = async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.role === "user",
        timestamp: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formattedMessages.length ? formattedMessages : [WELCOME_MESSAGE]);
    } catch (error) {
      console.error("Error loading conversation messages:", error);
      setMessages([WELCOME_MESSAGE]);
    }
  };

  // Generate conversation title
  const generateConversationTitle = (firstMessage) => {
    if (!firstMessage) return "New Conversation";
    const words = firstMessage.split(" ");
    return words.length <= 4 ? firstMessage : words.slice(0, 4).join(" ") + "...";
  };

  // Create new conversation
  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([WELCOME_MESSAGE]);
  };

  // Select conversation
  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
  };

  // Delete conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([WELCOME_MESSAGE]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Rename conversation
  const handleRenameConversation = async (conversationId, newTitle) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ title: newTitle })
        .eq("id", conversationId);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, title: newTitle } : conv
        )
      );
    } catch (error) {
      console.error("Error renaming conversation:", error);
    }
  };

  // Create new conversation - following Journal.jsx pattern
  const createNewConversation = async (firstMessage) => {
    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from("conversations")
        .insert([{
          session_id: sessionId,
          title: generateConversationTitle(firstMessage),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update conversations list
      setConversations(prev => [{
        ...data,
        preview: firstMessage.substring(0, 100) + "...",
        messages: []
      }, ...prev]);

      // Update active conversation
      setActiveConversationId(data.id);

      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  };

  // Save message to DB - simplified like Journal.jsx
  const saveMessageToDb = async (conversationId, role, content) => {
    try {
      const { error } = await supabase
        .from("messages")
        .insert([{ 
          conversation_id: conversationId, 
          role, 
          content,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error saving message:", error);
      return false;
    }
  };

  // Check pattern suggestions
  const checkPatternSuggestions = async () => {
    try {
      const suggestions = await generatePatternSuggestions();
      if (suggestions?.length > 0) {
        const highPriority = suggestions.find((s) => s.priority === "high");
        if (highPriority) {
          const suggestionMessage = {
            id: Date.now() + 1000,
            text: highPriority.message,
            isUser: false,
            isSystemSuggestion: true,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setTimeout(() => {
            setMessages((prev) => [...prev, suggestionMessage]);
          }, 2000);
        }
        setPatternSuggestions(suggestions);
      }
    } catch (error) {
      console.error("Error checking pattern suggestions:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // FIXED: Handle send with proper conversation ID management
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const currentInput = input.trim();
    const userMessage = {
      id: Date.now(),
      text: currentInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Determine which conversation ID to use
      let conversationId = activeConversationId;
      
      // If no active conversation, create one
      if (!conversationId) {
        conversationId = await createNewConversation(currentInput);
        if (!conversationId) {
          throw new Error("Failed to create conversation");
        }
      }

      // Save user message
      await saveMessageToDb(conversationId, "user", currentInput);

      // Get AI response
      const response = await getEnhancedGeminiResponse(currentInput, true);

      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Add bot message after delay
      setTimeout(async () => {
        setMessages((prev) => [...prev, botMessage]);
        
        // Save bot message using the SAME conversationId
        await saveMessageToDb(conversationId, "assistant", response);
        
        setLoading(false);
      }, 800);

    } catch (err) {
      console.error("Error in handleSend:", err);
      
      const errorMessage = {
        id: Date.now() + 2,
        text: ERROR_MESSAGE.text,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setTimeout(async () => {
        setMessages((prev) => [...prev, errorMessage]);
        
        // Save error message if we have a conversation
        if (activeConversationId) {
          await saveMessageToDb(activeConversationId, "assistant", ERROR_MESSAGE.text);
        }
        
        setLoading(false);
      }, 800);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (conversationsLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Loading conversations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <SideBar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className={`sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-4 md:px-6 md:py-4 ${
            isDark
              ? "bg-gray-900/95 border-gray-700"
              : "bg-white/95 border-gray-200"
          }`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDark ? "bg-blue-600" : "bg-blue-500"
                }`}
              >
                <span className="text-white font-medium text-sm">DS</span>
              </div>
              <div>
                <h1 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Dr. Sarah
                </h1>
                <p className={`text-xs ${isDark ? "text-green-400" : "text-green-600"}`}>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={handleNewConversation}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isDark
                  ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 pb-32 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <MessageBubble key={msg.id} message={msg} isUser={msg.isUser} animate={index > 0} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div
          className={`fixed bottom-20 left-0 right-0 backdrop-blur-xl border-t px-4 py-4 md:bottom-0 md:px-6 z-40 ${
            isDark ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-200"
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Dr. Sarah..."
                  disabled={loading}
                  rows={1}
                  className={`w-full resize-none rounded-3xl border px-4 py-3 focus:outline-none transition-all duration-200 text-base max-h-32 ${
                    isDark
                      ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                  style={{ minHeight: "44px" }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full p-3 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Message bubble component (unchanged)
const MessageBubble = ({ message, isUser, animate = true }) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  if (message.isSystemSuggestion) {
    return (
      <div
        className={`flex justify-center my-4 transition-all duration-500 ease-out transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div
          className={`max-w-[90%] md:max-w-2xl px-4 py-3 rounded-2xl border-2 ${
            isDark
              ? "bg-blue-900/20 border-blue-800/50 text-blue-200"
              : "bg-blue-50 border-blue-200 text-blue-900"
          } shadow-sm`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isDark ? "bg-blue-700" : "bg-blue-500"
              }`}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Pattern Insight</p>
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-2 ${isDark ? "text-blue-300/70" : "text-blue-600/70"}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex transition-all duration-500 ease-out transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] md:max-w-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-500 text-white rounded-3xl rounded-br-lg"
            : isDark
            ? "bg-gray-800 text-gray-100 rounded-3xl rounded-bl-lg"
            : "bg-white text-gray-900 rounded-3xl rounded-bl-lg border border-gray-200"
        } shadow-sm`}
      >
        <div className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</div>
        <p
          className={`text-xs mt-2 ${
            isUser ? "text-blue-100" : isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};

// Typing indicator component (unchanged)
const TypingIndicator = () => {
  const { isDark } = useTheme();

  return (
    <div className="flex justify-start">
      <div
        className={`px-4 py-3 rounded-3xl rounded-bl-lg ${
          isDark ? "bg-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex space-x-2">
          <span
            className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? "bg-gray-400" : "bg-gray-600"
            }`}
            style={{ animationDelay: "0ms" }}
          ></span>
          <span
            className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? "bg-gray-400" : "bg-gray-600"
            }`}
            style={{ animationDelay: "150ms" }}
          ></span>
          <span
            className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? "bg-gray-400" : "bg-gray-600"
            }`}
            style={{ animationDelay: "300ms" }}
          ></span>
        </div>
      </div>
    </div>
  );
};

export default TherapyChatbot;