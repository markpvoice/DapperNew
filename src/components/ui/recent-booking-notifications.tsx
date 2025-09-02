'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Types
export interface RecentBooking {
  id: string;
  clientName: string;
  eventType: string;
  location: string;
  timeAgo: string;
  services: string[];
}

export interface RecentBookingNotificationsProps {
  bookings: RecentBooking[];
  rotationInterval?: number;
  showServices?: boolean;
  showVerifiedBadge?: boolean;
  animated?: boolean;
  clickToPause?: boolean;
  className?: string;
}

export interface BookingNotificationProps {
  booking: RecentBooking;
  showServices?: boolean;
  showVerifiedBadge?: boolean;
  compact?: boolean;
  animationType?: 'fade' | 'slide' | 'scale';
  onClick?: (_booking: RecentBooking) => void;
  className?: string;
}

// Animation keyframes for notifications (currently unused but available for future enhancements)
const _animationClasses = {
  fade: 'opacity-0 animate-fade-in',
  slide: 'transform translate-x-full animate-slide-in',
  scale: 'transform scale-95 animate-scale-in',
};

// Mock recent bookings for demonstration
const MOCK_RECENT_BOOKINGS: RecentBooking[] = [
  {
    id: '1',
    clientName: 'Sarah J.',
    eventType: 'Wedding',
    location: 'Chicago, IL',
    timeAgo: '2 hours ago',
    services: ['DJ', 'Photography'],
  },
  {
    id: '2',
    clientName: 'Mike C.',
    eventType: 'Corporate Event',
    location: 'Milwaukee, WI',
    timeAgo: '4 hours ago',
    services: ['Karaoke'],
  },
  {
    id: '3',
    clientName: 'Lisa M.',
    eventType: 'Birthday Party',
    location: 'Naperville, IL',
    timeAgo: '6 hours ago',
    services: ['DJ', 'Karaoke'],
  },
  {
    id: '4',
    clientName: 'David T.',
    eventType: 'Anniversary',
    location: 'Schaumburg, IL',
    timeAgo: '8 hours ago',
    services: ['DJ', 'Photography'],
  },
  {
    id: '5',
    clientName: 'Jennifer W.',
    eventType: 'Corporate Event',
    location: 'Madison, WI',
    timeAgo: '12 hours ago',
    services: ['DJ', 'Karaoke', 'Photography'],
  },
];

// Booking Notification Item Component
export function BookingNotification({
  booking,
  showServices = false,
  showVerifiedBadge = false,
  compact = false,
  animationType = 'fade',
  onClick,
  className = '',
}: BookingNotificationProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(booking);
    }
  };

  return (
    <div
      data-testid="booking-notification-item"
      onClick={handleClick}
      className={`
        bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer
        ${compact ? 'text-sm py-3' : ''}
        ${animationType === 'slide' ? 'transform' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>
              <span className="text-brand-gold font-semibold">{booking.clientName}</span>
              {' just booked a '}
              <span className="font-semibold">{booking.eventType}</span>
              {' in '}
              <span className="text-gray-700">{booking.location}</span>
            </p>
            
            {showVerifiedBadge && (
              <div 
                data-testid="verified-badge"
                className="flex-shrink-0"
                aria-label="Verified booking"
              >
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path 
                    fillRule="evenodd" 
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
              {booking.timeAgo}
            </span>
            
            {showServices && booking.services.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>•</span>
                <span className={`text-brand-gold font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                  {booking.services.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Recent Booking Notifications Component
export function RecentBookingNotifications({
  bookings = MOCK_RECENT_BOOKINGS,
  rotationInterval = 5000,
  showServices = true,
  showVerifiedBadge = true,
  animated = true,
  clickToPause = false,
  className = '',
}: RecentBookingNotificationsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Rotation logic
  useEffect(() => {
    if (bookings.length === 0 || isPaused || isHovered) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bookings.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [bookings.length, rotationInterval, isPaused, isHovered]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    if (clickToPause) {
      setIsPaused(!isPaused);
    }
  }, [clickToPause, isPaused]);

  // Don't render if no bookings
  if (bookings.length === 0) {
    return null;
  }

  const currentBooking = bookings[currentIndex];

  return (
    <div
      data-testid="booking-notification"
      role="region"
      aria-label="Recent bookings"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`
        relative overflow-hidden
        ${animated ? 'transition-all duration-500 ease-in-out' : ''}
        ${clickToPause ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Notification */}
      <BookingNotification
        booking={currentBooking}
        showServices={showServices}
        showVerifiedBadge={showVerifiedBadge}
        animationType="fade"
      />

      {/* Progress indicator for rotation */}
      {bookings.length > 1 && !isPaused && !isHovered && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-brand-gold transition-all duration-100 ease-linear"
            style={{
              width: '100%',
              animation: `progress ${rotationInterval}ms linear infinite`,
            }}
          />
        </div>
      )}

      {/* Pause indicator */}
      {(isPaused || isHovered) && bookings.length > 1 && (
        <div className="absolute top-2 right-2">
          <div className="bg-black bg-opacity-50 rounded-full p-1">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Dots indicator */}
      {bookings.length > 1 && (
        <div className="flex justify-center space-x-1 mt-3">
          {bookings.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex 
                  ? 'bg-brand-gold' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to booking ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Custom CSS for progress animation */}
      <style jsx>{`
        @keyframes progress {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            transform: scaleX(1);
            transform-origin: left;
          }
        }
      `}</style>
    </div>
  );
}