/**
 * @fileoverview Mobile Optimizations Hook
 * 
 * Custom React hook for mobile device optimizations:
 * - Device detection (mobile, tablet, desktop)
 * - Touch capability detection
 * - Viewport and orientation tracking
 * - Adaptive sizing and layout calculations
 * - Performance optimizations for mobile
 */

import React, { useState, useEffect, useCallback } from 'react';

interface TouchCapabilities {
  hasTouch: boolean;
  maxTouchPoints: number;
  hasHover: boolean;
  pointerType: 'coarse' | 'fine' | 'none';
}

interface ViewportInfo {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  aspectRatio: number;
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  devicePixelRatio: number;
}

export interface TouchGesture {
  type: 'swipe' | 'tap' | 'longpress' | 'pinch';
  direction?: 'left' | 'right' | 'up' | 'down';
  velocity?: number;
  distance?: number;
  scale?: number;
}

interface MobileOptimizations {
  // Direct access properties (for component compatibility)
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  hasReducedMotion: boolean;
  
  // Device detection (nested objects for advanced use)
  deviceInfo: DeviceInfo;
  touchCapabilities: TouchCapabilities;
  viewport: ViewportInfo;
  
  // Optimization functions
  optimizeForDevice: (_baseSize: number) => number;
  getOptimalColumns: (_baseColumns?: number) => number;
  getOptimalSpacing: (_baseSpacing?: number) => number;
  shouldUseNativeScrolling: () => boolean;
  supportsHapticFeedback: () => boolean;
  
  // Layout and UX helpers
  getTouchTargetSize: (_priority: 'low' | 'medium' | 'high') => number;
  getModalSize: () => { width: string; height: string };
  getDrawerWidth: () => number;
  
  // Component helper methods
  getMobileClasses: (_baseClasses?: string) => string;
  getMobileInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  triggerHapticFeedback: (_pattern?: 'light' | 'medium' | 'heavy') => void;
  optimizeStepNavigation: (_currentStep: number, _totalSteps: number) => { showProgress: boolean; compactMode: boolean; showStepNumbers: boolean; useHorizontalLayout: boolean };
  
  // Touch event handlers
  handleTouchStart: (_event: TouchEvent) => void;
  handleTouchEnd: (_event: TouchEvent) => void;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
} as const;

const TOUCH_TARGET_SIZES = {
  low: 36,      // Secondary actions
  medium: 44,   // Standard touch targets
  high: 48      // Primary actions
} as const;

