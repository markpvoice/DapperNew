/**
 * @fileoverview Pull-to-Refresh Component
 * 
 * Native-like pull-to-refresh functionality with:
 * - Elastic resistance when pulling beyond threshold
 * - Visual feedback with dynamic opacity and rotation
 * - Smooth animations and haptic feedback
 * - Integration with existing scroll behavior
 * - Loading states and success/error feedback
 */

'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useAdvancedGestures } from '@/hooks/use-advanced-gestures';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  refreshThreshold?: number;
  maxPullDistance?: number;
  resistance?: number;
  isRefreshing?: boolean;
  disabled?: boolean;
  className?: string;
  
  // Visual customization
  indicatorColor?: string;
  backgroundColor?: string;
  spinnerSize?: number;
  
  // Behavior options
  hapticFeedback?: boolean;
  showSuccessIcon?: boolean;
  successDuration?: number;
  
  // Event handlers
  onPullStart?: () => void;
  onPullProgress?: (_progress: number) => void;
  onPullEnd?: () => void;
}

interface PullState {
  isPulling: boolean;
  pullDistance: number;
  pullProgress: number; // 0-1 normalized progress
  canRefresh: boolean;
  isReleased: boolean;
  showSuccess: boolean;
  showError: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  refreshThreshold = 70,
  maxPullDistance = 120,
  resistance = 0.5,
  isRefreshing = false,
  disabled = false,
  className = '',
  indicatorColor = '#666',
  backgroundColor = '#f9f9f9',
  spinnerSize = 20,
  hapticFeedback = true,
  showSuccessIcon = true,
  successDuration = 1000,
  onPullStart,
  onPullProgress,
  onPullEnd
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startScrollTopRef = useRef<number>(0);
  const pullStartYRef = useRef<number>(0);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [pullState, setPullState] = useState<PullState>({
    isPulling: false,
    pullDistance: 0,
    pullProgress: 0,
    canRefresh: false,
    isReleased: false,
    showSuccess: false,
    showError: false
  });

  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const finalRefreshing = isRefreshing || internalRefreshing;

  // Calculate pull progress and apply resistance
  const calculatePullDistance = useCallback((rawDistance: number) => {
    if (rawDistance <= 0) {
      return 0;
    }
    
    // Apply elastic resistance
    let adjustedDistance = rawDistance;
    if (rawDistance > refreshThreshold) {
      const excessDistance = rawDistance - refreshThreshold;
      adjustedDistance = refreshThreshold + (excessDistance * resistance);
    }
    
    return Math.min(adjustedDistance, maxPullDistance);
  }, [refreshThreshold, resistance, maxPullDistance]);

