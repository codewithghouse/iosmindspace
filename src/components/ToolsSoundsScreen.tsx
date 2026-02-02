import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ToolsSoundsScreenProps {
  isVisible: boolean;
  onBack?: () => void;
  initialCategory?: string;
}

interface AudioContent {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  imageName: string;
}

export default function ToolsSoundsScreen({ isVisible, onBack, initialCategory }: ToolsSoundsScreenProps) {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  
  // Update selected category when initialCategory prop changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

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
  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#4A4A4A';
  const bgHeader = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.5)';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)';
  const cardBg = theme === 'dark' ? 'rgba(60, 60, 60, 0.4)' : 'rgba(255, 255, 255, 0.6)';
  const cardBorder = theme === 'dark' ? 'rgba(122, 138, 122, 0.3)' : 'rgba(212, 209, 202, 0.5)';
  const emptyStateBg = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.6)';
  const emptyStateBorder = theme === 'dark' ? 'rgba(80, 80, 80, 0.5)' : 'rgba(212, 209, 202, 0.5)';
  const iconColor = theme === 'dark' ? '#E5E5E5' : '#3A3A3A';

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'music', label: 'Music' },
    { id: 'meditation', label: 'Meditation' },
    { id: 'ambient', label: 'Ambient Sounds' },
    { id: 'brainwave', label: 'Brainwave Entrainment' },
    { id: 'stress-relief', label: 'Stress Relief' },
    { id: 'focus', label: 'Focus & Productivity' }
  ];

  const audioContent: AudioContent[] = [
    {
      id: '1',
      title: 'Ambient Atmospheric',
      category: 'music',
      duration: '9m 44s',
      description: 'Gentle atmospheric sounds for relaxation',
      imageName: 'ambient_atmospheric'
    },
    {
      id: '2',
      title: 'Brainwave Entrainment',
      category: 'meditation',
      duration: '2m 0s',
      description: 'Meditation with brainwave synchronization',
      imageName: 'brainwave_entrainment'
    },
    {
      id: '3',
      title: 'Drum Meditations',
      category: 'meditation',
      duration: '5m 36s',
      description: 'Rhythmic drumming for deep meditation',
      imageName: 'drum_meditations'
    },
    {
      id: '4',
      title: 'Chill',
      category: 'music',
      duration: '2m 42s',
      description: 'Relaxing chill music',
      imageName: 'chill'
    },
    {
      id: '5',
      title: 'Medical Corporate',
      category: 'music',
      duration: '2m 7s',
      description: 'Calm background music for focus',
      imageName: 'medical_corporate'
    },
    {
      id: '6',
      title: 'Music Relax',
      category: 'music',
      duration: '2m 33s',
      description: 'Soothing music for relaxation',
      imageName: 'music_relax'
    },
    {
      id: '7',
      title: 'Night Sleep Yoga',
      category: 'meditation',
      duration: '9m 41s',
      description: 'Evening yoga for better sleep',
      imageName: 'night_sleep_yoga'
    },
    {
      id: '8',
      title: 'On The Edge',
      category: 'music',
      duration: '9m 55s',
      description: 'Dramatic and contemplative music',
      imageName: 'on_the_edge'
    },
    {
      id: '9',
      title: 'Relaxation In Nature',
      category: 'music',
      duration: '2m 9s',
      description: 'Peaceful sounds of nature',
      imageName: 'relaxation_in_nature'
    },
    {
      id: '10',
      title: 'Relaxation Meditation',
      category: 'meditation',
      duration: '6m 8s',
      description: 'Deep relaxation and inner peace',
      imageName: 'relaxation_meditation'
    }
  ];

  const filteredContent = selectedCategory === 'all'
    ? audioContent
    : audioContent.filter(item => item.category === selectedCategory);

  const handlePlay = (id: string) => {
    setIsPlaying(isPlaying === id ? null : id);
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
      
    <div className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom pb-20 transition-colors duration-300 scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', backgroundColor: bgColor }}>

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
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
            >
              Tools and Sounds
            </h1>
          </div>
        </div>
      </div>

      {/* Audio Content Grid */}
      <div className="px-4 py-6 safe-bottom relative z-10" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom) + 20px)' }}>
        {filteredContent.length === 0 ? (
          <div className="backdrop-blur-sm border rounded-2xl p-8 text-center theme-transition" style={{ backgroundColor: emptyStateBg, borderColor: emptyStateBorder }}>
            <p
              className="font-light theme-transition"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textSecondary }}
            >
              No audio content available for this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredContent.map((item, index) => {
              return (
                <button
                  key={item.id}
                  onClick={() => handlePlay(item.id)}
                  className={`group relative bg-gradient-to-br ${theme === 'dark' ? 'from-amber-700 via-amber-800 to-amber-900' : 'from-amber-400 via-amber-500 to-amber-600'} rounded-3xl p-0 overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] touch-target focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] flex flex-col`}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 50}ms both`
                  }}
                >
                  {/* Subtle overlay gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none z-10" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                        item.category === 'music'
                          ? 'bg-[#8B6F47]/95 text-white border border-white/20'
                          : 'bg-[#A0826D]/95 text-white border border-white/20'
                      }`}
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}
                    >
                      {item.category === 'music' ? 'MUSIC' : item.category === 'meditation' ? 'MEDITATION' : item.category.toUpperCase()}
                    </span>
                  </div>

                  {/* Image Container with Overlay */}
                  <div className="w-full h-40 rounded-t-3xl overflow-hidden relative">
                    <img
                      src={`/assets/tools/${item.imageName}.png`}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    
                    {/* Play/Pause Overlay */}
                    {isPlaying === item.id && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="#8B6F47" />
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    {/* Play icon on hover (when not playing) */}
                    {isPlaying !== item.id && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5v14l11-7z" fill="#8B6F47" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
                    {/* Title */}
                    <h3
                      className="text-[16px] text-white font-semibold mb-2 text-center leading-tight"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}
                    >
                      {item.title}
                    </h3>

                    {/* Duration */}
                    <div className="text-center">
                      <span
                        className="text-[13px] text-white/90 font-medium tracking-wide"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}
                      >
                        {item.duration}
                      </span>
                    </div>
                  </div>

                  {/* Active indicator bar */}
                  {isPlaying === item.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/60 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

