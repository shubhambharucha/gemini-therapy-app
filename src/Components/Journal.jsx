import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEditor, setShowEditor] = useState(false); // Mobile navigation state
  const { isDark } = useTheme();

  // Load entries from memory (localStorage replacement for demo)
  const [initialLoad, setInitialLoad] = useState(false);
  
  useEffect(() => {
    if (!initialLoad) {
      // Start with empty entries
      setEntries([]);
      setInitialLoad(true);
    }
  }, [initialLoad]);

  const handleCreateEntry = () => {
    if (!newEntry.title.trim()) return;

    const entry = {
      id: Date.now(),
      title: newEntry.title,
      content: newEntry.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEntries(prev => [entry, ...prev]);
    setNewEntry({ title: '', content: '' });
    setSelectedEntry(entry);
    setIsEditing(true);
    setSidebarCollapsed(true);
    setShowEditor(true); // Show editor on mobile
  };

  const handleUpdateEntry = () => {
    if (!selectedEntry || !selectedEntry.title.trim()) return;

    setEntries(prev => prev.map(entry => 
      entry.id === selectedEntry.id 
        ? { ...selectedEntry, updatedAt: new Date().toISOString() }
        : entry
    ));
    setIsEditing(false);
  };

  const handleDeleteEntry = (id) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
      setIsEditing(false);
      setShowEditor(false); // Return to list on mobile
    }
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setIsEditing(false);
    setSidebarCollapsed(true);
    setShowEditor(true); // Show editor on mobile
  };

  const handleBackToList = () => {
    setShowEditor(false);
    setSelectedEntry(null);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Mobile: Show only editor when showEditor is true
  // Desktop: Always show both panels
  const shouldShowSidebar = !showEditor; // Mobile: hide sidebar when showing editor
  const shouldShowEditor = showEditor || selectedEntry; // Desktop: show if entry selected

  return (
    <div className="h-screen flex">
      {/* Sidebar - Entry List */}
      <div className={`
        ${shouldShowSidebar ? 'flex' : 'hidden'} md:flex
        ${sidebarCollapsed ? 'md:w-16' : 'w-full md:w-80'} 
        transition-all duration-300 border-r 
        ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} 
        flex-col
      `}>
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Journal</h2>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className={`hidden md:block p-2 rounded-xl transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {/* Simple 3-line menu icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {/* New Entry Form */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                  placeholder="New journal entry..."
                  className={`w-full p-3 rounded-2xl border transition-all duration-200 text-base ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white'
                  }`}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateEntry()}
                />
                <button
                  onClick={handleCreateEntry}
                  disabled={!newEntry.title.trim()}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-2xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  + New Journal
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {/* Simple 3-line menu icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={handleCreateEntry}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Entry List */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto">
            {entries.length === 0 ? (
              <div className="p-8 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <svg className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No entries yet</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start writing your first journal entry</p>
              </div>
            ) : (
              <div className="p-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleSelectEntry(entry)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 mb-2 ${
                      selectedEntry?.id === entry.id
                        ? isDark 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-50 text-blue-900'
                        : isDark
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <h3 className="font-medium text-sm mb-1 truncate">{entry.title}</h3>
                    <p className={`text-xs ${
                      selectedEntry?.id === entry.id
                        ? isDark ? 'text-blue-100' : 'text-blue-600'
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(entry.updatedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content - Entry Editor */}
      <div className={`
        ${shouldShowEditor ? 'flex' : 'hidden'} md:flex
        flex-1 flex-col 
        ${isDark ? 'bg-gray-900' : 'bg-white'}
      `}>
        {selectedEntry ? (
          <>
            {/* Entry Header */}
            <div className={`p-4 md:p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <div className="flex items-center justify-between">
                {/* Mobile back button */}
                <button
                  onClick={handleBackToList}
                  className={`md:hidden p-2 mr-3 rounded-xl transition-colors ${
                    isDark 
                      ? 'text-gray-300 hover:bg-gray-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={selectedEntry.title}
                      onChange={(e) => setSelectedEntry({...selectedEntry, title: e.target.value})}
                      className={`w-full text-lg md:text-xl font-semibold bg-transparent border-none outline-none ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                      autoFocus
                    />
                  ) : (
                    <h1 className={`text-lg md:text-xl font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEntry.title}
                    </h1>
                  )}
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(selectedEntry.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setShowEditor(false)}
                    className={`md:hidden p-2 rounded-xl transition-colors ${
                      isDark 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* Edit/Save buttons */}
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdateEntry}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className={`p-2 rounded-xl transition-colors ${
                          isDark 
                            ? 'text-gray-300 hover:bg-gray-800' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className={`p-2 rounded-xl transition-colors ${
                          isDark 
                            ? 'text-gray-300 hover:bg-gray-800' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(selectedEntry.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Entry Content */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={selectedEntry.content}
                  onChange={(e) => setSelectedEntry({...selectedEntry, content: e.target.value})}
                  placeholder="Start writing your thoughts..."
                  className={`w-full h-full resize-none border-none outline-none text-base leading-relaxed ${
                    isDark ? 'text-white bg-transparent' : 'text-gray-900 bg-transparent'
                  }`}
                  autoFocus
                />
              ) : (
                <div className={`text-base leading-relaxed whitespace-pre-wrap ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedEntry.content || (
                    <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      No content yet. Click edit to start writing.
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Select a journal entry</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Choose an entry from the sidebar to start reading or editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;