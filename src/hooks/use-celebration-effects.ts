/**
 * @fileoverview useCelebrationEffects Hook
 * 
 * Manages celebration effects for booking journey including:
 * - Animation states and timing
 * - Sound effects management
 * - Haptic feedback control
 * - Accessibility compliance
 * - Progress tracking and milestones
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type CelebrationType = 'none' | 'step-complete' | 'milestone' | 'success';

export interface CelebrationEffectsConfig {
  step: number;
  totalSteps: number;
  enableSounds?: boolean;
  enableHaptics?: boolean;
}

export interface CelebrationEffectsState {
  progress: number;
  isAnimating: boolean;
  celebrationType: CelebrationType;
  milestone: number;
  announcement: string;
  prefersReducedMotion: boolean;
  triggerCelebration: (_type: CelebrationType) => void;
  resetCelebration: () => void;
}

/**
 * Custom hook for managing booking celebration effects
 */
export function useCelebrationEffects(
  config: CelebrationEffectsConfig
): CelebrationEffectsState {
  const { step, totalSteps, enableSounds = false, enableHaptics = false } = config;

  // State management
  const [isAnimating, setIsAnimating] = useState(false);
  const [celebrationType, setCelebrationType] = useState<CelebrationType>('none');
  const [announcement, setAnnouncement] = useState('');
  
  // Refs for cleanup
  const timeoutRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  // Calculate progress percentage
  const progress = Math.round((step / totalSteps) * 100);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Determine milestone (50%, 75%, 100%)
  const milestone = progress >= 100 ? 100 : progress >= 75 ? 75 : progress >= 50 ? 50 : 0;

  /**
   * Play sound effect for celebration type
   */
  const playSound = useCallback(async (_type: CelebrationType) => {
    if (!enableSounds) {
      return;
    }

    try {
      const soundMap = {
        'step-complete': '/sounds/step-complete.mp3',
        'milestone': '/sounds/milestone.mp3',
        'success': '/sounds/success.mp3',
        'none': ''
      };

      const soundFile = soundMap[_type];
      if (!soundFile) {
        return;
      }

      audioRef.current = new Audio(soundFile);
      await audioRef.current.play();
    } catch (error) {
      // Gracefully handle sound play errors
      console.warn('Sound failed to play:', error);
    }
  }, [enableSounds]);

  /**
   * Trigger haptic feedback for celebration type
   */
  const triggerHaptics = useCallback((type: CelebrationType) => {
    if (!enableHaptics || !navigator.vibrate) {
      return;
    }

    const vibrationPatterns = {
      'step-complete': [100],
      'milestone': [200, 100, 200],
      'success': [300, 100, 300, 100, 300],
      'none': []
    };

    const pattern = vibrationPatterns[type];
    if (pattern.length > 0) {
      navigator.vibrate(pattern);
    }
  }, [enableHaptics]);

  /**
   * Generate screen reader announcement
   */
  const generateAnnouncement = useCallback((_type: CelebrationType) => {
    switch (_type) {
      case 'step-complete':
        return `Step ${step} completed`;
      case 'milestone':
        return `Milestone reached: ${progress}% complete`;
      case 'success':
        return 'Booking completed successfully!';
      default:
        return '';
    }
  }, [step, progress]);

  /**
   * Trigger celebration with effects
   */
  const triggerCelebration = useCallback((_type: CelebrationType) => {
    setCelebrationType(_type);
    
    if (!prefersReducedMotion) {
      setIsAnimating(true);
    }

    // Generate announcement for screen readers
    const newAnnouncement = generateAnnouncement(_type);
    setAnnouncement(newAnnouncement);

    // Play sound effect
    playSound(_type);

    // Trigger haptic feedback
    triggerHaptics(_type);

    // Reset animation after duration
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 1500); // 1.5 second animation duration

  }, [prefersReducedMotion, generateAnnouncement, playSound, triggerHaptics]);

  /**
   * Reset celebration state
   */
  const resetCelebration = useCallback(() => {
    setCelebrationType('none');
    setIsAnimating(false);
    setAnnouncement('');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return {
    progress,
    isAnimating,
    celebrationType,
    milestone,
    announcement,
    prefersReducedMotion,
    triggerCelebration,
    resetCelebration,
  };
}