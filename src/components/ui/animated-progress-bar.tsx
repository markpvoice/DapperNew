/**
 * @fileoverview Animated Progress Bar Component
 * 
 * Displays booking form progress with smooth animations:
 * - Progressive fill animation
 * - Step completion check marks
 * - Current step pulse indicator
 * - Accessibility compliance
 */

'use client';

import { useEffect, useState } from 'react';

interface AnimatedProgressBarProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export function AnimatedProgressBar({ 
  steps, 
  currentStep, 
  completedSteps, 
  className = '' 
}: AnimatedProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Animate progress bar fill
  useEffect(() => {
    const targetProgress = (currentStep / (steps.length - 1)) * 100;
    
    if (prefersReducedMotion) {
      setAnimatedProgress(targetProgress);
      return;
    }

    const animationDuration = 600; // ms
    const startTime = Date.now();
    const startProgress = animatedProgress;
    const progressDiff = targetProgress - startProgress;

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function for smooth animation
      const easeOutQuad = 1 - Math.pow(1 - progress, 2);
      const newProgress = startProgress + (progressDiff * easeOutQuad);
      
      setAnimatedProgress(newProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };
    
    requestAnimationFrame(animateProgress);
  }, [currentStep, steps.length, animatedProgress, prefersReducedMotion]);

  return (
    <div 
      className={`w-full ${className}`}
      data-testid="progress-bar"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemax={steps.length - 1}
      aria-label="Form completion progress"
    >
      {/* Progress Bar Track */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Animated Fill */}
          <div 
            className={`h-full bg-gradient-to-r from-brand-gold to-brand-dark-gold rounded-full ${
              !prefersReducedMotion ? 'transition-all duration-300 ease-out' : ''
            }`}
            style={{ width: `${animatedProgress}%` }}
            data-testid="progress-fill"
          />
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = index === currentStep;
            const isActive = index <= currentStep;
            
            return (
              <div 
                key={index}
                className="flex flex-col items-center relative"
                data-testid={`step-${index}`}
              >
                {/* Step Circle */}
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300
                    ${isCompleted ? 
                      'bg-brand-gold border-brand-gold text-brand-charcoal' :
                      isActive ? 
                        'bg-white border-brand-gold text-brand-gold' :
                        'bg-gray-100 border-gray-300 text-gray-400'
                    }
                    ${isCurrent && !prefersReducedMotion ? 'animate-pulse-gentle' : ''}
                  `}
                  data-testid={`step-indicator-${index}`}
                >
                  {isCompleted ? (
                    <svg 
                      className={`w-4 h-4 ${!prefersReducedMotion ? 'animate-scale-in' : ''}`}
                      data-testid={`checkmark-${index}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-2 text-xs text-center max-w-20">
                  <span 
                    className={`
                      ${isActive ? 'text-brand-charcoal font-medium' : 'text-gray-500'}
                    `}
                  >
                    {step}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-gentle,
          .animate-scale-in {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}