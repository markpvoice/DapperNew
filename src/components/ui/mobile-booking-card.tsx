/**
 * @fileoverview Mobile Booking Card Component
 * 
 * Touch-optimized booking card for mobile admin interface:
 * - Swipe actions for quick operations
 * - Touch-friendly quick action buttons
 * - Visual feedback for interactions
 * - Status indicators and booking information
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventType: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  services: string[];
  venue?: string;
  totalAmount?: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: (_booking: Booking) => void;
}

interface MobileBookingCardProps {
  booking: Booking;
  onSwipeLeft?: (_booking: Booking) => void;
  onSwipeRight?: (_booking: Booking) => void;
  onQuickAction?: (_actionId: string, _booking: Booking) => void;
  className?: string;
}

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'call',
    label: 'Call',
    icon: '📞',
    color: 'bg-green-500',
    action: (_booking) => {
      if (typeof window !== 'undefined') {
        window.open(`tel:${_booking.clientPhone}`);
      }
    }
  },
  {
    id: 'email',
    label: 'Email',
    icon: '✉️',
    color: 'bg-blue-500',
    action: (_booking) => {
      if (typeof window !== 'undefined') {
        window.open(`mailto:${_booking.clientEmail}?subject=Re: Your ${_booking.eventType} Event`);
      }
    }
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: '✏️',
    color: 'bg-orange-500',
    action: (_booking: Booking) => {
      // Edit action will be handled by parent component
    }
  }
];

export function MobileBookingCard({
  booking,
  onSwipeLeft,
  onSwipeRight,
  onQuickAction,
  className = ''
}: MobileBookingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [_showActions, _setShowActions] = useState(false);
  
  const { 
    deviceInfo, 
    touchCapabilities, 
    getTouchTargetSize,
    supportsHapticFeedback 
  } = useMobileOptimizations();
  
  // Suppress unused variable warnings
  void touchCapabilities;

  // Haptic feedback for supported devices
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (supportsHapticFeedback() && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, [supportsHapticFeedback]);

  // Handle swipe gestures
  const { isSwipping, swipeDirection, swipeDistance } = useTouchGestures(cardRef, {
    onSwipe: (direction, distance, velocity) => {
      if (distance > 100 && velocity > 0.3) {
        triggerHapticFeedback('medium');
        
        if (direction === 'left' && onSwipeLeft) {
          onSwipeLeft(booking);
        } else if (direction === 'right' && onSwipeRight) {
          onSwipeRight(booking);
        }
      }
    },
    onTouchStart: () => {
      setIsPressed(true);
      triggerHapticFeedback('light');
    },
    onTouchEnd: () => {
      setIsPressed(false);
      setSwipeOffset(0);
    },
    onTouchMove: () => {
      if (isSwipping) {
        const offset = swipeDirection === 'left' ? -swipeDistance * 0.3 : 
                      swipeDirection === 'right' ? swipeDistance * 0.3 : 0;
        setSwipeOffset(Math.max(-100, Math.min(100, offset)));
      }
    },
    swipeThreshold: 80,
    preventDefaultScroll: true
  });

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    triggerHapticFeedback('light');
    
    const action = DEFAULT_QUICK_ACTIONS.find(a => a.id === actionId);
    if (action) {
      action.action(booking);
    }
    
    onQuickAction?.(actionId, booking);
  }, [booking, onQuickAction, triggerHapticFeedback]);

  // Get status styling
  const getStatusStyling = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date for mobile display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get touch target size for buttons
  const buttonSize = getTouchTargetSize('medium');

  return (
    <div
      ref={cardRef}
      className={`
        relative bg-white rounded-lg shadow-sm border transition-all duration-200
        ${isPressed ? 'shadow-md scale-98' : 'shadow-sm'}
        ${isSwipping ? 'cursor-grabbing' : 'cursor-grab'}
        ${className}
      `}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        minHeight: deviceInfo.isMobile ? '120px' : '100px'
      }}
      data-testid="mobile-booking-card"
      data-booking-id={booking.id}
      data-swipe-enabled="true"
    >
      {/* Swipe indicators */}
      {Math.abs(swipeOffset) > 20 && (
        <>
          {swipeOffset < 0 && onSwipeLeft && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 text-xl">
              ←
            </div>
          )}
          {swipeOffset > 0 && onSwipeRight && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-green-500 text-xl">
              →
            </div>
          )}
        </>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          {/* Client info */}
          <div className="flex-1" data-testid="booking-info">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {booking.clientName}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              {booking.eventType} • {formatDate(booking.eventDate)}
            </p>
            {booking.venue && (
              <p className="text-xs text-gray-500 truncate">
                📍 {booking.venue}
              </p>
            )}
          </div>

          {/* Status badge */}
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium border
            ${getStatusStyling(booking.status)}
          `}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
        </div>

        {/* Services */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {booking.services.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-brand-gold/20 text-brand-charcoal text-xs rounded"
              >
                {service}
              </span>
            ))}
            {booking.services.length > 3 && (
              <span className="text-xs text-gray-500">
                +{booking.services.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Total amount */}
        {booking.totalAmount && (
          <div className="mb-3">
            <span className="text-sm font-medium text-green-600">
              ${booking.totalAmount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2" data-testid="quick-actions">
            {DEFAULT_QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className={`
                  flex items-center justify-center rounded-full text-white font-medium
                  transition-all duration-200 hover:scale-105 active:scale-95
                  ${action.color}
                `}
                style={{
                  width: `${buttonSize}px`,
                  height: `${buttonSize}px`,
                  minWidth: `${buttonSize}px`,
                  minHeight: `${buttonSize}px`
                }}
                data-testid={`quick-${action.id}`}
                aria-label={`${action.label} ${booking.clientName}`}
              >
                <span className="text-lg">{action.icon}</span>
              </button>
            ))}
          </div>

          {/* Contact info */}
          <div className="text-right">
            <p className="text-xs text-gray-500 truncate max-w-[120px]">
              {booking.clientPhone}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[120px]">
              {booking.clientEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Touch feedback overlay */}
      {isPressed && !isSwipping && (
        <div 
          className="absolute inset-0 bg-black/5 rounded-lg pointer-events-none"
          data-testid="touch-feedback"
        />
      )}

      {/* Custom CSS for mobile optimizations */}
      <style jsx>{`
        .scale-98 {
          transform: scale(0.98);
        }
        
        @media (max-width: 768px) {
          .truncate {
            max-width: 100px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .transition-all,
          .hover\\:scale-105,
          .active\\:scale-95 {
            transition: none !important;
            transform: none !important;
          }
        }

        /* Improve touch targets on small screens */
        @media (max-width: 480px) {
          .text-xs {
            font-size: 0.8rem;
          }
          .text-sm {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}