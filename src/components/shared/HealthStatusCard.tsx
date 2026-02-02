import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useHealthStatus } from '../../hooks/useHealthStatus';

export const HealthStatusCard: React.FC = () => {
  const { theme } = useTheme();
  const { healthStatus, getStatusLabel, getStatusColor } = useHealthStatus();
  
  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#4A4A4A';
  const statusColor = getStatusColor(healthStatus.status, theme);

  return (
    <>
      {/* Health Visualization */}
          <h3 className="text-sm font-medium mb-3 theme-transition" 
              style={{ color: textSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
            Health Status
          </h3>
          <div className="relative w-24 h-24 mx-auto">
            {/* Circular Progress */}
            <svg className="transform -rotate-90" width="96" height="96" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke={theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.3)'}
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke={statusColor}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthStatus.percentage / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease', opacity: healthStatus.isLoading ? 0.5 : 1 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {healthStatus.isLoading ? (
                <span className="text-xs font-light theme-transition" 
                      style={{ color: textSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
                  Loading...
                </span>
              ) : (
                <>
                  <span className="text-2xl font-bold theme-transition" 
                        style={{ color: textPrimary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
                    {healthStatus.percentage}%
                  </span>
                  <span className="text-xs font-light theme-transition" 
                        style={{ color: textSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
                    {getStatusLabel(healthStatus.status)}
                  </span>
                </>
              )}
            </div>
          </div>
    </>
  );
};

