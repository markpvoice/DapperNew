/**
 * @fileoverview Advanced Gestures Hook
 * 
 * Enhanced mobile gesture recognition system with:
 * - Advanced swipe gestures (left/right/up/down with velocity-based behaviors)
 * - Edge swipe navigation for back/forward navigation
 * - Multi-touch gesture recognition (pinch-to-zoom, long press)
 * - Velocity-based interactions with customizable thresholds
 * - Haptic feedback integration with touch vibrations
 * - Performance optimizations and memory management
 */

import { useRef, useCallback, useState, useEffect, useMemo } from 'react';

// Enhanced touch point interface
interface EnhancedTouchPoint {
  x: number;
  y: number;
  timestamp: number;
  identifier: number;
}

// Advanced gesture state interface
interface AdvancedGestureState {
  // Swipe gesture state
  swipeState: {
    direction: 'left' | 'right' | 'up' | 'down' | null;
    velocity: number;
    distance: number;
    isActive: boolean;
    isEdgeSwipe: boolean;
  };
  
  // Pinch gesture state
  pinchState: {
    scale: number;
    center: { x: number; y: number } | null;
    isActive: boolean;
    velocity: number;
  };
  
  // Long press state
  longPressState: {
    isActive: boolean;
    duration: number;
    point: { x: number; y: number } | null;
  };
  
  // General touch state
  touchState: {
    touchCount: number;
    isMultiTouch: boolean;
    primaryTouch: EnhancedTouchPoint | null;
  };
}

// Velocity thresholds configuration
interface VelocityThresholds {
  slow: number;
  medium: number;
  fast: number;
}

// Haptic feedback patterns
interface HapticPatterns {
  light: number[];
  medium: number[];
  heavy: number[];
}

// Advanced gesture options
interface AdvancedGestureOptions {
  // Gesture callbacks
  onSwipe?: (_direction: string, _distance: number, _velocity: number, _isEdgeSwipe: boolean) => void;
  onPinch?: (_scale: number, _center: { x: number; y: number }, _velocity: number) => void;
  onLongPress?: (_point: { x: number; y: number }, _duration: number) => void;
  onTouchStart?: (_event: TouchEvent) => void;
  onTouchMove?: (_event: TouchEvent) => void;
  onTouchEnd?: (_event: TouchEvent) => void;
  
  // Gesture configuration
  swipeThreshold?: number;
  pinchThreshold?: number;
  longPressDuration?: number;
  edgeSwipeWidth?: number;
  
  // Velocity configuration
  velocityThresholds?: Partial<VelocityThresholds>;
  
  // Feature toggles
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableLongPress?: boolean;
  enableEdgeSwipe?: boolean;
  respectScrollableAreas?: boolean;
  
  // Haptic feedback
  hapticFeedback?: {
    enabled: boolean;
    patterns?: Partial<HapticPatterns>;
  };
  
  // Performance options
  throttleMs?: number;
  maxTouchHistory?: number;
  preventDefaultScroll?: boolean;
}

// Default configuration
const DEFAULT_OPTIONS: Required<AdvancedGestureOptions> = {
  onSwipe: () => {},
  onPinch: () => {},
  onLongPress: () => {},
  onTouchStart: () => {},
  onTouchMove: () => {},
  onTouchEnd: () => {},
  
  swipeThreshold: 50,
  pinchThreshold: 1.1,
  longPressDuration: 500,
  edgeSwipeWidth: 20,
  
  velocityThresholds: {
    slow: 0.3,
    medium: 0.5,
    fast: 0.8
  },
  
  enableSwipe: true,
  enablePinch: true,
  enableLongPress: true,
  enableEdgeSwipe: true,
  respectScrollableAreas: true,
  
  hapticFeedback: {
    enabled: true,
    patterns: {
      light: [10],
      medium: [50],
      heavy: [100, 50, 100]
    }
  },
  
  throttleMs: 16, // 60fps
  maxTouchHistory: 10,
  preventDefaultScroll: false
};

