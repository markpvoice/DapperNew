/**
 * Mobile Optimizations Hook
 * 
 * Provides mobile-specific functionality including:
 * - Device detection and touch support
 * - Viewport management
 * - Touch target compliance
 * - Haptic feedback
 * - Mobile keyboard optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MobileOptimizationState {
  isMobile: boolean;
  isTouch: boolean;
  viewportWidth: number;
  viewportHeight: number;
  hasReducedMotion: boolean;
  supportsVibration: boolean;
  isPortrait: boolean;
  devicePixelRatio: number;
}

export interface TouchGesture {
  type: 'tap' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'pinch';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  duration: number;
  velocity: number;
}

export const useMobileOptimizations = () => {
  const [state, setState] = useState<MobileOptimizationState>(() => ({
    isMobile: false,
    isTouch: false,
    viewportWidth: 0,
    viewportHeight: 0,
    hasReducedMotion: false,
    supportsVibration: false,
    isPortrait: true,
    devicePixelRatio: 1
  }));

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Initialize mobile state
  useEffect(() => {
    const updateMobileState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        isMobile: width <= 768,
        isTouch: navigator.maxTouchPoints > 0 || 'ontouchstart' in window,
        viewportWidth: width,
        viewportHeight: height,
        hasReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        supportsVibration: 'vibrate' in navigator,
        isPortrait: height > width,
        devicePixelRatio: window.devicePixelRatio || 1
      });
    };

    updateMobileState();

    const handleResize = () => updateMobileState();
    const handleOrientationChange = () => {
      setTimeout(updateMobileState, 100); // Delay for accurate dimensions
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Haptic feedback function
  const triggerHapticFeedback = useCallback((pattern: number | number[] = 50) => {
    if (state.supportsVibration && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [state.supportsVibration]);

  // Touch gesture detection
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent, onGesture?: (_gesture: TouchGesture) => void) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) {
      return;
    }

    const touch = e.changedTouches[0];
    const endTime = Date.now();
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const duration = endTime - touchStartRef.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;

    let gestureType: TouchGesture['type'] = 'tap';

    // Determine gesture type
    if (distance > 50) { // Minimum distance for swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        gestureType = deltaX > 0 ? 'swipe-right' : 'swipe-left';
      } else {
        gestureType = deltaY > 0 ? 'swipe-down' : 'swipe-up';
      }
    }

    const gesture: TouchGesture = {
      type: gestureType,
      startX: touchStartRef.current.x,
      startY: touchStartRef.current.y,
      endX: touch.clientX,
      endY: touch.clientY,
      deltaX,
      deltaY,
      duration,
      velocity
    };

    if (onGesture) {
      onGesture(gesture);
    }
    touchStartRef.current = null;
  }, []);

  // Get mobile-optimized CSS classes
  const getMobileClasses = useCallback((config: {
    touchTarget?: boolean;
    thumbReach?: boolean;
    spaced?: boolean;
    mobileFirst?: boolean;
  } = {}) => {
    const classes: string[] = [];

    if (config.touchTarget && state.isMobile) {
      classes.push('min-h-[44px]', 'min-w-[44px]', 'touch-manipulation');
    }

    if (config.thumbReach && state.isMobile) {
      classes.push('mb-safe-bottom'); // For devices with safe areas
    }

    if (config.spaced && state.isMobile) {
      classes.push('gap-2', 'sm:gap-4');
    }

    if (config.mobileFirst) {
      classes.push('w-full', 'sm:w-auto');
    }

    return classes.join(' ');
  }, [state.isMobile]);

  // Get mobile-optimized input attributes
  const getMobileInputProps = useCallback((type: 'email' | 'tel' | 'text' | 'number' | 'url') => {
    const props: Record<string, string> = {};

    switch (type) {
      case 'email':
        props.inputMode = 'email';
        props.autoCapitalize = 'none';
        props.autoCorrect = 'off';
        break;
      case 'tel':
        props.inputMode = 'tel';
        props.autoCapitalize = 'none';
        props.autoCorrect = 'off';
        break;
      case 'number':
        props.inputMode = 'numeric';
        break;
      case 'url':
        props.inputMode = 'url';
        props.autoCapitalize = 'none';
        props.autoCorrect = 'off';
        break;
      default:
        props.inputMode = 'text';
    }

    return props;
  }, []);

  // Check if element is in thumb-friendly zone
  const isInThumbZone = useCallback((element: Element | null) => {
    if (!element || !state.isMobile) {
      return true;
    }

    const rect = element.getBoundingClientRect();
    const thumbZoneStart = state.viewportHeight * 0.6; // Bottom 40% is thumb-friendly
    
    return rect.top >= thumbZoneStart;
  }, [state.isMobile, state.viewportHeight]);

  // Optimize form step navigation for mobile
  const optimizeStepNavigation = useCallback(() => {
    if (!state.isMobile) {
      return {};
    }

    return {
      containerProps: {
        className: 'touch-manipulation',
        style: { touchAction: 'manipulation' }
      },
      buttonProps: {
        className: getMobileClasses({ touchTarget: true, thumbReach: true, mobileFirst: true }),
        style: { 
          minHeight: '48px',
          fontSize: '16px' // Prevent zoom on iOS
        }
      }
    };
  }, [state.isMobile, getMobileClasses]);

  return {
    state,
    triggerHapticFeedback,
    handleTouchStart,
    handleTouchEnd,
    getMobileClasses,
    getMobileInputProps,
    isInThumbZone,
    optimizeStepNavigation,
    
    // Utility functions
    isMobile: state.isMobile,
    isTouch: state.isTouch,
    hasReducedMotion: state.hasReducedMotion
  };
};