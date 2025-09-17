import { useState, useEffect } from 'react';
import { getTimestamp } from '../utils/Constants';

const SessionNotes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  const commonTags = ['breakthrough', 'insight', 'goal', 'challenge', 'gratitude', 'reflection'];

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('therapyApp_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('therapyApp_notes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: Date.now(),
      content: newNote,
      timestamp: getTimestamp(),
      date: new Date().toISOString().split('T')[0],
      tags: extractTags(newNote),
      createdAt: new Date().toISOString(),
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const handleUpdateNote = () => {
    if (!editingNote || !editingNote.content.trim()) return;

    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? { ...note, content: editingNote.content, tags: extractTags(editingNote.content) }
        : note
    ));
    setEditingNote(null);
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const extractTags = (content) => {
    const words = content.toLowerCase().split(/\s+/);
    return commonTags.filter(tag => words.some(word => word.includes(tag)));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTag === 'all' || note.tags.includes(filterTag);
    return matchesSearch && matchesFilter;
  });

  const getUniqueTags = () => {
    const allTags = notes.flatMap(note => note.tags);
    return [...new Set(allTags)];
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Session Notes</h2>
      
      {/* Add New Note */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add a New Note</h3>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write down insights, breakthroughs, or important thoughts from your therapy sessions..."
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          rows="4"
        />
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Common tags: {commonTags.map(tag => `#${tag}`).join(', ')}
          </div>
          <button
            onClick={handleSaveNote}
            disabled={!newNote.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save Note
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tags</option>
              {getUniqueTags().map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">
              {notes.length === 0 
                ? "No notes yet. Start documenting your therapy insights!" 
                : "No notes match your search criteria."
              }
            </p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-6">
              {editingNote?.id === note.id ? (
                <div>
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                    rows="4"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateNote}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm text-gray-600">
                      {note.date} at {note.timestamp}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-3 whitespace-pre-wrap">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionNotes;
