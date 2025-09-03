'use client';

import React, { useEffect, useRef, Children, useCallback } from 'react';
import { useScrollAnimations } from '@/hooks/use-scroll-animations';

type AnimationType = 
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'slideInLeft'
  | 'slideInRight'
  | 'scaleIn'
  | 'rotateIn';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  stagger?: number;
  triggerOnScroll?: boolean;
  className?: string;
  style?: React.CSSProperties;
  threshold?: number;
  once?: boolean;
}

/**
 * AnimatedSection component for scroll-triggered animations
 * 
 * Features:
 * - Multiple animation types
 * - Stagger animations for multiple children
 * - Intersection Observer integration
 * - Accessibility compliance (prefers-reduced-motion)
 * - Performance optimization
 */
export function AnimatedSection({
  children,
  animation = 'fadeInUp',
  delay = 0,
  stagger = 0,
  triggerOnScroll = false,
  className = '',
  style = {},
  threshold = 0.1,
  once = true,
}: AnimatedSectionProps): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { observeElement, unobserveElement, isElementAnimated } = useScrollAnimations({
    threshold,
    once,
  });

  // Check for reduced motion preference
  const prefersReducedMotion = () => {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  };

  // Animation class mapping
  const getAnimationClass = useCallback((animationType: AnimationType): string => {
    if (prefersReducedMotion()) {
      return 'animate-none';
    }

    const classMap: Record<AnimationType, string> = {
      fadeInUp: 'animate-fade-in-up',
      fadeInDown: 'animate-fade-in-down',
      fadeInLeft: 'animate-fade-in-left',
      fadeInRight: 'animate-fade-in-right',
      slideInLeft: 'animate-slide-in-left',
      slideInRight: 'animate-slide-in-right',
      scaleIn: 'animate-scale-in',
      rotateIn: 'animate-rotate-in',
    };

    return classMap[animationType] || classMap.fadeInUp;
  }, []);

  // Set up scroll trigger if enabled
  useEffect(() => {
    if (triggerOnScroll && sectionRef.current) {
      const currentRef = sectionRef.current;
      observeElement(currentRef);
      
      return () => {
        unobserveElement(currentRef);
      };
    }
  }, [triggerOnScroll, observeElement, unobserveElement]);

  // Apply animations to section
  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) {
      return;
    }

    const section = sectionRef.current;
    
    if (triggerOnScroll) {
      // Wait for intersection observer to trigger
      const checkAnimation = () => {
        if (isElementAnimated(section)) {
          section.classList.add(getAnimationClass(animation));
          if (delay > 0) {
            section.style.animationDelay = `${delay}ms`;
          }
        } else {
          requestAnimationFrame(checkAnimation);
        }
      };
      checkAnimation();
    } else {
      // Apply animation immediately
      section.classList.add(getAnimationClass(animation));
      if (delay > 0) {
        section.style.animationDelay = `${delay}ms`;
      }
    }
  }, [animation, delay, triggerOnScroll, isElementAnimated, getAnimationClass]);

  // Apply stagger animations to children
  useEffect(() => {
    if (!sectionRef.current || stagger <= 0 || prefersReducedMotion()) {
      return;
    }

    const section = sectionRef.current;
    const childElements = Array.from(section.children) as HTMLElement[];

    childElements.forEach((child, index) => {
      const staggerDelay = delay + (index * stagger);
      child.style.animationDelay = `${staggerDelay}ms`;
      
      if (!child.classList.contains(getAnimationClass(animation))) {
        child.classList.add(getAnimationClass(animation));
      }
    });
  }, [animation, delay, stagger, children, getAnimationClass]);

  // Combine class names
  const combinedClassName = [
    'animated-section',
    triggerOnScroll ? 'scroll-trigger' : '',
    prefersReducedMotion() ? 'reduced-motion' : '',
    className,
  ].filter(Boolean).join(' ');

  // Combine styles
  const combinedStyle: React.CSSProperties = {
    ...style,
    // Ensure hardware acceleration
    transform: 'translate3d(0, 0, 0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
  };

  // Handle stagger animations for multiple children
  const renderChildren = () => {
    if (stagger > 0 && !prefersReducedMotion()) {
      return Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        const childDelay = delay + (index * stagger);
        
        return React.cloneElement(child as React.ReactElement<any>, {
          style: {
            ...child.props.style,
            animationDelay: `${childDelay}ms`,
          },
          'data-stagger-index': index,
        });
      });
    }

    return children;
  };

  return (
    <div
      ref={sectionRef}
      className={combinedClassName}
      style={combinedStyle}
      data-animation={animation}
      data-trigger-on-scroll={triggerOnScroll}
      data-testid="animated-section"
    >
      {renderChildren()}
    </div>
  );
}

// Export animation type for external use
export type { AnimationType };