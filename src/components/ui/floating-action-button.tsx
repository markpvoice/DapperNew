/**
 * @fileoverview Floating Action Button Component
 * 
 * Touch-optimized floating action button for mobile admin:
 * - Primary action with expandable menu
 * - Touch-friendly targets (56px minimum)
 * - Smooth animations and micro-interactions
 * - Backdrop for menu overlay
 * - Accessibility support
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useMobileOptimizations } from '@/hooks/use-mobile-optimizations';

interface FABAction {
  id: string;
  label: string;
  icon: string;
  color?: string;
  onClick: () => void;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  primaryIcon?: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  isExpanded?: boolean;
  onToggle?: (_expanded: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function FloatingActionButton({
  actions,
  primaryIcon = '+',
  primaryColor = 'bg-brand-gold',
  position = 'bottom-right',
  isExpanded: controlledExpanded,
  onToggle,
  disabled = false,
  className = ''
}: FloatingActionButtonProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [pressedAction, setPressedAction] = useState<string | null>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  
  const { 
    deviceInfo, 
    supportsHapticFeedback 
  } = useMobileOptimizations();

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const isControlled = controlledExpanded !== undefined;

  // FAB dimensions (56px is Material Design standard)
  const fabSize = 56;
  const actionSize = 48;

  // Haptic feedback
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' = 'light') => {
    if (supportsHapticFeedback() && 'vibrate' in navigator) {
      const patterns = { light: [5], medium: [10] };
      navigator.vibrate(patterns[type]);
    }
  }, [supportsHapticFeedback]);

  // Toggle FAB expansion
  const toggleExpanded = useCallback(() => {
    const newExpanded = !isExpanded;
    
    if (isControlled) {
      onToggle?.(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
    
    triggerHapticFeedback(newExpanded ? 'medium' : 'light');
  }, [isExpanded, isControlled, onToggle, triggerHapticFeedback]);

  // Handle action selection
  const handleActionClick = useCallback((action: FABAction) => {
    triggerHapticFeedback('light');
    action.onClick();
    
    // Close FAB after action
    setTimeout(() => {
      if (isControlled) {
        onToggle?.(false);
      } else {
        setInternalExpanded(false);
      }
    }, 150);
  }, [isControlled, onToggle, triggerHapticFeedback]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    if (isExpanded) {
      triggerHapticFeedback('light');
      toggleExpanded();
    }
  }, [isExpanded, toggleExpanded, triggerHapticFeedback]);

  // Handle touch feedback
  const handleTouchStart = useCallback((actionId: string) => {
    setPressedAction(actionId);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setPressedAction(null);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        toggleExpanded();
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isExpanded, toggleExpanded]);

  // Get position classes
  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50';
    const spacing = deviceInfo.isMobile ? '16px' : '24px';
    
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} bottom-[${spacing}] right-[${spacing}]`;
      case 'bottom-left':
        return `${baseClasses} bottom-[${spacing}] left-[${spacing}]`;
      case 'top-right':
        return `${baseClasses} top-[${spacing}] right-[${spacing}]`;
      case 'top-left':
        return `${baseClasses} top-[${spacing}] left-[${spacing}]`;
      default:
        return `${baseClasses} bottom-[${spacing}] right-[${spacing}]`;
    }
  };

  // Get action position based on FAB position
  const getActionPosition = (index: number) => {
    const offset = (actionSize + 12) * (index + 1);
    const isBottom = position.includes('bottom');
    
    if (isBottom) {
      return { bottom: `${offset + 8}px` };
    } else {
      return { top: `${offset + 8}px` };
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          ref={backdropRef}
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
          onClick={handleBackdropClick}
          data-testid="fab-backdrop"
          aria-hidden="true"
        />
      )}

      {/* FAB Container */}
      <div
        ref={fabRef}
        className={`${getPositionClasses()} ${className}`}
        data-testid="floating-action-button"
      >
        {/* Action Buttons */}
        {isExpanded && (
          <div className="absolute" style={{ bottom: '70px', right: '4px' }}>
            {actions.map((action, index) => (
              <div
                key={action.id}
                className="relative mb-3 last:mb-0"
                style={{
                  ...getActionPosition(index),
                  animationDelay: `${index * 50}ms`
                }}
                data-testid="fab-menu"
              >
                {/* Action Label */}
                <div className="absolute right-14 top-1/2 transform -translate-y-1/2 whitespace-nowrap">
                  <div className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
                    {action.label}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleActionClick(action)}
                  onTouchStart={() => handleTouchStart(action.id)}
                  onTouchEnd={handleTouchEnd}
                  className={`
                    flex items-center justify-center rounded-full text-white shadow-lg
                    transition-all duration-200 
                    ${action.color || 'bg-gray-600'} 
                    hover:scale-110 active:scale-95
                    ${pressedAction === action.id ? 'scale-95' : ''}
                    animate-fab-slide-in
                  `}
                  style={{
                    width: `${actionSize}px`,
                    height: `${actionSize}px`,
                    minWidth: `${actionSize}px`,
                    minHeight: `${actionSize}px`
                  }}
                  data-testid={`fab-action-${action.id}`}
                  aria-label={action.label}
                >
                  <span className="text-xl">{action.icon}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={toggleExpanded}
          onTouchStart={() => handleTouchStart('main')}
          onTouchEnd={handleTouchEnd}
          className={`
            flex items-center justify-center rounded-full text-white shadow-lg
            transition-all duration-300 
            ${primaryColor} 
            hover:scale-110 active:scale-95
            ${pressedAction === 'main' ? 'scale-95' : ''}
            ${isExpanded ? 'rotate-45' : 'rotate-0'}
          `}
          style={{
            width: `${fabSize}px`,
            height: `${fabSize}px`,
            minWidth: `${fabSize}px`,
            minHeight: `${fabSize}px`
          }}
          data-testid="fab-main"
          aria-label={isExpanded ? 'Close menu' : 'Open menu'}
          aria-expanded={isExpanded}
          aria-haspopup="menu"
        >
          <span className="text-2xl font-light leading-none">
            {primaryIcon}
          </span>
        </button>
      </div>

      {/* Custom CSS for animations and mobile optimizations */}
      <style jsx>{`
        @keyframes fab-slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fab-slide-in {
          animation: fab-slide-in 0.2s ease-out forwards;
        }

        /* Improve touch targets on small screens */
        @media (max-width: 480px) {
          .fixed {
            bottom: 16px !important;
            right: 16px !important;
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .transition-all,
          .hover\\:scale-110,
          .active\\:scale-95,
          .rotate-45,
          .animate-fab-slide-in {
            transition: none !important;
            animation: none !important;
            transform: none !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          button {
            border: 2px solid currentColor;
          }
        }

        /* Focus management */
        button:focus {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }

        /* Prevent text selection on touch */
        button * {
          user-select: none;
          -webkit-user-select: none;
        }

        /* iOS specific optimizations */
        @supports (-webkit-touch-callout: none) {
          button {
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }
        }

        /* Android specific optimizations */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          button {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </>
  );
}