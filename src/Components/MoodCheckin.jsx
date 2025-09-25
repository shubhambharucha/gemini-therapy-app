import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { submitMoodCheckin, getMoodCheckins, analyzeMoodPatterns } from '../utils/moodDatabase';

const MoodCheckin = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    routine: '',
    stress: null,
    dejection: null,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pastCheckins, setPastCheckins] = useState([]);
  const [recentInsights, setRecentInsights] = useState(null);
  const { isDark } = useTheme();

  // Load past check-ins on mount
  useEffect(() => {
    loadPastCheckins();
  }, []);

  const loadPastCheckins = async () => {
    try {
      const checkins = await getMoodCheckins();
      setPastCheckins(checkins);

      if (checkins.length > 0) {
        const insights = analyzeMoodPatterns(checkins.slice(-5)); // last 5 entries
        setRecentInsights(insights);
      }
    } catch (error) {
      console.error('Failed to load past check-ins:', error);
    }
  };

  const questions = [
    {
      id: 'routine',
      question: 'How was your routine today?',
      type: 'choice',
      options: ['Consistent', 'Partly off', 'Totally off']
    },
    {
      id: 'stress',
      question: 'Rate your stress level',
      type: 'scale',
      min: 1,
      max: 5,
      labels: ['Very Low', 'Low', 'Medium', 'High', 'Very High']
    },
    {
      id: 'dejection',
      question: 'Did you feel disappointed or dejected today?',
      type: 'boolean'
    }
  ];

  const handleResponse = (value) => {
    const currentQuestion = questions[currentStep];
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    if (currentQuestion.id === 'dejection') {
      if (!value) {
        handleSubmit(false);
      } else {
        setCurrentStep(currentStep + 1); // show notes input
      }
    } else if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleNotesSubmit = () => handleSubmit(true);

  const handleSubmit = async (dejectionValue) => {
    setIsSubmitting(true);
    try {
      const finalResponses = { ...responses, dejection: dejectionValue };
      await submitMoodCheckin(finalResponses);
      setShowSuccess(true);

      // Reload data and insights
      await loadPastCheckins();

    } catch (error) {
      console.error('Failed to submit check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getStressColor = (level) => {
    const colors = ['#10B981', '#84CC16', '#EAB308', '#F97316', '#EF4444'];
    return colors[level - 1] || '#6B7280';
  };

  // Generate sample chart data for decorative purposes
  const generateSampleChartData = () => {
    return [65, 78, 45, 88, 72, 56, 82];
  };

  // Mini SVG Chart Component
  const MiniChart = ({ data, color }) => {
    const maxValue = Math.max(...data);
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 80; // 80% of height for padding
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          fill="url(#chartGradient)"
          points={`0,100 ${points} 100,100`}
        />
      </svg>
    );
  };

  // ------------------- ENHANCED SUCCESS SCREEN -------------------
  if (showSuccess) {
    const sampleData = generateSampleChartData();

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Compact Success Message */}
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-green-100">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-1 text-gray-900">Thanks for sharing</h2>
            <p className="text-sm text-gray-600">Your check-in has been saved</p>
          </div>

          {/* Red Gradient Chart Card */}
          <div className="relative overflow-hidden rounded-3xl p-6 text-white" style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Mood Progress</h3>
                <p className="text-sm opacity-90">Last 7 days</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">76%</p>
                <p className="text-xs opacity-75">Overall wellness</p>
              </div>
            </div>
            <div className="h-16 w-full">
              <MiniChart data={sampleData} color="rgba(255,255,255,0.8)" />
            </div>
          </div>

          {/* Blue and Green Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Blue Card - Mood Summary */}
            <div className="rounded-2xl p-5 text-white" style={{
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)'
            }}>
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-lg bg-white bg-opacity-20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-base">Mood Patterns</h3>
              </div>
              {recentInsights && (
                <div className="space-y-2 text-sm opacity-95">
                  <p>Entries analyzed: {recentInsights.entriesAnalyzed}</p>
                  <p>{recentInsights.moodSummary}</p>
                </div>
              )}
              {!recentInsights && (
                <div className="text-sm opacity-95">
                  <p>Not enough data yet</p>
                  <p>Complete more check-ins to see patterns</p>
                </div>
              )}
            </div>

            {/* Green Card - Triggers */}
            <div className="rounded-2xl p-5 text-white" style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            }}>
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-lg bg-white bg-opacity-20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-base">Common Triggers</h3>
              </div>
              {recentInsights && (
                <div className="space-y-2 text-sm opacity-95">
                  <p>{recentInsights.triggers}</p>
                  <p className="text-xs opacity-80">Based on recent patterns</p>
                </div>
              )}
              {!recentInsights && (
                <div className="text-sm opacity-95">
                  <p>No patterns detected yet</p>
                  <p>Keep tracking to identify triggers</p>
                </div>
              )}
            </div>
          </div>

          {/* Yellow/Purple Suggestions Card */}
          <div className="rounded-2xl p-6 text-white" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
          }}>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-lg bg-white bg-opacity-20 flex items-center justify-center mr-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 11H7v8h2v-8zm4-4H11v12h2V7zm4-4H15v16h2V3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Personalized Suggestions</h3>
            </div>
            {recentInsights && recentInsights.actions.length > 0 ? (
              <ul className="space-y-2 text-sm opacity-95">
                {recentInsights.actions.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-white bg-opacity-60 mt-2 mr-3 flex-shrink-0"></span>
                    {action}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2 text-sm opacity-95">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-white bg-opacity-60 mt-2 mr-3 flex-shrink-0"></span>
                  Consider stress management techniques like deep breathing or short walks
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-white bg-opacity-60 mt-2 mr-3 flex-shrink-0"></span>
                  Try journaling or talking to someone when feeling down
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-white bg-opacity-60 mt-2 mr-3 flex-shrink-0"></span>
                  Consider study breaks and time management techniques
                </li>
              </ul>
            )}
          </div>

          {/* Start New Check-in Button */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setShowSuccess(false);
                setCurrentStep(0);
                setResponses({
                  routine: '',
                  stress: null,
                  dejection: false,
                  notes: ''
                });
              }}
              className="bg-blue-500 text-white py-3 px-8 rounded-2xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start New Check-in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------- QUESTION FLOW -------------------
  if (currentStep < questions.length) {
    const currentQuestion = questions[currentStep];
    return (
      <div className="h-screen flex flex-col bg-blue-50">
        {/* Progress bar */}
        <div className="p-4 border-b border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Question {currentStep + 1} of 3</span>
            <button onClick={() => setCurrentStep(0)} className="text-sm text-blue-500 hover:underline">Start Over</button>
          </div>
          <div className="w-full rounded-full h-2 bg-blue-100">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1)/3)*100}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <h2 className="text-xl md:text-2xl font-semibold mb-8 text-gray-900">{currentQuestion.question}</h2>

            {currentQuestion.type === 'choice' && (
              <div className="space-y-3">
                {currentQuestion.options.map(option => (
                  <button
                    key={option}
                    onClick={() => handleResponse(option)}
                    className="w-full p-4 rounded-2xl border border-blue-200 bg-white text-gray-900 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'scale' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  {[1,2,3,4,5].map(level => (
                    <button
                      key={level}
                      onClick={() => handleResponse(level)}
                      className="w-12 h-12 rounded-full font-semibold text-white transition-all duration-200 hover:scale-110"
                      style={{ backgroundColor: getStressColor(level) }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
            )}

            {currentQuestion.type === 'boolean' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleResponse(true)}
                  className="flex-1 p-4 rounded-2xl border border-blue-200 bg-white text-gray-900 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleResponse(false)}
                  className="flex-1 p-4 rounded-2xl border border-blue-200 bg-white text-gray-900 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ------------------- NOTES INPUT -------------------
  if (currentStep === questions.length && responses.dejection) {
    return (
      <div className="h-screen flex flex-col bg-blue-50">
        <div className="p-4 border-b border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900">Tell me more about it</h2>
          <p className="text-sm mt-1 text-gray-500">What was bothering you today? (Optional)</p>
        </div>

        <div className="flex-1 p-6">
          <textarea
            value={responses.notes}
            onChange={(e) => setResponses(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Was it related to studies, friends, family, or something else?"
            className="w-full h-full resize-none border-none outline-none text-base leading-relaxed bg-transparent text-gray-900 placeholder-gray-400"
            autoFocus
          />
        </div>

        <div className="p-6 border-t border-blue-200">
          <button
            onClick={handleNotesSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-2xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? 'Saving...' : 'Submit Check-in'}
          </button>
        </div>
      </div>
    );
  }

  // ------------------- HISTORY VIEW -------------------
  return (
    <div className="h-screen flex flex-col bg-blue-50">
      <div className="p-6 border-b border-blue-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mood Check-ins</h1>
          <p className="text-sm mt-1 text-gray-500">Track your well-being</p>
        </div>
        <button onClick={() => setCurrentStep(0)} className="bg-blue-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors">
          New Check-in
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {recentInsights && (
          <div className="p-4 rounded-xl border border-blue-200 bg-white shadow-sm">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Recent Mood Insights</h3>
            <p className="text-sm text-gray-600">Entries analyzed: {recentInsights.entriesAnalyzed}</p>
            <p className="text-sm text-gray-600 mt-1">Mood summary: {recentInsights.moodSummary}</p>
            <p className="text-sm text-gray-600 mt-1">Common triggers: {recentInsights.triggers}</p>
            {recentInsights.actions.length > 0 && (
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                {recentInsights.actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            )}
          </div>
        )}

        {pastCheckins.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            No check-ins yet. Start your first check-in above.
          </div>
        ) : (
          pastCheckins.map(checkin => (
            <div key={checkin.id} className="p-4 rounded-2xl border border-blue-200 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-900">{formatDate(checkin.created_at)}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStressColor(checkin.stress) }} />
                  <span className="text-xs text-gray-500">Stress: {checkin.stress}/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Routine: {checkin.routine}</span>
                {checkin.dejection && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">Feeling down</span>}
              </div>
              {checkin.notes && <p className="text-sm mt-2 italic text-gray-500">"{checkin.notes}"</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoodCheckin;