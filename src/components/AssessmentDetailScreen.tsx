import { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAppState } from '../contexts/AppStateContext';
import { 
  getAssessmentQuestions, 
  calculateAssessmentResult, 
  type AssessmentResult,
  type AssessmentType,
  ASSESSMENT_METADATA
} from '../data/assessments';
import { generateAITips, type AITip } from '../services/groqService';
import { getCalApi } from '@calcom/embed-react';

interface AssessmentDetailScreenProps {
  isVisible: boolean;
  assessmentId?: string;
  onComplete?: () => void;
  onBack?: () => void;
}

export default function AssessmentDetailScreen({ isVisible, assessmentId, onComplete, onBack }: AssessmentDetailScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [selectedOptionAnimating, setSelectedOptionAnimating] = useState<string | null>(null);
  const [aiTips, setAiTips] = useState<AITip[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const { theme } = useTheme();
  const { navigateToCall, navigateToBooking } = useAppState();
  const questionRef = useRef<HTMLDivElement>(null);

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

  // Get questions based on assessment type
  const assessmentType = (assessmentId || 'stress') as AssessmentType;
  const questions = useMemo(() => {
    return getAssessmentQuestions(assessmentType);
  }, [assessmentType]);
  const totalQuestions = questions.length;
  const assessmentMetadata = ASSESSMENT_METADATA[assessmentType];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  
  // Check if all questions are answered
  const allQuestionsAnswered = questions.every(q => answers[q.id] !== undefined);
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  // Track previous assessmentId to detect changes
  const prevAssessmentIdRef = useRef<string | undefined>(assessmentId);

  // Reset state when assessment changes
  useEffect(() => {
    // Only reset if assessmentId actually changed
    if (prevAssessmentIdRef.current !== assessmentId) {
      prevAssessmentIdRef.current = assessmentId;
      if (isVisible && assessmentId) {
        setCurrentQuestion(0);
        setAnswers({});
        setShowResults(false);
        setAssessmentResult(null);
        setSelectedOptionAnimating(null);
        setAiTips([]);
        setLoadingTips(false);
      }
    } else if (!isVisible) {
      // Reset when component becomes invisible
      setShowResults(false);
      setAssessmentResult(null);
    }
  }, [assessmentId, isVisible]);

  // Question transition animation
  useEffect(() => {
    if (isVisible && questionRef.current) {
      questionRef.current.style.opacity = '0';
      questionRef.current.style.transform = 'translateY(20px)';
      setTimeout(() => {
        if (questionRef.current) {
          questionRef.current.style.transition = 'all 0.4s ease-out';
          questionRef.current.style.opacity = '1';
          questionRef.current.style.transform = 'translateY(0)';
        }
      }, 50);
    }
  }, [currentQuestion, isVisible]);

  if (!isVisible) return null;

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(162, 173, 156, 0.4)';
  const bgHeader = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.95)';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';

  const handleAnswerSelect = (value: string) => {
    const questionId = questions[currentQuestion].id;
    setAnswers({ ...answers, [questionId]: value });
    
    // Animation feedback
    setSelectedOptionAnimating(value);
    setTimeout(() => setSelectedOptionAnimating(null), 600);
    
    // Auto-advance to next question after a short delay (only if not last question)
    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 600);
    }
  };

  const handleSubmit = async () => {
    // Verify all questions are answered
    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      console.warn('Not all questions answered:', unansweredQuestions);
      return;
    }

    // Calculate results
    try {
      const result = calculateScore();
      console.log('Assessment result:', result);
      if (result) {
        setAssessmentResult(result);
        setShowResults(true);
        
        // Generate AI tips
        setLoadingTips(true);
        setAiTips([]); // Clear previous tips
        try {
          const tips = await generateAITips(
            assessmentType,
            result.level,
            result.score,
            result.maxScore
          );
          setAiTips(tips);
        } catch (error) {
          console.error('Error generating AI tips:', error);
          // Tips will remain empty, fallback will be used in UI
        } finally {
          setLoadingTips(false);
        }
      } else {
        console.error('Failed to calculate assessment result');
      }
    } catch (error) {
      console.error('Error calculating assessment result:', error);
    }
  };


  const calculateScore = (): AssessmentResult => {
    return calculateAssessmentResult(answers, assessmentType);
  };

  const handleBackFromResults = () => {
    // Reset results state when going back
    setShowResults(false);
    setAssessmentResult(null);
    setCurrentQuestion(0);
    setAnswers({});
    setAiTips([]);
    setLoadingTips(false);
    if (onBack) {
      onBack();
    }
  };

  // Only show results if we have a result
  if (showResults && assessmentResult) {
    console.log('Showing results:', { showResults, assessmentResult, assessmentType });
    const tips = aiTips.length > 0 ? aiTips : []; // Use AI tips if available
    const levelColor = assessmentResult.level === 'Low' 
      ? (theme === 'dark' ? '#4ade80' : '#22c55e')
      : assessmentResult.level === 'Moderate'
      ? (theme === 'dark' ? '#fbbf24' : '#eab308')
      : (theme === 'dark' ? '#ef4444' : '#dc2626');

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
            <button
              onClick={handleBackFromResults}
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
            <h1
              className="text-[20px] font-medium theme-transition flex-1"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                color: textPrimary
              }}
            >
              Assessment Results
            </h1>
          </div>
        </div>

        {/* Results Content */}
        <div className="px-4 py-6 safe-bottom relative z-10">
          {/* Completion Celebration */}
          <div className="backdrop-blur-sm border rounded-2xl p-6 mb-4 theme-transition text-center" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <div
              className="text-2xl font-semibold mb-2 theme-transition"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                color: textPrimary
              }}
            >
              Assessment Complete!
            </div>
            <div
              className="text-sm font-light theme-transition"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                color: textSecondary
              }}
            >
              Your personalized insights are ready
            </div>
          </div>
          
          {/* Assessment Level and Score Card */}
          <div className="backdrop-blur-sm border rounded-2xl p-6 mb-4 theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <div className="text-center">
              {/* Level Badge */}
              <div
                className="inline-block px-6 py-3 rounded-full mb-5 theme-transition shadow-sm"
                style={{ 
                  backgroundColor: levelColor + '20',
                  border: `2px solid ${levelColor}`,
                  color: levelColor
                }}
              >
                <div
                  className="text-[20px] font-semibold theme-transition"
                  style={{ 
                    fontFamily: "'Fira Sans', sans-serif",
                  }}
                >
                  {assessmentResult.level} {assessmentMetadata.title.replace(' Assessment', '')}
                </div>
              </div>
              
              {/* Score Display */}
              <div className="mb-4">
                <div
                  className="text-[56px] font-bold mb-2 theme-transition"
                  style={{ 
                    fontFamily: "'Fira Sans', sans-serif",
                    color: accentColor
                  }}
                >
                  {assessmentResult.score.toFixed(1)}
                </div>
                <div
                  className="text-lg font-light theme-transition mb-3"
                  style={{ 
                    fontFamily: "'Fira Sans', sans-serif",
                    color: textSecondary
                  }}
                >
                  out of {assessmentResult.maxScore} points
                </div>
                
                {/* Progress Bar */}
                <div className="w-full max-w-xs mx-auto">
                  <div className="w-full h-3 rounded-full overflow-hidden theme-transition shadow-inner mb-2" style={{ backgroundColor: theme === 'dark' ? 'rgba(60, 60, 60, 0.5)' : 'rgba(212, 209, 202, 0.4)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500 theme-transition"
                      style={{ 
                        width: `${assessmentResult.percentage}%`,
                        background: theme === 'dark' 
                          ? `linear-gradient(to right, ${levelColor}, ${levelColor}dd)`
                          : `linear-gradient(to right, ${levelColor}, ${levelColor}cc)`,
                        boxShadow: `0 0 12px ${levelColor}60`
                      }}
                    />
                  </div>
                  <div
                    className="text-xs font-medium theme-transition"
                    style={{ 
                      fontFamily: "'Fira Sans', sans-serif",
                      color: textSecondary
                    }}
                  >
                    {assessmentResult.percentage}% Complete
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Generated Tips Section */}
          <div className="backdrop-blur-sm border rounded-2xl p-6 mb-4 theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <div className="flex items-center justify-between mb-5">
              <h3
                className="text-[18px] font-semibold theme-transition"
                style={{ 
                  fontFamily: "'Fira Sans', sans-serif",
                  color: textPrimary
                }}
              >
                Personalized Tips & Strategies
              </h3>
              {tips.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: accentColor + '20' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs font-medium" style={{ color: accentColor }}>AI Powered</span>
                </div>
              )}
            </div>
            
            {loadingTips ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 border-4 rounded-full animate-spin mb-4" style={{ borderColor: accentColor + '30', borderTopColor: accentColor }}></div>
                <div
                  className="text-sm font-light theme-transition"
                  style={{ 
                    fontFamily: "'Fira Sans', sans-serif",
                    color: textSecondary
                  }}
                >
                  Generating personalized tips...
                </div>
              </div>
            ) : tips.length > 0 ? (
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div
                    key={tip.id || index}
                    className="flex items-start gap-4 p-4 rounded-xl theme-transition"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(60, 60, 60, 0.5)' : 'rgba(247, 245, 242, 0.5)',
                      borderLeft: `4px solid ${accentColor}`
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold theme-transition"
                      style={{
                        backgroundColor: accentColor + '20',
                        color: accentColor,
                        fontFamily: "'Fira Sans', sans-serif"
                      }}
                    >
                      {tip.id || index + 1}
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-[15px] font-normal leading-relaxed theme-transition"
                        style={{
                          fontFamily: "'Fira Sans', sans-serif",
                          color: textPrimary,
                          lineHeight: '1.7'
                        }}
                      >
                        {tip.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div
                  className="text-sm font-light theme-transition"
                  style={{ 
                    fontFamily: "'Fira Sans', sans-serif",
                    color: textSecondary
                  }}
                >
                  Tips will be generated shortly...
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                navigateToCall();
                if (onComplete) onComplete();
              }}
              className="w-full px-5 py-4 rounded-full font-medium transition-all shadow-sm active:scale-95 touch-target theme-transition"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                backgroundColor: accentColor,
                color: theme === 'dark' ? '#FFFFFF' : 'white'
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#6A7A6A' : '#98A392'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = accentColor}
            >
              Call TARA
            </button>
            <button
              onClick={async () => {
                try {
                  const cal = await getCalApi({ namespace: 'appointment' });
                  cal('ui', {
                    hideEventTypeDetails: false,
                    layout: 'month_view',
                  });
                  // Trigger the Cal.com booking modal
                  const calButton = document.getElementById('cal-booking-button') as HTMLElement;
                  if (calButton) {
                    calButton.click();
                  } else {
                    // Fallback: navigate to booking screen
                    navigateToBooking();
                  }
                  if (onComplete) onComplete();
                } catch (error) {
                  console.error('Error opening Cal.com booking:', error);
                  // Fallback: navigate to booking screen
                  navigateToBooking();
                  if (onComplete) onComplete();
                }
              }}
              className="w-full px-5 py-4 rounded-full font-medium transition-all shadow-sm active:scale-95 touch-target theme-transition border-2"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                backgroundColor: 'transparent',
                borderColor: accentColor,
                color: accentColor
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.1)' : 'rgba(162, 173, 156, 0.1)'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  const currentQ = questions[currentQuestion];
  const selectedAnswer = answers[currentQ.id];

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
        <div className="flex items-center justify-between">
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
        </div>
        
        {/* Question Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div
              className="text-sm font-light theme-transition"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                color: textSecondary
              }}
            >
              Question {currentQuestion + 1} of {totalQuestions}
            </div>
            <div className="text-xs theme-transition" style={{ color: accentColor }}>{Math.round(progress)}%</div>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden theme-transition shadow-inner" style={{ backgroundColor: theme === 'dark' ? 'rgba(60, 60, 60, 0.5)' : 'rgba(212, 209, 202, 0.4)' }}>
            <div
              className="h-full rounded-full transition-all duration-300 theme-transition shadow-sm"
              style={{ 
                width: `${progress}%`, 
                background: theme === 'dark' 
                  ? `linear-gradient(to right, ${accentColor}, #8A9A8A)`
                  : `linear-gradient(to right, ${accentColor}, #B8C4B0)`,
                boxShadow: `0 0 8px ${accentColor}60`
              }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="px-4 py-6 safe-bottom relative z-10">
        <div 
          ref={questionRef}
          className="backdrop-blur-lg border rounded-2xl p-6 mb-6 theme-transition shadow-lg"
          style={{ 
            backgroundColor: bgCard, 
            borderColor: borderColor,
            boxShadow: theme === 'dark' 
              ? '0 4px 16px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)' 
              : '0 4px 16px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <h2
            className="text-[20px] font-semibold mb-6 leading-relaxed theme-transition"
            style={{ 
              fontFamily: "'Fira Sans', sans-serif",
              color: textPrimary,
              fontWeight: 600
            }}
          >
            {currentQ.text}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((option) => {
              const isSelected = selectedAnswer === option.value;
              const isAnimating = selectedOptionAnimating === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswerSelect(option.value)}
                  className="w-full p-4 rounded-xl border transition-all text-left touch-target theme-transition relative overflow-hidden"
                  style={{
                    backgroundColor: isSelected 
                      ? (theme === 'dark' ? 'rgba(122, 138, 122, 0.25)' : 'rgba(162, 173, 156, 0.15)')
                      : bgCard,
                    borderColor: isSelected ? accentColor : borderColor,
                    borderWidth: isSelected ? '2px' : '1px',
                    transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected 
                      ? (theme === 'dark' 
                          ? `0 0 0 3px ${accentColor}40, 0 4px 12px ${accentColor}30` 
                          : `0 0 0 3px ${accentColor}30, 0 4px 12px ${accentColor}20`)
                      : 'none',
                    animation: isAnimating ? 'pulse 0.6s ease-out' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(60, 60, 60, 1)' : 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.6)' : accentColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = bgCard;
                      e.currentTarget.style.borderColor = borderColor;
                    }
                  }}
                >
                  {isSelected && (
                    <div 
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: accentColor }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white" />
                      </svg>
                    </div>
                  )}
                  <div
                    className="text-[16px] font-medium theme-transition flex items-center gap-3"
                    style={{ 
                      fontFamily: "'Fira Sans', sans-serif",
                      color: textPrimary,
                      fontWeight: 500
                    }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ 
                        borderColor: isSelected ? accentColor : borderColor,
                        backgroundColor: isSelected ? accentColor : 'transparent'
                      }}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme === 'dark' ? '#FFFFFF' : 'white' }} />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Submit Button - Show when all questions are answered */}
        {allQuestionsAnswered && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="w-full px-5 py-4 rounded-full font-medium transition-all shadow-sm active:scale-95 touch-target theme-transition"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                backgroundColor: accentColor,
                color: theme === 'dark' ? '#FFFFFF' : 'white'
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#6A7A6A' : '#98A392'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = accentColor}
            >
              Submit Assessment
            </button>
          </div>
        )}

      </div>
    </div>
    </>
  );
}