  // Check if we're at the top of scrollable content
  const isAtTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return false;
    }
    
    return container.scrollTop <= 0;
  }, []);

  // Handle refresh execution
  const executeRefresh = useCallback(async () => {
    if (disabled || finalRefreshing) {
      return;
    }
    
    try {
      setInternalRefreshing(true);
      await onRefresh();
      
      if (showSuccessIcon) {
        setPullState(prev => ({ ...prev, showSuccess: true }));
        successTimerRef.current = setTimeout(() => {
          setPullState(prev => ({ ...prev, showSuccess: false }));
        }, successDuration);
      }
    } catch (error) {
      setPullState(prev => ({ ...prev, showError: true }));
      setTimeout(() => {
        setPullState(prev => ({ ...prev, showError: false }));
      }, successDuration);
    } finally {
      setInternalRefreshing(false);
    }
  }, [disabled, finalRefreshing, onRefresh, showSuccessIcon, successDuration]);

  // Advanced gesture handling
  const {
    swipeState: _swipeState,
    isVerticalSwipe: _isVerticalSwipe,
    triggerHapticFeedback
  } = useAdvancedGestures(containerRef, {
    enableSwipe: true,
    enablePinch: false,
    enableLongPress: false,
    enableEdgeSwipe: false,
    respectScrollableAreas: true,
    hapticFeedback: { enabled: hapticFeedback },
    
    onTouchStart: (event) => {
      if (disabled || finalRefreshing) {
        return;
      }
      
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      
      if (isAtTop()) {
        startScrollTopRef.current = containerRef.current?.scrollTop || 0;
        pullStartYRef.current = touch.clientY;
        
        setPullState(prev => ({
          ...prev,
          isPulling: false,
          isReleased: false
        }));
      }
    },
    
    onTouchMove: (event) => {
      if (disabled || finalRefreshing) {
        return;
      }
      
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      
      const currentY = touch.clientY;
      const deltaY = currentY - pullStartYRef.current;
      
      // Only handle downward pulls when at top
      if (deltaY > 0 && isAtTop() && startScrollTopRef.current <= 0) {
        const rawPullDistance = deltaY;
        const adjustedPullDistance = calculatePullDistance(rawPullDistance);
        const progress = Math.min(adjustedPullDistance / refreshThreshold, 1);
        const canRefresh = adjustedPullDistance >= refreshThreshold;
        
        setPullState(prev => ({
          ...prev,
          isPulling: true,
          pullDistance: adjustedPullDistance,
          pullProgress: progress,
          canRefresh
        }));
        
        // Haptic feedback at threshold
        if (canRefresh && !pullState.canRefresh && hapticFeedback) {
          triggerHapticFeedback('medium');
        }
        
        onPullProgress?.(progress);
        
        // Prevent default scroll behavior when pulling
        event.preventDefault();
      }
    },
    
    onTouchEnd: () => {
      if (disabled || finalRefreshing || !pullState.isPulling) {
        return;
      }
      
      const { canRefresh } = pullState;
      
      setPullState(prev => ({
        ...prev,
        isPulling: false,
        isReleased: true
      }));
      
      if (canRefresh) {
        executeRefresh();
        if (hapticFeedback) {
          triggerHapticFeedback('heavy');
        }
      } else {
        // Animate back to original position
        setPullState(prev => ({
          ...prev,
          pullDistance: 0,
          pullProgress: 0,
          canRefresh: false,
          isReleased: false
        }));
      }
      
      onPullEnd?.();
    }
  });

  // Handle pull start
  useEffect(() => {
    if (pullState.isPulling && !pullState.isReleased && onPullStart) {
      onPullStart();
    }
  }, [pullState.isPulling, pullState.isReleased, onPullStart]);

  // Animate back to original position after refresh
  useEffect(() => {
    if (!finalRefreshing && pullState.isReleased) {
      const timer = setTimeout(() => {
        setPullState(prev => ({
          ...prev,
          pullDistance: 0,
          pullProgress: 0,
          canRefresh: false,
          isReleased: false
        }));
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [finalRefreshing, pullState.isReleased]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // Calculate transform values
  const indicatorOpacity = pullState.pullProgress;
  const indicatorRotation = pullState.canRefresh ? 180 : pullState.pullProgress * 180;
  const contentTransform = pullState.isPulling || pullState.isReleased || finalRefreshing
    ? pullState.pullDistance
    : 0;

  // Determine indicator icon
  const getIndicatorIcon = () => {
    if (pullState.showSuccess) {
      return (
        <svg 
          width={spinnerSize} 
          height={spinnerSize} 
          viewBox="0 0 24 24" 
          fill="none"
          className="text-green-500"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            stroke="currentColor" 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      );
    }
    
    if (pullState.showError) {
      return (
        <svg 
          width={spinnerSize} 
          height={spinnerSize} 
          viewBox="0 0 24 24" 
          fill="none"
          className="text-red-500"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            stroke="currentColor" 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      );
    }
    
    if (finalRefreshing) {
      return (
        <div 
          className="animate-spin"
          style={{ 
            width: spinnerSize, 
            height: spinnerSize,
            border: `2px solid transparent`,
            borderTop: `2px solid ${indicatorColor}`,
            borderRadius: '50%'
          }}
        />
      );
    }
    
    return (
      <svg 
        width={spinnerSize} 
        height={spinnerSize} 
        viewBox="0 0 24 24" 
        fill="none"
        style={{ 
          transform: `rotate(${indicatorRotation}deg)`,
          color: indicatorColor
        }}
        className="transition-transform duration-200"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          stroke="currentColor" 
          d="M19 14l-7-7m0 0l-7 7m7-7v18" 
        />
      </svg>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      data-testid="pull-to-refresh-container"
    >
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center transition-opacity duration-200"
        style={{
          height: refreshThreshold,
          backgroundColor,
          opacity: indicatorOpacity,
          transform: `translateY(-${refreshThreshold - (contentTransform * 0.5)}px)`
        }}
        data-testid="pull-indicator"
      >
        <div className="flex flex-col items-center">
          {getIndicatorIcon()}
          <div 
            className="mt-1 text-xs font-medium transition-opacity duration-200"
            style={{ color: indicatorColor, opacity: indicatorOpacity * 0.8 }}
          >
            {pullState.showSuccess && 'Updated!'}
            {pullState.showError && 'Failed'}
            {finalRefreshing && 'Refreshing...'}
            {!finalRefreshing && !pullState.showSuccess && !pullState.showError && (
              pullState.canRefresh ? 'Release to refresh' : 'Pull to refresh'
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${contentTransform}px)`
        }}
        data-testid="pull-to-refresh-content"
      >
        {children}
      </div>

      {/* Accessibility announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
        data-testid="pull-status-announcement"
      >
        {pullState.canRefresh && 'Ready to refresh'}
        {finalRefreshing && 'Refreshing content'}
        {pullState.showSuccess && 'Content refreshed successfully'}
        {pullState.showError && 'Failed to refresh content'}
      </div>

      {/* Custom CSS for enhanced mobile experience */}
      <style jsx>{`
        /* Improve scroll performance on iOS */
        .overflow-auto {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
        }
        
        /* Prevent text selection during pull */
        .user-select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .transition-transform,
          .transition-opacity,
          .animate-spin {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}