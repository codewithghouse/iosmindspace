import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageSrc?: string;
  onClick: () => void;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  id,
  title,
  description,
  icon,
  imageSrc,
  onClick,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <motion.button
      onClick={onClick}
      className={`group relative w-full h-[160px] rounded-[32px] overflow-hidden text-left touch-target flex flex-col transition-all duration-300 ${className}`}
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(145deg, rgba(40,40,40,0.9), rgba(30,30,30,0.95))'
          : 'linear-gradient(145deg, #FFFFFF, #F8F9FA)',
        boxShadow: theme === 'dark'
          ? '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)'
          : '0 10px 30px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)',
        border: theme === 'dark'
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(255,255,255,0.6)'
      }}
      whileHover={{ scale: 1.01, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Premium Glass Sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

      {/* Content Container */}
      <div className="relative z-20 flex flex-col h-full p-5 justify-between">

        {/* Header: Title & Desc */}
        <div className="flex flex-col gap-1 max-w-[70%]">
          <h3
            className="text-[17px] font-semibold leading-tight tracking-tight"
            style={{
              color: 'var(--text-primary)',
              fontFamily: "'Inter', -apple-system, sans-serif"
            }}
          >
            {title}
          </h3>
          <p
            className="text-[13px] font-medium leading-normal"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: "'Inter', -apple-system, sans-serif"
            }}
          >
            {description}
          </p>
        </div>

        {/* Dynamic Illustration or Icon */}
        {imageSrc ? (
          <div className="absolute bottom-[-10px] right-[-10px] w-[110px] h-[110px] transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-contain drop-shadow-xl"
              style={{ filter: theme === 'dark' ? 'brightness(0.9)' : 'none' }}
            />
          </div>
        ) : (
          /* Fallback Elegant Icon Container */
          <div className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-accent/10"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              color: 'var(--accent-color)'
            }}>
            <div className="scale-110 opacity-90">
              {icon}
            </div>
          </div>
        )}
      </div>

      {/* Soft Bottom Highlight */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-accent/5 to-transparent opacity-50 z-0"
        style={{ color: 'var(--accent-color)' }}
      />
    </motion.button>
  );
};

