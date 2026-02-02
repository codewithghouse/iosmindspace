import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface BreathingScreenProps {
  isVisible: boolean;
  onBack: () => void;
}

export default function BreathingScreen({ isVisible, onBack }: BreathingScreenProps) {
  const { theme } = useTheme();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waterCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const SPEED = 0.5; // Fixed easy mode speed
  const [breathingPhase, setBreathingPhase] = useState('BREATH IN');
  const [cycleCount, setCycleCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // Timer in seconds
  const [hasInteracted, setHasInteracted] = useState(false); // Track if user has manually interacted
  
  // Animation variables (use useRef to persist between renders)
  const scrollOffsetRef = useRef(0);
  const previousYRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const waterAnimationFrameIdRef = useRef<number | null>(null);
  const lastPhaseChangeRef = useRef<'up' | 'down' | null>(null);
  const phaseStartTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeRef = useRef(0); // Use ref to avoid dependency issues
  const isPlayingRef = useRef(false); // Track playing state in ref
  const waterTimeRef = useRef(0); // For water animation

  // Ball properties - More compact
  const ballRef = useRef({
    x: 0, // Will be set based on canvas width
    y: 0,
    radius: 18, // Reduced from 22
    color: '#FFD93D' // Yellow/golden color
  });

  // Path properties for zigzag pattern (will be dynamically adjusted) - More compact
  const pathConfigRef = useRef({
    segmentWidth: 180,     // Reduced from 200
    flatLength: 90,        // Reduced from 100
    peakY: 0,              // Peak height (will be set based on canvas height)
    valleyY: 0,            // Valley depth (will be set based on canvas height)
    thickness: 10,          // Reduced from 12
    patternLength: 0,      // Total length of one complete pattern cycle
    amplitudeMultiplier: 1.0  // Increases path height over time
  });

  // Stop animation when navigating away
  useEffect(() => {
    if (!isVisible) {
      setIsPlaying(false);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (waterAnimationFrameIdRef.current) {
        cancelAnimationFrame(waterAnimationFrameIdRef.current);
        waterAnimationFrameIdRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [isVisible]);

  // Initialize canvas and start animation
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to fill screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Update ball and path positions based on canvas size
      ballRef.current.x = canvas.width * 0.3; // Ball stays at 30% from left edge
      ballRef.current.y = canvas.height / 2;
      
      // Calculate total pattern length (will be dynamic, but we need a base value)
      const { segmentWidth, flatLength } = pathConfigRef.current;
      pathConfigRef.current.patternLength = (segmentWidth + flatLength) * 2;
      
      previousYRef.current = canvas.height / 2;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    /**
     * Generate zigzag path points with dynamic difficulty and variation
     * Creates varied angular patterns: flat → up → flat → down → repeat
     * Each cycle has different hold durations for realism
     */
    const generatePathPoints = () => {
      const points: Array<{ x: number; y: number }> = [];
      const { segmentWidth, amplitudeMultiplier } = pathConfigRef.current;
      
      // Base positions - More compact
      const centerY = canvas.height / 2;
      const baseAmplitude = canvas.height * 0.2; // Reduced from 25% to 20% for more compact layout
      
      // Fixed easy mode - no difficulty progression
      const currentAmplitude = baseAmplitude * amplitudeMultiplier;
      
      // Calculate dynamic peak and valley based on current difficulty
      const currentPeakY = centerY - currentAmplitude;
      const currentValleyY = centerY + currentAmplitude;
      
      let x = -500; // Start off-screen to the left
      let isAtPeak = false;
      let cycleIndex = 0;
      
      // Predefined pattern of hold durations for variety (in pixels)
      // This creates a natural breathing rhythm with variation
      const holdPatterns = [
        120, // Long hold
        80,  // Medium hold
        60,  // Short hold
        100, // Medium-long hold
        70,  // Medium-short hold
        140, // Very long hold
        90,  // Medium hold
        50   // Very short hold
      ];
      
      // Generate enough points to fill screen + extra
      while (x < canvas.width + 1000) {
        // Get varied hold length based on pattern
        const holdLength = holdPatterns[cycleIndex % holdPatterns.length];
        
        if (isAtPeak) {
          // At peak: flat → down to valley (HOLD then BREATH OUT)
          points.push({ x, y: currentPeakY });
          x += holdLength;
          points.push({ x, y: currentPeakY });
          x += segmentWidth;
          points.push({ x, y: currentValleyY });
          isAtPeak = false;
        } else {
          // At valley: flat → up to peak (HOLD then BREATH IN)
          points.push({ x, y: currentValleyY });
          x += holdLength;
          points.push({ x, y: currentValleyY });
          x += segmentWidth;
          points.push({ x, y: currentPeakY });
          isAtPeak = true;
        }
        
        cycleIndex++;
      }
      
      return points;
    };

    /**
     * Find the Y position on the path at the ball's X position
     * Uses linear interpolation between path points
     */
    const getBallYPosition = (): number => {
      const points = generatePathPoints();
      const ballXOnPath = ballRef.current.x + scrollOffsetRef.current;
      
      // Find which two points the ball is between
      for (let i = 0; i < points.length - 1; i++) {
        const point1 = points[i];
        const point2 = points[i + 1];
        
        // Check if ball X is between these two points
        if (ballXOnPath >= point1.x && ballXOnPath <= point2.x) {
          // Linear interpolation to find exact Y position
          const t = (ballXOnPath - point1.x) / (point2.x - point1.x);
          const y = point1.y + (point2.y - point1.y) * t;
          return y;
        }
      }
      
      return ballRef.current.y; // Fallback
    };

    /**
     * Draw the zigzag path with sharp corners
     */
    const drawPath = () => {
      const points = generatePathPoints();
      
      ctx.strokeStyle = '#000000'; // Black color for path
      ctx.lineWidth = pathConfigRef.current.thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'miter'; // Sharp corners for angular look
      
      ctx.beginPath();
      
      // Draw path with scroll offset applied
      points.forEach((point, index) => {
        const adjustedX = point.x - scrollOffsetRef.current;
        
        if (index === 0) {
          ctx.moveTo(adjustedX, point.y);
        } else {
          ctx.lineTo(adjustedX, point.y);
        }
      });
      
      ctx.stroke();
    };

    /**
     * Draw the ball at its current position
     */
    const drawBall = () => {
      const ball = ballRef.current;
      
      // Add a glowing effect
      ctx.shadowColor = ball.color;
      ctx.shadowBlur = 20;
      
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Add a white highlight for 3D effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(ball.x - 7, ball.y - 7, ball.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    };

    /**
     * Update ball position to follow the path
     */
    const updateBallPosition = () => {
      ballRef.current.y = getBallYPosition();
    };

    /**
     * Detect if user should be inhaling or exhaling based on ball movement
     */
    const detectBreathingPhase = () => {
      const currentY = ballRef.current.y;
      const previousY = previousYRef.current;
      
      // Very low threshold for immediate response
      const movementThreshold = 0.5;
      const holdThreshold = 0.3;
      
      const yDifference = previousY - currentY;
      
      // If ball is moving UP significantly (Y is decreasing), BREATH IN
      if (yDifference > movementThreshold) {
        setBreathingPhase('BREATH IN');
        lastPhaseChangeRef.current = 'up';
      } 
      // If ball is moving DOWN significantly (Y is increasing), BREATH OUT
      else if (yDifference < -movementThreshold) {
        setBreathingPhase('BREATH OUT');
        lastPhaseChangeRef.current = 'down';
      }
      // If barely moving or not moving, HOLD
      else if (Math.abs(yDifference) <= holdThreshold) {
        setBreathingPhase('HOLD');
      }
      
      // Count cycles when transitioning from exhale to inhale
      if (lastPhaseChangeRef.current === 'down' && yDifference > movementThreshold) {
        const timeSinceLastCycle = Date.now() - phaseStartTimeRef.current;
        if (timeSinceLastCycle > 3000) { // Only count if enough time has passed
          setCycleCount(prev => prev + 1);
          phaseStartTimeRef.current = Date.now();
        }
      }
      
      previousYRef.current = currentY;
    };

    /**
     * Main animation loop - runs 60 times per second
     */
    const animate = () => {
      // Use ref to check playing state to avoid stale closures
      if (!isPlayingRef.current || !isVisible) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        return;
      }
      
      // Clear the screen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update scroll offset (this makes the path move)
      scrollOffsetRef.current += SPEED;
      
      // Make path loop seamlessly
      const patternLength = pathConfigRef.current.patternLength;
      if (patternLength > 0 && scrollOffsetRef.current > patternLength) {
        scrollOffsetRef.current -= patternLength;
      }
      
      // Update ball position to follow the path
      updateBallPosition();
      
      // Detect breathing phase
      detectBreathingPhase();
      
      // Draw everything
      drawPath();
      drawBall();
      
      // Call this function again on the next frame - ensure it always continues
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    // Update refs to keep them in sync
    isPlayingRef.current = isPlaying;
    
    // Start or stop animation based on isPlaying
    if (isPlaying && isVisible) {
      // Always restart animation if not already running
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    } else {
      // Stop animation and draw static state
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      // Draw static state when paused
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateBallPosition();
        drawPath();
        drawBall();
      }
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isVisible, isPlaying, theme]);

  // Water background animation
  useEffect(() => {
    if (!isVisible || !waterCanvasRef.current) return;

    const waterCanvas = waterCanvasRef.current;
    const waterCtx = waterCanvas.getContext('2d');
    if (!waterCtx) return;

    const resizeWaterCanvas = () => {
      waterCanvas.width = window.innerWidth;
      waterCanvas.height = window.innerHeight;
    };

    resizeWaterCanvas();
    window.addEventListener('resize', resizeWaterCanvas);

    // Water wave properties - darker and more visible
    const waves: Array<{
      amplitude: number;
      frequency: number;
      speed: number;
      offset: number;
      color: string;
    }> = [
      { amplitude: 30, frequency: 0.01, speed: 0.02, offset: 0, color: 'rgba(30, 144, 255, 0.7)' }, // Darker blue
      { amplitude: 40, frequency: 0.008, speed: 0.015, offset: Math.PI / 2, color: 'rgba(25, 25, 112, 0.6)' }, // Midnight blue
      { amplitude: 25, frequency: 0.012, speed: 0.025, offset: Math.PI, color: 'rgba(70, 130, 180, 0.65)' }, // Steel blue
    ];

    const animateWater = () => {
      if (!isVisible) {
        if (waterAnimationFrameIdRef.current) {
          cancelAnimationFrame(waterAnimationFrameIdRef.current);
          waterAnimationFrameIdRef.current = null;
        }
        return;
      }

      waterTimeRef.current += 0.016; // ~60fps
      
      // Clear canvas
      waterCtx.clearRect(0, 0, waterCanvas.width, waterCanvas.height);

      // Draw base water background
      const baseGradient = waterCtx.createLinearGradient(0, 0, 0, waterCanvas.height);
      baseGradient.addColorStop(0, 'rgba(25, 25, 112, 0.4)'); // Dark blue at top
      baseGradient.addColorStop(0.5, 'rgba(30, 144, 255, 0.5)'); // Medium blue in middle
      baseGradient.addColorStop(1, 'rgba(70, 130, 180, 0.6)'); // Lighter blue at bottom
      waterCtx.fillStyle = baseGradient;
      waterCtx.fillRect(0, 0, waterCanvas.width, waterCanvas.height);

      // Draw multiple wave layers
      waves.forEach((wave, index) => {
        waterCtx.beginPath();
        const centerY = waterCanvas.height * 0.4; // Start waves higher up
        waterCtx.moveTo(0, centerY);

        const time = waterTimeRef.current * wave.speed + wave.offset;
        
        for (let x = 0; x < waterCanvas.width; x += 2) {
          const y = centerY + 
            Math.sin(x * wave.frequency + time) * wave.amplitude +
            Math.sin(x * wave.frequency * 1.5 + time * 1.3) * wave.amplitude * 0.5;
          waterCtx.lineTo(x, y);
        }

        // Fill with gradient - darker and more visible
        const gradient = waterCtx.createLinearGradient(0, centerY - wave.amplitude * 2, 0, waterCanvas.height);
        // Extract RGB from wave.color (format: rgba(r, g, b, a))
        const colorMatch = wave.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (colorMatch) {
          const r = colorMatch[1];
          const g = colorMatch[2];
          const b = colorMatch[3];
          gradient.addColorStop(0, wave.color);
          gradient.addColorStop(0.3, wave.color);
          gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.5)`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.4)`);
        } else {
          gradient.addColorStop(0, wave.color);
          gradient.addColorStop(1, wave.color);
        }
        
        waterCtx.fillStyle = gradient;
        waterCtx.lineTo(waterCanvas.width, waterCanvas.height);
        waterCtx.lineTo(0, waterCanvas.height);
        waterCtx.closePath();
        waterCtx.fill();
      });

      waterAnimationFrameIdRef.current = requestAnimationFrame(animateWater);
    };

    // Start water animation
    waterAnimationFrameIdRef.current = requestAnimationFrame(animateWater);

    return () => {
      window.removeEventListener('resize', resizeWaterCanvas);
      if (waterAnimationFrameIdRef.current) {
        cancelAnimationFrame(waterAnimationFrameIdRef.current);
        waterAnimationFrameIdRef.current = null;
      }
    };
  }, [isVisible]);

  // Timer (no speed progression - fixed easy mode)
  useEffect(() => {
    if (!isPlaying) {
      // Reset timer when stopped
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      return;
    }

    // Start session timer
    sessionStartTimeRef.current = Date.now();
    
    // Update elapsed time every second
    timerIntervalRef.current = setInterval(() => {
      if (sessionStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        elapsedTimeRef.current = elapsed; // Update ref
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Auto-start after 2 seconds (only on first load, not after manual pause)
  useEffect(() => {
    if (isVisible && !isPlaying && !hasInteracted) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isPlaying, hasInteracted]);

  if (!isVisible) return null;

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textColor = theme === 'dark' ? '#E5E5E5' : '#1A1A1A';

  return (
    <div 
      className="absolute inset-0 h-screen w-full overflow-hidden safe-top safe-bottom"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header - More compact */}
      <div className="backdrop-blur-xl border-b px-3 py-1.5 shadow-sm safe-top relative z-30" 
           style={{ 
             backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.95)', 
             borderColor: theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(162, 173, 156, 0.4)' 
           }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setIsPlaying(false);
              onBack();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors touch-target"
            aria-label="Back"
            style={{ color: textColor }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="flex flex-col items-center gap-0">
            <div className="text-sm font-semibold" style={{ color: textColor }}>Breathing Exercise</div>
            <div className="flex items-center gap-3">
              {/* Timer - More compact */}
              <div
                style={{
                  fontSize: '13px',
                  color: textColor,
                  fontWeight: '600',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                }}
              >
                {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
              </div>
              
              {/* Cycle Counter - More compact */}
              {cycleCount > 0 && (
                <div
                  style={{
                    fontSize: '11px',
                    color: textColor,
                    opacity: 0.7,
                    fontWeight: '500',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  }}
                >
                  Cycle {cycleCount}
                </div>
              )}
            </div>
          </div>
          
          <div className="w-10"></div>
        </div>
      </div>

      {/* Water Background Canvas - Full coverage from header to bottom controls */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        <canvas
          ref={waterCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            opacity: 1
          }}
        />
      </div>

      {/* Canvas for the game - More compact */}
      <div className="relative w-full" style={{ 
        height: 'calc(100vh - 45px - 60px)', // More compact: reduced header and bottom space
        marginTop: '45px',
        backgroundColor: 'transparent',
        zIndex: 2,
        position: 'relative'
      }}>
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            zIndex: 2
          }}
        />

        {/* Breathing Phase Indicator - More compact */}
        <div 
          className="absolute top-4 left-0 right-0 z-30 flex items-center justify-center"
          style={{
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: breathingPhase === 'BREATH IN' 
                ? '#6BCB77' 
                : breathingPhase === 'BREATH OUT' 
                  ? '#FF6B6B' 
                  : '#FFD93D',
              textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
              fontWeight: '700',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
              transition: 'color 0.2s ease, transform 0.2s ease',
              transform: breathingPhase !== 'HOLD' ? 'scale(1.05)' : 'scale(1)',
              letterSpacing: '0.5px',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            {breathingPhase}
          </div>
        </div>

        {/* Controls - More compact */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-1 pb-3 pt-2"
          style={{
            paddingBottom: 'max(12px, env(safe-area-inset-bottom) + 12px)',
            background: `linear-gradient(to top, ${bgColor} 75%, transparent)`
          }}
        >
          <button
            onClick={() => {
              setHasInteracted(true); // Mark that user has interacted
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                setIsPlaying(true);
                setElapsedTime(0);
                elapsedTimeRef.current = 0;
                setCycleCount(0);
              }
            }}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all touch-target"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.9)' : 'rgba(162, 173, 156, 0.9)',
              color: '#FFFFFF',
              boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isPlaying ? '⏸ Pause' : '▶ Start'}
          </button>
        </div>
      </div>

    </div>
  );
}
