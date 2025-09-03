/**
 * useTouchGestures Hook
 * React hook for managing touch gestures and mobile interactions
 * TDD GREEN Phase: Minimal implementation to make tests pass
 */

import { useState, useCallback } from 'react';

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startTime: number;
  currentTime?: number;
}

export type GestureType = 'tap' | 'long-press' | 'swipe' | 'drag' | null;

export interface UseTouchGesturesReturn {
  isTouch: boolean;
  touches: TouchPoint[];
  gestureType: GestureType;
  startTouch: (_touch: TouchPoint) => void;
  updateTouch: (_touch: Partial<TouchPoint> & { id: number }) => void;
  endTouch: (_touchId: number) => void;
  detectGesture: (_pattern: { duration: number; distance: number }) => GestureType;
  clearGesture: () => void;
}

/**
 * Hook for managing touch gestures and recognition
 */
export function useTouchGestures(): UseTouchGesturesReturn {
  const [isTouch, setIsTouch] = useState(false);
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [gestureType, setGestureType] = useState<GestureType>(null);

  // Start a new touch
  const startTouch = useCallback((touch: TouchPoint) => {
    setIsTouch(true);
    setTouches(current => {
      // Remove existing touch with same ID and add new one
      const filtered = current.filter(t => t.id !== touch.id);
      return [...filtered, touch];
    });

    // Auto-detect gesture type based on initial touch
    setGestureType('tap'); // Default assumption
  }, []);

  // Update existing touch
  const updateTouch = useCallback((touchUpdate: Partial<TouchPoint> & { id: number }) => {
    setTouches(current => 
      current.map(touch => 
        touch.id === touchUpdate.id 
          ? { ...touch, ...touchUpdate }
          : touch
      )
    );

    // Update gesture type based on touch movement
    const touch = touches.find(t => t.id === touchUpdate.id);
    if (touch && touchUpdate.x && touchUpdate.y) {
      const distance = Math.sqrt(
        Math.pow(touchUpdate.x - touch.x, 2) + 
        Math.pow(touchUpdate.y - touch.y, 2)
      );
      
      const duration = (touchUpdate.currentTime || Date.now()) - touch.startTime;
      
      if (distance > 50) {
        setGestureType('drag');
      } else if (duration > 800) {
        setGestureType('long-press');
      }
    }
  }, [touches]);

  // End a touch
  const endTouch = useCallback((touchId: number) => {
    setTouches(current => {
      const filtered = current.filter(t => t.id !== touchId);
      
      // If no touches remaining, clear touch state
      if (filtered.length === 0) {
        setIsTouch(false);
      }
      
      return filtered;
    });
  }, []);

  // Detect gesture type from pattern
  const detectGesture = useCallback((pattern: { duration: number; distance: number }): GestureType => {
    const { duration, distance } = pattern;

    if (duration < 200 && distance < 10) {
      setGestureType('tap');
      return 'tap';
    }
    
    if (duration > 800 && distance < 10) {
      setGestureType('long-press');
      return 'long-press';
    }
    
    if (distance > 50) {
      setGestureType('swipe');
      return 'swipe';
    }
    
    setGestureType('drag');
    return 'drag';
  }, []);

  // Clear current gesture
  const clearGesture = useCallback(() => {
    setGestureType(null);
    setTouches([]);
    setIsTouch(false);
  }, []);

  return {
    isTouch,
    touches,
    gestureType,
    startTouch,
    updateTouch,
    endTouch,
    detectGesture,
    clearGesture
  };
}