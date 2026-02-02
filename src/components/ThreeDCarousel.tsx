import React, { useRef, useEffect, useState, TouchEvent } from "react";
import { useTheme } from '../contexts/ThemeContext';

export interface ThreeDCarouselItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface ThreeDCarouselProps {
  items: ThreeDCarouselItem[];
  autoRotate?: boolean;
  rotateInterval?: number;
  isPaused?: boolean;
}

const ThreeDCarousel = ({
  items,
  autoRotate = true,
  rotateInterval = 3000,
  isPaused = false,
}: ThreeDCarouselProps) => {
  const { theme } = useTheme();
  const [active, setActive] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Enhanced gradient helper function - Brighter colors for better visibility
  const getGradientClass = (id: string) => {
    if (theme === 'dark') {
      const darkGradients: { [key: string]: string } = {
        'selfcare': 'from-[#6A7A6A] to-[#5A6A5A]',
        'tools': 'from-[#7A8A7A] to-[#6A7A6A]',
        'articles': 'from-[#8A9A8A] to-[#7A8A7A]',
        'journal': 'from-[#6A7A6A] to-[#4A5A4A]'
      };
      return darkGradients[id] || darkGradients['selfcare'];
    } else {
      const lightGradients: { [key: string]: string } = {
        'selfcare': 'from-[#7A8A7A] to-[#6A7A6A]',
        'tools': 'from-[#8A9A8A] to-[#7A8A7A]',
        'articles': 'from-[#9AAA9A] to-[#8A9A8A]',
        'journal': 'from-[#7A8A7A] to-[#5A6A5A]'
      };
      return lightGradients[id] || lightGradients['selfcare'];
    }
  };

  useEffect(() => {
    if (autoRotate && isInView && !isHovering && !isPaused && items.length > 0) {
      const interval = setInterval(() => {
        setActive((prev) => (prev + 1) % items.length);
      }, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [isInView, isHovering, autoRotate, rotateInterval, items.length, isPaused]);

  useEffect(() => {
    if (!carouselRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && items.length > 0) {
      setActive((prev) => (prev + 1) % items.length);
    } else if (distance < -minSwipeDistance && items.length > 0) {
      setActive((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  const getCardAnimationClass = (index: number) => {
    if (items.length === 0) return "scale-100 opacity-100 z-20";
    
    if (index === active) return "scale-100 opacity-100 z-20 translate-x-0";
    if (index === (active + 1) % items.length)
      return "translate-x-[32%] scale-[0.88] opacity-40 z-10";
    if (index === (active - 1 + items.length) % items.length)
      return "translate-x-[-32%] scale-[0.88] opacity-40 z-10";
    return "scale-70 opacity-0 z-0 pointer-events-none";
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={carouselRef}
      className="relative overflow-hidden h-[160px]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute top-0 w-[300px] transform transition-all duration-700 ease-out ${getCardAnimationClass(
              index
            )}`}
            style={{
              left: '50%',
              marginLeft: '-150px', // Half of card width
              willChange: 'transform, opacity',
            }}
          >
            <button
              onClick={item.onClick}
              className="group w-full h-full rounded-3xl p-0 overflow-hidden transition-all duration-300 hover:shadow-xl active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target min-h-[140px] flex flex-col explore-card relative"
              style={{
                boxShadow: theme === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)' 
                  : '0 8px 24px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.12), 0 0 0 1px rgba(122, 138, 122, 0.2)'
              }}
            >
              {(() => {
                const gradientClass = getGradientClass(item.id);
                
                return (
                  <>
                    {/* Gradient Background with Glossy Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-3xl backdrop-blur-lg`} />
                    
                    {/* Glossy overlay for premium effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl pointer-events-none z-10" />
                    
                    {/* Subtle overlay gradient for depth */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black/20' : 'from-black/10'} via-transparent to-transparent pointer-events-none z-10`} />
                    
                    {/* Glass effect ring */}
                    <div className="absolute inset-0 rounded-3xl ring-2 ring-white/20 pointer-events-none z-10" />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full p-5">
                      {/* Icon Container with enhanced glow */}
                      <div className={`w-14 h-14 rounded-2xl ${theme === 'dark' ? 'bg-white/40' : 'bg-white/30'} backdrop-blur-md flex items-center justify-center mb-4 shadow-xl ring-2 ring-white/60 flex-shrink-0`}>
                        <div className="scale-110 text-white">
                          {item.icon}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3
                        className="text-[17px] text-white font-semibold mb-2 flex-1"
                        style={{ 
                          fontFamily: "'Fira Sans', sans-serif",
                          textShadow: theme === 'dark' 
                            ? '0 2px 8px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)' 
                            : '0 3px 8px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.2)'
                        }}
                      >
                        {item.title}
                      </h3>
                      
                      {/* Description */}
                      <p
                        className="text-[13px] text-white font-light leading-snug"
                        style={{ 
                          fontFamily: "'Fira Sans', sans-serif",
                          opacity: 0.95,
                          textShadow: theme === 'dark' 
                            ? '0 1px 5px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.25)' 
                            : '0 2px 6px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.2)'
                        }}
                      >
                        {item.description}
                      </p>
                      
                      {/* Arrow indicator on hover */}
                      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="white" />
                        </svg>
                      </div>
                    </div>
                  </>
                );
              })()}
            </button>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center space-x-2 z-30">
        {items.map((_, idx) => (
          <button
            key={idx}
            className="transition-all duration-300 rounded-full theme-transition"
            style={{
              backgroundColor: active === idx 
                ? (theme === 'dark' ? '#7A8A7A' : '#A2AD9C')
                : (theme === 'dark' ? 'rgba(100, 100, 100, 0.5)' : '#D4D1CA'),
              width: active === idx ? '24px' : '8px',
              height: '8px'
            }}
            onClick={() => setActive(idx)}
            onMouseEnter={(e) => {
              if (active !== idx) {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(162, 173, 156, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== idx) {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.5)' : '#D4D1CA';
              }
            }}
            aria-label={`Go to item ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThreeDCarousel;

