import { useState, useEffect } from 'react';
import { 
  loadUserUsage, 
  updateUserUsage, 
  canStartCall, 
  formatRemainingTime,
  formatRemainingTimeDetailed,
  UserUsage
} from '../services/usageService';

export const useUserUsage = (uid: string | null) => {
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user usage from Firebase
  const loadUsage = async () => {
    if (!uid) return;

    try {
      setIsLoading(true);
      const userUsage = await loadUserUsage(uid);
      setUsage(userUsage);
    } catch (error) {
      console.error('Error loading user usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user usage after call ends or during call
  const updateUsage = async (callDurationSeconds: number): Promise<boolean> => {
    if (!uid) return false;

    const success = await updateUserUsage(uid, callDurationSeconds);
    if (success) {
      // Reload usage after update
      await loadUsage();
    }
    return success;
  };

  // Check if user can start a call
  const canStart = (): boolean => {
    return canStartCall(usage);
  };

  // Format remaining time as MM:SS
  const formatRemaining = (): string => {
    if (!usage) return '00:00';
    return formatRemainingTime(usage.remaining_seconds);
  };

  // Format remaining time as HH:MM:SS
  const formatRemainingDetailed = (): string => {
    if (!usage) return '00:00:00';
    return formatRemainingTimeDetailed(usage.remaining_seconds);
  };

  // Force refresh user usage (useful after subscription updates)
  const refreshUsage = async () => {
    await loadUsage();
  };

  // Load usage when uid changes
  useEffect(() => {
    if (uid) {
      loadUsage();
    } else {
      setUsage(null);
    }
  }, [uid]);

  return {
    usage,
    isLoading,
    updateUserUsage: updateUsage,
    canStartCall: canStart,
    formatRemainingTime: formatRemaining,
    formatRemainingTimeDetailed: formatRemainingDetailed,
    loadUserUsage: loadUsage,
    refreshUserUsage: refreshUsage
  };
};

