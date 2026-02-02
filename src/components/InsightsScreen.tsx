import { useTheme } from '../contexts/ThemeContext';
import { useMemo, useEffect, useState } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { getUserMoods } from '../services/moodService';
import { getUserCallLogs } from '../services/callLogService';
import { getUserJournals } from '../services/journalService';
import { getUserAssessments } from '../services/assessmentService';
import { MoodTracker, CallLog, JournalEntry, AssessmentResult } from '../types';
import { Timestamp } from 'firebase/firestore';
import { logger } from '../utils/logger';
import { MOODS } from '../hooks/useMood';

interface InsightsScreenProps {
  isVisible: boolean;
  onBack?: () => void;
}

// Map mood strings to numeric values (1-10 scale) - comprehensive mapping
const moodToValue: Record<string, number> = {
  // Positive moods (7-10)
  'very happy': 9,
  'happy': 8,
  'excited': 8,
  'energetic': 8,
  'content': 8,
  'playful': 8,
  'proud': 8,
  'cool': 8,
  'love': 9,
  'grateful': 8,
  'hopeful': 8,
  'peaceful': 7,
  'calm': 7,
  'good': 7,
  'relieved': 7,
  'surprised': 7,
  
  // Neutral moods (5-6)
  'okay': 6,
  'neutral': 5,
  'thoughtful': 5,
  
  // Negative moods (2-4)
  'sad': 4,
  'tired': 4,
  'sleepy': 4,
  'lonely': 3,
  'anxious': 3,
  'worried': 3,
  'confused': 3,
  'very sad': 3,
  'frowning': 3,
  'disappointed': 3,
  'stressed': 2,
  'angry': 2,
  'frustrated': 2,
  'determined': 2, // Can be positive but often comes from stress
  'sick': 2,
  'embarrassed': 2,
};

// Default mood value if not found
const getMoodValue = (mood: string): number => {
  const lowerMood = mood?.toLowerCase() || '';
  return moodToValue[lowerMood] || 5; // Default to neutral
};

