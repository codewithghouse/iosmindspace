import React, { useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface AssessmentsScreenProps {
  isVisible: boolean;
  onNavigateToAssessment?: (assessmentId: string) => void;
  onBack?: () => void;
}

interface AnimatedAssessmentCardProps {
  children: React.ReactNode;
  delay?: number;
}

const AnimatedAssessmentCard: React.FC<AnimatedAssessmentCardProps> = ({ children, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: false });
  
  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-4"
    >
      {children}
    </motion.div>
  );
};

export default function AssessmentsScreen({ isVisible, onNavigateToAssessment, onBack }: AssessmentsScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [topGradientOpacity, setTopGradientOpacity] = React.useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = React.useState<number>(1);
  const { theme } = useTheme();

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#1A1A1A';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)';
  const iconColor = theme === 'dark' ? '#E5E5E5' : '#3A3A3A';

  // Premium glossy gradient helper function using dark accent colors
  const getGradientClass = () => {
    if (theme === 'dark') {
      // Dark variant accent colors for premium glossy effect
      return 'from-[#7A8A7A] to-[#6A7A6A]';
    } else {
      // Light theme accent colors
      return 'from-[#A2AD9C] to-[#98A392]';
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

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

  const assessments = [
    {
      id: 'anxiety',
      title: 'Anxiety Assessment',
      description: 'Evaluate your anxiety levels and patterns',
      questions: 10,
      estimatedTime: '5-7 min',
      progress: 0,
      status: 'Not Started'
    },
    {
      id: 'depression',
      title: 'Depression Assessment',
      description: 'Assess symptoms of depression and mood patterns',
      questions: 10,
      estimatedTime: '5-7 min',
      progress: 0,
      status: 'Not Started'
    },
    {
      id: 'stress',
      title: 'Stress Assessment',
      description: 'Evaluate your stress levels and get personalized tips',
      questions: 10,
      estimatedTime: '5-7 min',
      progress: 0,
      status: 'Not Started'
    },
    {
      id: 'ptsd',
      title: 'PTSD Assessment',
      description: 'Screen for post-traumatic stress disorder symptoms',
      questions: 10,
      estimatedTime: '5-7 min',
      progress: 0,
      status: 'Not Started'
    },
    {
      id: 'relationship',
      title: 'Relationship Assessment',
      description: 'Assess relationship patterns and communication styles',
      questions: 10,
      estimatedTime: '5-7 min',
      progress: 0,
      status: 'Not Started'
    },
    {
      id: 'ocd',
      title: 'OCD Assessment',
      description: 'Evaluate obsessive-compulsive disorder symptoms',
      questions: 10,
      estimatedTime: '5-7 min',
      progress: 0,
      status: 'Not Started'
    }
  ];

  const handleAssessmentClick = (assessmentId: string) => {
    // Mark that user has seen initial assessment when they click on any assessment
    localStorage.setItem('hasSeenInitialAssessment', 'true');
    if (onNavigateToAssessment) {
      onNavigateToAssessment(assessmentId);
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
      ref={containerRef}
      className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom pb-32 relative theme-transition scrollable-container" 
      style={{ 
        WebkitOverflowScrolling: 'touch', 
        scrollBehavior: 'smooth', 
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
        paddingBottom: 'max(128px, env(safe-area-inset-bottom) + 80px)',
        backgroundColor: bgColor
      }}
      onScroll={handleScroll}
    >

      {/* Header */}
      <div className="backdrop-blur-xl border-b px-4 py-3 shadow-sm safe-top relative z-20 theme-transition" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 245, 242, 0.8)', borderColor: borderColor }}>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all touch-target flex-shrink-0 theme-transition"
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
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                color: textPrimary
              }}
            >
              Assessments
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-24 safe-bottom relative z-10" style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom) + 60px)' }}>
        <div className="space-y-4">
          {assessments.map((assessment, index) => {
            // Get gradient and icon for each assessment type
            const getAssessmentStyle = (id: string) => {
              const gradientClass = getGradientClass();
              const styles: { [key: string]: { gradient: string; icon: React.ReactNode } } = {
                'anxiety': {
                  gradient: gradientClass,
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="white"/>
                    </svg>
                  )
                },
                'depression': {
                  gradient: getGradientClass(),
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
                    </svg>
                  )
                },
                'stress': {
                  gradient: getGradientClass(),
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="white"/>
                    </svg>
                  )
                },
                'ptsd': {
                  gradient: getGradientClass(),
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="white"/>
                    </svg>
                  )
                },
                'relationship': {
                  gradient: getGradientClass(),
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="white"/>
                    </svg>
                  )
                },
                'ocd': {
                  gradient: getGradientClass(),
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/>
                    </svg>
                  )
                }
              };
              return styles[id] || styles['anxiety'];
            };

            const style = getAssessmentStyle(assessment.id);

            return (
              <AnimatedAssessmentCard key={assessment.id} delay={index * 0.05}>
                <motion.button
                  onClick={() => handleAssessmentClick(assessment.id)}
                  className="group w-full rounded-3xl p-0 overflow-hidden transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target relative mb-4"
                  style={{
                    minHeight: assessment.progress > 0 ? '220px' : '200px',
                    boxShadow: theme === 'dark' 
                      ? '0 12px 40px rgba(122, 138, 122, 0.25), 0 8px 24px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' 
                      : '0 8px 32px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(122, 138, 122, 0.2)'
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                {/* Premium Dark Accent Gradient Background with Enhanced Glossy Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass()} rounded-3xl backdrop-blur-xl overflow-hidden`} />
                
                {/* Enhanced glossy overlay for premium effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent rounded-3xl pointer-events-none z-10" />
                
                {/* Enhanced glass effect ring with glow */}
                <div className="absolute inset-0 rounded-3xl ring-2 ring-white/30 pointer-events-none z-10" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/50 pointer-events-none z-10" />
                
                {/* Subtle overlay gradient for depth */}
                <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black/20' : 'from-black/10'} via-transparent to-transparent pointer-events-none z-10`} />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col p-6" style={{ minHeight: assessment.progress > 0 ? '220px' : '200px', paddingBottom: assessment.progress > 0 ? '24px' : '24px' }}>
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Icon Container with premium enhanced glow */}
                      <div className={`w-14 h-14 rounded-2xl ${theme === 'dark' ? 'bg-white/50' : 'bg-white/30'} backdrop-blur-lg flex items-center justify-center mb-4 shadow-2xl ring-2 ring-white/70 ring-offset-2 ring-offset-transparent flex-shrink-0`} style={{
                        boxShadow: theme === 'dark' 
                          ? '0 8px 16px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)' 
                          : '0 4px 16px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15)'
                      }}>
                        <div className="scale-110 text-white drop-shadow-lg">
                          {style.icon}
                        </div>
                      </div>
                      
                      <h3
                        className="text-[17px] text-white font-semibold mb-2 break-words"
                        style={{ 
                          fontFamily: "'Fira Sans', sans-serif",
                          textShadow: theme === 'dark' 
                            ? '0 2px 8px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)' 
                            : '0 3px 8px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.2)'
                        }}
                      >
                        {assessment.title}
                      </h3>
                      <p
                        className="text-[13px] text-white font-light leading-snug mb-3 break-words"
                        style={{ 
                          fontFamily: "'Fira Sans', sans-serif",
                          opacity: 0.95,
                          textShadow: theme === 'dark' 
                            ? '0 1px 5px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.25)' 
                            : '0 2px 6px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.2)'
                        }}
                      >
                        {assessment.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-white flex-wrap" style={{ opacity: 0.9 }}>
                        <span style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                          {assessment.questions} questions
                        </span>
                        <span style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                          {assessment.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 whitespace-nowrap ${
                        assessment.status === 'Completed'
                          ? 'bg-white/30 text-white backdrop-blur-sm'
                          : assessment.status === 'In Progress'
                          ? 'bg-white/25 text-white backdrop-blur-sm'
                          : 'bg-white/20 text-white/90 backdrop-blur-sm'
                      }`}
                      style={{ fontFamily: "'Fira Sans', sans-serif" }}
                    >
                      {assessment.status}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  {assessment.progress > 0 && (
                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs text-white/80"
                          style={{ fontFamily: "'Fira Sans', sans-serif" }}
                        >
                          Progress
                        </span>
                        <span
                          className="text-xs text-white font-medium"
                          style={{ fontFamily: "'Fira Sans', sans-serif" }}
                        >
                          {assessment.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                          className="h-full bg-white/70 rounded-full transition-all duration-500 backdrop-blur-sm shadow-sm"
                          style={{ width: `${assessment.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Arrow indicator on hover */}
                  <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="white" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            </AnimatedAssessmentCard>
            );
          })}
        </div>
      </div>
      
      {/* Scroll Gradients */}
      <div
        className="absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b to-transparent pointer-events-none transition-opacity duration-300 ease z-30 theme-transition"
        style={{ background: `linear-gradient(to bottom, ${bgColor}, transparent)`, opacity: topGradientOpacity }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t to-transparent pointer-events-none transition-opacity duration-300 ease z-30 theme-transition"
        style={{ background: `linear-gradient(to top, ${bgColor}, transparent)`, opacity: bottomGradientOpacity }}
      />
    </div>
    </>
  );
}

