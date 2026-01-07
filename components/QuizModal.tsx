'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, ArrowLeft, Clock } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPass: () => void; // Called when user passes (7/10 or more)
  raffleId: string;
  walletAddress: string;
}

type QuizStage = 'welcome' | 'questions' | 'results';

export default function QuizModal({
  isOpen,
  onClose,
  onPass,
  raffleId,
  walletAddress,
}: QuizModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [stage, setStage] = useState<QuizStage>('welcome');
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [animatingScore, setAnimatingScore] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent screenshots and right-click
  useEffect(() => {
    if (!isOpen) return;

    const preventScreenshot = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 's' || e.key === 'p' || e.key === 'PrintScreen')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventRightClick = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        return false;
      }
    };

    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const preventDevTools = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'U')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener('keydown', preventScreenshot);
    window.addEventListener('keydown', preventDevTools);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('mousedown', preventRightClick);

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      window.removeEventListener('keydown', preventScreenshot);
      window.removeEventListener('keydown', preventDevTools);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('mousedown', preventRightClick);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStage('welcome');
      setQuestions([]);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setScore(null);
      setPassed(false);
      setAnimatingScore(0);
      setError(null);
      setSessionToken(null);
      setExpiresAt(null);
      setStartTime(null);
    }
  }, [isOpen]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));

    // Auto-advance to next question after a short delay
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentIndex + 1);
      }, 300); // Smooth transition
    } else {
      // Last question - auto submit after delay
      setTimeout(() => {
        handleSubmit();
      }, 500);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!sessionToken || submitting) return;

    // Check if all questions are answered
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          answers,
          timeTakenSeconds: timeTaken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit quiz' }));
        throw new Error(errorData.error || 'Failed to submit quiz');
      }

      const data = await response.json();

      // Store results
      setScore(data.score);
      setPassed(data.passed);
      setStage('results');
      setSubmitting(false);

      // Animate score from 0 to actual score
      setAnimatingScore(0);
      const targetScore = data.score;
      const duration = 1500;
      const steps = 30;
      const increment = targetScore / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const scoreInterval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setAnimatingScore(targetScore);
          clearInterval(scoreInterval);
        } else {
          setAnimatingScore(Math.min(increment * currentStep, targetScore));
        }
      }, stepDuration);
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
      setError(err.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  }, [sessionToken, submitting, questions, answers, startTime]);

  const handleContinue = () => {
    if (passed) {
      onPass();
    } else {
      // Reset for retry
      setStage('welcome');
      setScore(null);
      setPassed(false);
      setAnimatingScore(0);
      setQuestions([]);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setSessionToken(null);
      setExpiresAt(null);
      setStartTime(null);
      setError(null);
    }
  };

  const handleStartQuiz = () => {
    setStage('questions');
  };

  // Fetch questions when modal opens
  useEffect(() => {
    if (!isOpen || questions.length > 0) return;

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        let ipAddress = null;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const ipResponse = await fetch('https://api.ipify.org?format=json', { 
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ipAddress = ipData?.ip || null;
          }
        } catch (ipError) {
          console.warn('Could not fetch IP address:', ipError);
        }

        const response = await fetch('/api/quiz/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raffleId,
            walletAddress,
            ipAddress,
            count: 10,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch questions' }));
          throw new Error(errorData.error || 'Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data.questions || []);
        setSessionToken(data.sessionToken);
        setExpiresAt(new Date(data.expiresAt));
        setStartTime(Date.now());
        setTimeLeft(120); // Reset timer
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError(err.message || 'Failed to load quiz questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [isOpen, raffleId, walletAddress, questions.length]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || !expiresAt || submitting || stage !== 'questions') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0 && sessionToken && !submitting) {
        handleSubmit();
      }
    };

    updateTimer(); // Initial update
    timerIntervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isOpen, expiresAt, submitting, sessionToken, stage, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div 
        className="bg-primary-gray border-2 border-primary-green rounded-lg w-full max-w-2xl overflow-hidden flex flex-col transition-all duration-300"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          maxHeight: 'calc(100vh - 2rem)',
          marginTop: '1rem',
          marginBottom: '1rem',
        }}
      >
        {/* Close button - only show on welcome and results */}
        {(stage === 'welcome' || stage === 'results') && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
              disabled={submitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mb-4"></div>
              <p className="text-gray-400">Loading questions...</p>
            </div>
          ) : error && stage === 'welcome' ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-red-400 text-center mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary-green text-primary-darker rounded-lg font-semibold hover:bg-primary-green/90 transition-all"
              >
                Close
              </button>
            </div>
          ) : stage === 'welcome' ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center py-8 md:py-12 space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  You are ready to answer the question
                </h2>
                <div className="bg-primary-darker rounded-lg p-4 border border-primary-green/30">
                  <p className="text-primary-green font-semibold text-lg">
                    You need 7/10 in 2 min
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartQuiz}
                disabled={questions.length === 0}
                className="px-8 py-4 bg-primary-green text-primary-darker rounded-lg font-bold text-lg hover:bg-primary-green/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Continue
              </button>
            </div>
          ) : stage === 'questions' && currentQuestion ? (
            // Questions Screen
            <div className="space-y-6">
              {/* Timer and Back button */}
              <div className="flex items-center justify-between">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={submitting}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                  </button>
                )}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ml-auto ${
                  timeLeft < 30 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-primary-green/20 text-primary-green border border-primary-green/30'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Question */}
              <div className="bg-primary-darker rounded-lg p-6 space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionKey = `option_${option.toLowerCase()}` as keyof Question;
                    const optionText = currentQuestion[optionKey] as string;
                    const isSelected = answers[currentQuestion.id] === option;

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                        disabled={submitting}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                          isSelected
                            ? 'border-primary-green bg-primary-green/10 text-white scale-[1.02]'
                            : 'border-primary-lightgray bg-primary-gray text-gray-300 hover:border-primary-green/50 hover:bg-primary-gray/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                            isSelected
                              ? 'bg-primary-green text-primary-darker scale-110'
                              : 'bg-primary-lightgray text-gray-400'
                          }`}>
                            {option}
                          </div>
                          <span className="text-base md:text-lg">{optionText}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-submitting indicator */}
              {submitting && (
                <div className="flex items-center justify-center gap-2 text-primary-green">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-green"></div>
                  <span>Submitting...</span>
                </div>
              )}
            </div>
          ) : stage === 'results' && score !== null ? (
            // Results Screen
            <div className="flex flex-col items-center justify-center py-8 md:py-12 space-y-6 md:space-y-8">
              {/* Result Icon */}
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                passed 
                  ? 'bg-primary-green/20 border-4 border-primary-green scale-100' 
                  : 'bg-red-500/20 border-4 border-red-500 scale-100'
              }`}>
                {passed ? (
                  <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-primary-green" />
                ) : (
                  <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500" />
                )}
              </div>

              {/* Result Text */}
              <div className="text-center space-y-2">
                <h3 className={`text-2xl md:text-3xl font-bold transition-all ${
                  passed ? 'text-primary-green' : 'text-red-400'
                }`}>
                  {passed ? 'Congratulations!' : 'Quiz Failed'}
                </h3>
                <p className="text-gray-400 text-base md:text-lg">
                  {passed 
                    ? 'You passed the skill-based quiz!' 
                    : 'You need at least 7/10 to proceed'}
                </p>
              </div>

              {/* Score Display */}
              <div className="w-full max-w-md space-y-4">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-bold text-white mb-2 transition-all">
                    {Math.round(animatingScore)}<span className="text-2xl md:text-3xl text-gray-400">/10</span>
                  </div>
                  <p className="text-gray-400">Correct Answers</p>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-primary-darker rounded-full h-5 md:h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center ${
                      passed ? 'bg-primary-green' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${(animatingScore / 10) * 100}%`,
                      minWidth: animatingScore > 0 ? '40px' : '0'
                    }}
                  >
                    {animatingScore > 0 && (
                      <span className="text-xs font-bold text-white px-2">
                        {Math.round((animatingScore / 10) * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Pass/Fail Indicator */}
                <div className={`text-center p-4 rounded-lg transition-all ${
                  passed 
                    ? 'bg-primary-green/10 border border-primary-green/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <p className={`font-semibold text-sm md:text-base ${
                    passed ? 'text-primary-green' : 'text-red-400'
                  }`}>
                    {passed 
                      ? '✓ You can now proceed to payment' 
                      : '✗ Minimum score required: 7/10'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleContinue}
                className={`px-8 py-4 rounded-lg font-bold text-base md:text-lg transition-all transform hover:scale-105 ${
                  passed
                    ? 'bg-primary-green text-primary-darker hover:bg-primary-green/90'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {passed ? 'Continue to Payment' : 'Retest'}
              </button>
            </div>
          ) : null}

          {/* Error message */}
          {error && stage === 'questions' && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
