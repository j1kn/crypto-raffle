'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Clock, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent screenshots and right-click
  useEffect(() => {
    if (!isOpen) return;

    const preventScreenshot = (e: KeyboardEvent) => {
      // Disable common screenshot shortcuts
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
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
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

    // Disable text selection
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

  // Fetch questions when modal opens
  useEffect(() => {
    if (!isOpen || questions.length > 0) return;

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get IP address (client-side approximation) - optional, server will get real IP
        let ipAddress = null;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          const ipResponse = await fetch('https://api.ipify.org?format=json', { 
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ipAddress = ipData?.ip || null;
          }
        } catch (ipError) {
          // IP fetching is optional, continue without it
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
  }, [isOpen, raffleId, walletAddress]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || !expiresAt || submitting) {
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

      if (remaining === 0) {
        // Time's up - auto submit
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
  }, [isOpen, expiresAt, submitting]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
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

      if (data.passed) {
        // User passed - proceed to checkout
        onPass();
      } else {
        // User failed
        setError(
          `You scored ${data.score}/10. You need at least 7/10 to enter the raffle. Please try again.`
        );
        // Reset for retry
        setTimeout(() => {
          setQuestions([]);
          setAnswers({});
          setCurrentQuestionIndex(0);
          setSessionToken(null);
          setExpiresAt(null);
          setStartTime(null);
          setTimeLeft(120);
          setSubmitting(false);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
      setError(err.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
        className="bg-primary-gray border-2 border-primary-green rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col m-4"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Header with timer */}
        <div className="bg-primary-darker border-b border-primary-lightgray p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Skill-Based Quiz</h2>
            <span className="text-xs text-gray-400 bg-primary-gray px-2 py-1 rounded">
              Answer 7/10 correctly to proceed
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${
              timeLeft < 30 ? 'bg-red-500/20 text-red-400' : 'bg-primary-green/20 text-primary-green'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={submitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mb-4"></div>
              <p className="text-gray-400">Loading questions...</p>
            </div>
          ) : error && !currentQuestion ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-red-400 text-center mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary-green text-primary-darker rounded font-semibold hover:bg-primary-green/90"
              >
                Close
              </button>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="w-full bg-primary-darker rounded-full h-2">
                <div
                  className="bg-primary-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 text-center">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>

              {/* Question */}
              <div className="bg-primary-darker rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-6">
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
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary-green bg-primary-green/10 text-white'
                            : 'border-primary-lightgray bg-primary-gray text-gray-300 hover:border-primary-green/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isSelected
                              ? 'bg-primary-green text-primary-darker'
                              : 'bg-primary-lightgray text-gray-400'
                          }`}>
                            {option}
                          </div>
                          <span>{optionText}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0 || submitting}
                  className="px-6 py-2 bg-primary-gray border border-primary-lightgray rounded text-white font-semibold hover:bg-primary-lightgray disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    disabled={submitting}
                    className="px-6 py-2 bg-primary-green text-primary-darker rounded font-semibold hover:bg-primary-green/90 disabled:opacity-50"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting || timeLeft === 0}
                    className="px-6 py-2 bg-primary-green text-primary-darker rounded font-semibold hover:bg-primary-green/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-darker"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Submit Quiz
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Error message */}
          {error && currentQuestion && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

