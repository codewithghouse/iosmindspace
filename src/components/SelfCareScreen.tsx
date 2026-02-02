import { useState, useMemo } from 'react';
import SelfCareTipsModal from './SelfCareTipsModal';
import { useTheme } from '../contexts/ThemeContext';

interface SelfCareScreenProps {
  isVisible: boolean;
  onBack?: () => void;
  initialCategory?: string;
  onNavigateToChat?: () => void;
}

export default function SelfCareScreen({ isVisible, onBack, initialCategory, onNavigateToChat }: SelfCareScreenProps) {
  const { theme } = useTheme();
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<string | null>(null);

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
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const accentLight = theme === 'dark' ? '#6A7A6A' : '#6A7A6A';
  const bgHeader = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : 'rgba(162, 173, 156, 0.4)';
  const cardBg = theme === 'dark' ? 'rgba(60, 60, 60, 0.6)' : 'rgba(255, 255, 255, 0.95)';
  const cardBorder = theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : 'rgba(162, 173, 156, 0.3)';
  const iconBg = theme === 'dark' ? 'rgba(122, 138, 122, 0.3)' : 'rgba(122, 138, 122, 0.2)';
  const badgeBg = theme === 'dark' ? 'rgba(80, 80, 80, 0.8)' : 'rgba(255, 255, 255, 0.95)';
  const badgeBorder = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(162, 173, 156, 0.4)';
  const badgeText = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#3A3A3A';

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'academic-stress', label: 'Academic Stress' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'depression', label: 'Depression' },
    { id: 'ptsd', label: 'PTSD' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'ocd', label: 'OCD' }
  ];

  // Category-specific tips for modal display
  const categoryTips: { [key: string]: string[] } = {
    'anxiety': [
      'Practice deep breathing exercises (4-7-8 technique) daily',
      'Use grounding techniques (5-4-3-2-1 method) during panic attacks',
      'Limit caffeine and alcohol intake',
      'Establish a regular sleep schedule',
      'Engage in regular physical exercise',
      'Practice progressive muscle relaxation',
      'Try mindfulness meditation for 10 minutes daily'
    ],
    'depression': [
      'Maintain a regular daily routine',
      'Engage in physical activity, even a short walk',
      'Practice gratitude journaling daily',
      'Connect with supportive friends or family',
      'Expose yourself to natural sunlight daily',
      'Set small, achievable goals each day',
      'Consider professional therapy or counseling'
    ],
    'ptsd': [
      'Practice grounding techniques (5-4-3-2-1 method) during triggers',
      'Engage in trauma-focused therapy with certified professionals',
      'Create a safety plan for emotional regulation',
      'Practice mindfulness and meditation daily',
      'Join peer support groups for validation and understanding',
      'Establish healthy sleep hygiene routines',
      'Learn and practice relaxation techniques'
    ],
    'relationships': [
      'Practice active listening without interrupting',
      'Express your needs and boundaries clearly',
      'Schedule regular quality time together',
      'Show appreciation and gratitude regularly',
      'Seek couples therapy when communication breaks down',
      'Respect each other\'s personal space and time',
      'Work on conflict resolution skills together'
    ],
    'ocd': [
      'Practice exposure and response prevention (ERP) therapy',
      'Use mindfulness to observe thoughts without judgment',
      'Establish structured daily routines',
      'Gradually face fears in a controlled manner',
      'Join OCD support groups for shared experiences',
      'Work with a therapist specializing in OCD treatment',
      'Practice self-compassion during difficult moments'
    ],
    'academic-stress': [
      'Break large tasks into smaller, manageable steps',
      'Create a realistic study schedule with breaks',
      'Practice time management techniques',
      'Seek help from teachers or tutors when needed',
      'Maintain a healthy work-life balance',
      'Practice stress-relief techniques before exams',
      'Get adequate sleep and nutrition'
    ]
  };

  // Handle category card click - open modal
  const handleCategoryCardClick = (categoryId: string) => {
    setSelectedCategoryForModal(categoryId);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategoryForModal(null);
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'academic-stress':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
          </svg>
        );
      case 'anxiety':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="16" cy="8" r="1.5" fill="currentColor" />
          </svg>
        );
      case 'depression':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
          </svg>
        );
      case 'ptsd':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
            <path d="M12 6l-1.5 3L7.5 9.5l1.5 1.5-0.5 3L12 12.5l3.5 1.5-0.5-3 1.5-1.5-3-0.5L12 6z" fill="currentColor" />
          </svg>
        );
      case 'relationships':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor" />
          </svg>
        );
      case 'ocd':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor" />
            <path d="M8 8h8v1H8zm0 3h8v1H8zm0 3h7v1H8z" fill="currentColor" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
          </svg>
        );
    }
  };

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
      
    <div 
      className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom transition-colors duration-300 scrollable-container" 
      style={{ 
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        scrollBehavior: 'smooth',
        overscrollBehavior: 'contain',
        paddingBottom: 'max(80px, env(safe-area-inset-bottom) + 60px)',
        minHeight: '-webkit-fill-available',
        backgroundColor: bgColor
      }}
    >

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
              Self-Care Tips
            </h1>
          </div>
        </div>
      </div>

      {/* Category Cards List - Premium Design */}
      <div className="py-6 pb-24 safe-bottom relative z-10" style={{ 
        paddingBottom: 'max(96px, env(safe-area-inset-bottom) + 60px)'
      }}>
        <div className="space-y-4">
          {categories.filter(cat => cat.id !== 'all').map((category, index) => {
            const tipCount = categoryTips[category.id]?.length || 0;
            
            // Category-specific gradient colors (theme-aware)
            const categoryGradients: { [key: string]: { from: string; to: string; iconBg: string; iconColor: string } } = theme === 'dark' ? {
              'academic-stress': { 
                from: 'from-[#4A5A4A]/20', 
                to: 'to-[#3A4A3A]/10', 
                iconBg: 'from-[#4A5A4A] to-[#3A4A3A]',
                iconColor: 'text-[#7A8A7A]'
              },
              'anxiety': { 
                from: 'from-[#5A6A5A]/20', 
                to: 'to-[#4A5A4A]/10', 
                iconBg: 'from-[#5A6A5A] to-[#4A5A4A]',
                iconColor: 'text-[#8A9A8A]'
              },
              'depression': { 
                from: 'from-[#6A7A6A]/20', 
                to: 'to-[#5A6A5A]/10', 
                iconBg: 'from-[#6A7A6A] to-[#5A6A5A]',
                iconColor: 'text-[#9AAA9A]'
              },
              'ptsd': { 
                from: 'from-[#4A5A4A]/20', 
                to: 'to-[#2A3A2A]/10', 
                iconBg: 'from-[#4A5A4A] to-[#2A3A2A]',
                iconColor: 'text-[#7A8A7A]'
              },
              'relationships': { 
                from: 'from-[#5A6A5A]/20', 
                to: 'to-[#4A5A4A]/10', 
                iconBg: 'from-[#5A6A5A] to-[#4A5A4A]',
                iconColor: 'text-[#8A9A8A]'
              },
              'ocd': { 
                from: 'from-[#6A7A6A]/20', 
                to: 'to-[#4A5A4A]/10', 
                iconBg: 'from-[#6A7A6A] to-[#4A5A4A]',
                iconColor: 'text-[#9AAA9A]'
              }
            } : {
              'academic-stress': { 
                from: 'from-[#A2AD9C]/15', 
                to: 'to-[#98A392]/8', 
                iconBg: 'from-[#A2AD9C] to-[#98A392]',
                iconColor: 'text-[#A2AD9C]'
              },
              'anxiety': { 
                from: 'from-[#B8C4B0]/15', 
                to: 'to-[#A2AD9C]/8', 
                iconBg: 'from-[#B8C4B0] to-[#A2AD9C]',
                iconColor: 'text-[#B8C4B0]'
              },
              'depression': { 
                from: 'from-[#C9D4C1]/15', 
                to: 'to-[#B8C4B0]/8', 
                iconBg: 'from-[#C9D4C1] to-[#B8C4B0]',
                iconColor: 'text-[#C9D4C1]'
              },
              'ptsd': { 
                from: 'from-[#A2AD9C]/15', 
                to: 'to-[#8B9A85]/8', 
                iconBg: 'from-[#A2AD9C] to-[#8B9A85]',
                iconColor: 'text-[#A2AD9C]'
              },
              'relationships': { 
                from: 'from-[#B8C4B0]/15', 
                to: 'to-[#A2AD9C]/8', 
                iconBg: 'from-[#B8C4B0] to-[#A2AD9C]',
                iconColor: 'text-[#B8C4B0]'
              },
              'ocd': { 
                from: 'from-[#C9D4C1]/15', 
                to: 'to-[#A2AD9C]/8', 
                iconBg: 'from-[#C9D4C1] to-[#A2AD9C]',
                iconColor: 'text-[#C9D4C1]'
              }
            };
            
            const gradient = categoryGradients[category.id] || categoryGradients['academic-stress'];
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryCardClick(category.id)}
                className="group w-full relative overflow-hidden rounded-3xl p-5 touch-target focus:outline-none focus:ring-2 focus:ring-[#A2AD9C]/40 focus:ring-offset-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`
                }}
              >
                {/* Gradient Background with Glassmorphism */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.to} backdrop-blur-md rounded-3xl border shadow-lg group-hover:shadow-xl transition-shadow duration-300`} style={{ borderColor: cardBorder }} />
                
                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.02] rounded-3xl" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V4h4V2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V4h4V2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Premium Icon Container */}
                    <div className={`relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient.iconBg} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 flex items-center justify-center`}>
                      {/* Icon Glow */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient.iconBg} opacity-50 blur-md group-hover:opacity-70 transition-opacity duration-300`} />
                      {/* Icon */}
                      <div className="relative z-10 text-white scale-110">
                        {getCategoryIcon(category.id)}
                      </div>
                    </div>
                    
                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-[18px] font-semibold mb-1 transition-colors duration-200 truncate theme-transition"
                        style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
                      >
                        {category.label}
                      </h3>
                      
                      {/* Tip Count Badge */}
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-full backdrop-blur-sm border theme-transition" style={{ backgroundColor: badgeBg, borderColor: badgeBorder }}>
                          <span
                            className="text-[12px] font-medium theme-transition"
                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: badgeText }}
                          >
                            {tipCount} {tipCount === 1 ? 'Tip' : 'Tips'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium Arrow Icon */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm theme-transition" style={{ backgroundColor: iconBg, borderColor: cardBorder }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform duration-300">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill={textSecondary} />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Self-Care Tips Modal */}
      {selectedCategoryForModal && (
        <SelfCareTipsModal
          isOpen={isModalOpen}
          categoryId={selectedCategoryForModal}
          categoryName={categories.find(cat => cat.id === selectedCategoryForModal)?.label || selectedCategoryForModal}
          tips={categoryTips[selectedCategoryForModal] || []}
          categoryIcon={getCategoryIcon(selectedCategoryForModal)}
          onClose={handleModalClose}
          onTalkToUs={() => {
            handleModalClose();
            if (onNavigateToChat) {
              onNavigateToChat();
            }
          }}
        />
      )}
    </div>
    </>
  );
}

