import { useAppState } from '../contexts/AppStateContext';
import { HomeHeader } from './home/HomeHeader';
import { GetStartedCards } from './home/HomeCards';
import { MoodList } from './shared/MoodSelector';
import { HeroCard } from './home/HeroCard';
import ThreeDCarousel from './ThreeDCarousel';

interface HomeScreenProps {
  isVisible: boolean;
}

export default function HomeScreen({ isVisible }: HomeScreenProps) {
  const { navigateToJournal, navigateToSelfCare, navigateToToolsSounds, navigateToArticles } = useAppState();

  const bgColor = 'var(--bg-primary)';
  const textPrimary = 'var(--text-primary)';

  if (!isVisible) return null;

  return (
    <>
      <div
        className="absolute inset-0 min-h-screen w-full overflow-y-auto safe-top safe-bottom pb-32 theme-transition scrollable-container"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          backgroundColor: bgColor
        }}
      >
        {/* Header - Matches 'Here for you always...' */}
        <HomeHeader />

        {/* Main Content */}
        <div className="px-5 pb-40 safe-bottom relative z-10 min-h-[calc(100vh+100px)] flex flex-col gap-6">



          {/* Hero Card - 'Brain won't shut up?' */}
          <HeroCard />

          {/* Grid of 4 Cards */}
          {/* Take Assessment, Book Appointment, Say Hi to Tara, Breathe with us */}
          <div className="mb-2">
            <GetStartedCards />
          </div>

          {/* Daily Mood Log - 'How does [Name] feel today?' */}
          <div className="mt-6">
            <MoodList />
          </div>

          {/* Explore Section - Compact spacing */}
          <div className="mb-20 mt-2 relative z-0">
            <h2
              className="text-[18px] font-bold mb-3 px-1"
              style={{ fontFamily: "'Inter', sans-serif", color: textPrimary }}
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
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
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
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor" />
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
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor" />
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
                      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor" />
                    </svg>
                  ),
                  onClick: () => navigateToJournal()
                },
              ]}
              autoRotate={true}
              rotateInterval={4000}
            />
          </div>

        </div>
      </div>
    </>
  );
}

