/**
 * @fileoverview Animated Hero Buttons Component
 * 
 * Enhanced hero buttons with micro-interactions including:
 * - Pulse animations
 * - Ripple effects on click
 * - Sound wave hover animations
 * - Accessibility compliance
 */

'use client';

import { useState, useRef } from 'react';

interface AnimatedHeroButtonsProps {
  onRequestDate: () => void;
  onCheckAvailability?: () => void;
  className?: string;
}

interface RippleState {
  x: number;
  y: number;
  size: number;
}

export function AnimatedHeroButtons({ 
  onRequestDate, 
  onCheckAvailability,
  className = '' 
}: AnimatedHeroButtonsProps) {
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const [isHovering, setIsHovering] = useState<{ [key: string]: boolean }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Create ripple effect on click
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>, buttonKey: string) => {
    const button = buttonRefs.current[buttonKey];
    if (!button || prefersReducedMotion) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);

    const newRipple: RippleState = { x, y, size };
    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.slice(1));
    }, 800);
  };

  // Handle button click with ripple effect
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, action: () => void, buttonKey: string) => {
    createRipple(event, buttonKey);
    action();
  };

  // Handle hover states for animations
  const handleMouseEnter = (buttonKey: string) => {
    if (!prefersReducedMotion) {
      setIsHovering(prev => ({ ...prev, [buttonKey]: true }));
    }
  };

  const handleMouseLeave = (buttonKey: string) => {
    setIsHovering(prev => ({ ...prev, [buttonKey]: false }));
  };

  // Default availability handler
  const handleCheckAvailability = onCheckAvailability || (() => {
    document.querySelector('#availability')?.scrollIntoView({ behavior: 'smooth' });
  });

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      {/* Request Date Button - Primary CTA */}
      <button
        ref={el => { buttonRefs.current.requestDate = el; }}
        onClick={(e) => handleClick(e, onRequestDate, 'requestDate')}
        onMouseEnter={() => handleMouseEnter('requestDate')}
        onMouseLeave={() => handleMouseLeave('requestDate')}
        className={`
          relative overflow-hidden
          bg-brand-gold text-brand-charcoal 
          px-8 py-4 rounded-lg font-bold text-lg
          hover:bg-brand-dark-gold transform hover:scale-105 
          transition-all duration-300 shadow-lg hover:shadow-xl
          focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:outline-none
          min-h-[3.5rem] min-w-[12rem]
          ${!prefersReducedMotion ? 'animate-pulse-subtle' : ''}
        `}
        data-testid="book-now-button"
        role="button"
        aria-label="Request your event date"
      >
        <span className="relative z-10">Request Your Date</span>
        
        {/* Sound Wave Animation */}
        <div 
          className={`
            absolute inset-0 pointer-events-none
            ${isHovering.requestDate ? 'animate-sound-wave' : ''}
          `}
          data-testid="sound-wave-animation"
        >
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`
                    w-1 bg-brand-charcoal/20 rounded-full
                    ${isHovering.requestDate ? `animate-bounce` : ''}
                  `}
                  style={{
                    height: `${12 + i * 4}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ripple Effects */}
        {ripples.map((ripple, index) => (
          <span
            key={index}
            className="absolute pointer-events-none animate-ripple"
            data-testid="button-ripple"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
      </button>

      {/* Check Availability Button - Secondary CTA */}
      <button
        ref={el => { buttonRefs.current.checkAvailability = el; }}
        onClick={(e) => handleClick(e, handleCheckAvailability, 'checkAvailability')}
        onMouseEnter={() => handleMouseEnter('checkAvailability')}
        onMouseLeave={() => handleMouseLeave('checkAvailability')}
        className={`
          relative overflow-hidden
          bg-transparent text-white border-2 border-white
          px-8 py-4 rounded-lg font-bold text-lg
          hover:bg-white hover:text-brand-charcoal
          transform hover:scale-105 transition-all duration-300
          focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none
          min-h-[3.5rem] min-w-[12rem]
        `}
        data-testid="check-availability-button"
        role="button"
        aria-label="Check date availability"
      >
        <span className="relative z-10">Check Availability</span>

        {/* Subtle glow effect on hover */}
        <div 
          className={`
            absolute inset-0 bg-white/10 rounded-lg
            transform transition-transform duration-300
            ${isHovering.checkAvailability ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
        />
      </button>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes sound-wave {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.6;
            background: rgba(255, 215, 0, 0.4);
            border-radius: 50%;
          }
          100% {
            transform: scale(1);
            opacity: 0;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 50%;
          }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        
        .animate-sound-wave {
          animation: sound-wave 1.5s ease-in-out infinite;
        }
        
        .animate-ripple {
          animation: ripple 0.8s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-subtle,
          .animate-sound-wave,
          .animate-ripple {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}