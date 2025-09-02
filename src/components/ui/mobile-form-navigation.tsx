/**
 * Mobile Form Navigation Component
 * 
 * Mobile-optimized navigation for multi-step forms with:
 * - Touch-friendly buttons (44px minimum)
 * - Swipe gesture support
 * - Thumb-accessible positioning
 * - Haptic feedback
 * - Sticky bottom positioning
 */

'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useMobileOptimizations } from '@/hooks/use-mobile-optimizations';

interface MobileFormNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoBack: boolean;
  isSubmitting?: boolean;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  nextLabel?: string;
  backLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export function MobileFormNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  canGoBack,
  isSubmitting = false,
  onNext,
  onBack,
  onCancel,
  nextLabel = 'Next',
  backLabel = 'Back',
  cancelLabel = 'Cancel',
  className = ''
}: MobileFormNavigationProps) {
  const { 
    isMobile, 
    isTouch, 
    triggerHapticFeedback, 
    getMobileClasses, 
    optimizeStepNavigation 
  } = useMobileOptimizations();

  const navigationConfig = optimizeStepNavigation();

  const handleNext = useCallback(() => {
    if (isTouch) {
      triggerHapticFeedback(50); // Light haptic feedback
    }
    onNext();
  }, [isTouch, triggerHapticFeedback, onNext]);

  const handleBack = useCallback(() => {
    if (isTouch) {
      triggerHapticFeedback(30); // Lighter feedback for back action
    }
    onBack();
  }, [isTouch, triggerHapticFeedback, onBack]);

  const handleCancel = useCallback(() => {
    if (isTouch) {
      triggerHapticFeedback([100, 50]); // Double tap pattern for cancel
    }
    onCancel();
  }, [isTouch, triggerHapticFeedback, onCancel]);

  // Mobile-first design
  if (isMobile) {
    return (
      <div 
        className={`
          fixed bottom-0 left-0 right-0 
          bg-white border-t border-gray-200 
          p-4 pb-safe-bottom
          shadow-lg
          ${className}
        `}
        {...navigationConfig.containerProps}
      >
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          {/* Primary action (Next/Submit) */}
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext || isSubmitting}
            className={`
              w-full h-12 
              bg-brand-gold hover:bg-brand-dark-gold text-white 
              text-lg font-medium
              touch-manipulation
              disabled:opacity-50 disabled:cursor-not-allowed
              ${getMobileClasses({ touchTarget: true, mobileFirst: true })}
            `}
            style={{ 
              minHeight: '48px',
              fontSize: '16px' // Prevent iOS zoom
            }}
          >
            {isSubmitting ? 'Submitting...' : (currentStep === totalSteps - 1 ? 'Submit Booking' : nextLabel)}
          </Button>

          {/* Secondary actions */}
          <div className="flex gap-3">
            {canGoBack && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className={`
                  flex-1 h-12
                  text-base font-medium
                  touch-manipulation
                  ${getMobileClasses({ touchTarget: true, mobileFirst: true })}
                `}
                style={{ 
                  minHeight: '48px',
                  fontSize: '16px'
                }}
              >
                {backLabel}
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className={`
                flex-1 h-12
                text-base font-medium
                text-gray-600 border-gray-300
                touch-manipulation
                ${getMobileClasses({ touchTarget: true, mobileFirst: true })}
              `}
              style={{ 
                minHeight: '48px',
                fontSize: '16px'
              }}
            >
              {cancelLabel}
            </Button>
          </div>
        </div>

        {/* Step indicator dots */}
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`
                w-2 h-2 rounded-full transition-colors duration-200
                ${index === currentStep 
                  ? 'bg-brand-gold' 
                  : index < currentStep 
                    ? 'bg-brand-gold opacity-60' 
                    : 'bg-gray-300'
                }
              `}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop version (existing layout)
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 ${className}`}>
      <div className="flex gap-3 w-full sm:w-auto">
        {canGoBack && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm"
          >
            {backLabel}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm"
        >
          {cancelLabel}
        </Button>
      </div>
      <div className="w-full sm:w-auto">
        <Button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext || isSubmitting}
          className="bg-brand-gold hover:bg-brand-dark-gold text-white w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm"
        >
          {isSubmitting ? 'Submitting...' : (currentStep === totalSteps - 1 ? 'Submit Booking' : nextLabel)}
        </Button>
      </div>
    </div>
  );
}