export default function InsightsScreen({ isVisible, onBack }: InsightsScreenProps) {
  const { theme } = useTheme();
  const { user, userProfile } = useAppState();
  
  const [moods, setMoods] = useState<MoodTracker[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data when screen becomes visible
  useEffect(() => {
    if (!isVisible || !user?.uid) {
      setIsLoading(false);
      return;
    }

    const fetchInsightsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const results = await Promise.allSettled([
          getUserMoods(user.uid, 100), // Get last 100 moods for trend analysis
          getUserCallLogs(user.uid, 200), // Get last 200 call logs for 6-month analysis
          getUserJournals(user.uid, 200), // Get last 200 journal entries
          getUserAssessments(user.uid, 100), // Get last 100 assessments
        ]);

        // Extract results, defaulting to empty arrays on error
        const moodsResult = results[0].status === 'fulfilled' ? results[0].value : [];
        const callLogsResult = results[1].status === 'fulfilled' ? results[1].value : [];
        const journalsResult = results[2].status === 'fulfilled' ? results[2].value : [];
        const assessmentsResult = results[3].status === 'fulfilled' ? results[3].value : [];

        setMoods(moodsResult);
        setCallLogs(callLogsResult);
        setJournals(journalsResult);
        setAssessments(assessmentsResult);
        
        logger.debug('[Insights] Data fetched:', {
          moods: moodsResult.length,
          callLogs: callLogsResult.length,
          journals: journalsResult.length,
          assessments: assessmentsResult.length
        });
      } catch (error) {
        logger.error('[Insights] Error fetching insights data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsightsData();
  }, [isVisible, user?.uid]);

  const bgPrimary = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(162, 173, 156, 0.4)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const accentLight = theme === 'dark' ? '#6A7A6A' : '#98A392';

  // Mood colors from emoji backgrounds
  const moodColors = {
    pink: theme === 'dark' ? '#DB2777' : '#F9A8D4',      // bg-pink-200/600
    yellow: theme === 'dark' ? '#CA8A04' : '#FCD34D',    // bg-yellow-200/600
    orange: theme === 'dark' ? '#EA580C' : '#FDBA74',   // bg-orange-200/600
    blue: theme === 'dark' ? '#2563EB' : '#93C5FD',      // bg-blue-200/600
    gray: theme === 'dark' ? '#6B7280' : '#D1D5DB'       // bg-gray-200/600
  };

  // Process mood data for 7-day trend chart
  const moodData = useMemo(() => {
    if (moods.length === 0) {
      // Return empty data with default values
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map(day => ({ day, value: 5 }));
    }

    // Get last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Group moods by day
    const dayMap = new Map<string, number[]>();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    moods.forEach(mood => {
      const moodDate = mood.date_time?.toDate ? mood.date_time.toDate() : new Date(mood.date_time);
      if (moodDate >= sevenDaysAgo) {
        const dayKey = dayNames[moodDate.getDay()];
        const moodValue = getMoodValue(mood.mood);
        if (!dayMap.has(dayKey)) {
          dayMap.set(dayKey, []);
        }
        dayMap.get(dayKey)!.push(moodValue);
      }
    });

    // Calculate average mood per day (last 7 days, most recent first)
    const result: { day: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = dayNames[date.getDay()];
      const dayMoods = dayMap.get(dayName) || [];
      const avgMood = dayMoods.length > 0 
        ? dayMoods.reduce((sum, val) => sum + val, 0) / dayMoods.length 
        : 5; // Default to neutral if no data
      result.push({ day: dayName, value: Math.round(avgMood * 10) / 10 });
    }

    return result;
  }, [moods]);

  // Process call logs for 6-month session frequency chart
  const sessionData = useMemo(() => {
    if (callLogs.length === 0) {
      // Return empty data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map(month => ({ month, sessions: 0 }));
    }

    // Get last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group call logs by month
    const monthMap = new Map<string, number>();
    
    callLogs.forEach(log => {
      const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : 
                     log.startTime?.toDate ? log.startTime.toDate() : 
                     new Date(log.timestamp || log.startTime);
      
      if (logDate >= sixMonthsAgo) {
        const monthKey = `${monthNames[logDate.getMonth()]}`;
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
      }
    });

    // Get last 6 months
    const result: { month: string; sessions: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthNames[date.getMonth()];
      result.push({ 
        month: monthName, 
        sessions: monthMap.get(monthName) || 0 
      });
    }

    return result;
  }, [callLogs]);

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

  // Calculate weekly progress (percentage of days with activity)
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeDays = new Set<string>();
    
    // Count days with any activity
    [...callLogs, ...journals, ...assessments].forEach(item => {
      const itemDate = item.timestamp?.toDate ? item.timestamp.toDate() :
                      item.date_time?.toDate ? item.date_time.toDate() :
                      item.submit_time?.toDate ? item.submit_time.toDate() :
                      new Date(item.timestamp || item.date_time || item.submit_time);
      
      if (itemDate >= weekAgo) {
        const dayKey = itemDate.toDateString();
        activeDays.add(dayKey);
      }
    });

    return Math.round((activeDays.size / 7) * 100);
  }, [callLogs, journals, assessments]);

  // Calculate monthly progress (percentage of goal - using 20 activities as goal)
  const monthlyProgress = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const monthlyActivities = [...callLogs, ...journals, ...assessments].filter(item => {
      const itemDate = item.timestamp?.toDate ? item.timestamp.toDate() :
                      item.date_time?.toDate ? item.date_time.toDate() :
                      item.submit_time?.toDate ? item.submit_time.toDate() :
                      new Date(item.timestamp || item.date_time || item.submit_time);
      return itemDate >= monthAgo;
    }).length;

    const goal = 20; // 20 activities per month
    return Math.min(Math.round((monthlyActivities / goal) * 100), 100);
  }, [callLogs, journals, assessments]);

  // Activity breakdown with real data
  const activityData = useMemo(() => {
    const chatSessions = callLogs.length;
    const journalEntries = journals.length;
    const assessmentCount = assessments.length;
    // Breathing sessions - we don't have this data, so we'll use 0 or estimate
    const breathingSessions = 0; // Placeholder - no breathing data in Firestore

    return [
      { label: 'Chat Sessions', value: chatSessions, color: moodColors.pink },
      { label: 'Journal', value: journalEntries, color: moodColors.yellow },
      { label: 'Assessments', value: assessmentCount, color: moodColors.blue },
      { label: 'Breathing', value: breathingSessions, color: moodColors.orange },
    ].filter(activity => activity.value > 0 || activity.label === 'Breathing'); // Show breathing even if 0
  }, [callLogs, journals, assessments, moodColors]);

  // Calculate most common mood
  const mostCommonMood = useMemo(() => {
    if (moods.length === 0) return null;
    
    const moodCounts = new Map<string, number>();
    moods.forEach(mood => {
      const count = moodCounts.get(mood.mood) || 0;
      moodCounts.set(mood.mood, count + 1);
    });
    
    let maxCount = 0;
    let mostCommon = '';
    moodCounts.forEach((count, mood) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = mood;
      }
    });
    
    return mostCommon ? { mood: mostCommon, count: maxCount, total: moods.length } : null;
  }, [moods]);

  // Calculate activity streak (consecutive days with activity)
  const activityStreak = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const activeDays = new Set<string>();
    [...callLogs, ...journals, ...assessments, ...moods].forEach(item => {
      const itemDate = item.timestamp?.toDate ? item.timestamp.toDate() :
                      item.date_time?.toDate ? item.date_time.toDate() :
                      item.submit_time?.toDate ? item.submit_time.toDate() :
                      new Date(item.timestamp || item.date_time || item.submit_time);
      itemDate.setHours(0, 0, 0, 0);
      activeDays.add(itemDate.toISOString());
    });
    
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      if (activeDays.has(checkDate.toISOString())) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }
    
    return streak;
  }, [callLogs, journals, assessments, moods]);

  // Calculate comparison with previous period
  const previousPeriodComparison = useMemo(() => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    
    const currentWeekActivities = [...callLogs, ...journals, ...assessments].filter(item => {
      const itemDate = item.timestamp?.toDate ? item.timestamp.toDate() :
                      item.date_time?.toDate ? item.date_time.toDate() :
                      item.submit_time?.toDate ? item.submit_time.toDate() :
                      new Date(item.timestamp || item.date_time || item.submit_time);
      return itemDate >= currentWeekStart;
    }).length;
    
    const previousWeekActivities = [...callLogs, ...journals, ...assessments].filter(item => {
      const itemDate = item.timestamp?.toDate ? item.timestamp.toDate() :
                      item.date_time?.toDate ? item.date_time.toDate() :
                      item.submit_time?.toDate ? item.submit_time.toDate() :
                      new Date(item.timestamp || item.date_time || item.submit_time);
      return itemDate >= previousWeekStart && itemDate < currentWeekStart;
    }).length;
    
    if (previousWeekActivities === 0) return null;
    
    const change = ((currentWeekActivities - previousWeekActivities) / previousWeekActivities) * 100;
    return { change, current: currentWeekActivities, previous: previousWeekActivities };
  }, [callLogs, journals, assessments]);

  // Generate insights based on real data
  const insights = useMemo(() => {
    const result: { icon: string; text: string; color: string }[] = [];

    // Insight 1: Mood trend
    if (moodData.length >= 2) {
      const firstWeek = moodData.slice(0, 3).reduce((sum, d) => sum + d.value, 0) / 3;
      const lastWeek = moodData.slice(-3).reduce((sum, d) => sum + d.value, 0) / 3;
      const moodChange = firstWeek > 0 ? ((lastWeek - firstWeek) / firstWeek) * 100 : 0;
      
      if (moodChange > 5) {
        result.push({
          icon: '📈',
          text: `Your mood has improved by ${Math.round(moodChange)}% this week`,
          color: moodColors.pink
        });
      } else if (moodChange < -5) {
        result.push({
          icon: '📉',
          text: `Your mood has decreased by ${Math.round(Math.abs(moodChange))}% this week`,
          color: moodColors.orange
        });
      }
    }

    // Insight 2: Most common mood
    if (mostCommonMood && mostCommonMood.count >= 3) {
      const moodEmoji = MOODS.find(m => m.label.toLowerCase() === mostCommonMood.mood.toLowerCase())?.emoji || '😊';
      result.push({
        icon: moodEmoji,
        text: `Your most common mood is ${mostCommonMood.mood} (${mostCommonMood.count} times)`,
        color: moodColors.yellow
      });
    }

    // Insight 3: Activity streak
    if (activityStreak >= 3) {
      result.push({
        icon: '🔥',
        text: `You're on a ${activityStreak}-day activity streak! Keep it up!`,
        color: moodColors.orange
      });
    }

    // Insight 4: Weekly comparison
    if (previousPeriodComparison && Math.abs(previousPeriodComparison.change) > 10) {
      if (previousPeriodComparison.change > 0) {
        result.push({
          icon: '📊',
          text: `You're ${Math.round(previousPeriodComparison.change)}% more active than last week`,
          color: moodColors.blue
        });
      } else {
        result.push({
          icon: '📊',
          text: `You're ${Math.round(Math.abs(previousPeriodComparison.change))}% less active than last week`,
          color: moodColors.gray
        });
      }
    }

    // Insight 5: Monthly goal
    if (monthlyProgress >= 80) {
      result.push({
        icon: '🎯',
        text: "You're on track to reach your monthly goal",
        color: moodColors.yellow
      });
    } else if (monthlyProgress < 50 && monthlyProgress > 0) {
      result.push({
        icon: '💪',
        text: 'Keep going! You\'re making progress toward your goal',
        color: moodColors.orange
      });
    }

    // Insight 6: Journaling consistency
    const recentJournals = journals.filter(j => {
      const journalDate = j.date_time?.toDate ? j.date_time.toDate() : new Date(j.date_time);
      return journalDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    });
    if (recentJournals.length >= 3) {
      result.push({
        icon: '📝',
        text: `You've journaled ${recentJournals.length} times this week - great consistency!`,
        color: moodColors.blue
      });
    }

    // Insight 7: Wellness score
    if (wellnessScore >= 70) {
      result.push({
        icon: '🌟',
        text: `Your wellness score is ${wellnessScore} - above average!`,
        color: moodColors.blue
      });
    } else if (wellnessScore < 50 && wellnessScore > 0) {
      result.push({
        icon: '💙',
        text: `Your wellness score is ${wellnessScore} - focus on self-care to improve`,
        color: moodColors.blue
      });
    }

    // Insight 8: Call session frequency
    const recentCalls = callLogs.filter(call => {
      const callDate = call.timestamp?.toDate ? call.timestamp.toDate() :
                      call.startTime?.toDate ? call.startTime.toDate() :
                      new Date(call.timestamp || call.startTime);
      return callDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    });
    if (recentCalls.length >= 5) {
      result.push({
        icon: '💬',
        text: `You've had ${recentCalls.length} chat sessions this week - excellent engagement!`,
        color: moodColors.pink
      });
    }

    // Default insights if no data
    if (result.length === 0) {
      result.push({
        icon: '📊',
        text: 'Start tracking your mood and activities to see personalized insights',
        color: moodColors.gray
      });
    }

    return result.slice(0, 6); // Limit to 6 insights
  }, [moodData, monthlyProgress, journals, wellnessScore, moodColors, mostCommonMood, activityStreak, previousPeriodComparison, callLogs]);

  // Calculate chart dimensions and positions
  const chartWidth = 280;
  const chartHeight = 160;
  const padding = 20;
  const maxMood = 10;
  // Dynamic max sessions based on actual data (add 20% padding)
  const maxSessions = useMemo(() => {
    if (sessionData.length === 0) return 25;
    const max = Math.max(...sessionData.map(s => s.sessions));
    return Math.max(Math.ceil(max * 1.2), 5); // At least 5, or 20% more than max
  }, [sessionData]);

  // Generate line path for mood chart
  const moodPath = useMemo(() => {
    const points = moodData.map((point, index) => {
      const x = padding + (index * (chartWidth - padding * 2) / (moodData.length - 1));
      const y = chartHeight - padding - (point.value / maxMood) * (chartHeight - padding * 2);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }, [moodData]);

  // Generate bars for session chart
  const sessionBars = useMemo(() => {
    return sessionData.map((point, index) => {
      const barWidth = (chartWidth - padding * 2) / sessionData.length - 4;
      const x = padding + index * ((chartWidth - padding * 2) / sessionData.length);
      const height = (point.sessions / maxSessions) * (chartHeight - padding * 2);
      const y = chartHeight - padding - height;
      return { x, y, width: barWidth, height, value: point.sessions, month: point.month };
    });
  }, [sessionData]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto safe-top safe-bottom transition-opacity duration-300"
      style={{
        backgroundColor: bgPrimary,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        fontFamily: "'Fira Sans', sans-serif"
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 backdrop-blur-xl border-b transition-all duration-300"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(247, 245, 242, 0.95)',
          borderColor: borderColor
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 touch-target"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.2)' : 'rgba(162, 173, 156, 0.15)',
                  color: textPrimary
                }}
                aria-label="Go back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <h1
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: textPrimary }}
            >
              Insights
            </h1>
          </div>
          {/* Refresh Button */}
          <button
            onClick={async () => {
              if (!user?.uid) return;
              setIsLoading(true);
              try {
                const results = await Promise.allSettled([
                  getUserMoods(user.uid, 100),
                  getUserCallLogs(user.uid, 200),
                  getUserJournals(user.uid, 200),
                  getUserAssessments(user.uid, 100),
                ]);
                setMoods(results[0].status === 'fulfilled' ? results[0].value : []);
                setCallLogs(results[1].status === 'fulfilled' ? results[1].value : []);
                setJournals(results[2].status === 'fulfilled' ? results[2].value : []);
                setAssessments(results[3].status === 'fulfilled' ? results[3].value : []);
                logger.log('[Insights] Data refreshed');
              } catch (error) {
                logger.error('[Insights] Error refreshing data:', error);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 touch-target"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.2)' : 'rgba(162, 173, 156, 0.15)',
              color: textPrimary,
              opacity: isLoading ? 0.5 : 1
            }}
            aria-label="Refresh insights"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={isLoading ? 'animate-spin' : ''}
            >
              <path 
                d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" 
                fill="currentColor" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-24 safe-bottom">
        {/* Data Status Indicator */}
        {!isLoading && (
          <div className="mb-4 px-4 py-2 rounded-xl backdrop-blur-sm border" 
               style={{ 
                 backgroundColor: bgCard, 
                 borderColor: borderColor 
               }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-light" style={{ color: textSecondary }}>
                Data Status
              </span>
              <div className="flex items-center gap-4 text-xs" style={{ color: textSecondary }}>
                <span>Moods: {moods.length}</span>
                <span>Sessions: {callLogs.length}</span>
                <span>Journals: {journals.length}</span>
                <span>Assessments: {assessments.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className="rounded-2xl p-4 border backdrop-blur-sm transition-all duration-300"
            style={{ backgroundColor: bgCard, borderColor: borderColor }}
          >
            <div
              className="text-xs font-light mb-1 transition-colors duration-300"
              style={{ color: textSecondary }}
            >
              Wellness Score
            </div>
            <div className="flex items-baseline gap-2">
              <div
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: textPrimary }}
              >
                {wellnessScore}
              </div>
              {moodData.length >= 2 && (() => {
                const firstWeek = moodData.slice(0, 3).reduce((sum, d) => sum + d.value, 0) / 3;
                const lastWeek = moodData.slice(-3).reduce((sum, d) => sum + d.value, 0) / 3;
                const change = ((lastWeek - firstWeek) / firstWeek) * 100;
                return change !== 0 ? (
                  <div
                    className="text-xs font-medium transition-colors duration-300"
                    style={{ color: change > 0 ? accentColor : moodColors.orange }}
                  >
                    {change > 0 ? '+' : ''}{Math.round(change)}%
                  </div>
                ) : null;
              })()}
            </div>
          </div>
          <div
            className="rounded-2xl p-4 border backdrop-blur-sm transition-all duration-300"
            style={{ backgroundColor: bgCard, borderColor: borderColor }}
          >
            <div
              className="text-xs font-light mb-1 transition-colors duration-300"
              style={{ color: textSecondary }}
            >
              This Week
            </div>
            <div className="flex items-baseline gap-2">
              <div
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: textPrimary }}
              >
                {weeklyProgress}%
              </div>
              <div
                className="text-xs font-medium transition-colors duration-300"
                style={{ color: accentColor }}
              >
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Mood Trend Chart */}
        <div
          className="rounded-2xl p-5 mb-6 border backdrop-blur-sm transition-all duration-300"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <h2
            className="text-lg font-semibold mb-4 transition-colors duration-300"
            style={{ color: textPrimary }}
          >
            Mood Trend (7 Days)
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center" style={{ width: chartWidth, height: chartHeight }}>
              <div className="text-sm" style={{ color: textSecondary }}>Loading mood data...</div>
            </div>
          ) : moods.length === 0 ? (
            <div className="flex items-center justify-center" style={{ width: chartWidth, height: chartHeight }}>
              <div className="text-sm text-center" style={{ color: textSecondary }}>
                No mood data available.<br />
                Start tracking your mood to see trends!
              </div>
            </div>
          ) : (
            <div className="relative" style={{ width: chartWidth, height: chartHeight }}>
            <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
              {/* Grid lines */}
              {[0, 2, 4, 6, 8, 10].map((value) => {
                const y = chartHeight - padding - (value / maxMood) * (chartHeight - padding * 2);
                return (
                  <line
                    key={value}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke={borderColor}
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
                );
              })}
              {/* Mood line with gradient effect */}
              <defs>
                <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={moodColors.pink} />
                  <stop offset="33%" stopColor={moodColors.yellow} />
                  <stop offset="66%" stopColor={moodColors.orange} />
                  <stop offset="100%" stopColor={moodColors.blue} />
                </linearGradient>
              </defs>
              <path
                d={moodPath}
                fill="none"
                stroke="url(#moodGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {moodData.map((point, index) => {
                const x = padding + (index * (chartWidth - padding * 2) / (moodData.length - 1));
                const y = chartHeight - padding - (point.value / maxMood) * (chartHeight - padding * 2);
                const pointColor = index < 2 ? moodColors.pink : index < 4 ? moodColors.yellow : index < 6 ? moodColors.orange : moodColors.blue;
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill={pointColor}
                      stroke={bgCard}
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={chartHeight - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill={textSecondary}
                    >
                      {point.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          )}
        </div>

        {/* Session Frequency Chart */}
        <div
          className="rounded-2xl p-5 mb-6 border backdrop-blur-sm transition-all duration-300"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <h2
            className="text-lg font-semibold mb-4 transition-colors duration-300"
            style={{ color: textPrimary }}
          >
            Session Frequency (6 Months)
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center" style={{ width: chartWidth, height: chartHeight }}>
              <div className="text-sm" style={{ color: textSecondary }}>Loading session data...</div>
            </div>
          ) : callLogs.length === 0 ? (
            <div className="flex items-center justify-center" style={{ width: chartWidth, height: chartHeight }}>
              <div className="text-sm text-center" style={{ color: textSecondary }}>
                No session data available.<br />
                Start making calls to see your activity!
              </div>
            </div>
          ) : (
            <div className="relative" style={{ width: chartWidth, height: chartHeight }}>
            <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
              {/* Grid lines */}
              {[0, 5, 10, 15, 20, 25].map((value) => {
                const y = chartHeight - padding - (value / maxSessions) * (chartHeight - padding * 2);
                return (
                  <line
                    key={value}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke={borderColor}
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
                );
              })}
              {/* Bars with mood colors */}
              {sessionBars.map((bar, index) => {
                const barColors = [moodColors.pink, moodColors.yellow, moodColors.orange, moodColors.blue, moodColors.pink, moodColors.yellow];
                return (
                  <g key={index}>
                    <rect
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      fill={barColors[index]}
                      rx="2"
                      opacity="0.85"
                    />
                  <text
                    x={bar.x + bar.width / 2}
                    y={bar.y - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill={textPrimary}
                    fontWeight="600"
                  >
                    {bar.value}
                  </text>
                  <text
                    x={bar.x + bar.width / 2}
                    y={chartHeight - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill={textSecondary}
                  >
                    {bar.month}
                  </text>
                </g>
                );
              })}
            </svg>
          </div>
          )}
        </div>

        {/* Activity Breakdown */}
        <div
          className="rounded-2xl p-5 mb-6 border backdrop-blur-sm transition-all duration-300"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <h2
            className="text-lg font-semibold mb-4 transition-colors duration-300"
            style={{ color: textPrimary }}
          >
            Activity Breakdown
          </h2>
          <div className="space-y-3">
            {activityData.map((activity, index) => {
              const total = activityData.reduce((sum, a) => sum + a.value, 0);
              const percentage = (activity.value / total) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm font-medium transition-colors duration-300"
                      style={{ color: textPrimary }}
                    >
                      {activity.label}
                    </span>
                    <span
                      className="text-sm font-semibold transition-colors duration-300"
                      style={{ color: textSecondary }}
                    >
                      {activity.value}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.3)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: activity.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Progress */}
        <div
          className="rounded-2xl p-5 mb-6 border backdrop-blur-sm transition-all duration-300"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <h2
            className="text-lg font-semibold mb-4 transition-colors duration-300"
            style={{ color: textPrimary }}
          >
            Monthly Progress
          </h2>
          <div className="relative">
            <div className="relative w-full h-8 rounded-full overflow-hidden" style={{ backgroundColor: theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.3)' }}>
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${monthlyProgress}%`,
                  background: `linear-gradient(to right, ${moodColors.pink}, ${moodColors.yellow}, ${moodColors.orange}, ${moodColors.blue})`
                }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: theme === 'dark' ? '#FFFFFF' : '#F7F5F2' }}
                >
                  {monthlyProgress}%
                </span>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span
                className="text-xs font-light transition-colors duration-300"
                style={{ color: textSecondary }}
              >
                Goal: 100%
              </span>
              <span
                className="text-xs font-medium transition-colors duration-300"
                style={{ color: accentColor }}
              >
                +18% from last month
              </span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div
          className="rounded-2xl p-5 border backdrop-blur-sm transition-all duration-300"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <h2
            className="text-lg font-semibold mb-4 transition-colors duration-300"
            style={{ color: textPrimary }}
          >
            Key Insights
          </h2>
          <div className="space-y-3">
            {insights.length === 0 ? (
              <div className="text-center py-4">
                <p
                  className="text-sm font-light transition-colors duration-300"
                  style={{ color: textSecondary }}
                >
                  Start tracking your activities to see personalized insights
                </p>
              </div>
            ) : (
              insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-xl">{insight.icon}</span>
                <p
                  className="text-sm font-medium flex-1 transition-colors duration-300"
                  style={{ color: textPrimary }}
                >
                  {insight.text}
                </p>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
