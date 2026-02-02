import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveMood, getTodayMood } from '../services/moodService';
import { MoodTracker } from '../types';
import { logger } from '../utils/logger';

export interface Mood {
  id: string;
  emoji: string;
  color: string;
  label: string;
}

export const MOODS: Mood[] = [
  { id: 'happy', emoji: '😊', color: 'bg-pink-200', label: 'Happy' },
  { id: 'sad', emoji: '😢', color: 'bg-yellow-200', label: 'Sad' },
  { id: 'frowning', emoji: '😞', color: 'bg-gray-300', label: 'Frowning' },
  { id: 'angry', emoji: '😠', color: 'bg-orange-200', label: 'Angry' },
  { id: 'neutral', emoji: '😐', color: 'bg-gray-200', label: 'Neutral' },
  { id: 'excited', emoji: '🤩', color: 'bg-pink-200', label: 'Excited' },
  { id: 'anxious', emoji: '😰', color: 'bg-yellow-200', label: 'Anxious' },
  { id: 'calm', emoji: '😌', color: 'bg-blue-200', label: 'Calm' },
  { id: 'tired', emoji: '😴', color: 'bg-gray-200', label: 'Tired' },
  { id: 'confused', emoji: '😕', color: 'bg-gray-300', label: 'Confused' },
  { id: 'grateful', emoji: '🙏', color: 'bg-yellow-200', label: 'Grateful' },
  { id: 'love', emoji: '🥰', color: 'bg-pink-200', label: 'Love' },
  { id: 'stressed', emoji: '😓', color: 'bg-orange-200', label: 'Stressed' },
  { id: 'peaceful', emoji: '☺️', color: 'bg-blue-200', label: 'Peaceful' },
  { id: 'frustrated', emoji: '😤', color: 'bg-orange-200', label: 'Frustrated' },
  { id: 'hopeful', emoji: '😇', color: 'bg-blue-200', label: 'Hopeful' },
  { id: 'lonely', emoji: '😔', color: 'bg-gray-300', label: 'Lonely' },
  { id: 'proud', emoji: '😎', color: 'bg-blue-200', label: 'Proud' },
  { id: 'worried', emoji: '😟', color: 'bg-yellow-200', label: 'Worried' },
  { id: 'content', emoji: '😄', color: 'bg-pink-200', label: 'Content' },
  { id: 'surprised', emoji: '😲', color: 'bg-yellow-200', label: 'Surprised' },
  { id: 'embarrassed', emoji: '😳', color: 'bg-pink-200', label: 'Embarrassed' },
  { id: 'sick', emoji: '🤒', color: 'bg-orange-200', label: 'Sick' },
  { id: 'cool', emoji: '😎', color: 'bg-blue-200', label: 'Cool' },
  { id: 'sleepy', emoji: '😪', color: 'bg-gray-200', label: 'Sleepy' },
  { id: 'relieved', emoji: '😮‍💨', color: 'bg-blue-200', label: 'Relieved' },
  { id: 'disappointed', emoji: '😞', color: 'bg-gray-300', label: 'Disappointed' },
  { id: 'thoughtful', emoji: '🤔', color: 'bg-gray-200', label: 'Thoughtful' },
  { id: 'playful', emoji: '😜', color: 'bg-pink-200', label: 'Playful' },
  { id: 'determined', emoji: '😤', color: 'bg-orange-200', label: 'Determined' }
];

export const useMood = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [todayMood, setTodayMood] = useState<MoodTracker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch today's mood on mount and when user changes
  useEffect(() => {
    if (!user?.uid) {
      setCurrentMood(null);
      setTodayMood(null);
      setIsLoading(false);
      return;
    }

    const fetchTodayMood = async () => {
      try {
        setIsLoading(true);
        const mood = await getTodayMood(user.uid);
        if (mood) {
          // Find mood ID by matching label
          const moodData = MOODS.find(m => m.label.toLowerCase() === mood.mood.toLowerCase());
          if (moodData) {
            setCurrentMood(moodData.id);
            setSelectedMood(moodData.id);
            setTodayMood(mood);
            logger.debug('[useMood] Loaded today mood:', moodData.label);
          }
        } else {
          setCurrentMood(null);
          setSelectedMood(null);
          setTodayMood(null);
        }
      } catch (error) {
        logger.error('[useMood] Error fetching today mood:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayMood();
  }, [user?.uid]);

  const selectMood = useCallback(async (moodId: string) => {
    // If mood already selected today, don't allow change
    if (todayMood) {
      logger.debug('[useMood] Mood already selected today, cannot change');
      return;
    }

    if (!user?.uid || !user?.email) {
      logger.warn('[useMood] Cannot select mood: user not authenticated');
      return;
    }

    const mood = MOODS.find(m => m.id === moodId);
    if (!mood) {
      logger.warn('[useMood] Invalid mood ID:', moodId);
      return;
    }

    // IMMEDIATELY update local state for instant UI feedback
    setSelectedMood(moodId);
    setCurrentMood(moodId);

    try {
      setIsSaving(true);
      
      // Save to Firestore
      const savedMoodId = await saveMood(user.uid, user.email, mood.label, mood.emoji);
      logger.log('[useMood] Mood saved to Firestore:', mood.label, 'ID:', savedMoodId);
      
      // Fetch the saved mood to update todayMood
      const savedMood = await getTodayMood(user.uid);
      if (savedMood) {
        setTodayMood(savedMood);
      }
    } catch (error) {
      logger.error('[useMood] Error saving mood:', error);
      // Revert state if save failed
      setSelectedMood(null);
      setCurrentMood(null);
    } finally {
      setIsSaving(false);
    }
  }, [user, todayMood]);

  const clearMood = useCallback(() => {
    // Cannot clear mood once saved for the day
    if (todayMood) {
      logger.debug('[useMood] Cannot clear mood: already saved for today');
      return;
    }
    setCurrentMood(null);
    setSelectedMood(null);
  }, [todayMood]);

  const getMoodById = useCallback((moodId: string) => {
    return MOODS.find(m => m.id === moodId);
  }, []);

  return {
    moods: MOODS,
    selectedMood,
    currentMood,
    todayMood,
    isLoading,
    isSaving,
    selectMood,
    clearMood,
    getMoodById,
  };
};
