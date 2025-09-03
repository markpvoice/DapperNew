import { useEffect, useState, useRef, useCallback } from 'react';

interface ParallaxOptions {
  speed?: number;
  offset?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  enableOnMobile?: boolean;
  rootMargin?: string;
  threshold?: number[];
}

interface UseParallaxReturn {
  ref: React.RefObject<HTMLElement>;
  transform: string;
  isInView: boolean;
}

/**
 * Custom hook for parallax effects with performance optimization
 * Features:
 * - GPU-accelerated transforms
 * - Intersection Observer for performance
 * - Accessibility compliance (prefers-reduced-motion)
 * - Mobile device detection and control
 * - Multiple direction support
 */
export function useParallax(options: ParallaxOptions = {}): UseParallaxReturn {
  const {
    speed = 0.5,
    offset = 0,
    direction = 'up',
    enableOnMobile = false,
    rootMargin = '0px',
    threshold = [0, 0.25, 0.5, 0.75, 1],
  } = options;

  const [scrollY, setScrollY] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [transform, setTransform] = useState('translate3d(0, 0, 0)');
  
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rafRef = useRef<number>();

  // Check for reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  }, []);

  // Check if device is mobile
  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
  }, []);

  // Calculate transform based on scroll position and direction
  const calculateTransform = useCallback((scrollPosition: number, elementTop: number, elementHeight: number) => {
    if (prefersReducedMotion() || (isMobile() && !enableOnMobile)) {
      return 'translate3d(0, 0, 0)';
    }

    const elementCenter = elementTop + elementHeight / 2;
    const windowCenter = window.innerHeight / 2;
    const distanceFromCenter = elementCenter - scrollPosition - windowCenter;
    const parallaxOffset = distanceFromCenter * speed + offset;

    switch (direction) {
      case 'up':
        return `translate3d(0, ${-parallaxOffset}px, 0)`;
      case 'down':
        return `translate3d(0, ${parallaxOffset}px, 0)`;
      case 'left':
        return `translate3d(${-parallaxOffset}px, 0, 0)`;
      case 'right':
        return `translate3d(${parallaxOffset}px, 0, 0)`;
      default:
        return `translate3d(0, ${-parallaxOffset}px, 0)`;
    }
  }, [speed, offset, direction, enableOnMobile, prefersReducedMotion, isMobile]);

  // Scroll event handler with RAF optimization
  const handleScroll = useCallback(() => {
    if (!isInView || !ref.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const scrollPosition = window.pageYOffset;
      setScrollY(scrollPosition);

      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const elementTop = rect.top + scrollPosition;
        const elementHeight = rect.height;
        
        const newTransform = calculateTransform(scrollPosition, elementTop, elementHeight);
        setTransform(newTransform);
      }
    });
  }, [isInView, calculateTransform]);

  // Intersection Observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.target === ref.current) {
        setIsInView(entry.isIntersecting);
        
        if (entry.isIntersecting) {
          // Start listening to scroll when element is in view
          handleScroll();
        }
      }
    });
  }, [handleScroll]);

  // Initialize Intersection Observer
  useEffect(() => {
    if (!ref.current || !window.IntersectionObserver) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    observerRef.current.observe(ref.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, rootMargin, threshold]);

  // Add scroll listener when element is in view
  useEffect(() => {
    if (!isInView) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isInView, handleScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref,
    transform,
    isInView,
  };
}