export function useMobileOptimizations(): MobileOptimizations {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    devicePixelRatio: 1
  });

  const [touchCapabilities, setTouchCapabilities] = useState<TouchCapabilities>({
    hasTouch: false,
    maxTouchPoints: 0,
    hasHover: true,
    pointerType: 'fine'
  });

  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    orientation: 'landscape',
    aspectRatio: 1
  });

  // Detect device capabilities
  const detectDeviceCapabilities = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Device type detection
    const isMobile = width <= BREAKPOINTS.mobile;
    const isTablet = width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet;
    const isDesktop = width > BREAKPOINTS.tablet;
    
    // OS detection
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    // Touch capabilities
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    let pointerType: 'coarse' | 'fine' | 'none' = 'fine';
    if (window.matchMedia('(pointer: coarse)').matches) {
      pointerType = 'coarse';
    } else if (window.matchMedia('(pointer: none)').matches) {
      pointerType = 'none';
    }

    // Viewport info
    const orientation = width > height ? 'landscape' : 'portrait';
    const aspectRatio = width / height;

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      devicePixelRatio: window.devicePixelRatio || 1
    });

    setTouchCapabilities({
      hasTouch,
      maxTouchPoints,
      hasHover,
      pointerType
    });

    setViewport({
      width,
      height,
      orientation,
      aspectRatio
    });
  }, []);

  // Optimize sizes for device
  const optimizeForDevice = useCallback((baseSize: number): number => {
    const { isMobile, isTablet } = deviceInfo;
    void isTablet; // Suppress unused variable warning
    const { pointerType } = touchCapabilities;
    
    let multiplier = 1;
    
    if (pointerType === 'coarse') {
      // Touch devices need larger targets
      multiplier = isMobile ? 1.25 : 1.1;
    }
    
    const optimizedSize = baseSize * multiplier;
    
    // Ensure minimum touch target size
    if (touchCapabilities.hasTouch) {
      return Math.max(optimizedSize, TOUCH_TARGET_SIZES.medium);
    }
    
    return optimizedSize;
  }, [deviceInfo, touchCapabilities]);

  // Get optimal number of columns for layout
  const getOptimalColumns = useCallback((baseColumns: number = 4): number => {
    const { isMobile, isTablet } = deviceInfo;
    const { orientation } = viewport;
    
    if (isMobile) {
      return orientation === 'landscape' ? 2 : 1;
    }
    
    if (isTablet) {
      return orientation === 'landscape' ? Math.min(baseColumns, 3) : 2;
    }
    
    return baseColumns;
  }, [deviceInfo, viewport]);

  // Get optimal spacing for device
  const getOptimalSpacing = useCallback((baseSpacing: number = 16): number => {
    const { isMobile } = deviceInfo;
    
    if (isMobile) {
      // Tighter spacing on mobile to maximize content
      return Math.max(baseSpacing * 0.75, 8);
    }
    
    return baseSpacing;
  }, [deviceInfo]);

  // Determine if native scrolling should be used
  const shouldUseNativeScrolling = useCallback((): boolean => {
    const { isIOS } = deviceInfo;
    const { hasTouch } = touchCapabilities;
    
    // iOS and touch devices benefit from native scrolling
    return isIOS || hasTouch;
  }, [deviceInfo, touchCapabilities]);

  // Check haptic feedback support
  const supportsHapticFeedback = useCallback((): boolean => {
    const { isIOS, isAndroid } = deviceInfo;
    
    // Check for vibration API
    const hasVibration = 'vibrate' in navigator;
    
    // iOS has haptic feedback, Android has vibration
    return (isIOS && hasVibration) || (isAndroid && hasVibration);
  }, [deviceInfo]);

  // Get appropriate touch target size
  const getTouchTargetSize = useCallback((priority: 'low' | 'medium' | 'high'): number => {
    const baseSize = TOUCH_TARGET_SIZES[priority];
    return optimizeForDevice(baseSize);
  }, [optimizeForDevice]);

  // Get optimal modal size
  const getModalSize = useCallback((): { width: string; height: string } => {
    const { isMobile } = deviceInfo;
    
    if (isMobile) {
      // Full screen on mobile
      return { width: '100vw', height: '100vh' };
    }
    
    // Centered modal on larger screens
    return { width: 'auto', height: 'auto' };
  }, [deviceInfo]);

  // Get optimal drawer width
  const getDrawerWidth = useCallback((): number => {
    const { width } = viewport;
    const { isMobile } = deviceInfo;
    
    if (isMobile) {
      // Take most of the screen on mobile, but leave some space for backdrop
      return Math.min(width * 0.85, 320);
    }
    
    // Fixed width on larger screens
    return 280;
  }, [viewport, deviceInfo]);

  // Check reduced motion preference
  const hasReducedMotion = useCallback((): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Generate mobile-optimized CSS classes
  const getMobileClasses = useCallback((_baseClasses: string = ''): string => {
    const { isMobile } = deviceInfo;
    const { hasTouch } = touchCapabilities;
    
    let mobileClasses = baseClasses;
    
    if (isMobile) {
      mobileClasses += ' mobile-optimized';
    }
    
    if (hasTouch) {
      mobileClasses += ' touch-optimized min-h-[44px] min-w-[44px]';
    }
    
    return mobileClasses.trim();
  }, [deviceInfo, touchCapabilities]);

  // Generate mobile input properties
  const getMobileInputProps = useCallback((): React.InputHTMLAttributes<HTMLInputElement> => {
    const { isMobile, isIOS } = deviceInfo;
    
    if (!isMobile) {
      return {};
    }
    
    return {
      inputMode: 'text' as const,
      autoComplete: 'off',
      autoCapitalize: isIOS ? 'words' : 'none',
      autoCorrect: isIOS ? 'on' : 'off',
    };
  }, [deviceInfo]);

  // Trigger haptic feedback
  const triggerHapticFeedback = useCallback((_pattern: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) {
      return;
    }
    
    const vibrationPatterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    };
    
    navigator.vibrate(vibrationPatterns[pattern]);
  }, []);

  // Optimize step navigation for mobile
  const optimizeStepNavigation = useCallback((currentStep: number, totalSteps: number) => {
    const { isMobile } = deviceInfo;
    const { width } = viewport;
    
    return {
      showProgress: true,
      compactMode: isMobile && width < 380,
      showStepNumbers: !isMobile || totalSteps <= 5,
      useHorizontalLayout: !isMobile && width > 768
    };
  }, [deviceInfo, viewport]);

  // Touch event handlers (basic implementations)
  const handleTouchStart = useCallback((event: TouchEvent) => {
    // Basic touch start handling - can be extended per component needs
    const touch = event.touches[0];
    if (touch && event.currentTarget && 'setAttribute' in event.currentTarget) {
      // Store initial touch position for gesture detection
      (event.currentTarget as HTMLElement).setAttribute('data-touch-start-x', touch.clientX.toString());
      (event.currentTarget as HTMLElement).setAttribute('data-touch-start-y', touch.clientY.toString());
    }
  }, []);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    // Basic touch end handling - can be extended per component needs
    if (event.currentTarget && 'removeAttribute' in event.currentTarget) {
      (event.currentTarget as HTMLElement).removeAttribute('data-touch-start-x');
      (event.currentTarget as HTMLElement).removeAttribute('data-touch-start-y');
    }
  }, []);

  // Set up event listeners for device changes
  useEffect(() => {
    detectDeviceCapabilities();

    const handleResize = () => {
      detectDeviceCapabilities();
    };

    const handleOrientationChange = () => {
      // Small delay to allow viewport to settle
      setTimeout(detectDeviceCapabilities, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Listen for changes in hover/pointer capabilities
    const mediaQueries = [
      window.matchMedia('(hover: hover)'),
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(pointer: none)')
    ];

    const handleMediaQueryChange = () => {
      detectDeviceCapabilities();
    };

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleMediaQueryChange);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleMediaQueryChange);
      });
    };
  }, [detectDeviceCapabilities]);

  return {
    // Direct access properties (for component compatibility)
    isMobile: deviceInfo.isMobile,
    isTablet: deviceInfo.isTablet,
    isDesktop: deviceInfo.isDesktop,
    isTouch: touchCapabilities.hasTouch,
    hasReducedMotion: hasReducedMotion(),
    
    // Device detection (nested objects for advanced use)
    deviceInfo,
    touchCapabilities,
    viewport,
    
    // Optimization functions
    optimizeForDevice,
    getOptimalColumns,
    getOptimalSpacing,
    shouldUseNativeScrolling,
    supportsHapticFeedback,
    
    // Layout and UX helpers
    getTouchTargetSize,
    getModalSize,
    getDrawerWidth,
    
    // Component helper methods
    getMobileClasses,
    getMobileInputProps,
    triggerHapticFeedback,
    optimizeStepNavigation,
    
    // Touch event handlers
    handleTouchStart,
    handleTouchEnd
  };
}