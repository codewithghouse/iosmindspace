import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: (isActive: boolean) => JSX.Element;
  screen: string;
}

export default function NavigationBar({ currentScreen, onNavigate }: NavigationBarProps) {
  const { theme } = useTheme();
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemPositions, setItemPositions] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(400);
  
  // Neumorphic colors - soft, warm palette
  const navBg = theme === 'dark' ? 'rgba(50, 50, 50, 0.3)' : 'rgba(255, 255, 255, 0.3)'; // Transparent navbar
  const backgroundBase = theme === 'dark' ? '#2A2A2A' : '#E8E8E8';
  const activeColor = theme === 'dark' ? '#FF6B6B' : '#FF6B6B'; // Coral/warm red
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A'; // Theme accent color
  const shadowColor = theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)';
  const highlightColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
  
  // Different colors for each icon (used for both active and inactive)
  const getIconColor = (iconId: string) => {
    const colors: { [key: string]: string } = {
      'home': '#4A90E2',      // Blue - welcoming, homey
      'insights': '#9B59B6',  // Purple - analytical, data-focused
      'call': '#2ECC71',      // Green - communication, connection
      'profile': '#F39C12'    // Orange - personal, warm
    };
    return colors[iconId] || '#3A4A3A';
  };

  // Navigation items - 4 items: Home, Insights, Call, Profile
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      screen: 'home',
      icon: (isActive: boolean) => {
        const iconColor = getIconColor('home');
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
              fill={isActive ? iconColor : 'none'}
              stroke={iconColor}
              strokeWidth={isActive ? '0' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }
    },
    {
      id: 'insights',
      label: 'Insights',
      screen: 'insights',
      icon: (isActive: boolean) => {
        const iconColor = getIconColor('insights');
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {isActive ? (
              // Active: Professional column chart - 3 filled columns
              <>
                {/* Chart base line */}
                <line x1="5" y1="20" x2="19" y2="20" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
                
                {/* Column bars - 3 columns with varying heights */}
                <rect x="6" y="12" width="2.5" height="8" fill={iconColor} rx="0.5"/>
                <rect x="10.5" y="8" width="2.5" height="12" fill={iconColor} rx="0.5"/>
                <rect x="15" y="6" width="2.5" height="14" fill={iconColor} rx="0.5"/>
              </>
            ) : (
              // Inactive: Professional column chart outline - 3 columns
              <>
                {/* Chart base line */}
                <line x1="5" y1="20" x2="19" y2="20" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
                
                {/* Column bars - 3 columns outline version */}
                <rect x="6" y="12" width="2.5" height="8" fill="none" stroke={iconColor} strokeWidth="2" rx="0.5"/>
                <rect x="10.5" y="8" width="2.5" height="12" fill="none" stroke={iconColor} strokeWidth="2" rx="0.5"/>
                <rect x="15" y="6" width="2.5" height="14" fill="none" stroke={iconColor} strokeWidth="2" rx="0.5"/>
              </>
            )}
          </svg>
        );
      }
    },
    {
      id: 'call',
      label: 'Call',
      screen: 'call',
      icon: (isActive: boolean) => {
        const iconColor = getIconColor('call');
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill={isActive ? iconColor : 'none'}
              stroke={iconColor}
              strokeWidth={isActive ? '0' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }
    },
    {
      id: 'profile',
      label: 'Profile',
      screen: 'profile',
      icon: (isActive: boolean) => {
        const iconColor = getIconColor('profile');
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* No outer circle - only the head and body */}
            <circle
              cx="12"
              cy="8"
              r="3"
              fill={isActive ? iconColor : 'none'}
              stroke={iconColor}
              strokeWidth={isActive ? '0' : '2'}
            />
            <path
              d="M6 19c0-3.31 2.69-6 6-6s6 2.69 6 6"
              fill={isActive ? iconColor : 'none'}
              stroke={iconColor}
              strokeWidth={isActive ? '0' : '2'}
              strokeLinecap="round"
            />
          </svg>
        );
      }
    }
  ];

  // Find active item index
  const activeIndex = useMemo(() => {
    return navItems.findIndex(item => item.screen === currentScreen || (item.screen === 'call' && currentScreen === 'call'));
  }, [currentScreen]);

  // Calculate item positions and container width after mount
  useEffect(() => {
    const updatePositions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
        
        const buttons = containerRef.current.querySelectorAll('button[data-nav-item]');
        const positions: number[] = [];
        buttons.forEach((button) => {
          const buttonRect = button.getBoundingClientRect();
          const containerRect = containerRef.current!.getBoundingClientRect();
          positions.push(buttonRect.left - containerRect.left + buttonRect.width / 2);
        });
        if (positions.length > 0) {
          setItemPositions(positions);
        }
      }
    };

    // Initial update with delay to ensure DOM is ready
    const timer = setTimeout(updatePositions, 100);
    
    // Update on resize
    window.addEventListener('resize', updatePositions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
    };
  }, [currentScreen]);

  // Spring animation config - 450-600ms timing with perfect synchronization
  const springConfig = { 
    type: 'spring' as const,
    stiffness: 140,  // Tuned for 450-600ms duration
    damping: 22,     // Smooth damping with subtle overshoot
    mass: 1.6        // More weight for natural, rubber-like feel
  };

  // Calculate active button X position
  const activeXValue = useMemo(() => {
    if (activeIndex >= 0 && itemPositions.length > 0 && itemPositions[activeIndex] !== undefined) {
      return itemPositions[activeIndex];
    }
    return containerWidth / 2;
  }, [activeIndex, itemPositions, containerWidth]);

  // Motion values for smooth animation
  const activeX = useMotionValue(activeXValue);
  const springX = useSpring(activeX, springConfig);

  // Update motion value when active index changes
  useEffect(() => {
    if (activeIndex >= 0 && itemPositions.length > 0 && itemPositions[activeIndex] !== undefined) {
      activeX.set(itemPositions[activeIndex]);
    }
  }, [activeIndex, itemPositions, activeX]);


  // Transform springX to button X position
  const buttonX = useTransform(springX, (x) => x - 28);

  const handleNavClick = async (screen: string, id: string) => {
    setPressedItem(id);
    setTimeout(async () => {
      setPressedItem(null);
      
      // Navigate to call screen (no special handling needed)
      onNavigate(screen);
    }, 150);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bottom-nav"
      style={{
        fontFamily: "'Fira Sans', sans-serif",
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '16px',
        paddingBottom: '16px' // Will be overridden by CSS for iOS to include safe area
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Removed grey background - navbar is now pure white floating surface */}
      
      {/* Main Navigation Bar - Clean white pill shape */}
      <div
        ref={containerRef}
        className="relative mx-auto nav-bar-container"
        style={{
          maxWidth: '400px',
          height: '64px',
          marginBottom: '0'
        }}
      >
        {/* Base navbar container - transparent with backdrop blur, shadow only below */}
        <div
          className="absolute inset-0 rounded-full overflow-visible backdrop-blur-xl"
          style={{
            backgroundColor: navBg,
            boxShadow: theme === 'dark'
              ? `0 4px 12px ${shadowColor}`
              : `0 4px 12px ${shadowColor}`,
            border: theme === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(122, 138, 122, 0.2)' // Subtle border for visibility
          }}
        >
          {/* Navigation Items */}
          <div className="relative h-full flex items-center justify-around px-2 z-0">
            {navItems.map((item, index) => {
              const isActive = currentScreen === item.screen || (item.screen === 'call' && currentScreen === 'call');
              const isPressed = pressedItem === item.id;
              
              return (
                <button
                  key={item.id}
                  data-nav-item={item.id}
                  onClick={() => handleNavClick(item.screen, item.id)}
                  className="relative flex items-center justify-center touch-target z-10"
                  style={{
                    width: `${100 / navItems.length}%`,
                    height: '100%',
                    transform: isPressed ? 'scale(0.95)' : 'scale(1)',
                    transition: 'transform 0.15s ease-out'
                  }}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Icon - active shows in bold with color, inactive shows lighter */}
                  <motion.div
                    className="flex items-center justify-center"
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0.6,
                      scale: isActive ? 1.1 : 1
                    }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                      mass: 0.6
                    }}
                  >
                    {item.icon(isActive)}
                  </motion.div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
