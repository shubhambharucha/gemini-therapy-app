// src/utils/moodDatabase.js
import { supabase } from '../supabaseClient.js';
import { getSessionId } from '../utils.js';

// Submit a new mood check-in
export const submitMoodCheckin = async (moodData) => {
  try {
    console.log('📤 Submitting mood data:', moodData);
    const sessionId = getSessionId();
    
    const checkinData = {
      session_id: sessionId,
      routine: moodData.routine, // "Consistent", "Partly off", or "Totally off"
      stress: moodData.stress, // integer 1-5
      dejection: moodData.dejection, // boolean
      notes: moodData.dejection ? moodData.notes : null, // only if dejected
      created_at: new Date().toISOString()
    };

    console.log('📝 Checkin data to insert:', checkinData);

    const { data, error } = await supabase
      .from('checkins')
      .insert([checkinData])
      .select();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Successfully inserted:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ Failed to submit mood check-in:', error);
    throw error;
  }
};

// Get all mood check-ins for the current session
export const getMoodCheckins = async () => {
  try {
    console.log('📊 Fetching mood check-ins...');
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching mood check-ins:', error);
      throw error;
    }

    console.log('📊 Fetched check-ins:', data);
    return data || [];
  } catch (error) {
    console.error('❌ Failed to fetch mood check-ins:', error);
    return [];
  }
};

// Get recent mood check-ins for pattern analysis (last 5-10 entries)
export const getRecentMoodPatterns = async (limit = 10) => {
  try {
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('checkins')
      .select('routine, stress, dejection, notes, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching mood patterns:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch mood patterns:', error);
    return [];
  }
};

// FIXED: Pattern analysis that returns the structure expected by MoodCheckin.jsx
export const analyzeMoodPatterns = (checkins) => {
  console.log('🧠 Analyzing mood patterns for:', checkins);
  
  if (!checkins || checkins.length < 2) {
    console.log('🧠 Not enough data for analysis');
    return null; // Need at least 2 entries for patterns
  }

  // Calculate metrics
  let totalStress = 0;
  let dejectedCount = 0;
  let consistentRoutineCount = 0;
  const commonTriggers = [];

  checkins.forEach(checkin => {
    totalStress += checkin.stress || 0;
    if (checkin.dejection) {
      dejectedCount++;
      // Extract potential triggers from notes
      if (checkin.notes) {
        const notes = checkin.notes.toLowerCase();
        if (notes.includes('study') || notes.includes('exam') || notes.includes('school')) {
          commonTriggers.push('studies');
        }
        if (notes.includes('friend') || notes.includes('social')) {
          commonTriggers.push('social');
        }
        if (notes.includes('family') || notes.includes('home')) {
          commonTriggers.push('family');
        }
        if (notes.includes('work') || notes.includes('job')) {
          commonTriggers.push('work');
        }
      }
    }
    if (checkin.routine === 'Consistent') consistentRoutineCount++;
  });

  const averageStress = Math.round(totalStress / checkins.length * 10) / 10;
  const dejectionFrequency = Math.round((dejectedCount / checkins.length) * 100);
  const routineConsistency = Math.round((consistentRoutineCount / checkins.length) * 100);

  // Generate mood summary
  let moodSummary = '';
  if (averageStress <= 2) {
    moodSummary = 'Generally calm and relaxed';
  } else if (averageStress <= 3) {
    moodSummary = 'Moderate stress levels';
  } else if (averageStress <= 4) {
    moodSummary = 'Elevated stress levels';
  } else {
    moodSummary = 'High stress periods';
  }

  // Add dejection info to summary
  if (dejectionFrequency > 50) {
    moodSummary += ', frequent low moods';
  } else if (dejectionFrequency > 20) {
    moodSummary += ', occasional low moods';
  }

  // Get unique triggers
  const uniqueTriggers = [...new Set(commonTriggers)];
  const triggersText = uniqueTriggers.length > 0 ? uniqueTriggers.join(', ') : 'None identified';

  // Generate actionable insights
  const actions = [];
  if (averageStress > 3.5) {
    actions.push("Consider stress management techniques like deep breathing or short walks");
  }
  if (dejectionFrequency > 40) {
    actions.push("Try journaling or talking to someone when feeling down");
  }
  if (routineConsistency < 50) {
    actions.push("Focus on maintaining a more consistent daily routine");
  }
  if (routineConsistency > 70 && averageStress < 3) {
    actions.push("Keep up the great work with your routine!");
  }
  if (uniqueTriggers.includes('studies')) {
    actions.push("Consider study breaks and time management techniques");
  }

  const result = {
    entriesAnalyzed: checkins.length,
    moodSummary: moodSummary,
    triggers: triggersText,
    actions: actions
  };

  console.log('🧠 Generated insights:', result);
  return result;
};