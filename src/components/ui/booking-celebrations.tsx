/**
 * @fileoverview BookingCelebrations Component
 * 
 * Provides delightful celebration animations for booking journey including:
 * - Step completion animations
 * - Progress milestone celebrations  
 * - Confetti effects for success
 * - Sound effects and haptic feedback
 * - Full accessibility compliance
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCelebrationEffects, type CelebrationType } from '@/hooks/use-celebration-effects';

export interface BookingCelebrationsProps {
  /** Current step number */
  step: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether celebrations should be visible */
  isVisible: boolean;
  /** Callback when celebration completes */
  onComplete: (_type: string, _data?: any) => void;
  /** Type of celebration to show */
  celebrationType?: CelebrationType;
  /** Enable sound effects */
  enableSounds?: boolean;
  /** Enable haptic feedback */
  enableHaptics?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * BookingCelebrations component with animations and accessibility
 */
export function BookingCelebrations({
  step,
  totalSteps,
  isVisible,
  onComplete,
  celebrationType = 'none',
  enableSounds = false,
  enableHaptics = false,
  className = '',
}: BookingCelebrationsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isConfettiAnimating, setIsConfettiAnimating] = useState(false);
  
  // Use celebration effects hook
  const {
    progress,
    announcement,
    prefersReducedMotion,
    triggerCelebration,
  } = useCelebrationEffects({
    step,
    totalSteps,
    enableSounds,
    enableHaptics,
  });

  // Check for high contrast preference
  const prefersHighContrast = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-contrast: high)').matches
    : false;

  /**
   * Confetti animation implementation
   */
  const animateConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
    }> = [];

    // Create confetti particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
        size: Math.random() * 4 + 2,
      });
    }

    let _animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // gravity

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Remove particles that fall off screen
        if (particle.y > canvas.height + 10) {
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        _animationId = requestAnimationFrame(animate);
      } else {
        setIsConfettiAnimating(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  /**
   * Trigger celebration effect
   */
  useEffect(() => {
    if (!isVisible || celebrationType === 'none') {
      return;
    }

    triggerCelebration(celebrationType);
    
    if (celebrationType === 'success' && canvasRef.current) {
      setIsConfettiAnimating(true);
      animateConfetti();
    }

    // Call completion callback
    const timer = setTimeout(() => {
      if (celebrationType === 'milestone') {
        onComplete('milestone', { percentage: progress });
      } else {
        onComplete(celebrationType);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [celebrationType, isVisible, progress, onComplete, triggerCelebration]);

  /**
   * Cleanup animations on unmount
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onComplete(celebrationType);
    }
  };

  /**
   * Get milestone message
   */
  const getMilestoneMessage = () => {
    if (celebrationType === 'success') {
      return 'Booking Complete! 🎊';
    }
    if (celebrationType === 'milestone' && progress >= 50) {
      return 'Halfway there! 🎉';
    }
    return '';
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`celebration-container ${className}`}
      data-testid="celebration-container"
      data-type={celebrationType}
      data-reduced-motion={prefersReducedMotion}
      data-high-contrast={prefersHighContrast}
      aria-label="Booking progress celebration"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Screen Reader Announcement */}
      <div
        className="sr-only"
        data-testid="sr-announcement"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      {/* Progress Display */}
      <div
        className="celebration-progress"
        data-testid="celebration-progress"
        data-step={step}
        data-total={totalSteps}
        aria-label={`Step ${step} of ${totalSteps} completed`}
      >
        {/* Progress Bar */}
        <div
          className={`progress-bar ${!prefersReducedMotion ? 'animate-progress-fill' : ''}`}
          data-testid="progress-bar"
          style={{ width: `${progress}%` }}
        />

        {/* Step Indicators */}
        <div className="step-indicators">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < step;
            const isCurrent = stepNumber === step;

            return (
              <div
                key={stepNumber}
                className={`step-indicator ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isCompleted && !prefersReducedMotion ? 'animate-check-scale' : ''} ${isCurrent && !prefersReducedMotion ? 'animate-pulse-glow' : ''}`}
                data-testid={isCompleted ? 'step-checkmark' : isCurrent ? 'current-step-indicator' : 'step-indicator'}
              >
                {isCompleted && (
                  <span className={`checkmark ${!prefersReducedMotion ? 'animate-check-scale' : ''}`}>
                    ✓
                  </span>
                )}
                {isCurrent && !prefersReducedMotion && (
                  <span className="animate-pulse-glow" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Completion Celebration */}
      {celebrationType === 'step-complete' && (
        <div
          className={`step-celebration ${!prefersReducedMotion ? 'animate-step-complete' : ''}`}
          data-testid="step-celebration"
        >
          <div className="celebration-icon">✨</div>
          <div className="celebration-text">Step Complete!</div>
        </div>
      )}

      {/* Milestone Celebration */}
      {celebrationType === 'milestone' && (
        <div
          className={`milestone-celebration ${!prefersReducedMotion ? 'animate-milestone-burst' : ''}`}
          data-testid="milestone-celebration"
          data-milestone={progress}
        >
          <div className="milestone-icon">🎉</div>
          <div className="milestone-text">{getMilestoneMessage()}</div>
        </div>
      )}

      {/* Success Celebration */}
      {celebrationType === 'success' && (
        <div
          className={`success-celebration ${!prefersReducedMotion ? 'animate-success-burst' : ''}`}
          data-testid="success-celebration"
          data-milestone="100"
        >
          <div className="success-icon">🎊</div>
          <div className="success-text">{getMilestoneMessage()}</div>
          
          {/* Confetti Canvas */}
          <canvas
            ref={canvasRef}
            className="confetti-canvas"
            data-testid="confetti-canvas"
            data-animating={isConfettiAnimating}
            width={800}
            height={600}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        </div>
      )}
    </div>
  );
}

// Default export for easier importing
export default BookingCelebrations;