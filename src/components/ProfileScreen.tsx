import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAppState } from '../contexts/AppStateContext';
import { getUserCallLogs } from '../services/callLogService';
import { getUserAssessments } from '../services/assessmentService';
import { getUserJournals } from '../services/journalService';
import { getUserProfile } from '../services/userService';
import { useUserUsage } from '../hooks/useUserUsage';
import SubscriptionModal from './shared/SubscriptionModal';
import { SubscriptionPlan } from '../services/subscriptionService';
import { CallLog } from '../types';
import { logger } from '../utils/logger';

interface ProfileScreenProps {
  isVisible: boolean;
  onBack?: () => void;
  onLogout?: () => void;
}

interface ProfileStats {
  sessions: number;
  assessments: number;
  journal: number;
  remainingMinutes: number;
  recentCalls: CallLog[];
}

export default function ProfileScreen({ isVisible, onBack, onLogout }: ProfileScreenProps) {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    sessions: 0,
    assessments: 0,
    journal: 0,
    remainingMinutes: 0,
    recentCalls: []
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { theme, themeMode, toggleTheme } = useTheme();
  const { userProfile, user, userEmail, userName, refreshUserProfile, navigate } = useAppState();
  
  // Use real-time usage hook for accurate remaining time
  const { usage, formatRemainingTimeDetailed, refreshUserUsage } = useUserUsage(user?.uid || null);
  
  // Fetch real stats from Firebase
  useEffect(() => {
    if (!isVisible || !user?.uid) return;
    
    // Refresh user profile first to get latest total_conversation_seconds
    refreshUserProfile();
    
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Fetch all data in parallel
        // Use Promise.allSettled to handle individual errors gracefully
        const results = await Promise.allSettled([
          getUserCallLogs(user.uid, 100), // Get more for accurate stats
          getUserAssessments(user.uid, 100),
          getUserJournals(user.uid, 100)
        ]);
        
        // Extract results, defaulting to empty arrays on error
        const callLogs = results[0].status === 'fulfilled' ? results[0].value : [];
        const assessments = results[1].status === 'fulfilled' ? results[1].value : [];
        const journals = results[2].status === 'fulfilled' ? results[2].value : [];
        
        // Log any errors but don't crash
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const serviceNames = ['CallLogs', 'Assessments', 'Journals'];
            logger.warn(`[Profile] Error fetching ${serviceNames[index]}:`, result.reason);
          }
        });
        
        // Calculate sessions (unique call days or total calls)
        const sessions = callLogs.length;
        
        // Get remaining minutes from real-time usage (more accurate)
        const remainingMinutes = usage?.remaining_minutes || userProfile?.remaining ? Math.floor((userProfile.remaining || 0) / 60) : 0;
        
        // Get recent calls (last 5)
        const recentCalls = callLogs.slice(0, 5);
        
        setStats({
          sessions,
          assessments: assessments.length,
          journal: journals.length,
          remainingMinutes,
          recentCalls
        });
      } catch (error) {
        logger.error('Error fetching profile stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchStats();
  }, [isVisible, user?.uid, userProfile?.remaining, usage?.remaining_minutes, refreshUserProfile]);
  
  // Generate random star positions (memoized for performance)
  const stars = useMemo(() => {
    if (theme !== 'dark') return [];
    const starArray = [];
    const starCount = 20;
    for (let i = 0; i < starCount; i++) {
      const size = Math.random() < 0.33 ? 'small' : Math.random() < 0.66 ? 'medium' : 'large';
      starArray.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: size,
        delay: Math.random() * 2
      });
    }
    return starArray;
  }, [theme]);
  
  // Get user display name and email
  const displayName = userProfile?.display_name || userProfile?.displayName || userName || 'User';
  const email = userProfile?.email || userEmail || '';
  const photoUrl = userProfile?.photo_url || userProfile?.photoUrl || user?.photoURL || '';
  
  if (!isVisible) return null;

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.6)';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(212, 209, 202, 0.5)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const accentLight = theme === 'dark' ? '#6A7A6A' : '#98A392';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#3A3A3A';

  const menuItems = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
    { id: 'help', label: 'Help & Support', icon: '❓' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  return (
    <>
      {/* Sun/Moon - Fixed position, outside scrollable container */}
      {theme === 'dark' ? (
        <div className="moon-container">
          <div className="moon-glow"></div>
          <div className="moon"></div>
        </div>
      ) : (
        <div className="sun-container">
          <div className="sun-glow"></div>
          <div className="sun"></div>
        </div>
      )}
      
      {/* Twinkling Stars - Only in dark theme */}
      {theme === 'dark' && (
        <div className="stars-container">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`star star-${star.size}`}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: `${star.delay}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Multiple organic clouds - Fixed position, outside scrollable container */}
      <div className="cloud-wrapper">
        <img src="/assets/cloud.png" alt="" className="cloud" />
        <img src="/assets/cloud.png" alt="" className="cloud-middle" />
        <img src="/assets/cloud.png" alt="" className="cloud-lower" />
      </div>
      
    <div className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom pb-32 transition-colors duration-300 scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', paddingBottom: 'max(128px, env(safe-area-inset-bottom) + 80px)', backgroundColor: bgColor }}>

      {/* Header */}
      <div className="backdrop-blur-xl border-b px-4 py-3 shadow-sm safe-top relative z-20 transition-colors duration-300" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 245, 242, 0.8)', borderColor: borderColor }}>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all touch-target flex-shrink-0 theme-transition"
              style={{ activeBackgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={iconColor} />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <h1
              className="text-[20px] font-medium transition-colors duration-300"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
            >
              Profile
            </h1>
          </div>
          {/* Refresh Button */}
          <button
            onClick={async () => {
              setIsLoadingStats(true);
              await Promise.all([
                refreshUserProfile(),
                refreshUserUsage()
              ]);
              // Re-fetch stats after refresh
              const results = await Promise.allSettled([
                getUserCallLogs(user!.uid, 100),
                getUserAssessments(user!.uid, 100),
                getUserJournals(user!.uid, 100)
              ]);
              
              const callLogs = results[0].status === 'fulfilled' ? results[0].value : [];
              const assessments = results[1].status === 'fulfilled' ? results[1].value : [];
              const journals = results[2].status === 'fulfilled' ? results[2].value : [];
              
              setStats({
                sessions: callLogs.length,
                assessments: assessments.length,
                journal: journals.length,
                remainingMinutes: usage?.remaining_minutes || 0,
                recentCalls: callLogs.slice(0, 5)
              });
              setIsLoadingStats(false);
            }}
            disabled={isLoadingStats}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all touch-target flex-shrink-0 theme-transition"
            style={{ activeBackgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Refresh"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={isLoadingStats ? 'animate-spin' : ''}
            >
              <path 
                d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" 
                fill={iconColor} 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-24 safe-bottom relative z-10" style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom) + 60px)' }}>
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A2AD9C] to-[#98A392] flex items-center justify-center mb-4 overflow-hidden">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                  fill="#F7F5F2"
                />
              </svg>
            )}
          </div>
          <h2
            className="text-[20px] font-medium mb-1 transition-colors duration-300"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
          >
            {displayName}
          </h2>
          <p
            className="text-sm font-light transition-colors duration-300"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textSecondary }}
          >
            {email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { value: isLoadingStats ? '...' : stats.sessions.toString(), label: 'Sessions' },
            { value: isLoadingStats ? '...' : stats.assessments.toString(), label: 'Assessments' },
            { value: isLoadingStats ? '...' : stats.journal.toString(), label: 'Journal' }
          ].map((stat, index) => (
            <div key={index} className="backdrop-blur-sm border rounded-2xl p-3 text-center transition-colors duration-300" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
              <div
                className="text-[18px] font-medium mb-1 transition-colors duration-300"
                style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
              >
                {stat.value}
              </div>
              <div
                className="text-[10px] font-light transition-colors duration-300"
                style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Plan Section */}
        <div className="mb-6">
          <h2
            className="text-[18px] font-medium mb-4 transition-colors duration-300"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
          >
            Subscription Plan
          </h2>
          
          <div className="backdrop-blur-sm border rounded-2xl p-4 mb-4 transition-colors duration-300" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div
                  className="text-xs font-light mb-1 transition-colors duration-300"
                  style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
                >
                  Current Plan
                </div>
                <div
                  className="text-[18px] font-medium transition-colors duration-300"
                  style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
                >
                  {userProfile?.plan || 'Free Trial'}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-xs font-light mb-1 transition-colors duration-300"
                  style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
                >
                  Remaining Time
                </div>
                <div
                  className="text-[18px] font-medium transition-colors duration-300"
                  style={{ fontFamily: "'Fira Sans', sans-serif", color: accentColor }}
                >
                  {usage ? formatRemainingTimeDetailed() : (stats.remainingMinutes > 0 ? `${stats.remainingMinutes} min` : '0 min')}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="w-full py-3 px-4 rounded-xl font-medium transition-all touch-target active:scale-[0.98]"
              style={{
                backgroundColor: accentColor,
                color: '#FFFFFF',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
              }}
            >
              {usage && usage.remaining_seconds > 0 ? 'Upgrade Plan' : 'Get Started'}
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mb-6">
          <button
            onClick={toggleTheme}
            className="w-full backdrop-blur-sm border rounded-2xl p-4 flex items-center justify-between transition-all touch-target active:scale-[0.98]"
            style={{ 
              backgroundColor: bgCard, 
              borderColor: borderColor 
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
              <div className="flex flex-col items-start">
                <span
                  className="text-[16px] font-medium transition-colors duration-300"
                  style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
                >
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <span
                  className="text-xs font-light transition-colors duration-300"
                  style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
                >
                  {themeMode === 'auto' ? 'Auto (Time-based)' : 'Manual'}
                </span>
              </div>
            </div>
            <div className="w-14 h-8 rounded-full p-1 transition-all duration-300 theme-transition" style={{ backgroundColor: theme === 'dark' ? accentColor : borderColor }}>
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'notifications') {
                  navigate('notifications');
                } else if (item.id === 'privacy') {
                  navigate('privacy');
                } else if (item.id === 'help') {
                  navigate('help');
                } else if (item.id === 'about') {
                  navigate('about');
                }
              }}
              className="w-full backdrop-blur-sm border rounded-2xl p-4 flex items-center gap-3 transition-all touch-target active:scale-[0.98]"
              style={{ 
                backgroundColor: bgCard, 
                borderColor: borderColor 
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span
                className="flex-1 text-left text-[16px] font-medium transition-colors duration-300"
                style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
              >
                {item.label}
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                  fill={textSecondary}
                  fillOpacity="0.6"
                />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout Button - Prominent and clearly separated */}
        {onLogout && (
          <div className="border-t pt-6 mt-6 mb-8 theme-transition" style={{ borderColor: borderColor }}>
            <button
              onClick={onLogout}
              className="w-full bg-red-50/90 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-4 text-red-600 font-semibold active:bg-red-100 active:border-red-300 transition-all touch-target flex items-center justify-center gap-2.5 shadow-md active:shadow-lg active:scale-[0.98]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', fontSize: '16px' }}
              aria-label="Log out"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                  fill="currentColor"
                />
              </svg>
              Log Out
            </button>
          </div>
        )}
      </div>
      
      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSelectPlan={async (plan: SubscriptionPlan) => {
          setShowSubscriptionModal(false);
          // Refresh stats after plan selection
          if (user?.uid) {
            // Force refresh by re-fetching stats
            setTimeout(() => {
              window.location.reload(); // Simple refresh to update all data
            }, 1000);
          }
        }}
        userRemainingTime={usage?.remaining_seconds || 0}
        showFreeTrial={true}
        isReturningUser={usage ? usage.remaining_seconds > 0 : false}
      />
    </div>
    </>
  );
}

