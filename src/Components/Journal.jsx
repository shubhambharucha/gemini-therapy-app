// src/Components/Journal.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabaseClient';
import { getSessionId } from '../utils';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!newEntryTitle.trim()) return;

    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from('journals')
        .insert([{
          session_id: sessionId,
          content: `# ${newEntryTitle}\n\n`,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      const newEntry = data[0];
      setEntries(prev => [newEntry, ...prev]);
      setNewEntryTitle('');
      setSelectedEntry(newEntry);
      setIsEditing(true);
      setShowEditor(true);
      setSidebarCollapsed(true);
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  const handleUpdateEntry = async () => {
    if (!selectedEntry) return;

    try {
      const { error } = await supabase
        .from('journals')
        .update({ content: selectedEntry.content })
        .eq('id', selectedEntry.id);

      if (error) throw error;

      setEntries(prev => prev.map(entry => 
        entry.id === selectedEntry.id ? selectedEntry : entry
      ));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== id));
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
        setIsEditing(false);
        setShowEditor(false);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setIsEditing(false);
    setShowEditor(true);
    setSidebarCollapsed(true);
  };

  const getEntryTitle = (content) => {
    const lines = content.split('\n');
    const titleLine = lines.find(line => line.startsWith('# '));
    return titleLine ? titleLine.substring(2) : 'Untitled';
  };

  const getEntryPreview = (content) => {
    const lines = content.split('\n');
    const contentLines = lines.filter(line => !line.startsWith('# ') && line.trim());
    return contentLines.slice(0, 2).join(' ').substring(0, 80) + '...';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Loading journal...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar - Entry List */}
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
                  Journal
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
              
              {/* New Entry Form */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={newEntryTitle}
                  onChange={(e) => setNewEntryTitle(e.target.value)}
                  placeholder="New entry title..."
                  className={`w-full p-2.5 rounded-lg border-0 text-sm ${
                    isDark 
                      ? 'bg-gray-800 text-white placeholder-gray-400' 
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateEntry()}
                />
                <button
                  onClick={handleCreateEntry}
                  disabled={!newEntryTitle.trim()}
                  className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  + New Entry
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
                  setNewEntryTitle('New Entry');
                  handleCreateEntry();
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

        {/* Entry List */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-2">
            {entries.length === 0 ? (
              <div className="p-8 text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  No entries yet
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Start your first journal entry above
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleSelectEntry(entry)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedEntry?.id === entry.id
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
                      {getEntryTitle(entry.content)}
                    </h3>
                    <p className={`text-xs mb-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(entry.created_at)}
                    </p>
                    <p className={`text-xs line-clamp-2 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {getEntryPreview(entry.content)}
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
        ${showEditor ? 'flex' : 'hidden'} md:flex
        flex-1 flex-col 
        ${isDark ? 'bg-gray-900' : 'bg-white'}
      `}>
        {selectedEntry ? (
          <>
            {/* Entry Header */}
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <div className="flex items-center justify-between">
                {/* Mobile back button */}
                <button
                  onClick={() => setShowEditor(false)}
                  className={`md:hidden p-2 mr-3 rounded-lg transition-colors ${
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
                  <h1 className={`text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {getEntryTitle(selectedEntry.content)}
                  </h1>
                  <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(selectedEntry.created_at)}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdateEntry}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className={`p-2 rounded-lg transition-colors ${
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
                        className={`p-2 rounded-lg transition-colors ${
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
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <div className="flex-1 p-6 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={selectedEntry.content}
                  onChange={(e) => setSelectedEntry({...selectedEntry, content: e.target.value})}
                  placeholder="Start writing..."
                  className={`w-full h-full resize-none border-none outline-none text-base leading-relaxed font-normal ${
                    isDark ? 'text-white bg-transparent placeholder-gray-500' : 'text-gray-900 bg-transparent placeholder-gray-400'
                  }`}
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  autoFocus
                />
              ) : (
                <div className={`text-base leading-relaxed whitespace-pre-wrap font-normal ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Select a journal entry
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Choose an entry from the sidebar to start reading or editing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;