/**
 * @fileoverview Animated Statistics Component
 * 
 * Provides smooth counting animations for hero section statistics
 * with accessibility support and reduced motion compliance.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Stat {
  value: number;
  label: string;
  suffix: string;
}

interface AnimatedStatsProps {
  stats: Stat[];
  duration?: number;
  className?: string;
}

export function AnimatedStats({ stats, duration = 2000, className = '' }: AnimatedStatsProps) {
  const [animatedValues, setAnimatedValues] = useState<number[]>(stats.map(() => 0));
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Easing function for smooth animation
  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = prefersReducedMotion ? 1 : easeOutExpo(progress);

    const newValues = stats.map(stat => Math.floor(stat.value * easedProgress));
    setAnimatedValues(newValues);

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [duration, prefersReducedMotion, stats]);

  // Start animation when component becomes visible
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const currentContainer = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          if (prefersReducedMotion) {
            // Show final values immediately for reduced motion
            setAnimatedValues(stats.map(stat => stat.value));
          } else {
            // Start animation
            startTimeRef.current = undefined;
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(currentContainer);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, prefersReducedMotion, stats, animate]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Convert label to accessible text
  const getAccessibleLabel = (stat: Stat, value: number): string => {
    const cleanLabel = stat.label.replace(/\n/g, ' ');
    let accessibleSuffix = stat.suffix;
    
    if (stat.suffix === '★') {
      accessibleSuffix = value === 1 ? 'star' : 'stars';
    } else if (stat.suffix === '+') {
      accessibleSuffix = 'plus';
    }
    
    return `${cleanLabel}: ${value} ${accessibleSuffix}`;
  };

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 ${className}`}
      data-testid="animated-stats"
      aria-live="polite"
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center"
          data-testid={`stat-${index}`}
          aria-label={getAccessibleLabel(stat, animatedValues[index])}
        >
          <div 
            className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2"
            data-testid={`stat-value-${index}`}
          >
            {animatedValues[index]}{stat.suffix}
          </div>
          <div 
            className="text-xs sm:text-sm opacity-80 leading-tight"
            aria-hidden="true"
          >
            {stat.label.split('\n').map((line, lineIndex) => (
              <span key={lineIndex}>
                {line}
                {lineIndex < stat.label.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}