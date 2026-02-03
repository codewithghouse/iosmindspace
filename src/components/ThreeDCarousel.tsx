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

  // Pastel Color Palette matching GetStartedCards
  const getGradientClass = (id: string) => {
    if (theme === 'dark') {
      const darkGradients: { [key: string]: string } = {
        'selfcare': 'from-[#556B55] to-[#4A5A4A]', // Deep herbal green
        'tools': 'from-[#5A6A7A] to-[#4A5A6A]',    // Slate blue
        'articles': 'from-[#7A6A7A] to-[#6A5A6A]', // Muted plum
        'journal': 'from-[#7A7060] to-[#6A6050]'   // Warm earth
      };
      return darkGradients[id] || darkGradients['selfcare'];
    } else {
      // PREMIUM PASTEL GRADIENTS (Modified to match GetStartedCards)
      const lightGradients: { [key: string]: string } = {
        'selfcare': 'from-[#E8DAEF] to-[#D7BDE2]', // Lavender (Assessment)
        'tools': 'from-[#FAE5D3] to-[#F5CBA7]',    // Apricot/Sand (Booking)
        'articles': 'from-[#D6EAF8] to-[#AED6F1]', // Sky Blue (Tara)
        'journal': 'from-[#D5F5E3] to-[#ABEBC6]'   // Mint Green (Breathing)
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

    // Adjusted scaling for a more 'card stack' feel
    if (index === active) return "scale-100 opacity-100 z-20 translate-x-0";
    if (index === (active + 1) % items.length)
      return "translate-x-[20px] scale-[0.92] z-10 blur-[1px] opacity-60"; // Right card behind
    if (index === (active - 1 + items.length) % items.length)
      return "translate-x-[-20px] scale-[0.92] z-10 blur-[1px] opacity-60"; // Left card behind
    return "scale-80 opacity-0 z-0 pointer-events-none";
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={carouselRef}
      className="relative h-[180px] w-full flex items-center justify-center overflow-visible"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full max-w-[340px] h-[160px] flex items-center justify-center perspective-1000">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute top-0 w-full h-full transition-all duration-700 cubic-bezier(0.25, 0.8, 0.25, 1) ${getCardAnimationClass(
              index
            )}`}
            style={{
              willChange: 'transform, opacity',
            }}
          >
            <button
              onClick={item.onClick}
              className="group w-full h-full rounded-[28px] overflow-hidden transition-transform duration-300 active:scale-[0.98] focus:outline-none text-left touch-target relative"
              style={{
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.5)',
                boxShadow: theme === 'dark'
                  ? '0 12px 32px -8px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)'
                  : '0 14px 30px -10px rgba(0,0,0,0.1), 0 4px 12px -2px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.4)'
              }}
            >
              {(() => {
                const gradientClass = getGradientClass(item.id);

                return (
                  <>
                    {/* Soft Matte Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-100`} />

                    {/* Very subtle noise texture for premium feel */}
                    <div className="absolute inset-0 bg-white/5 opacity-40 mix-blend-overlay pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full p-6 justify-between">
                      {/* Top Row: Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/15 shadow-sm">
                        <div className="text-white scale-100 opacity-95">
                          {item.icon}
                        </div>
                      </div>

                      {/* Flex spacer */}
                      <div className="flex-1" />

                      {/* Title & Desc */}
                      <div>
                        {/* Title */}
                        <h3
                          className="text-[19px] font-bold mb-1 tracking-tight"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: theme === 'dark' ? '#FFFFFF' : '#2D3748', // Dark slate in light mode
                            textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p
                          className="text-[13px] font-medium leading-relaxed"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#4A5568' // Muted slate in light mode
                          }}
                        >
                          {item.description}
                        </p>
                      </div>

                      {/* Arrow indicator on hover */}
                      <div className={`absolute bottom-6 right-6 w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-black/5'} backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill={theme === 'dark' ? 'white' : '#2D3748'} />
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
      <div className="absolute -bottom-6 left-0 right-0 flex justify-center items-center space-x-2 z-30">
        {items.map((_, idx) => (
          <button
            key={idx}
            className="transition-all duration-300 rounded-full theme-transition"
            style={{
              backgroundColor: active === idx
                ? (theme === 'dark' ? '#AA9A8A' : '#7A8A7A')
                : (theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'),
              width: active === idx ? '24px' : '6px',
              height: '6px'
            }}
            onClick={() => setActive(idx)}
            aria-label={`Go to item ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThreeDCarousel;
