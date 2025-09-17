import { useState, useEffect } from 'react';
import { getTimestamp } from '../utils/Constants';

const MoodTracker = () => {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const moodOptions = [
    { id: 1, label: 'Very Low', value: 1, color: 'bg-red-500', icon: 'VeryLow' },
    { id: 2, label: 'Low', value: 2, color: 'bg-orange-500', icon: 'Low' },
    { id: 3, label: 'Neutral', value: 3, color: 'bg-yellow-500', icon: 'Neutral' },
    { id: 4, label: 'Good', value: 4, color: 'bg-blue-500', icon: 'Good' },
    { id: 5, label: 'Great', value: 5, color: 'bg-green-500', icon: 'Great' },
  ];

  const getMoodIcon = (iconName) => {
    const iconClass = "w-6 h-6";
    switch (iconName) {
      case 'VeryLow':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'Low':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Neutral':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Good':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Great':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Load moods from localStorage on component mount
  useEffect(() => {
    const savedMoods = localStorage.getItem('therapyApp_moods');
    if (savedMoods) {
      setMoods(JSON.parse(savedMoods));
    }
  }, []);

  // Save moods to localStorage whenever moods change
  useEffect(() => {
    localStorage.setItem('therapyApp_moods', JSON.stringify(moods));
  }, [moods]);

  const handleMoodSubmit = () => {
    if (!selectedMood) return;

    const newMood = {
      id: Date.now(),
      mood: selectedMood,
      note: moodNote,
      date: new Date().toISOString().split('T')[0],
      timestamp: getTimestamp(),
    };

    setMoods(prev => [newMood, ...prev]);
    setSelectedMood(null);
    setMoodNote('');
  };

  const getTodayMood = () => {
    const today = new Date().toISOString().split('T')[0];
    return moods.find(mood => mood.date === today);
  };

  const getMoodStats = () => {
    if (moods.length === 0) return { average: 0, trend: 'neutral' };
    
    const last7Days = moods.slice(0, 7);
    const average = last7Days.reduce((sum, mood) => sum + mood.mood.value, 0) / last7Days.length;
    
    let trend = 'neutral';
    if (last7Days.length >= 2) {
      const recent = last7Days.slice(0, 3).reduce((sum, mood) => sum + mood.mood.value, 0) / 3;
      const older = last7Days.slice(3, 6).reduce((sum, mood) => sum + mood.mood.value, 0) / 3;
      if (recent > older + 0.5) trend = 'improving';
      else if (recent < older - 0.5) trend = 'declining';
    }
    
    return { average: average.toFixed(1), trend };
  };

  const todayMood = getTodayMood();
  const stats = getMoodStats();

  return (
    <div className="px-4 py-6 md:max-w-4xl md:mx-auto md:px-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1 md:mb-2">Daily Mood Check-in</h2>
        <p className="text-gray-600 text-sm md:text-base">Track your emotional well-being over time</p>
      </div>
      
      {/* Today's Mood Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 md:p-8 mb-6 md:mb-8">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">How are you feeling today?</h3>
        
        {todayMood ? (
          <div className="text-center">
            <div className="mb-4">{getMoodIcon(todayMood.mood.icon)}</div>
            <p className="text-lg font-medium text-gray-900">{todayMood.mood.label}</p>
            {todayMood.note && (
              <p className="text-gray-600 mt-3 italic">"{todayMood.note}"</p>
            )}
            <p className="text-sm text-gray-500 mt-3">Recorded at {todayMood.timestamp}</p>
            <button
              onClick={() => {
                setMoods(prev => prev.filter(m => m.id !== todayMood.id));
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Update today's mood
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6">
              {moodOptions.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-3 md:p-4 rounded-2xl border transition-all duration-200 min-h-[80px] md:min-h-[100px] ${
                    selectedMood?.id === mood.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="mb-1 md:mb-2 text-gray-600">{getMoodIcon(mood.icon)}</div>
                  <div className="text-xs font-medium text-gray-700 leading-tight">{mood.label}</div>
                </button>
              ))}
            </div>
            
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">
                Optional note about your mood
              </label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="What's contributing to how you feel today?"
                className="w-full p-3 md:p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none text-base"
                rows="3"
              />
            </div>
            
            <button
              onClick={handleMoodSubmit}
              disabled={!selectedMood}
              className="w-full bg-blue-500 text-white py-3 md:py-4 px-6 rounded-2xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px]"
            >
              Save Today's Mood
            </button>
          </div>
        )}
      </div>

      {/* Mood Statistics */}
      {moods.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 md:p-8 mb-6 md:mb-8">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Your Mood Insights</h3>
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{stats.average}</div>
              <div className="text-xs md:text-sm text-gray-600">7-day average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">{moods.length}</div>
              <div className="text-xs md:text-sm text-gray-600">Total entries</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl md:text-3xl font-bold mb-1 ${
                stats.trend === 'improving' ? 'text-green-600' : 
                stats.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.trend === 'improving' ? '↗' : stats.trend === 'declining' ? '↘' : '→'}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Trend</div>
            </div>
          </div>
        </div>
      )}

      {/* Mood History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 md:p-8">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Mood History</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>
        
        {showHistory && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {moods.length === 0 ? (
              <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No mood entries yet. Start tracking your daily mood!</p>
            ) : (
              moods.map(mood => (
                <div key={mood.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50/50 rounded-2xl border border-gray-200/50">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="text-gray-600">{getMoodIcon(mood.mood.icon)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm md:text-base">{mood.mood.label}</div>
                      <div className="text-xs md:text-sm text-gray-600">{mood.date} at {mood.timestamp}</div>
                      {mood.note && (
                        <div className="text-xs md:text-sm text-gray-700 italic mt-1 truncate">"{mood.note}"</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
