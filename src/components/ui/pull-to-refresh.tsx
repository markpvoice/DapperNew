/**
 * @fileoverview Pull-to-Refresh Component
 * 
 * Native-like pull-to-refresh functionality for mobile:
 * - Touch gesture detection for pull down
 * - Visual feedback with loading animation
 * - Customizable refresh threshold
 * - Smooth animations and transitions
 * - Integration with existing content
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useMobileOptimizations } from '@/hooks/use-mobile-optimizations';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  threshold?: number;
  maxPullDistance?: number;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
  className?: string;
  children: React.ReactNode;
}

enum _RefreshState {
  _Idle = 'idle',
  _Pulling = 'pulling',
  _ReadyToRefresh = 'ready',
  _Refreshing = 'refreshing'
}

export function PullToRefresh({
  onRefresh,
  disabled = false,
  threshold = 80,
  maxPullDistance = 120,
  refreshingText = 'Refreshing...',
  pullText = 'Pull down to refresh',
  releaseText = 'Release to refresh',
  className = '',
  children
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [refreshState, setRefreshState] = useState<_RefreshState>(_RefreshState._Idle);
  const [pullDistance, setPullDistance] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  
  const { 
    deviceInfo, 
    touchCapabilities,
    supportsHapticFeedback 
  } = useMobileOptimizations();
  
  // Suppress unused variable warnings
  void deviceInfo;
  void touchCapabilities;

  // Check if container is scrolled to top
  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    
    const scrollTop = containerRef.current.scrollTop;
    setIsAtTop(scrollTop <= 0);
  }, []);

  // Haptic feedback
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' = 'light') => {
    if (supportsHapticFeedback() && 'vibrate' in navigator) {
      const patterns = { light: [5], medium: [15] };
      navigator.vibrate(patterns[type]);
    }
  }, [supportsHapticFeedback]);

  // Handle touch gestures for pull-to-refresh
  const { isSwipping, swipeDirection, swipeDistance } = useTouchGestures(containerRef, {
    onTouchStart: () => {
      checkScrollPosition();
    },
    onTouchMove: () => {
      if (disabled || !isAtTop || swipeDirection !== 'down') {
        return;
      }
      
      const distance = Math.min(swipeDistance, maxPullDistance);
      setPullDistance(distance);
      
      if (distance > threshold && refreshState !== _RefreshState._ReadyToRefresh) {
        setRefreshState(_RefreshState._ReadyToRefresh);
        triggerHapticFeedback('medium');
      } else if (distance <= threshold && refreshState === _RefreshState._ReadyToRefresh) {
        setRefreshState(_RefreshState._Pulling);
      } else if (distance > 0 && refreshState === _RefreshState._Idle) {
        setRefreshState(_RefreshState._Pulling);
      }
    },
    onTouchEnd: async () => {
      if (disabled || !isAtTop) {
        setPullDistance(0);
        setRefreshState(_RefreshState._Idle);
        return;
      }
      
      if (refreshState === _RefreshState._ReadyToRefresh && pullDistance > threshold) {
        setRefreshState(_RefreshState._Refreshing);
        triggerHapticFeedback('medium');
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          // Smooth transition back to idle
          setTimeout(() => {
            setPullDistance(0);
            setRefreshState(_RefreshState._Idle);
          }, 300);
        }
      } else {
        // Animate back to idle state
        setPullDistance(0);
        setRefreshState(_RefreshState._Idle);
      }
    },
    swipeThreshold: 10,
    enableSwipe: true,
    preventDefaultScroll: false // Allow normal scrolling
  });
  
  // Suppress unused variable warning
  void isSwipping;

  // Monitor scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      checkScrollPosition();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    checkScrollPosition(); // Initial check

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkScrollPosition]);

  // Get refresh indicator transform
  const getIndicatorTransform = () => {
    const progress = Math.min(pullDistance / threshold, 1);
    const translateY = Math.min(pullDistance * 0.5, 40);
    const rotate = progress * 180;
    
    return {
      transform: `translateY(${translateY}px) rotate(${rotate}deg)`,
      opacity: progress
    };
  };

  // Get status text
  const getStatusText = () => {
    switch (refreshState) {
      case _RefreshState._Refreshing:
        return refreshingText;
      case _RefreshState._ReadyToRefresh:
        return releaseText;
      case _RefreshState._Pulling:
        return pullText;
      default:
        return '';
    }
  };

  // Get progress percentage
  const getProgress = () => {
    return Math.min((pullDistance / threshold) * 100, 100);
  };

  return (
    <div 
      ref={containerRef}
      className={`
        relative overflow-auto h-full
        ${disabled ? 'pointer-events-none' : ''}
        ${className}
      `}
      data-testid="pull-to-refresh"
      style={{
        transform: `translateY(${refreshState === _RefreshState._Refreshing ? '60px' : '0px'})`,
        transition: refreshState === _RefreshState._Refreshing ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Refresh Indicator */}
      <div 
        className={`
          absolute top-0 left-0 right-0 flex flex-col items-center justify-center
          transition-all duration-200 ease-out z-10
          ${refreshState === _RefreshState._Idle ? 'pointer-events-none' : ''}
        `}
        style={{
          height: '60px',
          transform: `translateY(${pullDistance > 0 ? -60 + (pullDistance * 0.5) : -60}px)`
        }}
        data-testid="refresh-indicator"
      >
        {/* Loading Spinner / Arrow */}
        <div 
          className={`
            w-8 h-8 mb-2 transition-all duration-200
            ${refreshState === _RefreshState._Refreshing ? 'animate-spin' : ''}
          `}
          style={getIndicatorTransform()}
        >
          {refreshState === _RefreshState._Refreshing ? (
            // Loading spinner
            <div className="w-full h-full border-2 border-gray-300 border-t-brand-gold rounded-full animate-spin" />
          ) : (
            // Arrow icon
            <svg 
              className="w-full h-full text-gray-400" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M7 14l5-5 5 5H7z" />
            </svg>
          )}
        </div>

        {/* Status Text */}
        {pullDistance > 20 && (
          <p className="text-sm text-gray-600 font-medium">
            {getStatusText()}
          </p>
        )}

        {/* Progress Bar */}
        {pullDistance > 10 && refreshState !== _RefreshState._Refreshing && (
          <div className="w-16 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-brand-gold rounded-full transition-all duration-100"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div 
        className="relative z-0"
        style={{
          paddingTop: refreshState === _RefreshState._Refreshing ? '60px' : '0px',
          transition: 'padding-top 0.3s ease-out'
        }}
        data-testid="refresh-content"
      >
        {children}
      </div>

      {/* Pull indicator overlay */}
      {pullDistance > 0 && refreshState !== _RefreshState._Refreshing && (
        <div 
          className="absolute inset-0 pointer-events-none z-5"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(255, 215, 0, ${Math.min(pullDistance / threshold * 0.1, 0.05)}) 0%, 
              transparent 200px)`
          }}
        />
      )}

      {/* Custom CSS for mobile optimizations */}
      <style jsx>{`
        /* Improve touch scrolling */
        .overflow-auto {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* Smooth animations */
        @keyframes refresh-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-refresh-bounce {
          animation: refresh-bounce 1s infinite;
        }

        /* Prevent text selection during gesture */
        .pointer-events-none * {
          user-select: none;
          -webkit-user-select: none;
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .transition-all,
          .transition-transform,
          .animate-spin {
            transition: none !important;
            animation: none !important;
          }
        }

        /* iOS specific optimizations */
        @supports (-webkit-appearance: none) {
          .overflow-auto {
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Android specific optimizations */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          .overflow-auto {
            scroll-behavior: smooth;
          }
        }
      `}</style>
    </div>
  );
}