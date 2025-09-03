'use client';

import React, { forwardRef } from 'react';
import { useParallax } from '@/hooks/use-parallax';

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  offset?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  enableOnMobile?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
  'data-testid'?: string;
}

/**
 * ParallaxSection component for smooth parallax scrolling effects
 * 
 * Features:
 * - GPU-accelerated transforms
 * - Performance-optimized with Intersection Observer
 * - Accessibility compliance (prefers-reduced-motion)
 * - Mobile device detection and control
 * - Multiple scroll directions
 * - Customizable speed and offset
 */
export const ParallaxSection = forwardRef<HTMLElement, ParallaxSectionProps>(
  ({
    children,
    speed = 0.5,
    offset = 0,
    direction = 'up',
    enableOnMobile = false,
    className = '',
    style = {},
    as: Component = 'div',
    'data-testid': dataTestId,
  }, forwardedRef) => {
    const { ref, transform, isInView } = useParallax({
      speed,
      offset,
      direction,
      enableOnMobile,
    });

    // Combine refs
    const combinedRef = (node: HTMLElement | null) => {
      if (ref.current !== node) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
      
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    // Combine styles with parallax transform
    const combinedStyle: React.CSSProperties = {
      ...style,
      transform,
      // Ensure GPU acceleration and smooth rendering
      backfaceVisibility: 'hidden',
      perspective: '1000px',
      transformOrigin: 'center',
      // Improve text rendering during animations
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    };

    // Combine class names
    const combinedClassName = [
      'parallax-section',
      isInView ? 'in-view' : 'out-of-view',
      className,
    ].filter(Boolean).join(' ');

    return (
      <Component
        // @ts-ignore - Generic component with dynamic ref types
        ref={combinedRef}
        className={combinedClassName}
        style={combinedStyle}
        data-parallax-speed={speed}
        data-parallax-direction={direction}
        data-in-view={isInView}
        data-testid={dataTestId}
      >
        {children}
      </Component>
    );
  }
);

ParallaxSection.displayName = 'ParallaxSection';