import { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getCalApi } from '@calcom/embed-react';

interface BookingScreenProps {
  isVisible: boolean;
  onBack?: () => void;
}

export default function BookingScreen({ isVisible, onBack }: BookingScreenProps) {
  const { theme } = useTheme();
  const calEmbedRef = useRef<HTMLDivElement>(null);

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

  // Initialize Cal.com when screen is visible
  useEffect(() => {
    if (isVisible && calEmbedRef.current) {
      (async function () {
        try {
          const cal = await getCalApi({ namespace: 'appointment' });
          
          // Configure UI settings
          cal('ui', {
            hideEventTypeDetails: false,
            layout: 'month_view',
            styles: {
              branding: {
                brandColor: theme === 'dark' ? '#7A8A7A' : '#A2AD9C',
                lightColor: '#F7F5F2',
                darkColor: '#1a1a1a',
              },
            },
          });

          // Embed inline calendar - elementOrSelector is required
          cal('inline', {
            elementOrSelector: calEmbedRef.current,
            calLink: 'goodmind-foundation-pqjl4q/appointment',
            layout: 'month_view',
            config: {
              layout: 'month_view',
            },
            styles: {
              branding: {
                brandColor: theme === 'dark' ? '#7A8A7A' : '#A2AD9C',
                lightColor: '#F7F5F2',
                darkColor: '#1a1a1a',
              },
            },
          });
        } catch (error) {
          console.error('Error initializing Cal.com embed:', error);
        }
      })();
    }
  }, [isVisible, theme]);

  if (!isVisible) return null;

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(212, 209, 202, 0.5)';
  const bgHeader = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.5)';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.6)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#3A3A3A';

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
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all touch-target theme-transition"
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
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                color: textPrimary
              }}
            >
              Book Appointment
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content - Cal.com Embed */}
      <div className="px-4 py-6 safe-bottom relative z-10">
        <div className="backdrop-blur-sm border rounded-2xl p-6 mb-4 theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
          <div className="text-center mb-6">
            <h2
              className="text-xl font-semibold mb-2 theme-transition"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                color: textPrimary
              }}
            >
              Schedule Your Appointment
            </h2>
            <p
              className="text-sm font-light theme-transition"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                color: textSecondary
              }}
            >
              Select a date and time that works for you
            </p>
          </div>
          
          {/* Cal.com Inline Embed Container */}
          <div 
            ref={calEmbedRef}
            id="cal-inline-widget"
            data-cal-namespace="appointment"
            data-cal-link="goodmind-foundation-pqjl4q/appointment"
            data-cal-config='{"layout":"month_view"}'
            style={{ 
              minHeight: '700px',
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: bgCard,
            }}
          />
          
          {/* Custom CSS to theme the Cal.com embed */}
          <style>{`
            /* Cal.com Embed Theme Styling */
            #cal-inline-widget iframe {
              border-radius: 16px !important;
              border: none !important;
              background: ${bgCard} !important;
            }
            
            /* Override Cal.com default styles to match theme */
            [data-cal-namespace="appointment"] {
              --cal-brand: ${accentColor} !important;
              --cal-brand-emphasis: ${theme === 'dark' ? '#8A9A8A' : '#B8C4B0'} !important;
              --cal-brand-text: ${textPrimary} !important;
              --cal-text: ${textPrimary} !important;
              --cal-text-emphasis: ${textSecondary} !important;
              --cal-border: ${borderColor} !important;
              --cal-border-subtle: ${theme === 'dark' ? 'rgba(122, 138, 122, 0.2)' : 'rgba(162, 173, 156, 0.2)'} !important;
              --cal-background: ${bgCard} !important;
              --cal-background-subtle: ${theme === 'dark' ? 'rgba(50, 50, 50, 0.5)' : 'rgba(255, 255, 255, 0.4)'} !important;
            }
            
            /* Theme-aware button styles */
            [data-cal-namespace="appointment"] button {
              background-color: ${accentColor} !important;
              color: ${theme === 'dark' ? '#FFFFFF' : 'white'} !important;
              border-radius: 9999px !important;
              font-family: 'Fira Sans', sans-serif !important;
              transition: all 0.2s ease !important;
            }
            
            [data-cal-namespace="appointment"] button:hover {
              background-color: ${theme === 'dark' ? '#8A9A8A' : '#B8C4B0'} !important;
              transform: scale(0.98) !important;
            }
            
            /* Calendar cell styling */
            [data-cal-namespace="appointment"] [class*="calendar"] {
              background: ${bgCard} !important;
            }
            
            [data-cal-namespace="appointment"] [class*="day"] {
              color: ${textPrimary} !important;
            }
            
            [data-cal-namespace="appointment"] [class*="selected"] {
              background-color: ${accentColor} !important;
              color: ${theme === 'dark' ? '#FFFFFF' : 'white'} !important;
            }
            
            /* Time slot styling */
            [data-cal-namespace="appointment"] [class*="time"] {
              color: ${textPrimary} !important;
              border-color: ${borderColor} !important;
            }
            
            [data-cal-namespace="appointment"] [class*="time"]:hover {
              background-color: ${theme === 'dark' ? 'rgba(122, 138, 122, 0.2)' : 'rgba(162, 173, 156, 0.1)'} !important;
            }
          `}</style>
        </div>
      </div>
    </div>
    </>
  );
}
