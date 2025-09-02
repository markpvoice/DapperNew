/**
 * Swipe Form Container
 * 
 * Container component that enables swipe navigation between form steps:
 * - Horizontal swipe gestures
 * - Visual swipe indicators
 * - Smooth animations
 * - Accessibility support
 * - Touch feedback
 */

'use client';

import React, { useRef, useCallback, useState } from 'react';
import { useMobileOptimizations, TouchGesture } from '@/hooks/use-mobile-optimizations';

interface SwipeFormContainerProps {
  currentStep: number;
  totalSteps?: number; // Made optional since it's not used
  onSwipeNext: () => void;
  onSwipePrevious: () => void;
  canSwipeNext: boolean;
  canSwipePrevious: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SwipeFormContainer({
  currentStep,
  totalSteps: _totalSteps,
  onSwipeNext,
  onSwipePrevious,
  canSwipeNext,
  canSwipePrevious,
  children,
  className = '',
  disabled = false
}: SwipeFormContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [swipeProgress, setSwipeProgress] = useState(0); // -1 to 1
  const [isSwipingRef, setIsSwipingRef] = useState(false);
  
  const { 
    isMobile, 
    isTouch, 
    triggerHapticFeedback, 
    handleTouchStart, 
    handleTouchEnd,
    hasReducedMotion
  } = useMobileOptimizations();

  const handleGesture = useCallback((gesture: TouchGesture) => {
    if (disabled || !isMobile) {
      return;
    }

    const SWIPE_THRESHOLD = 100; // Minimum distance for swipe
    const VELOCITY_THRESHOLD = 0.3; // Minimum velocity

    if (gesture.type === 'swipe-left' && canSwipeNext) {
        if (Math.abs(gesture.deltaX) > SWIPE_THRESHOLD || gesture.velocity > VELOCITY_THRESHOLD) {
        onSwipeNext();
        if (isTouch) {
          triggerHapticFeedback(50);
        }
      }
    } else if (gesture.type === 'swipe-right' && canSwipePrevious) {
        if (Math.abs(gesture.deltaX) > SWIPE_THRESHOLD || gesture.velocity > VELOCITY_THRESHOLD) {
        onSwipePrevious();
        if (isTouch) {
          triggerHapticFeedback(50);
        }
      }
    }

    setSwipeProgress(0);
    setIsSwipingRef(false);
  }, [disabled, isMobile, canSwipeNext, canSwipePrevious, onSwipeNext, onSwipePrevious, isTouch, triggerHapticFeedback]);

  const handleTouchStartWrapper = useCallback((e: React.TouchEvent) => {
    if (!isMobile || disabled) {
      return;
    }
    
    setIsSwipingRef(true);
    handleTouchStart(e.nativeEvent);
  }, [isMobile, disabled, handleTouchStart]);

  const handleTouchMoveWrapper = useCallback((e: React.TouchEvent) => {
    if (!isMobile || disabled || !isSwipingRef) {
      return;
    }

    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const deltaX = touch.clientX - rect.left - rect.width / 2;
    const progress = Math.max(-1, Math.min(1, deltaX / (rect.width / 2)));

    // Only show progress if swipe is valid
    if ((progress > 0 && canSwipeNext) || (progress < 0 && canSwipePrevious)) {
      setSwipeProgress(progress);
    }
  }, [isMobile, disabled, isSwipingRef, canSwipeNext, canSwipePrevious]);

  const handleTouchEndWrapper = useCallback((e: React.TouchEvent) => {
    if (!isMobile || disabled) {
      return;
    }
    
    handleTouchEnd(e.nativeEvent, handleGesture);
  }, [isMobile, disabled, handleTouchEnd, handleGesture]);

  const animationClasses = hasReducedMotion 
    ? '' 
    : 'transition-transform duration-200 ease-out';

  return (
    <div 
      ref={containerRef}
      className={`
        relative overflow-hidden touch-manipulation
        ${className}
      `}
      onTouchStart={handleTouchStartWrapper}
      onTouchMove={handleTouchMoveWrapper}
      onTouchEnd={handleTouchEndWrapper}
      style={{ touchAction: 'pan-x' }}
    >
      {/* Swipe Indicators */}
      {isMobile && Math.abs(swipeProgress) > 0.1 && (
        <>
          {/* Left swipe indicator (Next) */}
          {swipeProgress < 0 && canSwipeNext && (
            <div 
              className={`
                absolute right-4 top-1/2 transform -translate-y-1/2 z-10
                bg-brand-gold text-white rounded-full p-3 shadow-lg
                opacity-70
                ${animationClasses}
              `}
              style={{
                transform: `translateY(-50%) translateX(${Math.min(0, swipeProgress * 100)}px)`
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}

          {/* Right swipe indicator (Previous) */}
          {swipeProgress > 0 && canSwipePrevious && (
            <div 
              className={`
                absolute left-4 top-1/2 transform -translate-y-1/2 z-10
                bg-gray-600 text-white rounded-full p-3 shadow-lg
                opacity-70
                ${animationClasses}
              `}
              style={{
                transform: `translateY(-50%) translateX(${Math.max(0, swipeProgress * 100)}px)`
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          )}
        </>
      )}

      {/* Content with swipe transform */}
      <div 
        className={`
          ${animationClasses}
          ${isSwipingRef ? 'select-none' : ''}
        `}
        style={{
          transform: isSwipingRef && Math.abs(swipeProgress) > 0.1 
            ? `translateX(${swipeProgress * 20}px)` 
            : 'translateX(0px)'
        }}
      >
        {children}
      </div>

      {/* Swipe hints for first-time users */}
      {isMobile && currentStep === 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            <span>Swipe to navigate</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      )}

      {/* Progress bar showing swipe sensitivity */}
      {isMobile && Math.abs(swipeProgress) > 0.2 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className={`
              h-full transition-all duration-100
              ${swipeProgress > 0 
                ? 'bg-gray-600' 
                : 'bg-brand-gold'
              }
            `}
            style={{
              width: `${Math.abs(swipeProgress) * 100}%`,
              marginLeft: swipeProgress > 0 ? '0%' : `${(1 - Math.abs(swipeProgress)) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
}