// src/App.jsx
import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import TherapyChatbot from './Components/TherapyChatbot';
import MoodCheckin from './Components/MoodCheckin';
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
        return <MoodCheckin />;
      case 'journal':
        return <Journal />;
      default:
        return <TherapyChatbot />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={`${activeTab === 'chat' ? 'pt-0 md:pt-20' : 'pt-0 md:pt-20'} pb-20 md:pb-8`}>
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