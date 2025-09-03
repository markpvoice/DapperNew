'use client';

import React, { useRef, forwardRef } from 'react';
import { useAdvancedHover } from '@/hooks/use-advanced-hover';

interface HoverEnhancedCardProps {
  children: React.ReactNode;
  
  // Transform options
  scale?: number;
  rotateX?: number;
  rotateY?: number;
  
  // Effect toggles
  enableScale?: boolean;
  enableTilt?: boolean;
  enableGlow?: boolean;
  enableMagnetic?: boolean;
  
  // Visual options
  glowColor?: string;
  magneticStrength?: number;
  
  // Performance options
  throttleMs?: number;
  duration?: number;
  easing?: string;
  
  // Standard HTML attributes
  className?: string;
  style?: React.CSSProperties;
  onClick?: (_event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (_event: React.KeyboardEvent<HTMLDivElement>) => void;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

/**
 * HoverEnhancedCard component with advanced hover effects
 * 
 * Features:
 * - Scale, tilt, glow, and magnetic effects
 * - Performance-optimized with GPU acceleration
 * - Accessibility support (keyboard navigation, reduced motion)
 * - Customizable animations and timing
 * - TypeScript support with full type safety
 */
export const HoverEnhancedCard = forwardRef<HTMLDivElement, HoverEnhancedCardProps>(
  ({
    children,
    scale = 1.05,
    rotateX = 5,
    rotateY = 5,
    enableScale = true,
    enableTilt = false,
    enableGlow = false,
    enableMagnetic = false,
    glowColor = '#FFD700',
    magneticStrength = 0.2,
    throttleMs = 16,
    duration = 300,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    className = '',
    style = {},
    onClick,
    onKeyDown,
    tabIndex = 0,
    role = 'button',
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
  }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Use advanced hover hook with all the options
    const {
      transformStyle,
      transitionStyle,
      glowStyle,
      hoverHandlers,
    } = useAdvancedHover({
      scale,
      rotateX,
      rotateY,
      enableScale,
      enableTilt,
      enableGlow,
      enableMagnetic,
      glowColor,
      magneticStrength,
      throttleMs,
      duration,
      easing,
      element: cardRef.current,
    });

    // Handle keyboard interactions
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event as any);
      }
      onKeyDown?.(event);
    };

    // Combine class names
    const combinedClassName = [
      'hover-enhanced-card',
      'cursor-pointer',
      'focus:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-brand-gold',
      'focus-visible:ring-offset-2',
      className,
    ].filter(Boolean).join(' ');

    // Combine styles with hover effects
    const combinedStyle: React.CSSProperties = {
      ...style,
      transform: transformStyle,
      transition: transitionStyle,
      filter: glowStyle,
      // Ensure proper layering and performance
      position: 'relative',
      zIndex: 1,
      transformOrigin: 'center',
      backfaceVisibility: 'hidden',
      // Improve text rendering during animations
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    };

    return (
      <div
        ref={(node) => {
          cardRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={combinedClassName}
        style={combinedStyle}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={hoverHandlers.onMouseEnter}
        onMouseLeave={hoverHandlers.onMouseLeave}
        onMouseMove={hoverHandlers.onMouseMove}
        onFocus={hoverHandlers.onFocus}
        onBlur={hoverHandlers.onBlur}
        tabIndex={tabIndex}
        role={role}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        data-hover-effects={JSON.stringify({
          scale: enableScale,
          tilt: enableTilt,
          glow: enableGlow,
          magnetic: enableMagnetic,
        })}
      >
        {children}
      </div>
    );
  }
);

HoverEnhancedCard.displayName = 'HoverEnhancedCard';