import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const getCardColorClass = (id: string, theme: 'light' | 'dark'): string => {
  if (theme === 'dark') {
    const darkCardColors: { [key: string]: string } = {
      'tara': 'bg-gray-800',
      'assessments': 'bg-blue-600',
      'selfcare': 'bg-pink-600',
      'bookings': 'bg-yellow-600',
      'breathing': 'bg-orange-600',
      'tools': 'bg-gray-700',
      'journal': 'bg-gray-600',
      'articles': 'bg-[#5A6A5A]'
    };
    return darkCardColors[id] || darkCardColors['tara'];
  } else {
    const lightCardColors: { [key: string]: string } = {
      'tara': 'bg-white',
      'assessments': 'bg-blue-300',
      'selfcare': 'bg-pink-300',
      'bookings': 'bg-yellow-300',
      'breathing': 'bg-orange-300',
      'tools': 'bg-gray-300',
      'journal': 'bg-gray-400',
      'articles': 'bg-[#7A8A7A]'
    };
    return lightCardColors[id] || lightCardColors['tara'];
  }
};

const getCardTextStyle = (id: string, theme: 'light' | 'dark', isTitle: boolean = true) => {
  if (theme === 'dark') {
    return {
      color: '#FFFFFF',
      fontWeight: isTitle ? '700' : '600',
      textShadow: isTitle 
        ? '0 2px 10px rgba(0,0,0,0.5), 0 1px 5px rgba(0,0,0,0.4)' 
        : '0 1px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.35)',
      letterSpacing: isTitle ? '-0.3px' : '0px'
    };
  } else {
    const needsDarkText = ['tara', 'articles', 'bookings', 'tools'];
    const isDarkText = needsDarkText.includes(id);
    
    if (isDarkText) {
      return {
        color: '#1A1A1A',
        fontWeight: isTitle ? '700' : '600',
        textShadow: '0 1px 3px rgba(255,255,255,0.8), 0 1px 1px rgba(0,0,0,0.1)',
        letterSpacing: isTitle ? '-0.3px' : '0px'
      };
    } else {
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

const getIconContainerStyle = (id: string, theme: 'light' | 'dark') => {
  const needsDarkText = ['tara', 'articles', 'bookings', 'tools'];
  const isWhiteText = !needsDarkText.includes(id) || theme === 'dark';
  
  if (theme === 'dark') {
    return {
      containerClass: 'bg-white/20 backdrop-blur-md ring-2 ring-white/40',
      iconColor: '#FFFFFF'
    };
  } else {
    if (isWhiteText) {
      return {
        containerClass: 'bg-white/30 backdrop-blur-md ring-2 ring-white/50',
        iconColor: '#FFFFFF'
      };
    } else {
      return {
        containerClass: 'bg-white/20 backdrop-blur-md ring-2 ring-white/30',
        iconColor: '#1A1A1A'
      };
    }
  }
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
  id,
  title,
  description,
  icon,
  onClick,
  className = '',
}) => {
  const { theme } = useTheme();
  const cardColor = getCardColorClass(id, theme);
  const textStyle = getCardTextStyle(id, theme, true);
  const descStyle = getCardTextStyle(id, theme, false);
  const iconStyle = getIconContainerStyle(id, theme);

  return (
    <motion.button
      onClick={onClick}
      className={`group w-full h-[150px] rounded-3xl p-0 overflow-hidden transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#A2AD9C] text-left touch-target flex flex-col relative ${className}`}
      style={{
        boxShadow: theme === 'dark' 
          ? '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
          : '0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(162, 173, 156, 0.2)'
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background */}
      <div className={`absolute inset-0 ${cardColor} rounded-3xl`} />
      
      {/* Subtle overlay gradient for depth */}
      <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black/20 via-transparent to-transparent' : 'from-black/10 via-transparent to-transparent'} pointer-events-none z-10`} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Icon Container */}
        <div className={`w-12 h-12 rounded-2xl ${iconStyle.containerClass} flex items-center justify-center mb-3 shadow-lg flex-shrink-0`}>
          <div className="scale-110" style={{ color: iconStyle.iconColor }}>
            {icon}
          </div>
        </div>
        
        <h3
          className="text-[17px] mb-1.5 flex-1"
          style={{ 
            ...textStyle,
            fontFamily: "'Fira Sans', sans-serif"
          }}
        >
          {title}
        </h3>
        <p
          className="text-[13px]"
          style={{ 
            ...descStyle,
            fontFamily: "'Fira Sans', sans-serif",
            opacity: 0.85
          }}
        >
          {description}
        </p>
      </div>
    </motion.button>
  );
};

