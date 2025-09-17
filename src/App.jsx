// src/App.jsx
import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import TherapyChatbot from './Components/TherapyChatbot';
import MoodTracker from './Components/MoodTracker';
import SessionNotes from './Components/SessionNotes';
import ThemedSessions from './Components/ThemedSessions';
import Journal from './Components/Journal';
import Navigation from './Components/Navigation';
import './index.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('chat');
  const { isDark } = useTheme();

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'chat':
        return <TherapyChatbot />;
      case 'mood':
        return <MoodTracker />;
      case 'notes':
        return <SessionNotes />;
      case 'themes':
        return <ThemedSessions />;
      case 'journal':
        return <Journal />;
      default:
        return <TherapyChatbot />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50/50'
    }`}>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="pb-20 md:pb-8">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
