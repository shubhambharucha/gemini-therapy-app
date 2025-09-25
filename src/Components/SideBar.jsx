import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SideBar = ({ 
  conversations = [], 
  activeConversationId, 
  onSelectConversation, 
  onNewConversation, 
  onDeleteConversation, 
  onRenameConversation 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const { isDark } = useTheme();

  // Handle mobile responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(false); // Keep expanded on mobile by default
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateConversation = async () => {
    if (!newConversationTitle.trim()) {
      setNewConversationTitle('New Conversation');
    }
    
    onNewConversation(newConversationTitle.trim() || 'New Conversation');
    setNewConversationTitle('');
    setShowEditor(true);
    setSidebarCollapsed(true);
  };

  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation.id);
    setShowEditor(true);
    setSidebarCollapsed(true);
  };

  const getConversationTitle = (conversation) => {
    return conversation.title || 'Untitled Conversation';
  };

  const getConversationPreview = (conversation) => {
    if (conversation.preview) {
      return conversation.preview.length > 80 
        ? conversation.preview.substring(0, 80) + '...'
        : conversation.preview;
    }
    return 'No messages yet...';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const conversationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (conversationDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (conversationDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className={`
      ${showEditor ? 'hidden' : 'flex'} md:flex
      ${sidebarCollapsed ? 'md:w-16' : 'w-full md:w-80'} 
      transition-all duration-300 border-r 
      ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} 
      flex-col
    `}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
        {!sidebarCollapsed ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Conversations
              </h2>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className={`hidden md:block p-1.5 rounded-md transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:bg-gray-800' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {/* New Conversation Form */}
            <div className="space-y-2">
              <input
                type="text"
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                placeholder="Conversation topic..."
                className={`w-full p-2.5 rounded-lg border-0 text-sm ${
                  isDark 
                    ? 'bg-gray-800 text-white placeholder-gray-400' 
                    : 'bg-white text-gray-900 placeholder-gray-500'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateConversation()}
              />
              <button
                onClick={handleCreateConversation}
                className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                + Start new conversation
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className={`p-2 rounded-md transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:bg-gray-800' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => {
                setNewConversationTitle('New Conversation');
                handleCreateConversation();
              }}
              className={`p-2 rounded-md transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:bg-gray-800' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Conversation List */}
      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No conversations yet
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Start your first conversation above
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // Handle context menu for rename/delete
                    const action = window.prompt('Choose action: (r)ename or (d)elete');
                    if (action === 'r') {
                      const newTitle = window.prompt('Enter new title:', conversation.title);
                      if (newTitle && newTitle.trim()) {
                        onRenameConversation(conversation.id, newTitle.trim());
                      }
                    } else if (action === 'd') {
                      if (window.confirm('Are you sure you want to delete this conversation?')) {
                        onDeleteConversation(conversation.id);
                      }
                    }
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeConversationId === conversation.id
                      ? isDark 
                        ? 'bg-blue-600/20 border border-blue-500/30' 
                        : 'bg-blue-50 border border-blue-200'
                      : isDark
                        ? 'hover:bg-gray-800 border border-transparent'
                        : 'hover:bg-white border border-transparent hover:shadow-sm'
                  }`}
                >
                  <h3 className={`font-medium text-sm mb-1 truncate ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {getConversationTitle(conversation)}
                  </h3>
                  <p className={`text-xs mb-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatDate(conversation.updated_at || conversation.created_at)}
                  </p>
                  <p className={`text-xs line-clamp-2 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {getConversationPreview(conversation)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SideBar;