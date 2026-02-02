import { useState, useEffect, useMemo } from 'react';
import AnimatedList from './AnimatedList';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationsScreenProps {
  isVisible: boolean;
  onBack?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'reminder' | 'achievement' | 'update';
  read: boolean;
}

export default function NotificationsScreen({ isVisible, onBack }: NotificationsScreenProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { theme } = useTheme();

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

  if (!isVisible) return null;

  // Theme-aware colors
  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const bgHeader = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(162, 173, 156, 0.4)';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Welcome to TARA!',
      message: 'Thank you for joining TARA. Start your mental wellness journey by making your first call.',
      time: '2 hours ago',
      type: 'info',
      read: false
    },
    {
      id: '2',
      title: 'Daily Check-in Reminder',
      message: 'Don\'t forget to track your mood today. Regular mood tracking helps identify patterns and improve your well-being.',
      time: '5 hours ago',
      type: 'reminder',
      read: false
    },
    {
      id: '3',
      title: 'New Feature Available',
      message: 'We\'ve added new breathing exercises to help you relax. Check them out in the Self-Care section.',
      time: '1 day ago',
      type: 'update',
      read: true
    },
    {
      id: '4',
      title: 'Weekly Progress Summary',
      message: 'You\'ve completed 3 sessions this week! Keep up the great work on your mental wellness journey.',
      time: '2 days ago',
      type: 'achievement',
      read: true
    },
    {
      id: '5',
      title: 'Subscription Plan Update',
      message: 'Your subscription plan has been successfully updated. You now have access to premium features.',
      time: '3 days ago',
      type: 'info',
      read: true
    },
    {
      id: '6',
      title: 'Journal Entry Reminder',
      message: 'It\'s been a while since your last journal entry. Writing can help process emotions and reduce stress.',
      time: '4 days ago',
      type: 'reminder',
      read: true
    },
    {
      id: '7',
      title: 'New Article Available',
      message: 'Check out our latest article: "Understanding Anxiety: A Comprehensive Guide" in the Articles section.',
      time: '5 days ago',
      type: 'update',
      read: true
    },
    {
      id: '8',
      title: 'Assessment Reminder',
      message: 'Complete your monthly mental health assessment to track your progress and get personalized insights.',
      time: '1 week ago',
      type: 'reminder',
      read: true
    },
    {
      id: '9',
      title: 'Milestone Achieved!',
      message: 'Congratulations! You\'ve completed 10 sessions with TARA. Your commitment to mental wellness is inspiring.',
      time: '1 week ago',
      type: 'achievement',
      read: true
    },
    {
      id: '10',
      title: 'Privacy Policy Updated',
      message: 'We\'ve updated our privacy policy to better protect your data. Review the changes in the Privacy & Security section.',
      time: '2 weeks ago',
      type: 'info',
      read: true
    }
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return 'Information';
      case 'reminder': return 'Reminder';
      case 'achievement': return 'Achievement';
      case 'update': return 'Update';
      default: return 'Notification';
    }
  };

  if (selectedNotification) {
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
      
      <div className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom pb-20 theme-transition scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', backgroundColor: bgColor }}>

        {/* Header */}
        <div className="backdrop-blur-md border-b px-4 py-4 shadow-sm safe-top relative z-20 theme-transition" style={{ backgroundColor: bgHeader, borderColor: borderColor }}>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setSelectedNotification(null)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all touch-target flex-shrink-0 theme-transition"
              style={{ activeBackgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Back to notifications"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={iconColor} />
              </svg>
            </button>
            <div className="flex-1">
              <h1
                className="text-[24px] font-medium theme-transition"
                style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
              >
                Notification
              </h1>
            </div>
          </div>
        </div>

        {/* Notification Content */}
        <div className="py-6 safe-bottom relative z-10">
          <div className="mb-4 px-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium theme-transition"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                backgroundColor: theme === 'dark' ? `${accentColor}20` : `${accentColor}20`,
                color: accentColor
              }}
            >
              {getTypeLabel(selectedNotification.type)}
            </span>
          </div>

          <h2
            className="text-[24px] font-medium mb-3 px-4 theme-transition"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
          >
            {selectedNotification.title}
          </h2>

          <div className="flex items-center gap-3 mb-4 text-sm px-4 theme-transition" style={{ color: textSecondary }}>
            <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
              {selectedNotification.time}
            </span>
            {!selectedNotification.read && (
              <>
                <span>•</span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    backgroundColor: theme === 'dark' ? '#7A8A7A' : '#7A8A7A',
                    color: '#FFFFFF'
                  }}
                >
                  New
                </span>
              </>
            )}
          </div>

          <div className="mx-4 backdrop-blur-sm border rounded-2xl p-5 theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <p
              className="text-sm font-light leading-relaxed whitespace-pre-line theme-transition"
              style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
            >
              {selectedNotification.message}
            </p>
          </div>
        </div>
      </div>
      </>
    );
  }

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
      
    <div className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom pb-20 theme-transition scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', backgroundColor: bgColor }}>

      {/* Header */}
      <div className="backdrop-blur-xl border-b px-4 py-3 shadow-sm safe-top relative z-20 theme-transition" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 245, 242, 0.8)', borderColor: borderColor }}>
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
              className="text-[20px] font-medium theme-transition"
              style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
            >
              Notifications
            </h1>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="py-6 pb-24 safe-bottom relative z-10" style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom) + 60px)' }}>
        {notifications.length === 0 ? (
          <div className="mx-4 backdrop-blur-sm border rounded-2xl p-8 text-center theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <p
              className="font-light theme-transition"
              style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
            >
              No notifications available.
            </p>
          </div>
        ) : (
          <AnimatedList
            items={notifications.map(notification => ({
              title: notification.title,
              readTime: notification.time,
              category: getTypeLabel(notification.type),
              excerpt: notification.message
            }))}
            onItemSelect={(item, index) => {
              const selectedNotification = notifications[index];
              if (selectedNotification) {
                setSelectedNotification(selectedNotification);
              }
            }}
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={false}
            className="w-full"
          />
        )}
      </div>
    </div>
    </>
  );
}

