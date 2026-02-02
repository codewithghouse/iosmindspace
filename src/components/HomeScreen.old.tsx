import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ExploreCategoryPanel from './ExploreCategoryPanel';
import ThreeDCarousel from './ThreeDCarousel';

interface HomeScreenProps {
  isVisible: boolean;
  onNavigateToChat?: () => void;
  onStartCall?: () => void;
  onNavigateToJournal?: () => void;
  onNavigateToSelfCare?: (category?: string) => void;
  onNavigateToToolsSounds?: (category?: string) => void;
  onNavigateToArticles?: (category?: string) => void;
  onNavigateToAssessments?: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToBreathing?: () => void;
  onNavigateToProfile?: () => void;
}

export default function HomeScreen({ 
  isVisible, 
  onNavigateToChat, 
  onStartCall,
  onNavigateToJournal,
  onNavigateToSelfCare,
  onNavigateToToolsSounds,
  onNavigateToArticles,
  onNavigateToAssessments,
  onNavigateToBookings,
  onNavigateToBreathing,
  onNavigateToProfile
}: HomeScreenProps) {
  const { theme } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeExploreCard, setActiveExploreCard] = useState<'selfcare' | 'tools' | 'articles' | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const [prevTheme, setPrevTheme] = useState<typeof theme>(() => {
    const dataTheme = document.documentElement.getAttribute('data-theme');
    return (dataTheme as typeof theme) || theme;
  });
  const userName = typeof window !== 'undefined' ? (localStorage.getItem('mindspace_user_name') || 'saniya') : 'saniya';

  // Handle theme transition animation - detect when theme starts changing
  useEffect(() => {
    const handleThemeChange = () => {
      const currentDataTheme = document.documentElement.getAttribute('data-theme') as typeof theme;
      if (currentDataTheme && currentDataTheme !== prevTheme && currentDataTheme !== theme) {
        // Theme is transitioning
        setIsThemeTransitioning(true);
        const timer = setTimeout(() => {
          setIsThemeTransitioning(false);
          setPrevTheme(currentDataTheme);
        }, 5000);
        return () => clearTimeout(timer);
      }
    };

    // Check immediately
    handleThemeChange();

    // Also listen for attribute changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, [theme, prevTheme]);

  // Update prevTheme when theme state finally updates
  useEffect(() => {
    if (!isThemeTransitioning && prevTheme !== theme) {
      setPrevTheme(theme);
    }
  }, [theme, isThemeTransitioning, prevTheme]);

  // Sample notifications data
  const notifications = [
    { id: '1', title: 'New message from TARA', message: 'You have a new message waiting', time: '2m ago', read: false },
    { id: '2', title: 'Assessment reminder', message: 'Complete your weekly wellness check', time: '1h ago', read: false },
    { id: '3', title: 'Session scheduled', message: 'Your appointment is tomorrow at 2 PM', time: '3h ago', read: true },
    { id: '4', title: 'Wellness tip', message: 'Daily breathing exercises can reduce stress', time: '5h ago', read: true },
  ];

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

  // Use CSS custom properties for smooth transitions - they transition automatically
  const bgColor = 'var(--bg-primary)';
  const textPrimary = 'var(--text-primary)';
  const textSecondary = 'var(--text-secondary)';
  const bgCard = 'var(--bg-secondary)';
  const borderColor = 'var(--border-color)';
  const accentColor = 'var(--accent-color)';
  const accentLight = 'var(--accent-light)';
  const iconColor = 'var(--text-primary)';
  const iconSecondary = 'var(--text-secondary)';

  // Gradient helper function (for profile picture and other UI elements)
  const getGradientClass = (id: string) => {
    if (theme === 'dark') {
      const darkGradients: { [key: string]: string } = {
        'primary': 'from-[#4A5A4A] to-[#3A4A3A]',
        'secondary': 'from-[#5A6A5A] to-[#4A5A4A]',
        'tertiary': 'from-[#6A7A6A] to-[#5A6A5A]',
        'quaternary': 'from-[#4A5A4A] to-[#2A3A2A]'
      };
      return darkGradients[id] || darkGradients['primary'];
    } else {
      const lightGradients: { [key: string]: string } = {
        'primary': 'from-[#A2AD9C] to-[#98A392]',
        'secondary': 'from-[#B8C4B0] to-[#A2AD9C]',
        'tertiary': 'from-[#C9D4C1] to-[#B8C4B0]',
        'quaternary': 'from-[#A2AD9C] to-[#8B9A85]'
      };
      return lightGradients[id] || lightGradients['primary'];
    }
  };

  // Card color helper function - Theme-aware colors for better dark mode support
  const getCardColorClass = (id: string) => {
    if (theme === 'dark') {
      // Dark theme - darker, richer colors with better contrast
      const darkCardColors: { [key: string]: string } = {
        'tara': 'bg-gray-800', // Most important - Dark gray (instead of white)
        'assessments': 'bg-blue-600', // High importance - Deeper blue (#2563EB)
        'selfcare': 'bg-pink-600', // High importance - Deeper pink (#DB2777)
        'bookings': 'bg-yellow-600', // Medium importance - Deeper yellow (#CA8A04)
        'breathing': 'bg-orange-600', // Medium importance - Deeper orange (#EA580C)
        'tools': 'bg-gray-700', // Medium importance - Medium gray (#374151)
        'journal': 'bg-gray-600', // Lower importance - Lighter gray (#4B5563)
        'articles': 'bg-[#5A6A5A]' // Lower importance - Darker beige/green
      };
      return darkCardColors[id] || darkCardColors['tara'];
    } else {
      // Light theme - Enhanced vibrant colors for better visibility
      const lightCardColors: { [key: string]: string } = {
        'tara': 'bg-white', // Most important - White
        'assessments': 'bg-blue-300', // High importance - More vibrant Blue (#93C5FD)
        'selfcare': 'bg-pink-300', // High importance - More vibrant Pink (#F9A8D4)
        'bookings': 'bg-yellow-300', // Medium importance - More vibrant Yellow (#FCD34D)
        'breathing': 'bg-orange-300', // Medium importance - More vibrant Orange (#FDBA74)
        'tools': 'bg-gray-300', // Medium importance - Gray Medium (#D1D5DB)
        'journal': 'bg-gray-400', // Lower importance - Gray Darker (#9CA3AF)
        'articles': 'bg-[#7A8A7A]' // Lower importance - Darker beige/green for better contrast
      };
      return lightCardColors[id] || lightCardColors['tara'];
    }
  };

  // Text color helper - Theme-aware text colors
  const getCardTextColor = (id: string) => {
    if (theme === 'dark') {
      // Dark theme - all cards use white text for better contrast
      return 'text-white';
    } else {
      // Light theme - dark text for light backgrounds
      const needsDarkText = ['tara', 'articles', 'bookings', 'tools'];
      return needsDarkText.includes(id) ? textPrimary : 'text-white';
    }
  };

  // Enhanced text styling helper for better visibility - Theme-aware
  const getCardTextStyle = (id: string, isTitle: boolean = true) => {
    if (theme === 'dark') {
      // Dark theme - white text with strong shadows for all cards
      return {
        color: '#FFFFFF',
        fontWeight: isTitle ? '700' : '600',
        textShadow: isTitle 
          ? '0 2px 10px rgba(0,0,0,0.5), 0 1px 5px rgba(0,0,0,0.4)' 
          : '0 1px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.35)',
        letterSpacing: isTitle ? '-0.3px' : '0px'
      };
    } else {
      // Light theme - conditional text colors with enhanced visibility
      const needsDarkText = ['tara', 'articles', 'bookings', 'tools'];
      const isDarkText = needsDarkText.includes(id);
      
      if (isDarkText) {
        // Dark text on light backgrounds - stronger, more visible text
        return {
          color: '#1A1A1A', // Darker for better contrast
          fontWeight: isTitle ? '700' : '600',
          textShadow: '0 1px 3px rgba(255,255,255,0.8), 0 1px 1px rgba(0,0,0,0.1)',
          letterSpacing: isTitle ? '-0.3px' : '0px'
        };
      } else {
        // White text on colored backgrounds - enhanced shadows for better visibility
        return {
          color: '#FFFFFF',
          fontWeight: isTitle ? '700' : '600',
          textShadow: isTitle 
            ? '0 3px 10px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.3)' 
            : '0 2px 6px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.25)',
          letterSpacing: isTitle ? '-0.3px' : '0px'
        };
      }
    }
  };

  // Icon container styling helper - Theme-aware
  const getIconContainerStyle = (id: string) => {
    const isWhiteText = getCardTextColor(id) === 'text-white';
    
    if (theme === 'dark') {
      // Dark theme - brighter icon containers for better visibility
      return {
        containerClass: 'bg-white/20 backdrop-blur-md ring-2 ring-white/40',
        iconColor: '#FFFFFF'
      };
    } else {
      // Light theme - conditional styling
      if (isWhiteText) {
        return {
          containerClass: 'bg-white/30 backdrop-blur-md ring-2 ring-white/50',
          iconColor: '#FFFFFF'
        };
      } else {
        return {
          containerClass: 'bg-white/20 backdrop-blur-md ring-2 ring-white/30',
          iconColor: textPrimary
        };
      }
    }
  };

  // Category data for each card type
  const selfCareCategories = [
    { id: 'all', label: 'All' },
    { id: 'academic-stress', label: 'Academic Stress' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'depression', label: 'Depression' },
    { id: 'ptsd', label: 'PTSD' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'ocd', label: 'OCD' }
  ];

  const toolsSoundsCategories = [
    { id: 'all', label: 'All' },
    { id: 'relaxation', label: 'Relaxation & Focus' },
    { id: 'ambient', label: 'Ambient Sounds' },
    { id: 'meditation', label: 'Meditation Sessions' },
    { id: 'brainwave', label: 'Brainwave Entrainment' },
    { id: 'stress-relief', label: 'Stress Relief Music' },
    { id: 'focus', label: 'Focus & Productivity' }
  ];

  const articlesCategories = [
    { id: 'all', label: 'All' },
    { id: 'mental-health', label: 'Mental Health' },
    { id: 'wellness', label: 'Wellness' },
    { id: 'self-care', label: 'Self-Care' }
  ];

  // Pause carousel when panel is open
  useEffect(() => {
    if (activeExploreCard) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [activeExploreCard]);

  const moods = [
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

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId === selectedMood ? null : moodId);
    console.log('Mood selected:', moodId);
  };

  const handlePlanSession = () => {
    if (onNavigateToChat) {
      onNavigateToChat();
    }
  };

  const handleNavigateToTARA = () => {
    if (onNavigateToChat) {
      onNavigateToChat();
    }
  };

  const handleNavigateToAssessments = () => {
    if (onNavigateToAssessments) {
      onNavigateToAssessments();
    }
  };

  const handleNavigateToBookings = () => {
    if (onNavigateToBookings) {
      onNavigateToBookings();
    }
  };

  const handleNavigateToBreathing = () => {
    if (onNavigateToBreathing) {
      onNavigateToBreathing();
    }
  };

  // Panel handlers
  const handleCardClick = (cardType: 'selfcare' | 'tools' | 'articles') => {
    // For selfcare, navigate directly to SelfCareScreen
    if (cardType === 'selfcare' && onNavigateToSelfCare) {
      onNavigateToSelfCare();
    } else {
      setActiveExploreCard(cardType);
    }
  };

  const handlePanelClose = () => {
    setActiveExploreCard(null);
  };

  const handleCategorySelect = (cardType: 'selfcare' | 'tools' | 'articles', categoryId: string) => {
    setActiveExploreCard(null);
    // Navigate to respective screen with category pre-selected
    if (cardType === 'selfcare' && onNavigateToSelfCare) {
      onNavigateToSelfCare(categoryId);
    } else if (cardType === 'tools' && onNavigateToToolsSounds) {
      // For tools, navigate directly without category selection
      onNavigateToToolsSounds();
    } else if (cardType === 'articles' && onNavigateToArticles) {
      // For articles, navigate directly without category selection
      onNavigateToArticles();
    }
  };
  
  // Handle direct tools navigation (skip category panel)
  const handleToolsClick = () => {
    if (onNavigateToToolsSounds) {
      onNavigateToToolsSounds();
    }
  };
  
  // Handle direct article navigation (skip category panel)
  const handleArticlesClick = () => {
    if (onNavigateToArticles) {
      onNavigateToArticles();
    }
  };

  // Get card info for panel (not used for selfcare, tools, or articles anymore)
  const getCardInfo = (cardType: 'selfcare' | 'tools' | 'articles') => {
    // All cards now navigate directly, no category panels
    return null;
  };

  const cardInfo = null; // No category panels for any cards

  if (!isVisible) return null;

  return (
    <>
      
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
      
      <div className="absolute inset-0 min-h-screen w-full overflow-y-auto safe-top safe-bottom pb-48 theme-transition scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', backgroundColor: bgColor }}>

      {/* Header with Greeting and Search */}
      <div className="px-4 py-3 safe-top relative z-20 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <button
              onClick={() => onNavigateToProfile && onNavigateToProfile()}
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 touch-target transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                background: theme === 'dark' 
                  ? 'linear-gradient(to bottom right, #7A8A7A, #6A7A6A)'
                  : 'linear-gradient(to bottom right, #A2AD9C, #98A392)',
                focusRingColor: theme === 'dark' ? '#7A8A7A' : '#A2AD9C'
              }}
              aria-label="Navigate to profile"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                  fill={theme === 'dark' ? '#FFFFFF' : '#F7F5F2'}
                />
              </svg>
            </button>
            {/* Greeting */}
            <div>
              <h1
                className="text-[20px] font-medium transition-colors duration-300"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
              >
                Hello, {userName}
              </h1>
            </div>
          </div>
          {/* Call Button - Highlighted and Attention-Grabbing */}
          <button
            onClick={onStartCall}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 touch-target relative theme-transition shadow-lg active:scale-95"
            style={{ 
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, #7A8A7A, #6A7A6A)'
                : 'linear-gradient(135deg, #A2AD9C, #98A392)',
              focusRingColor: accentColor,
              boxShadow: theme === 'dark'
                ? '0 4px 16px rgba(122, 138, 122, 0.4), 0 0 20px rgba(122, 138, 122, 0.2)'
                : '0 4px 16px rgba(162, 173, 156, 0.4), 0 0 20px rgba(162, 173, 156, 0.2)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = theme === 'dark'
                ? '0 6px 20px rgba(122, 138, 122, 0.5), 0 0 25px rgba(122, 138, 122, 0.3)'
                : '0 6px 20px rgba(162, 173, 156, 0.5), 0 0 25px rgba(162, 173, 156, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = theme === 'dark'
                ? '0 4px 16px rgba(122, 138, 122, 0.4), 0 0 20px rgba(122, 138, 122, 0.2)'
                : '0 4px 16px rgba(162, 173, 156, 0.4), 0 0 20px rgba(162, 173, 156, 0.2)';
            }}
            aria-label="Start call with TARA"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                fill={theme === 'dark' ? '#FFFFFF' : '#F7F5F2'}
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                fill={iconSecondary}
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-3 backdrop-blur-sm border rounded-2xl placeholder-opacity-50 focus:outline-none focus:ring-2 transition-all touch-target theme-transition"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
              fontSize: '15px',
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: borderColor,
              color: textPrimary
            }}
            aria-label="Search"
          />
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 safe-top" onClick={() => setShowNotifications(false)}>
          <div 
            className="absolute top-20 right-4 w-full max-w-md rounded-3xl shadow-2xl border backdrop-blur-xl theme-transition"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.98)' : 'rgba(247, 245, 242, 0.95)',
              borderColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : borderColor,
              maxHeight: 'calc(100vh - 120px)',
              marginTop: 'env(safe-area-inset-top)',
              animation: 'notificationSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transformOrigin: 'top right',
              willChange: 'transform, opacity'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b theme-transition" style={{ borderColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : borderColor }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold theme-transition" style={{ color: theme === 'dark' ? '#FFFFFF' : textPrimary, fontFamily: "'Fira Sans', sans-serif" }}>
                  Notifications
                </h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors touch-target"
                  style={{ 
                    color: theme === 'dark' ? '#FFFFFF' : textSecondary,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(60, 60, 60, 0.6)' : 'rgba(255, 255, 255, 0.6)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto scrollable-container" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="pl-6 pr-4 py-4 border-b theme-transition cursor-pointer active:opacity-70"
                  style={{ 
                    borderColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.3)' : borderColor,
                    backgroundColor: !notif.read ? (theme === 'dark' ? 'rgba(122, 138, 122, 0.15)' : 'rgba(162, 173, 156, 0.1)') : 'transparent'
                  }}
                  onClick={() => {
                    // Handle notification click
                    console.log('Notification clicked:', notif.id);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.3)' : accentColor + '20' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill={theme === 'dark' ? '#FFFFFF' : accentColor}/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium mb-1 theme-transition" style={{ color: theme === 'dark' ? '#FFFFFF' : textPrimary, fontFamily: "'Fira Sans', sans-serif" }}>
                        {notif.title}
                      </h3>
                      <p className="text-sm font-light mb-1 theme-transition" style={{ color: theme === 'dark' ? '#E0E0E0' : textSecondary, fontFamily: "'Fira Sans', sans-serif" }}>
                        {notif.message}
                      </p>
                      <p className="text-xs font-light theme-transition" style={{ color: theme === 'dark' ? '#CCCCCC' : textSecondary, fontFamily: "'Fira Sans', sans-serif" }}>
                        {notif.time}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-3 h-3 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: theme === 'dark' ? '#4ade80' : '#22c55e' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-6 pb-40 safe-bottom relative z-10 min-h-[calc(100vh+700px)]">
        {/* Health & Mood Card */}
        <div className="mb-12">
          <div className="w-full rounded-3xl p-5 transition-all duration-300 shadow-lg relative overflow-hidden backdrop-blur-xl border theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <div className="flex items-center gap-4">
              {/* Health Visualization - Left Side */}
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-3 theme-transition" style={{ color: textSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
                  Health Status
                </h3>
                <div className="relative w-24 h-24 mx-auto">
                  {/* Circular Progress */}
                  <svg className="transform -rotate-90" width="96" height="96" viewBox="0 0 96 96">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.3)'}
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={accentColor}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.75)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold theme-transition" style={{ color: textPrimary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
                      75%
                    </span>
                    <span className="text-xs font-light theme-transition" style={{ color: textSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
                      Good
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-24 theme-transition" style={{ backgroundColor: borderColor }} />

              {/* Mood Selector - Right Side */}
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-3 theme-transition" style={{ color: textSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
                  Your Mood
                </h3>
                <div className="flex flex-col items-center gap-2">
                  {currentMood ? (
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => setCurrentMood(null)}
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all active:scale-95 touch-target shadow-md"
                        style={{
                          backgroundColor: moods.find(m => m.id === currentMood)?.color || accentColor + '20',
                          boxShadow: `0 4px 12px ${accentColor}40`
                        }}
                        aria-label={`Current mood: ${moods.find(m => m.id === currentMood)?.label}`}
                      >
                        {moods.find(m => m.id === currentMood)?.emoji}
                      </button>
                      <span className="text-xs font-medium theme-transition" style={{ color: textPrimary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
                        {moods.find(m => m.id === currentMood)?.label}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        // Open mood selector
                        const moodSelector = document.getElementById('mood-selector');
                        if (moodSelector) {
                          moodSelector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }}
                      className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed transition-all active:scale-95 touch-target theme-transition"
                      style={{ borderColor: borderColor, color: textSecondary }}
                      aria-label="Select your mood"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily mood log Section */}
        <div className="mb-12" id="mood-selector">
          <h2
            className="text-[18px] font-medium mb-4 transition-colors duration-300"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
          >
            Daily mood log
          </h2>
          <div 
            className="flex gap-3 pb-2 overflow-x-auto" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain',
              touchAction: 'pan-x',
              overflowY: 'hidden',
              width: '100%',
              transform: 'translateZ(0)',
              willChange: 'scroll-position'
            }}
          >
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => {
                  handleMoodSelect(mood.id);
                  setCurrentMood(mood.id);
                }}
                className={`flex-shrink-0 w-14 h-14 rounded-full ${mood.color} flex items-center justify-center text-2xl transition-all active:scale-95 touch-target theme-transition ${
                  selectedMood === mood.id ? 'ring-2 ring-offset-2 scale-110' : ''
                }`}
                aria-label={mood.label}
                style={{
                  boxShadow: selectedMood === mood.id ? `0 4px 12px ${theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : 'rgba(162, 173, 156, 0.3)'}` : '0 2px 6px rgba(0, 0, 0, 0.1)',
                  ringColor: accentColor
                }}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Explore Section - 3D Carousel */}
        <div className="mb-12">
          <h2
            className="text-[18px] font-medium mb-5 transition-colors duration-300"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
          >
            Explore
          </h2>
          <ThreeDCarousel
            items={[
              {
                id: 'selfcare',
                title: 'Self-Care Tips',
                description: 'Wellness guidance',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill="currentColor"
                    />
                  </svg>
                ),
                onClick: () => handleCardClick('selfcare')
              },
              {
                id: 'tools',
                title: 'Tools & Sounds',
                description: 'Relaxation audio',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                      fill="currentColor"
                    />
                  </svg>
                ),
                onClick: () => {
                  if (onNavigateToToolsSounds) {
                    onNavigateToToolsSounds();
                  }
                }
              },
              {
                id: 'articles',
                title: 'Mindful Articles',
                description: 'Educational content',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                      fill="currentColor"
                    />
                  </svg>
                ),
                onClick: () => {
                  if (onNavigateToArticles) {
                    onNavigateToArticles();
                  }
                }
              },
              {
                id: 'journal',
                title: 'Journal',
                description: 'Personal reflections',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                      fill="currentColor"
                    />
                  </svg>
                ),
                onClick: () => onNavigateToJournal && onNavigateToJournal()
              },
              {
                id: 'tara',
                title: 'Chat with TARA',
                description: 'Get instant support',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
                      fill="currentColor"
                    />
                  </svg>
                ),
                onClick: () => onNavigateToChat && onNavigateToChat()
              },
              {
                id: 'assessments',
                title: 'Assessments',
                description: 'Track your wellness',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                      fill="currentColor"
                    />
                  </svg>
                ),
                onClick: () => onNavigateToAssessments && onNavigateToAssessments()
              },
              {
                id: 'bookings',
                title: 'Appointment',
                description: 'Schedule session',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                      fill="currentColor"
                    />
                  </svg>
                ),
                onClick: () => onNavigateToBookings && onNavigateToBookings()
              },
              {
                id: 'breathing',
                title: 'Breathing',
                description: 'Find calm & peace',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9" />
                    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                  </svg>
                ),
                onClick: () => onNavigateToBreathing && onNavigateToBreathing()
              }
            ]}
            autoRotate={true}
            rotateInterval={3000}
            isPaused={isPaused || !!activeExploreCard}
          />
        </div>

        {/* Get Started Section */}
        <div className="mb-12">
          <h2
            className="text-[18px] font-medium mb-5 transition-colors duration-300"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
          >
            Get Started
          </h2>
          
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* TARA Card */}
            <button
              onClick={handleNavigateToTARA}
              className="group w-full h-[150px] rounded-3xl p-0 overflow-hidden transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target flex flex-col relative"
              style={{
                boxShadow: theme === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(162, 173, 156, 0.2)'
              }}
            >
              {/* Background */}
              <div className={`absolute inset-0 ${getCardColorClass('tara')} rounded-3xl`} />
              
              {/* Subtle overlay gradient for depth - Theme-aware */}
              <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black/20 via-transparent to-transparent' : 'from-black/10 via-transparent to-transparent'} pointer-events-none z-10`} />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-4">
                {/* Icon Container with glow */}
                <div className={`w-12 h-12 rounded-2xl ${getIconContainerStyle('tara').containerClass} flex items-center justify-center mb-3 shadow-lg flex-shrink-0`}>
                  <div className="scale-110" style={{ color: getIconContainerStyle('tara').iconColor }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
                        fill={getIconContainerStyle('tara').iconColor}
                      />
                    </svg>
                  </div>
                </div>
                
                <h3
                  className="text-[17px] mb-1.5 flex-1"
                  style={{ 
                    ...getCardTextStyle('tara', true),
                    fontFamily: "'Fira Sans', sans-serif"
                  }}
                >
                  Chat with TARA
                </h3>
                <p
                  className="text-[13px]"
                  style={{ 
                    ...getCardTextStyle('tara', false),
                    fontFamily: "'Fira Sans', sans-serif",
                    opacity: 0.85
                  }}
                >
                  Get instant support
                </p>
              </div>
            </button>

            {/* Assessments Card */}
            <button
              onClick={handleNavigateToAssessments}
              className="group w-full h-[150px] rounded-3xl p-0 overflow-hidden transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target flex flex-col relative"
              style={{
                boxShadow: theme === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(162, 173, 156, 0.2)'
              }}
            >
              {/* Background */}
              <div className={`absolute inset-0 ${getCardColorClass('assessments')} rounded-3xl`} />
              
              {/* Subtle overlay gradient for depth - Theme-aware */}
              <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black/20 via-transparent to-transparent' : 'from-black/10 via-transparent to-transparent'} pointer-events-none z-10`} />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-4">
                {/* Icon Container with glow */}
                <div className={`w-12 h-12 rounded-2xl ${getIconContainerStyle('assessments').containerClass} flex items-center justify-center mb-3 shadow-lg flex-shrink-0`}>
                  <div className="scale-110" style={{ color: getIconContainerStyle('assessments').iconColor }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                        fill={getIconContainerStyle('assessments').iconColor}
                      />
                    </svg>
                  </div>
                </div>
                
                <h3
                  className="text-[17px] mb-1.5 flex-1"
                  style={{ 
                    ...getCardTextStyle('assessments', true),
                    fontFamily: "'Fira Sans', sans-serif"
                  }}
                >
                  Assessments
                </h3>
                <p
                  className="text-[13px]"
                  style={{ 
                    ...getCardTextStyle('assessments', false),
                    fontFamily: "'Fira Sans', sans-serif",
                    opacity: 0.95
                  }}
                >
                  Track your wellness
                </p>
              </div>
            </button>

            {/* Bookings Card */}
            <button
              onClick={handleNavigateToBookings}
              className="group w-full h-[150px] rounded-3xl p-0 overflow-hidden transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target flex flex-col relative"
              style={{
                boxShadow: theme === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(162, 173, 156, 0.2)'
              }}
            >
              {/* Background */}
              <div className={`absolute inset-0 ${getCardColorClass('bookings')} rounded-3xl`} />
              
              {/* Subtle overlay gradient for depth - Theme-aware */}
              <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black/20 via-transparent to-transparent' : 'from-black/10 via-transparent to-transparent'} pointer-events-none z-10`} />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-4">
                {/* Icon Container with glow */}
                <div className={`w-12 h-12 rounded-2xl ${getIconContainerStyle('bookings').containerClass} flex items-center justify-center mb-3 shadow-lg flex-shrink-0`}>
                  <div className="scale-110" style={{ color: getIconContainerStyle('bookings').iconColor }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                        fill={getIconContainerStyle('bookings').iconColor}
                      />
                    </svg>
                  </div>
                </div>
                
                <h3
                  className="text-[17px] mb-1.5 flex-1"
                  style={{ 
                    ...getCardTextStyle('bookings', true),
                    fontFamily: "'Fira Sans', sans-serif"
                  }}
                >
                  Appointment
                </h3>
                <p
                  className="text-[13px]"
                  style={{ 
                    ...getCardTextStyle('bookings', false),
                    fontFamily: "'Fira Sans', sans-serif",
                    opacity: 0.95
                  }}
                >
                  Schedule session
                </p>
              </div>
            </button>

            {/* Breathing Card */}
            <button
              onClick={handleNavigateToBreathing}
              className="group w-full h-[150px] rounded-3xl p-0 overflow-hidden transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target flex flex-col relative"
              style={{
                boxShadow: theme === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(162, 173, 156, 0.2)'
              }}
            >
              {/* Background */}
              <div className={`absolute inset-0 ${getCardColorClass('breathing')} rounded-3xl`} />
              
              {/* Subtle overlay gradient for depth - Theme-aware */}
              <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black/20 via-transparent to-transparent' : 'from-black/10 via-transparent to-transparent'} pointer-events-none z-10`} />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-4">
                {/* Icon Container with glow */}
                <div className={`w-12 h-12 rounded-2xl ${getIconContainerStyle('breathing').containerClass} flex items-center justify-center mb-3 shadow-lg flex-shrink-0`}>
                  <div className="scale-110" style={{ color: getIconContainerStyle('breathing').iconColor }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="4" fill={getIconContainerStyle('breathing').iconColor} opacity="0.9" />
                      <circle cx="12" cy="12" r="6" fill="none" stroke={getIconContainerStyle('breathing').iconColor} strokeWidth="1.5" opacity="0.6" />
                      <circle cx="12" cy="12" r="8" fill="none" stroke={getIconContainerStyle('breathing').iconColor} strokeWidth="1" opacity="0.4" />
                    </svg>
                  </div>
                </div>
                
                <h3
                  className="text-[17px] mb-1.5 flex-1"
                  style={{ 
                    ...getCardTextStyle('breathing', true),
                    fontFamily: "'Fira Sans', sans-serif"
                  }}
                >
                  Breathing
                </h3>
                <p
                  className="text-[13px]"
                  style={{ 
                    ...getCardTextStyle('breathing', false),
                    fontFamily: "'Fira Sans', sans-serif",
                    opacity: 0.95
                  }}
                >
                  Find calm & peace
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Access Section - 2x2 Grid Layout */}
        <div className="mb-24">
          <h2
            className="text-[18px] font-medium mb-5 transition-colors duration-300"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
          >
            Quick Access
          </h2>
          
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1 - Tools & Sounds */}
            <button
              onClick={() => {
                if (onNavigateToToolsSounds) {
                  onNavigateToToolsSounds();
                }
              }}
              className="group w-full h-[150px] rounded-3xl p-0 overflow-hidden transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target flex flex-col relative"
              style={{
                boxShadow: theme === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(162, 173, 156, 0.2)'
              }}
            >
                <div className={`absolute inset-0 ${getCardColorClass('tools')} rounded-3xl`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none z-10" />
                <div className="relative z-10 flex flex-col h-full p-4">
                  <div className={`w-12 h-12 rounded-2xl ${getIconContainerStyle('tools').containerClass} flex items-center justify-center mb-3 shadow-lg flex-shrink-0`}>
                    <div className="scale-110" style={{ color: getIconContainerStyle('tools').iconColor }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                          fill={getIconContainerStyle('tools').iconColor}
                        />
                      </svg>
                    </div>
                  </div>
                  <h3
                    className="text-[17px] mb-1.5 flex-1"
                    style={{ 
                      ...getCardTextStyle('tools', true),
                      fontFamily: "'Fira Sans', sans-serif"
                    }}
                  >
                    Tools & Sounds
                  </h3>
                  <p
                    className="text-[13px]"
                    style={{ 
                      ...getCardTextStyle('tools', false),
                      fontFamily: "'Fira Sans', sans-serif",
                      opacity: 0.95
                    }}
                  >
                    Relaxation audio
                  </p>
                </div>
              </button>

            {/* Card 2 - Self Care Tips */}
            <button
              onClick={() => handleCardClick('selfcare')}
              className="group w-full h-[150px] rounded-3xl p-0 overflow-hidden transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target flex flex-col relative"
              style={{
                boxShadow: theme === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(162, 173, 156, 0.2)'
              }}
            >
                <div className={`absolute inset-0 ${getCardColorClass('selfcare')} rounded-3xl`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none z-10" />
                <div className="relative z-10 flex flex-col h-full p-4">
                  <div className={`w-12 h-12 rounded-2xl ${getIconContainerStyle('selfcare').containerClass} flex items-center justify-center mb-3 shadow-lg flex-shrink-0`}>
                    <div className="scale-110" style={{ color: getIconContainerStyle('selfcare').iconColor }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          fill={getIconContainerStyle('selfcare').iconColor}
                        />
                      </svg>
                    </div>
                  </div>
                  <h3
                    className="text-[17px] mb-1.5 flex-1"
                    style={{ 
                      ...getCardTextStyle('selfcare', true),
                      fontFamily: "'Fira Sans', sans-serif"
                    }}
                  >
                    Self-Care Tips
                  </h3>
                  <p
                    className="text-[13px]"
                    style={{ 
                      ...getCardTextStyle('selfcare', false),
                      fontFamily: "'Fira Sans', sans-serif",
                      opacity: 0.95
                    }}
                  >
                    Wellness guidance
                  </p>
                </div>
              </button>

            {/* Card 3 - Journal */}
            <button
              onClick={() => onNavigateToJournal && onNavigateToJournal()}
              className="group w-full h-[150px] rounded-3xl p-0 overflow-hidden transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target flex flex-col relative"
              style={{
                boxShadow: theme === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(162, 173, 156, 0.2)'
              }}
            >
                <div className={`absolute inset-0 ${getCardColorClass('journal')} rounded-3xl`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none z-10" />
                <div className="relative z-10 flex flex-col h-full p-4">
                  <div className={`w-12 h-12 rounded-2xl ${getIconContainerStyle('journal').containerClass} flex items-center justify-center mb-3 shadow-lg flex-shrink-0`}>
                    <div className="scale-110" style={{ color: getIconContainerStyle('journal').iconColor }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                          fill={getIconContainerStyle('journal').iconColor}
                        />
                      </svg>
                    </div>
                  </div>
                  <h3
                    className="text-[17px] mb-1.5 flex-1"
                    style={{ 
                      ...getCardTextStyle('journal', true),
                      fontFamily: "'Fira Sans', sans-serif"
                    }}
                  >
                    Journal
                  </h3>
                  <p
                    className="text-[13px]"
                    style={{ 
                      ...getCardTextStyle('journal', false),
                      fontFamily: "'Fira Sans', sans-serif",
                      opacity: 0.95
                    }}
                  >
                    Personal reflections
                  </p>
                </div>
              </button>

            {/* Card 4 - Mindful Articles */}
            <button
              onClick={() => {
                if (onNavigateToArticles) {
                  onNavigateToArticles();
                }
              }}
              className="group w-full h-[150px] rounded-3xl p-0 overflow-hidden transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target flex flex-col relative"
              style={{
                boxShadow: theme === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(162, 173, 156, 0.2)'
              }}
            >
                <div className={`absolute inset-0 ${getCardColorClass('articles')} rounded-3xl`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none z-10" />
                <div className="relative z-10 flex flex-col h-full p-4">
                  <div className={`w-12 h-12 rounded-2xl ${getIconContainerStyle('articles').containerClass} flex items-center justify-center mb-3 shadow-lg flex-shrink-0`}>
                    <div className="scale-110" style={{ color: getIconContainerStyle('articles').iconColor }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                          fill={getIconContainerStyle('articles').iconColor}
                        />
                      </svg>
                    </div>
                  </div>
                  <h3
                    className="text-[17px] mb-1.5 flex-1"
                    style={{ 
                      ...getCardTextStyle('articles', true),
                      fontFamily: "'Fira Sans', sans-serif"
                    }}
                  >
                    Mindful Articles
                  </h3>
                  <p
                    className="text-[13px]"
                    style={{ 
                      ...getCardTextStyle('articles', false),
                      fontFamily: "'Fira Sans', sans-serif",
                      opacity: 0.85
                    }}
                  >
                    Educational content
                  </p>
                </div>
              </button>
          </div>
        </div>
      </div>
      </div>

      {/* Explore Category Panel - Removed, all cards navigate directly */}
      
      {/* Pulse Animation for Call Button */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }
      `}</style>
    </>
  );
}
