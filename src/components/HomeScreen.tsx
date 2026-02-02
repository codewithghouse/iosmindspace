import { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAppState } from '../contexts/AppStateContext';
import { HomeHeader } from './home/HomeHeader';
import { GetStartedCards, QuickAccessCards } from './home/HomeCards';
import { HealthStatusCard } from './shared/HealthStatusCard';
import { MoodSelector, MoodList } from './shared/MoodSelector';
import ThreeDCarousel from './ThreeDCarousel';

interface HomeScreenProps {
  isVisible: boolean;
}

export default function HomeScreen({ isVisible }: HomeScreenProps) {
  const { theme } = useTheme();
  const { navigateToChat, navigateToJournal, navigateToSelfCare, navigateToToolsSounds, navigateToArticles } = useAppState();
  const [isPaused, setIsPaused] = useState(false);

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

  const bgColor = 'var(--bg-primary)';
  const textPrimary = 'var(--text-primary)';

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
      
      <div 
        className="absolute inset-0 min-h-screen w-full overflow-y-auto safe-top safe-bottom pb-48 theme-transition scrollable-container" 
        style={{ 
          WebkitOverflowScrolling: 'touch', 
          scrollBehavior: 'smooth', 
          overscrollBehavior: 'contain', 
          touchAction: 'pan-y',
          backgroundColor: bgColor
        }}
      >
        {/* Header with Greeting and Search */}
        <HomeHeader />

        {/* Main Content */}
        <div className="px-4 py-6 pb-40 safe-bottom relative z-10 min-h-[calc(100vh+700px)]">
          {/* Health & Mood Card */}
          <div className="mb-12">
            <div className="w-full rounded-3xl p-5 transition-all duration-300 shadow-lg relative overflow-hidden backdrop-blur-xl border theme-transition" 
                 style={{ 
                   backgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.95)', 
                   borderColor: theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)' 
                 }}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <HealthStatusCard />
                </div>
                <div className="w-px h-24 theme-transition" style={{ backgroundColor: theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)' }} />
                <MoodSelector />
              </div>
            </div>
          </div>

          {/* Daily mood log Section */}
          <MoodList />

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
                  onClick: () => navigateToSelfCare()
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
                  onClick: () => navigateToToolsSounds()
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
                  onClick: () => navigateToArticles()
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
                  onClick: () => navigateToJournal()
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
                  onClick: () => navigateToChat()
                },
              ]}
              autoRotate={true}
              rotateInterval={3000}
              isPaused={isPaused}
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
            <GetStartedCards />
          </div>

          {/* Quick Access Section */}
          <div className="mb-24">
            <h2
              className="text-[18px] font-medium mb-5 transition-colors duration-300"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
            >
              Quick Access
            </h2>
            <QuickAccessCards />
          </div>
        </div>
      </div>
    </>
  );
}

