import React, { useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SunMoonSVGProps {
  className?: string;
}

export default function SunMoonSVG({ className = '' }: SunMoonSVGProps) {
  const { theme } = useTheme();
  const overlayRef = useRef<SVGCircleElement>(null);
  const donutRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);

  // Determine if we should show moon (dark theme) or sun (light theme)
  const showMoon = theme === 'dark';

  // Calculate overlay positions for smooth transition
  const overlayPositions = useMemo(() => {
    if (showMoon) {
      // Moon position - creates crescent
      return { cx: 110, cy: 70 };
    } else {
      // Sun position - overlay moved away
      return { cx: 230, cy: -30 };
    }
  }, [showMoon]);

  useEffect(() => {
    // Use requestAnimationFrame for smoother animations
    const animate = () => {
      if (overlayRef.current) {
        // Directly set attributes - CSS transition will handle smooth movement
        overlayRef.current.setAttribute('cx', overlayPositions.cx.toString());
        overlayRef.current.setAttribute('cy', overlayPositions.cy.toString());
      }

      if (donutRef.current) {
        donutRef.current.setAttribute('fill', showMoon ? 'rgba(230, 230, 245, 0.85)' : 'rgba(255, 220, 120, 0.4)');
      }

      if (glowRef.current) {
        glowRef.current.setAttribute('opacity', showMoon ? '0.3' : '0.4');
      }
    };

    requestAnimationFrame(animate);
  }, [showMoon, overlayPositions]);

  return (
    <div className={`sun-moon-svg-container ${className}`} style={{ opacity: 0.7, transform: 'scale(0.7)' }}>
      <svg 
        id="sunmoon" 
        width="200" 
        height="200" 
        viewBox="0 0 200 200"
        style={{ 
          shapeRendering: 'geometricPrecision',
          textRendering: 'optimizeLegibility'
        }}
      >
        <defs>
          <mask id="sunMoonMask">
            <rect width="100%" height="100%" fill="white" />
            <circle 
              ref={overlayRef}
              id="overlay" 
              r="80" 
              cx={overlayPositions.cx}
              cy={overlayPositions.cy}
              fill="black"
            />
          </mask>

          <filter id="sunMoonBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            <feDropShadow 
              dx="0" 
              dy="0" 
              stdDeviation="8" 
              floodColor={showMoon ? "rgba(190, 190, 210, 0.35)" : "rgba(255, 220, 120, 0.25)"} 
            />
            {/* 3D depth shadow for better depth perception */}
            <feDropShadow 
              dx="5" 
              dy="5" 
              stdDeviation="5" 
              floodColor="rgba(0, 0, 0, 0.2)" 
            />
          </filter>

          {/* Glow effect - dimmer */}
          <radialGradient id="sunMoonGlow">
            <stop 
              offset="0%" 
              stopColor={showMoon ? "rgba(190, 190, 210, 0.3)" : "rgba(255, 220, 120, 0.2)"}
            />
            <stop 
              offset="50%" 
              stopColor={showMoon ? "rgba(170, 170, 190, 0.2)" : "rgba(255, 200, 90, 0.15)"}
            />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Glow circle - dimmer */}
        <circle
          ref={glowRef}
          cx="100"
          cy="100"
          r="90"
          fill="url(#sunMoonGlow)"
          opacity={showMoon ? 0.3 : 0.4}
        />

          {/* Main sun/moon circle with mask - dimmer colors with natural 3D depth */}
          <g filter="url(#sunMoonBlur)" style={{ transformStyle: 'preserve-3d' }}>
            {/* Background depth layer for subtle 3D effect */}
            <circle
              r="75"
              cx="100"
              cy="100"
              fill={showMoon ? "rgba(190, 190, 210, 0.4)" : "rgba(255, 220, 120, 0.2)"}
              mask="url(#sunMoonMask)"
              style={{
                transform: 'translateZ(-8px)',
                opacity: 0.6
              }}
            />
            {/* Main circle with natural shadow - thicker for moon */}
            <circle
              ref={donutRef}
              fill={showMoon ? "rgba(230, 230, 245, 0.85)" : "rgba(255, 220, 120, 0.4)"}
              id="donut"
              r={showMoon ? "82" : "80"}
              cx="100"
              cy="100"
              mask="url(#sunMoonMask)"
              stroke={showMoon ? "rgba(220, 220, 240, 0.4)" : "none"}
              strokeWidth={showMoon ? "3" : "0"}
              style={{
                transformStyle: 'preserve-3d',
                filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2))'
              }}
            />
          </g>
      </svg>
    </div>
  );
}
