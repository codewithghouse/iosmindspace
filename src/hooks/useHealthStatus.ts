import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { getUserMoods } from '../services/moodService';
import { getUserCallLogs } from '../services/callLogService';
import { getUserJournals } from '../services/journalService';
import { getUserAssessments } from '../services/assessmentService';
import { MoodTracker, CallLog, JournalEntry, AssessmentResult } from '../types';

export interface HealthStatus {
  percentage: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdated: Date;
  isLoading: boolean;
}

const getStatusFromPercentage = (percentage: number): HealthStatus['status'] => {
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'fair';
  return 'poor';
};

// Map mood strings to numeric values (1-10 scale)
const moodToValue: Record<string, number> = {
  'very happy': 9,
  'happy': 8,
  'good': 7,
  'okay': 6,
  'neutral': 5,
  'sad': 4,
  'very sad': 3,
  'anxious': 3,
  'stressed': 2,
  'angry': 2,
  'excited': 8,
  'calm': 7,
  'tired': 4,
  'energetic': 8,
};

const getMoodValue = (mood: string): number => {
  const lowerMood = mood?.toLowerCase() || '';
  return moodToValue[lowerMood] || 5; // Default to neutral
};

export const useHealthStatus = () => {
  const { user } = useAppState();
  const [moods, setMoods] = useState<MoodTracker[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data when user is available
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const fetchHealthData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const results = await Promise.allSettled([
          getUserMoods(user.uid, 30), // Last 30 moods
          getUserCallLogs(user.uid, 50), // Last 50 call logs
          getUserJournals(user.uid, 50), // Last 50 journal entries
          getUserAssessments(user.uid, 50), // Last 50 assessments
        ]);

        // Extract results, defaulting to empty arrays on error
        setMoods(results[0].status === 'fulfilled' ? results[0].value : []);
        setCallLogs(results[1].status === 'fulfilled' ? results[1].value : []);
        setJournals(results[2].status === 'fulfilled' ? results[2].value : []);
        setAssessments(results[3].status === 'fulfilled' ? results[3].value : []);
      } catch (error) {
        console.error('Error fetching health status data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthData();
  }, [user?.uid]);

  // Calculate wellness score (0-100) based on various factors
  const wellnessScore = useMemo(() => {
    if (moods.length === 0 && callLogs.length === 0 && journals.length === 0) {
      return 0; // No data
    }

    // Factor 1: Average mood (40% weight)
    const recentMoods = moods.slice(0, 30); // Last 30 moods
    const avgMood = recentMoods.length > 0
      ? recentMoods.reduce((sum, m) => sum + getMoodValue(m.mood), 0) / recentMoods.length
      : 5;
    const moodScore = (avgMood / 10) * 40; // Convert to 0-40 scale

    // Factor 2: Activity level (30% weight)
    const totalActivities = callLogs.length + journals.length + assessments.length;
    const activityScore = Math.min((totalActivities / 50) * 30, 30); // Cap at 30

    // Factor 3: Consistency (30% weight)
    const lastWeekMoods = moods.filter(m => {
      const moodDate = m.date_time?.toDate ? m.date_time.toDate() : new Date(m.date_time);
      return moodDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    });
    const consistencyScore = Math.min((lastWeekMoods.length / 7) * 30, 30); // Cap at 30

    return Math.round(moodScore + activityScore + consistencyScore);
  }, [moods, callLogs, journals, assessments]);

  // Calculate health status from wellness score
  const healthStatus = useMemo<HealthStatus>(() => {
    const percentage = wellnessScore;
    const status = getStatusFromPercentage(percentage);
    
    return {
      percentage,
      status,
      lastUpdated: new Date(),
      isLoading,
    };
  }, [wellnessScore, isLoading]);

  const updateHealthStatus = useCallback((percentage: number) => {
    // This function is kept for backward compatibility but now health status
    // is calculated automatically from Firestore data
    console.warn('updateHealthStatus is deprecated - health status is now calculated from Firestore data');
  }, []);

  const getStatusLabel = useCallback((status: HealthStatus['status']) => {
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
    };
    return labels[status];
  }, []);

  const getStatusColor = useCallback((status: HealthStatus['status'], theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      const colors = {
        excellent: '#4ade80',
        good: '#7A8A7A',
        fair: '#fbbf24',
        poor: '#ef4444',
      };
      return colors[status];
    } else {
      const colors = {
        excellent: '#22c55e',
        good: '#7A8A7A',
        fair: '#eab308',
        poor: '#dc2626',
      };
      return colors[status];
    }
  }, []);

  return {
    healthStatus,
    updateHealthStatus,
    getStatusLabel,
    getStatusColor,
  };
};

