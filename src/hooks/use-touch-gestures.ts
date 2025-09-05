/**
 * @fileoverview Touch Gestures Hook
 * 
 * Custom React hook for handling touch gestures:
 * - Swipe detection (left, right, up, down)
 * - Pinch-to-zoom gestures
 * - Touch event handling with proper cleanup
 * - Performance optimizations
 */

import { useRef, useCallback, useState, useEffect, useMemo } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface GestureState {
  isSwipping: boolean;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  swipeDistance: number;
  swipeVelocity: number;
  isPinching: boolean;
  pinchScale: number;
  pinchCenter: { x: number; y: number } | null;
}

interface TouchGestureOptions {
  onSwipe?: (_direction: string, _distance: number, _velocity: number) => void;
  onPinch?: (_scale: number, _center: { x: number; y: number }) => void;
  onTouchStart?: (_event: TouchEvent) => void;
  onTouchMove?: (_event: TouchEvent) => void;
  onTouchEnd?: (_event: TouchEvent) => void;
  swipeThreshold?: number;
  pinchThreshold?: number;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  preventDefaultScroll?: boolean;
}

const DEFAULT_OPTIONS: Required<TouchGestureOptions> = {
  onSwipe: () => {},
  onPinch: () => {},
  onTouchStart: () => {},
  onTouchMove: () => {},
  onTouchEnd: () => {},
  swipeThreshold: 50,
  pinchThreshold: 1.1,
  enableSwipe: true,
  enablePinch: true,
  preventDefaultScroll: false
};

export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: TouchGestureOptions = {}
) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  
  const [gestureState, setGestureState] = useState<GestureState>({
    isSwipping: false,
    swipeDirection: null,
    swipeDistance: 0,
    swipeVelocity: 0,
    isPinching: false,
    pinchScale: 1,
    pinchCenter: null
  });

  const touchStartRef = useRef<TouchPoint | null>(null);
  const initialPinchDistanceRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Calculate distance between two points
  const calculateDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate center point between two touches
  const calculateCenter = useCallback((touch1: Touch, touch2: Touch) => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  }), []);

  // Throttled state update for performance
  const updateGestureState = useCallback((newState: Partial<GestureState>) => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    rafIdRef.current = requestAnimationFrame(() => {
      setGestureState(prev => ({ ...prev, ...newState }));
    });
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    const now = Date.now();
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now
    };

    // Handle pinch gesture initialization
    if (opts.enablePinch && event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      initialPinchDistanceRef.current = calculateDistance(touch1, touch2);
      
      updateGestureState({
        isPinching: true,
        pinchCenter: calculateCenter(touch1, touch2),
        pinchScale: 1
      });
    }

    if (opts.preventDefaultScroll) {
      event.preventDefault();
    }

    opts.onTouchStart(event);
  }, [opts, calculateDistance, calculateCenter, updateGestureState]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchStartRef.current) {
      return;
    }

    const now = Date.now();
    const touch = event.touches[0];
    const startTouch = touchStartRef.current;

    // Handle swipe gestures
    if (opts.enableSwipe && event.touches.length === 1) {
      const deltaX = touch.clientX - startTouch.x;
      const deltaY = touch.clientY - startTouch.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      let direction: 'left' | 'right' | 'up' | 'down' | null = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const timeDiff = now - startTouch.timestamp;
      const velocity = timeDiff > 0 ? distance / timeDiff : 0;

      updateGestureState({
        isSwipping: distance > 10,
        swipeDirection: direction,
        swipeDistance: distance,
        swipeVelocity: velocity
      });

      // Trigger swipe callback if threshold is met
      if (distance > opts.swipeThreshold) {
        opts.onSwipe(direction, distance, velocity);
      }
    }

    // Handle pinch gestures
    if (opts.enablePinch && event.touches.length === 2 && initialPinchDistanceRef.current > 0) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = calculateDistance(touch1, touch2);
      const scale = currentDistance / initialPinchDistanceRef.current;
      const center = calculateCenter(touch1, touch2);

      updateGestureState({
        isPinching: true,
        pinchScale: scale,
        pinchCenter: center
      });

      // Trigger pinch callback if threshold is met
      if (Math.abs(scale - 1) > (opts.pinchThreshold - 1)) {
        opts.onPinch(scale, center);
      }
    }

    lastMoveTimeRef.current = now;

    if (opts.preventDefaultScroll) {
      event.preventDefault();
    }

    opts.onTouchMove(event);
  }, [opts, calculateDistance, calculateCenter, updateGestureState]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    // Reset gesture state
    updateGestureState({
      isSwipping: false,
      swipeDirection: null,
      swipeDistance: 0,
      swipeVelocity: 0,
      isPinching: false,
      pinchScale: 1,
      pinchCenter: null
    });

    touchStartRef.current = null;
    initialPinchDistanceRef.current = 0;

    opts.onTouchEnd(event);
  }, [opts, updateGestureState]);

  // Reset gesture state manually
  const resetGesture = useCallback(() => {
    updateGestureState({
      isSwipping: false,
      swipeDirection: null,
      swipeDistance: 0,
      swipeVelocity: 0,
      isPinching: false,
      pinchScale: 1,
      pinchCenter: null
    });
    
    touchStartRef.current = null;
    initialPinchDistanceRef.current = 0;
  }, [updateGestureState]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    // Add event listeners with passive: false for preventDefault support
    element.addEventListener('touchstart', handleTouchStart, { 
      passive: !opts.preventDefaultScroll 
    });
    element.addEventListener('touchmove', handleTouchMove, { 
      passive: !opts.preventDefaultScroll 
    });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      
      // Cancel any pending animation frame
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, opts.preventDefaultScroll]);

  return {
    ...gestureState,
    resetGesture
  };
}