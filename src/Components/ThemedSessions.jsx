import { useState } from 'react';
import { getGeminiResponse } from '../gemini';

const ThemedSessions = () => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const themes = [
    {
      id: 'anxiety',
      title: 'Managing Anxiety',
      description: 'Explore techniques for understanding and managing anxious thoughts and feelings.',
      color: 'bg-purple-500',
      icon: '🧘',
      prompts: [
        'What situations typically trigger your anxiety?',
        'How does anxiety show up in your body?',
        'What coping strategies have worked for you in the past?',
        'What would you like to feel instead of anxiety?'
      ]
    },
    {
      id: 'grief',
      title: 'Processing Grief',
      description: 'A compassionate space to explore loss and begin the healing process.',
      color: 'bg-blue-500',
      icon: '💙',
      prompts: [
        'What are you grieving right now?',
        'How has this loss affected your daily life?',
        'What memories bring you comfort?',
        'What support do you need during this time?'
      ]
    },
    {
      id: 'relationships',
      title: 'Relationship Dynamics',
      description: 'Examine patterns in your relationships and develop healthier connections.',
      color: 'bg-green-500',
      icon: '💕',
      prompts: [
        'What patterns do you notice in your relationships?',
        'How do you typically handle conflict?',
        'What boundaries do you want to set?',
        'What does a healthy relationship look like to you?'
      ]
    },
    {
      id: 'self-esteem',
      title: 'Building Self-Worth',
      description: 'Develop a more compassionate relationship with yourself.',
      color: 'bg-yellow-500',
      icon: '✨',
      prompts: [
        'What do you appreciate about yourself?',
        'How do you talk to yourself when you make mistakes?',
        'What would you tell a friend in your situation?',
        'What are your unique strengths and talents?'
      ]
    },
    {
      id: 'stress',
      title: 'Stress Management',
      description: 'Identify stress sources and develop effective coping strategies.',
      color: 'bg-red-500',
      icon: '🌊',
      prompts: [
        'What are your main sources of stress right now?',
        'How do you know when you\'re becoming overwhelmed?',
        'What activities help you feel more relaxed?',
        'What boundaries could help reduce your stress?'
      ]
    },
    {
      id: 'trauma',
      title: 'Healing from Trauma',
      description: 'A safe space to explore trauma responses and healing pathways.',
      color: 'bg-indigo-500',
      icon: '🦋',
      prompts: [
        'How has trauma affected your sense of safety?',
        'What coping mechanisms have you developed?',
        'What does healing look like to you?',
        'What support systems do you have in place?'
      ]
    }
  ];

  const startSession = (theme) => {
    setSelectedTheme(theme);
    setSessionActive(true);
    setMessages([{
      id: 1,
      text: `Welcome to our ${theme.title.toLowerCase()} session. I'm Dr. Sarah, and I'm here to support you through this exploration. This is a safe space where you can share openly and honestly. ${theme.description} Let's begin with a gentle question: ${theme.prompts[0]}`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: userInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      // Create a specialized prompt for themed sessions
      const themedPrompt = `You are Dr. Sarah conducting a ${selectedTheme.title.toLowerCase()} therapy session. The user is working on: ${selectedTheme.description}

Previous conversation context: ${messages.slice(-4).map(msg => 
  `${msg.isUser ? 'User' : 'Therapist'}: ${msg.text}`
).join('\n')}

Current user message: ${userInput}

Guidelines for this themed session:
- Stay focused on the ${selectedTheme.title.toLowerCase()} theme
- Use therapeutic techniques appropriate for this area
- Be especially empathetic and validating
- Ask follow-up questions that deepen the exploration
- Offer gentle insights and coping strategies
- Keep responses concise but meaningful

Respond as Dr. Sarah with specialized focus on ${selectedTheme.title.toLowerCase()}:`;

      const response = await getGeminiResponse(themedPrompt);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in themed session:', error);
      const errorMessage = {
        id: Date.now() + 2,
        text: "I'm experiencing some technical difficulties, but I'm still here with you. Let's continue our exploration when the connection is restored. How are you feeling about what we've discussed so far?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const endSession = () => {
    setSessionActive(false);
    setSelectedTheme(null);
    setMessages([]);
  };

  if (sessionActive) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedTheme.title} Session</h2>
              <p className="text-gray-600">{selectedTheme.description}</p>
            </div>
            <button
              onClick={endSession}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.isUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share your thoughts..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Themed Therapy Sessions</h2>
      <p className="text-gray-600 mb-8">Choose a focused session to explore specific areas of your mental health and well-being.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div key={theme.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`${theme.color} p-6 text-white`}>
              <div className="text-4xl mb-2">{theme.icon}</div>
              <h3 className="text-xl font-bold mb-2">{theme.title}</h3>
              <p className="text-white/90">{theme.description}</p>
            </div>
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-3">Sample Questions:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {theme.prompts.slice(0, 2).map((prompt, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => startSession(theme)}
                className={`w-full mt-4 ${theme.color} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity`}
              >
                Start Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemedSessions;
