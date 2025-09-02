/**
 * Mobile Floating Action Button (FAB)
 * 
 * Material Design inspired FAB for mobile devices with:
 * - 56px minimum touch target
 * - Thumb-accessible positioning
 * - Haptic feedback
 * - Expandable menu options
 * - Smooth animations
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useMobileOptimizations } from '@/hooks/use-mobile-optimizations';

interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface MobileFloatingActionButtonProps {
  primary: {
    icon: React.ReactNode;
    onClick: () => void;
    label?: string;
  };
  actions?: FABAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
  disabled?: boolean;
}

export function MobileFloatingActionButton({
  primary,
  actions = [],
  position = 'bottom-right',
  className = '',
  disabled = false
}: MobileFloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isMobile, isTouch, triggerHapticFeedback, hasReducedMotion } = useMobileOptimizations();

  const handlePrimaryClick = useCallback(() => {
    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
      if (isTouch) {
        triggerHapticFeedback(50);
      }
    } else {
      primary.onClick();
      if (isTouch) {
        triggerHapticFeedback(75);
      }
    }
  }, [isExpanded, actions.length, primary, isTouch, triggerHapticFeedback]);

  const handleActionClick = useCallback((action: FABAction) => {
    action.onClick();
    setIsExpanded(false);
    if (isTouch) {
      triggerHapticFeedback(50);
    }
  }, [isTouch, triggerHapticFeedback]);

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isExpanded]);

  // Only show FAB on mobile devices
  if (!isMobile) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-6'
  };

  const animationClasses = hasReducedMotion 
    ? '' 
    : 'transition-all duration-300 ease-out';

  return (
    <div 
      className={`
        fixed ${positionClasses[position]} z-50
        ${className}
      `}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Expanded Actions */}
      {actions.length > 0 && isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className={`
                flex items-center justify-end
                ${animationClasses}
                ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
              style={{
                transitionDelay: hasReducedMotion ? '0ms' : `${index * 50}ms`
              }}
            >
              {/* Action Label */}
              <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg mr-4 shadow-lg">
                {action.label}
              </div>
              
              {/* Action Button */}
              <button
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={`
                  w-12 h-12 rounded-full shadow-lg
                  bg-white border border-gray-200
                  flex items-center justify-center
                  touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-gray-50 active:scale-95
                  ${animationClasses}
                `}
                style={{ minHeight: '48px', minWidth: '48px' }}
                aria-label={action.label}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Primary FAB */}
      <button
        onClick={handlePrimaryClick}
        disabled={disabled}
        className={`
          w-14 h-14 rounded-full shadow-lg
          bg-brand-gold hover:bg-brand-dark-gold text-white
          flex items-center justify-center
          touch-manipulation
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:shadow-xl active:scale-95
          ${animationClasses}
          ${isExpanded ? 'rotate-45' : 'rotate-0'}
        `}
        style={{ 
          minHeight: '56px', 
          minWidth: '56px',
          fontSize: '16px' // Prevent iOS zoom
        }}
        aria-label={primary.label || 'Primary action'}
        aria-expanded={actions.length > 0 ? isExpanded : undefined}
      >
        {primary.icon}
      </button>
    </div>
  );
}