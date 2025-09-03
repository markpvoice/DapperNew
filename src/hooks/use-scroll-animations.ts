import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollAnimationOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  staggerDelay?: number;
  once?: boolean;
}

interface UseScrollAnimationsReturn {
  animatedElements: Set<Element>;
  isElementAnimated: (_element: Element | null) => boolean;
  observeElement: (_element: Element | null) => void;
  unobserveElement: (_element: Element | null) => void;
}

/**
 * Custom hook for managing scroll-triggered animations with Intersection Observer
 * Features:
 * - Performance-optimized with GPU acceleration
 * - Accessibility support (prefers-reduced-motion)
 * - Memory management and cleanup
 * - Stagger animation support
 * - Configurable thresholds and timing
 */
export function useScrollAnimations(
  options: ScrollAnimationOptions = {}
): UseScrollAnimationsReturn {
  const {
    root = null,
    rootMargin = '-10% 0px',
    threshold = [0, 0.25, 0.5, 0.75, 1],
    staggerDelay = 100,
    once = true,
  } = options;

  const [animatedElements] = useState<Set<Element>>(() => new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const animationFrameRef = useRef<number>();
  const _staggerCounterRef = useRef<number>(0);

  // Check for reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  }, []);

  // Animation callback for handling intersection changes
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const isReducedMotion = prefersReducedMotion();
    
    entries.forEach((entry, index) => {
      const { target, isIntersecting, intersectionRatio } = entry;
      
      // Determine if element should animate
      const shouldAnimate = isIntersecting && (
        Array.isArray(threshold) 
          ? intersectionRatio >= Math.max(...threshold.filter(t => t <= 1)) 
          : intersectionRatio >= threshold
      );

      if (shouldAnimate && !animatedElements.has(target)) {
        // Apply GPU-accelerated will-change for performance
        if (target instanceof HTMLElement) {
          target.style.willChange = 'transform, opacity, filter';
        }

        // Add to animated elements set
        animatedElements.add(target);

        if (isReducedMotion) {
          // Immediately show element without animation for accessibility
          if (target instanceof HTMLElement) {
            target.style.transform = 'translate3d(0, 0, 0)';
            target.style.opacity = '1';
            target.style.willChange = 'auto';
          }
        } else {
          // Apply stagger delay for sequential animations
          const delay = staggerDelay * index;
          
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          animationFrameRef.current = requestAnimationFrame(() => {
            setTimeout(() => {
              if (target instanceof HTMLElement && animatedElements.has(target)) {
                // Trigger animation by adding CSS classes or styles
                target.classList.add('animate-in');
                
                // Clean up will-change after animation
                setTimeout(() => {
                  if (target instanceof HTMLElement) {
                    target.style.willChange = 'auto';
                  }
                }, 1000); // Assume 1s max animation duration
              }
            }, delay);
          });
        }

        // Unobserve if animation should only happen once
        if (once && observerRef.current) {
          observerRef.current.unobserve(target);
        }
      }
    });
  }, [animatedElements, threshold, staggerDelay, once, prefersReducedMotion]);

  // Initialize Intersection Observer
  useEffect(() => {
    // Check if IntersectionObserver is available
    if (!window.IntersectionObserver) {
      console.warn('IntersectionObserver is not supported. Animations will be disabled.');
      return;
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });

    // Cleanup function
    const cleanup = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clean up will-change on all animated elements
      animatedElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.willChange = 'auto';
        }
      });
    };

    // Add beforeunload listener for cleanup
    window.addEventListener('beforeunload', cleanup);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [root, rootMargin, threshold, handleIntersection, animatedElements]);

  // Function to observe an element
  const observeElement = useCallback((element: Element | null) => {
    if (!element || !observerRef.current) {
      return;
    }
    
    // Apply initial styles for animation preparation
    if (element instanceof HTMLElement && !prefersReducedMotion()) {
      element.style.opacity = '0';
      element.style.transform = 'translate3d(0, 20px, 0)';
      element.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    observerRef.current.observe(element);
  }, [prefersReducedMotion]);

  // Function to unobserve an element
  const unobserveElement = useCallback((element: Element | null) => {
    if (!element || !observerRef.current) {
      return;
    }
    
    observerRef.current.unobserve(element);
    
    // Clean up styles
    if (element instanceof HTMLElement) {
      element.style.willChange = '';
    }
  }, []);

  // Function to check if element is animated
  const isElementAnimated = useCallback((element: Element | null) => {
    if (!element) {
      return false;
    }
    return animatedElements.has(element);
  }, [animatedElements]);

  return {
    animatedElements,
    isElementAnimated,
    observeElement,
    unobserveElement,
  };
}