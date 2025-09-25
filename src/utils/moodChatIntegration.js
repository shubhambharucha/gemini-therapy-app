// src/utils/moodChatIntegration.js
import { generatePatternSuggestions } from './aiPatternAnalysis.js';

// Trigger pattern analysis after mood check-in completion
export const handleMoodCheckinComplete = async (checkinData) => {
  try {
    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions = await generatePatternSuggestions();
    
    if (suggestions && suggestions.length > 0) {
      // Store suggestions in localStorage for chat component to pick up
      const chatSuggestions = suggestions.filter(s => s.priority === 'high' || s.priority === 'medium');
      
      if (chatSuggestions.length > 0) {
        localStorage.setItem('pendingChatSuggestions', JSON.stringify(chatSuggestions));
        
        // Emit custom event to notify chat component
        window.dispatchEvent(new CustomEvent('newPatternSuggestions', {
          detail: { suggestions: chatSuggestions }
        }));
      }
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error processing mood check-in completion:', error);
    return null;
  }
};

// Check for pending suggestions when switching to chat
export const checkPendingChatSuggestions = () => {
  try {
    const pendingSuggestions = localStorage.getItem('pendingChatSuggestions');
    if (pendingSuggestions) {
      localStorage.removeItem('pendingChatSuggestions');
      return JSON.parse(pendingSuggestions);
    }
    return null;
  } catch (error) {
    console.error('Error checking pending chat suggestions:', error);
    return null;
  }
};

// Generate contextual chat message based on mood check-in
export const generateMoodBasedChatMessage = (checkinData) => {
  const { routine, stress, dejection, notes } = checkinData;
  
  let message = '';
  
  if (dejection && notes) {
    message = `I just completed a mood check-in and shared that I've been feeling dejected about: ${notes}. I'd like to talk more about this.`;
  } else if (stress >= 4) {
    message = `I just did a mood check-in and my stress level is pretty high (${stress}/5). ${routine !== 'Consistent' ? 'My routine has also been off lately.' : ''} Can you help me process this?`;
  } else if (routine !== 'Consistent') {
    message = `I just completed a mood check-in. My routine has been ${routine.toLowerCase()} lately and I'm wondering how to get back on track.`;
  } else {
    message = `I just completed my daily mood check-in. Things are going relatively well, but I'd like to reflect on how I'm doing overall.`;
  }
  
  return message;
};

// Suggested conversation starters based on patterns
export const getMoodBasedConversationStarters = (patternData) => {
  const starters = [];
  
  if (patternData.highStressFrequency > 60) {
    starters.push("I've been feeling quite stressed lately and would like to talk about coping strategies.");
  }
  
  if (patternData.routineInconsistency > 70) {
    starters.push("My daily routine has been all over the place. Can you help me think through this?");
  }
  
  if (patternData.dejectionStreak >= 3) {
    starters.push("I've been feeling down for several days now and could use some support.");
  }
  
  return starters;
};