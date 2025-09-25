// src/utils/aiPatternAnalysis.js
import { getRecentMoodPatterns } from './moodDatabase.js';

// Generate pattern-aware suggestions based on mood check-ins
export const generatePatternSuggestions = async () => {
  try {
    const recentCheckins = await getRecentMoodPatterns(10);
    
    if (recentCheckins.length < 3) {
      return null; // Need at least 3 entries for patterns
    }

    const suggestions = [];
    const patterns = analyzePatterns(recentCheckins);

    // Stress patterns
    if (patterns.highStressFrequency > 60) {
      suggestions.push({
        type: 'stress_management',
        message: "I've noticed your stress levels have been higher than usual lately. Consider taking short breaks between study sessions or trying a 5-minute breathing exercise.",
        priority: 'high'
      });
    }

    // Routine consistency patterns
    if (patterns.routineInconsistency > 70) {
      suggestions.push({
        type: 'routine',
        message: "Your routine has been quite irregular recently. This might be contributing to stress - maybe try setting one small daily anchor, like a morning check-in?",
        priority: 'medium'
      });
    }

    // Dejection patterns
    if (patterns.dejectionStreak >= 3) {
      suggestions.push({
        type: 'emotional_support',
        message: "You've been feeling down for a few days. That takes courage to acknowledge. Would it help to talk about what's been on your mind?",
        priority: 'high'
      });
    }

    // Positive patterns
    if (patterns.consistentRoutine > 80 && patterns.averageStress < 3) {
      suggestions.push({
        type: 'positive_reinforcement',
        message: "You've been doing great maintaining your routine! It's clearly helping keep your stress manageable. Keep up the excellent work.",
        priority: 'low'
      });
    }

    // Weekend patterns
    if (patterns.weekendDips) {
      suggestions.push({
        type: 'weekend_support',
        message: "I notice your motivation tends to dip on weekends. Maybe try a gentle morning routine or one small meaningful activity to start your day?",
        priority: 'medium'
      });
    }

    return suggestions.length > 0 ? suggestions : null;
  } catch (error) {
    console.error('Error generating pattern suggestions:', error);
    return null;
  }
};

// Analyze patterns from recent check-ins
const analyzePatterns = (checkins) => {
  const patterns = {
    averageStress: 0,
    highStressFrequency: 0,
    routineInconsistency: 0,
    dejectionStreak: 0,
    consistentRoutine: 0,
    weekendDips: false
  };

  if (checkins.length === 0) return patterns;

  // Calculate stress patterns
  let totalStress = 0;
  let highStressCount = 0;
  let inconsistentRoutineCount = 0;
  let consistentRoutineCount = 0;
  let consecutiveDejection = 0;
  let maxDejectionStreak = 0;

  checkins.forEach((checkin, index) => {
    totalStress += checkin.stress;
    
    if (checkin.stress >= 4) highStressCount++;
    
    if (checkin.routine !== 'Consistent') {
      inconsistentRoutineCount++;
    } else {
      consistentRoutineCount++;
    }

    // Track dejection streaks
    if (checkin.dejection) {
      consecutiveDejection++;
      maxDejectionStreak = Math.max(maxDejectionStreak, consecutiveDejection);
    } else {
      consecutiveDejection = 0;
    }
  });

  patterns.averageStress = totalStress / checkins.length;
  patterns.highStressFrequency = (highStressCount / checkins.length) * 100;
  patterns.routineInconsistency = (inconsistentRoutineCount / checkins.length) * 100;
  patterns.consistentRoutine = (consistentRoutineCount / checkins.length) * 100;
  patterns.dejectionStreak = maxDejectionStreak;

  // Check for weekend patterns (simplified - would need day of week data)
  patterns.weekendDips = patterns.averageStress > 3.5 && patterns.routineInconsistency > 50;

  return patterns;
};

// Enhanced Gemini response with pattern awareness
export const getEnhancedGeminiResponse = async (userMessage, includePatterns = false) => {
  try {
    let contextualPrompt = userMessage;

    if (includePatterns) {
      const suggestions = await generatePatternSuggestions();
      
      if (suggestions && suggestions.length > 0) {
        const patternContext = suggestions
          .filter(s => s.priority === 'high' || s.priority === 'medium')
          .map(s => s.message)
          .join(' ');

        contextualPrompt = `Context: Based on recent mood patterns: ${patternContext}

User message: ${userMessage}

Please respond naturally as Dr. Sarah, incorporating this pattern awareness subtly if relevant to the conversation. Don't mention the pattern analysis directly unless it naturally fits the therapeutic conversation.`;
      }
    }

    // Import and use your existing getGeminiResponse function
    const { getGeminiResponse } = await import('../gemini.js');
    return await getGeminiResponse(contextualPrompt);
  } catch (error) {
    console.error('Enhanced AI response error:', error);
    const { getGeminiResponse } = await import('../gemini.js');
    return await getGeminiResponse(userMessage);
  }
};

// Check if user should receive pattern suggestions
export const shouldShowPatternSuggestion = async () => {
  try {
    const suggestions = await generatePatternSuggestions();
    return suggestions && suggestions.some(s => s.priority === 'high');
  } catch (error) {
    console.error('Error checking pattern suggestions:', error);
    return false;
  }
};