export function useAdvancedGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: AdvancedGestureOptions = {}
) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  
  // Enhanced gesture state
  const [gestureState, setGestureState] = useState<AdvancedGestureState>({
    swipeState: {
      direction: null,
      velocity: 0,
      distance: 0,
      isActive: false,
      isEdgeSwipe: false
    },
    pinchState: {
      scale: 1,
      center: null,
      isActive: false,
      velocity: 0
    },
    longPressState: {
      isActive: false,
      duration: 0,
      point: null
    },
    touchState: {
      touchCount: 0,
      isMultiTouch: false,
      primaryTouch: null
    }
  });

  // Touch tracking refs
  const touchHistoryRef = useRef<EnhancedTouchPoint[]>([]);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistanceRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Haptic feedback utility
  const triggerHapticFeedback = useCallback((type: keyof HapticPatterns) => {
    if (!opts.hapticFeedback.enabled || !('vibrate' in navigator)) {
      return;
    }
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const pattern = opts.hapticFeedback.patterns?.[type] || DEFAULT_OPTIONS.hapticFeedback.patterns[type];
    navigator.vibrate(pattern);
  }, [opts.hapticFeedback]);

  // Velocity calculation utility
  const calculateVelocity = useCallback((startPoint: EnhancedTouchPoint, endPoint: EnhancedTouchPoint) => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeDiff = endPoint.timestamp - startPoint.timestamp;
    
    return timeDiff > 0 ? distance / timeDiff : 0;
  }, []);

  // Edge detection utility
  const isEdgeSwipe = useCallback((startPoint: EnhancedTouchPoint, direction: string) => {
    if (!opts.enableEdgeSwipe) {
      return false;
    }
    
    const element = elementRef.current;
    if (!element) {
      return false;
    }
    
    const rect = element.getBoundingClientRect();
    const edgeWidth = opts.edgeSwipeWidth;
    
    // Left edge swipe (for back navigation)
    if (direction === 'right' && startPoint.x - rect.left < edgeWidth) {
      return true;
    }
    
    // Right edge swipe (for forward navigation)
    if (direction === 'left' && rect.right - startPoint.x < edgeWidth) {
      return true;
    }
    
    return false;
  }, [elementRef, opts.enableEdgeSwipe, opts.edgeSwipeWidth]);

  // Distance calculation for multi-touch
  const calculateDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Center point calculation for multi-touch
  const calculateCenter = useCallback((touch1: Touch, touch2: Touch) => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  }), []);

  // Throttled state update for performance
  const updateGestureState = useCallback((newState: Partial<AdvancedGestureState>) => {
    const now = performance.now();
    
    // Throttle updates for performance
    if (now - lastUpdateTimeRef.current < opts.throttleMs) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      rafIdRef.current = requestAnimationFrame(() => {
        setGestureState(prev => ({ ...prev, ...newState }));
        lastUpdateTimeRef.current = now;
      });
    } else {
      setGestureState(prev => ({ ...prev, ...newState }));
      lastUpdateTimeRef.current = now;
    }
  }, [opts.throttleMs]);

  // Touch start handler
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const now = performance.now();
    const touches = Array.from(event.touches);
    const primaryTouch = touches[0];
    
    if (!primaryTouch) {
      return;
    }

    // Create enhanced touch point
    const touchPoint: EnhancedTouchPoint = {
      x: primaryTouch.clientX,
      y: primaryTouch.clientY,
      timestamp: now,
      identifier: primaryTouch.identifier
    };

    // Update touch history (with size limit)
    touchHistoryRef.current = [...touchHistoryRef.current, touchPoint].slice(-opts.maxTouchHistory);

    // Update touch state
    updateGestureState({
      touchState: {
        touchCount: touches.length,
        isMultiTouch: touches.length > 1,
        primaryTouch: touchPoint
      }
    });

    // Handle multi-touch pinch initialization
    if (opts.enablePinch && touches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      initialPinchDistanceRef.current = calculateDistance(touch1, touch2);
      
      updateGestureState({
        pinchState: {
          scale: 1,
          center: calculateCenter(touch1, touch2),
          isActive: true,
          velocity: 0
        }
      });
      
      triggerHapticFeedback('light');
    }

    // Handle long press initialization
    if (opts.enableLongPress && touches.length === 1) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      
      longPressTimerRef.current = setTimeout(() => {
        updateGestureState({
          longPressState: {
            isActive: true,
            duration: opts.longPressDuration,
            point: { x: touchPoint.x, y: touchPoint.y }
          }
        });
        
        triggerHapticFeedback('medium');
        opts.onLongPress({ x: touchPoint.x, y: touchPoint.y }, opts.longPressDuration);
      }, opts.longPressDuration);
    }

    if (opts.preventDefaultScroll) {
      event.preventDefault();
    }

    opts.onTouchStart(event);
  }, [opts, updateGestureState, calculateDistance, calculateCenter, triggerHapticFeedback]);

  // Touch move handler
  const handleTouchMove = useCallback((event: TouchEvent) => {
    const touches = Array.from(event.touches);
    const now = performance.now();
    
    if (touches.length === 0 || touchHistoryRef.current.length === 0) {
      return;
    }

    const currentTouch = touches[0];
    const startTouch = touchHistoryRef.current[0];
    
    // Cancel long press on movement
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      
      updateGestureState({
        longPressState: {
          isActive: false,
          duration: 0,
          point: null
        }
      });
    }

    // Handle single-touch swipe gestures
    if (opts.enableSwipe && touches.length === 1) {
      const deltaX = currentTouch.clientX - startTouch.x;
      const deltaY = currentTouch.clientY - startTouch.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      let direction: 'left' | 'right' | 'up' | 'down' | null = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const currentTouchPoint: EnhancedTouchPoint = {
        x: currentTouch.clientX,
        y: currentTouch.clientY,
        timestamp: now,
        identifier: currentTouch.identifier
      };

      const velocity = calculateVelocity(startTouch, currentTouchPoint);
      const edgeSwipe = isEdgeSwipe(startTouch, direction);

      updateGestureState({
        swipeState: {
          direction,
          velocity,
          distance,
          isActive: distance > 10,
          isEdgeSwipe: edgeSwipe
        }
      });

      // Trigger swipe callback if threshold is met
      if (distance > opts.swipeThreshold) {
        // Determine haptic intensity based on velocity
        if (velocity > opts.velocityThresholds.fast) {
          triggerHapticFeedback('heavy');
        } else if (velocity > opts.velocityThresholds.medium) {
          triggerHapticFeedback('medium');
        } else if (velocity > opts.velocityThresholds.slow) {
          triggerHapticFeedback('light');
        }
        
        opts.onSwipe(direction, distance, velocity, edgeSwipe);
      }
    }

    // Handle multi-touch pinch gestures
    if (opts.enablePinch && touches.length === 2 && initialPinchDistanceRef.current > 0) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const currentDistance = calculateDistance(touch1, touch2);
      const scale = currentDistance / initialPinchDistanceRef.current;
      const center = calculateCenter(touch1, touch2);
      
      // Calculate pinch velocity (change in scale over time)
      const lastPinchTime = touchHistoryRef.current[touchHistoryRef.current.length - 1]?.timestamp || now;
      const timeDiff = now - lastPinchTime;
      const scaleVelocity = timeDiff > 0 ? Math.abs(scale - 1) / (timeDiff / 1000) : 0;

      updateGestureState({
        pinchState: {
          scale,
          center,
          isActive: true,
          velocity: scaleVelocity
        }
      });

      // Trigger pinch callback if threshold is met
      if (Math.abs(scale - 1) > (opts.pinchThreshold - 1)) {
        opts.onPinch(scale, center, scaleVelocity);
      }
    }

    if (opts.preventDefaultScroll) {
      event.preventDefault();
    }

    opts.onTouchMove(event);
  }, [opts, updateGestureState, calculateVelocity, isEdgeSwipe, calculateDistance, calculateCenter, triggerHapticFeedback]);

  // Touch end handler
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Reset gesture states
    updateGestureState({
      swipeState: {
        direction: null,
        velocity: 0,
        distance: 0,
        isActive: false,
        isEdgeSwipe: false
      },
      pinchState: {
        scale: 1,
        center: null,
        isActive: false,
        velocity: 0
      },
      longPressState: {
        isActive: false,
        duration: 0,
        point: null
      },
      touchState: {
        touchCount: event.touches.length,
        isMultiTouch: event.touches.length > 1,
        primaryTouch: null
      }
    });

    // Clear touch history
    touchHistoryRef.current = [];
    initialPinchDistanceRef.current = 0;

    opts.onTouchEnd(event);
  }, [opts, updateGestureState]);

  // Reset gesture state manually
  const resetGestures = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    updateGestureState({
      swipeState: {
        direction: null,
        velocity: 0,
        distance: 0,
        isActive: false,
        isEdgeSwipe: false
      },
      pinchState: {
        scale: 1,
        center: null,
        isActive: false,
        velocity: 0
      },
      longPressState: {
        isActive: false,
        duration: 0,
        point: null
      },
      touchState: {
        touchCount: 0,
        isMultiTouch: false,
        primaryTouch: null
      }
    });

    touchHistoryRef.current = [];
    initialPinchDistanceRef.current = 0;
  }, [updateGestureState]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    // Add event listeners
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
      
      // Clean up timers and animation frames
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, opts.preventDefaultScroll]);

  // Return enhanced gesture state and utilities
  return {
    ...gestureState,
    resetGestures,
    
    // Utility methods
    isGestureActive: gestureState.swipeState.isActive || gestureState.pinchState.isActive || gestureState.longPressState.isActive,
    isDualTouch: gestureState.touchState.touchCount === 2,
    isMultiTouch: gestureState.touchState.isMultiTouch,
    
    // Velocity helpers
    isSlowGesture: gestureState.swipeState.velocity > 0 && gestureState.swipeState.velocity <= opts.velocityThresholds.slow,
    isMediumGesture: gestureState.swipeState.velocity > opts.velocityThresholds.slow && gestureState.swipeState.velocity <= opts.velocityThresholds.medium,
    isFastGesture: gestureState.swipeState.velocity > opts.velocityThresholds.medium,
    
    // Gesture type helpers
    isHorizontalSwipe: ['left', 'right'].includes(gestureState.swipeState.direction || ''),
    isVerticalSwipe: ['up', 'down'].includes(gestureState.swipeState.direction || ''),
    isEdgeSwipe: gestureState.swipeState.isEdgeSwipe,
    
    // Manual trigger methods (for testing and programmatic control)
    triggerHapticFeedback
  };
}