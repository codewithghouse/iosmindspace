import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const { theme } = useTheme();
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-t-transparent rounded-full animate-spin`}
        style={{
          borderColor: `${accentColor}40`,
          borderTopColor: accentColor,
        }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: bgColor }}
    >
      <LoadingSpinner size="lg" />
    </div>
  );
};

