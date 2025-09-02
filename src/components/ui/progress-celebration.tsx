/**
 * @fileoverview Progress Celebration Component
 * 
 * Celebratory animations and feedback for form progress:
 * - Confetti animations with physics
 * - Progress bar celebration particles
 * - Achievement badges and motivational messages
 * - Sound effects and haptic feedback
 * - Reduced motion support
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

type CelebrationType = 'step-completion' | 'form-submission' | 'booking-confirmed';

interface ProgressCelebrationProps {
  show: boolean;
  stepName: string;
  stepNumber: number;
  totalSteps: number;
  celebrationType?: CelebrationType;
  intensity?: 'low' | 'high';
  playSound?: boolean;
  showContinueButton?: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

const CELEBRATION_COLORS = [
  'rgb(255, 215, 0)', // Gold
  'rgb(255, 69, 0)',  // Red-orange
  'rgb(50, 205, 50)', // Lime green
  'rgb(138, 43, 226)', // Blue violet
  'rgb(255, 20, 147)', // Deep pink
  'rgb(0, 191, 255)'   // Deep sky blue
];

const BADGE_TYPES = {
  1: 'star',
  2: 'star',
  3: 'trophy',
  4: 'trophy',
  5: 'crown'
};

const MOTIVATIONAL_MESSAGES = {
  1: "Great start! Keep going!",
  2: "You're making excellent progress!",
  3: "Halfway there! You're doing great!",
  4: "Almost finished! You're so close!",
  5: "Final step! Almost finished!"
};

export function ProgressCelebration({
  show,
  stepName,
  stepNumber,
  totalSteps,
  celebrationType = 'step-completion',
  intensity = 'high',
  playSound = false,
  showContinueButton = false,
  onComplete
}: ProgressCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Check device performance for particle optimization
  const getOptimalParticleCount = useCallback(() => {
    const baseCount = intensity === 'low' ? 25 : 75;
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 2;
    
    if (isMobile || isLowEnd) {
      return Math.floor(baseCount * 0.6);
    }
    
    return baseCount;
  }, [intensity]);

  // Generate confetti particles
  const generateParticles = useCallback(() => {
    if (prefersReducedMotion || !containerRef.current) {
      return [];
    }

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const particleCount = getOptimalParticleCount();
    
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: centerX + (Math.random() - 0.5) * 200,
      y: centerY - 50,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -10 - 5,
      color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    }));
  }, [prefersReducedMotion, getOptimalParticleCount]);

  // Physics animation for particles
  const animateParticles = useCallback(() => {
    setParticles(prevParticles => {
      const updatedParticles = prevParticles.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.3, // gravity
        rotation: particle.rotation + particle.rotationSpeed
      })).filter(particle => 
        particle.y < (window.innerHeight + 100) && 
        particle.x > -100 && 
        particle.x < (window.innerWidth + 100)
      );

      if (updatedParticles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animateParticles);
      } else {
        setIsAnimating(false);
      }

      return updatedParticles;
    });
  }, []);

  // Start celebration animation
  const startCelebration = useCallback(() => {
    if (!show || isAnimating) {
      return;
    }

    setIsAnimating(true);
    setShowContent(true);

    // Play sound effect if enabled
    if (playSound && !prefersReducedMotion) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio('/sounds/achievement.mp3');
          audioRef.current.volume = 0.3;
        }
        audioRef.current.play().catch(() => {
          console.warn('Could not play achievement sound');
        });
      } catch (error) {
        console.warn('Audio not supported:', error);
      }
    }

    // Generate and animate particles
    if (!prefersReducedMotion) {
      const newParticles = generateParticles();
      setParticles(newParticles);
      
      if (newParticles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animateParticles);
      }
    }

    // Auto-complete after animation duration
    const duration = prefersReducedMotion ? 1000 : 2500;
    setTimeout(() => {
      setShowContent(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);
  }, [show, isAnimating, playSound, prefersReducedMotion, generateParticles, animateParticles, onComplete]);

  // Initialize celebration when show changes
  useEffect(() => {
    if (show && !isAnimating) {
      startCelebration();
    }
  }, [show, startCelebration, isAnimating]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Listen for custom events
  useEffect(() => {
    const handleStepCompleted = (event: CustomEvent) => {
      const { isLastStep } = event.detail;
      
      if (isLastStep) {
        // Show special final step celebration
        setShowContent(true);
      }
    };

    const handleBookingCompleted = (_event: CustomEvent) => {
      setShowContent(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('step-completed', handleStepCompleted as EventListener);
      window.addEventListener('booking-completed', handleBookingCompleted as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('step-completed', handleStepCompleted as EventListener);
        window.removeEventListener('booking-completed', handleBookingCompleted as EventListener);
      }
    };
  }, []);

  if (!show) {
    return null;
  }

  const badgeType = BADGE_TYPES[stepNumber as keyof typeof BADGE_TYPES] || 'star';
  const motivationalText = MOTIVATIONAL_MESSAGES[stepNumber as keyof typeof MOTIVATIONAL_MESSAGES] || "Great job!";

  // Tailored encouraging headline based on progress
  const tailoredHeadline = (() => {
    if (stepNumber === 1) {
      return 'Great start!';
    }
    if (stepNumber >= 2 && stepNumber <= 3) {
      return 'Nice momentum!';
    }
    if (stepNumber === 4) {
      return 'Almost there!';
    }
    if (stepNumber >= totalSteps) {
      return 'Ready to submit!';
    }
    return 'Great progress!';
  })();

  const celebrationMessage = celebrationType === 'form-submission' 
    ? 'Form submitted successfully!'
    : celebrationType === 'booking-confirmed'
    ? 'Booking confirmed!'
    : `Step completed: ${stepName}`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      role="status"
      aria-live="polite"
      aria-label={celebrationMessage}
      data-testid="progress-celebration"
      data-celebrating="true"
      data-reduced-motion={prefersReducedMotion}
      data-mobile-optimized={typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'true' : 'false'}
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
    >
      {/* Confetti particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0" data-testid="confetti-container" data-reduced-motion="false">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded"
              data-testid={`confetti-particle-${particle.id}`}
              data-initial-y={particle.y - particle.vy}
              data-current-y={particle.y}
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
                willChange: 'transform'
              }}
            />
          ))}
        </div>
      )}

      {/* Reduced motion alternative */}
      {prefersReducedMotion && (
        <div className="absolute inset-0" data-testid="confetti-container" data-reduced-motion="true">
          <div 
            className="flex items-center justify-center text-6xl"
            data-testid="static-celebration-icon"
          >
            🎉
          </div>
        </div>
      )}

      {/* Celebration content */}
      {showContent && (
        <div className="pointer-events-auto bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 text-center">
          {/* Achievement badge */}
          <div 
            className={`mb-4 ${!prefersReducedMotion ? 'animate-bounce-in' : ''}`}
            data-testid="achievement-badge"
            aria-label={`Great progress: Step ${stepNumber} completed`}
          >
            <div className="relative w-16 h-16 mx-auto mb-2">
              <div 
                className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                data-testid="badge-icon"
                data-badge-type={badgeType}
              >
                {badgeType === 'star' && '⭐'}
                {badgeType === 'trophy' && '🏆'}
                {badgeType === 'crown' && '👑'}
              </div>
              
              {/* Badge shine effect */}
              {!prefersReducedMotion && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"
                  data-testid="badge-shine"
                  style={{ transform: 'skew(-20deg)' }}
                />
              )}
            </div>
            
            <div className="text-brand-gold font-bold text-lg">
              {tailoredHeadline}
            </div>
          </div>

          {/* Celebration message */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-brand-charcoal mb-2">
              {tailoredHeadline}
            </h3>
            <p 
              className={`text-brand-dark-gray ${!prefersReducedMotion ? 'animate-scale-in' : ''} animate-scale-in-complete`}
              data-testid="celebration-message"
              aria-live="assertive"
            >
              {celebrationMessage}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-4" data-testid="progress-indicator">
            <div className="text-sm text-brand-dark-gray mb-2">
              {stepNumber} of {totalSteps} steps completed
            </div>
            
            {/* Enhanced progress bar */}
            <div 
              className="relative bg-gray-200 rounded-full h-2 overflow-hidden"
              data-testid="celebration-progress-bar"
              data-celebrating="true"
              role="progressbar"
              aria-valuenow={stepNumber}
              aria-valuemax={totalSteps}
            >
              <div 
                className={`h-full bg-gradient-to-r from-brand-gold to-yellow-400 transition-all duration-1000 ${!prefersReducedMotion ? 'animate-fill-celebration' : ''}`}
                data-testid="progress-fill"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
              
              {/* Progress particles */}
              {!prefersReducedMotion && Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full w-1 bg-white opacity-70 animate-pulse"
                  data-testid={`progress-particle-${i}`}
                  style={{ 
                    left: `${Math.random() * (stepNumber / totalSteps) * 100}%`,
                    animationDelay: `${i * 200}ms`
                  }}
                />
              ))}
            </div>

            {/* Step checkmarks */}
            <div className="flex justify-between mt-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < stepNumber
                      ? `bg-brand-gold text-brand-charcoal ${!prefersReducedMotion ? 'animate-checkmark-complete' : ''}`
                      : i === stepNumber - 1
                      ? `bg-brand-gold text-brand-charcoal ${!prefersReducedMotion ? 'animate-checkmark-active' : ''}`
                      : 'bg-gray-200 text-gray-400'
                  }`}
                  data-testid={`step-checkmark-${i + 1}`}
                >
                  {i < stepNumber ? '✓' : i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Motivational text */}
          <p 
            className="text-brand-charcoal font-medium mb-4"
            data-testid="motivational-text"
          >
            {motivationalText}
          </p>

          {/* Continue button */}
          {showContinueButton && (
            <button
              className="px-6 py-2 bg-brand-gold hover:bg-brand-dark-gold text-white rounded-lg font-medium transition-colors min-h-[44px] touch-manipulation"
              data-testid="continue-button"
              tabIndex={0}
              onClick={onComplete}
            >
              Continue
            </button>
          )}
        </div>
      )}

      {/* Different celebration types */}
      <div className="sr-only">
        {celebrationType === 'step-completion' && (
          <div data-testid="step-completion-celebration">Step completion celebration</div>
        )}
        {celebrationType === 'form-submission' && (
          <div data-testid="form-submission-celebration">Form submission celebration</div>
        )}
        {celebrationType === 'booking-confirmed' && (
          <div data-testid="booking-confirmed-celebration">Booking confirmed celebration</div>
        )}
        {stepNumber === totalSteps && (
          <div data-testid="final-step-celebration">All steps completed!</div>
        )}
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) skew(-20deg); }
          100% { transform: translateX(200%) skew(-20deg); }
        }
        
        @keyframes fill-celebration {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        
        @keyframes checkmark-complete {
          0% { transform: scale(0) rotate(-45deg); }
          50% { transform: scale(1.2) rotate(-45deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        @keyframes checkmark-active {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); background-color: #FFD700; }
          100% { transform: scale(1); }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
        
        .animate-scale-in-complete {
          animation-fill-mode: forwards;
        }
        
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
        
        .animate-fill-celebration {
          animation: fill-celebration 1s ease-out;
          transform-origin: left;
        }
        
        .animate-checkmark-complete {
          animation: checkmark-complete 0.5s ease-out;
        }
        
        .animate-checkmark-active {
          animation: checkmark-active 1s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-bounce-in,
          .animate-scale-in,
          .animate-shine,
          .animate-fill-celebration,
          .animate-checkmark-complete,
          .animate-checkmark-active {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
