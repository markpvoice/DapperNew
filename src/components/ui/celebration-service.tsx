/**
 * @fileoverview Celebration Service Component
 * 
 * Manages celebration effects for form interactions:
 * - Confetti animations for step completion
 * - Success messages for booking completion
 * - Floating hearts for service selection
 * - Celebration queuing system
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

// Lazy load confetti library
let confetti: any = null;

const loadConfetti = async () => {
  if (confetti) {
    return confetti;
  }
  
  try {
    const confettiModule = await import('canvas-confetti');
    confetti = confettiModule.default;
    return confetti;
  } catch (error) {
    console.warn('Could not load confetti library:', error);
    return null;
  }
};

interface CelebrationEvent {
  type: 'step-completed' | 'booking-completed' | 'service-selected';
  data?: any;
  timestamp: number;
}

interface FloatingHeart {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export function CelebrationService() {
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Create confetti effect
  const createConfetti = useCallback(async (config: any = {}) => {
    if (prefersReducedMotion) {
      return;
    }
    
    const confettiLib = await loadConfetti();
    if (!confettiLib) {
      return;
    }

    const defaultConfig = {
      particleCount: 50,
      spread: 60,
      origin: { x: 0.5, y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF6B6B'],
      shapes: ['circle', 'square'],
      scalar: 0.8
    };

    confettiLib({ ...defaultConfig, ...config });
  }, [prefersReducedMotion]);

  // Create floating hearts
  const createFloatingHearts = useCallback(() => {
    if (prefersReducedMotion) {
      return;
    }

    const hearts: FloatingHeart[] = [];
    for (let i = 0; i < 5; i++) {
      hearts.push({
        id: `heart-${Date.now()}-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 20 + 80,
        size: Math.random() * 0.5 + 0.8,
        delay: i * 0.2
      });
    }

    setFloatingHearts(hearts);

    // Remove hearts after animation
    setTimeout(() => {
      setFloatingHearts([]);
    }, 2000);
  }, [prefersReducedMotion]);

  // Show success message with animation
  const showSuccess = useCallback((data: any) => {
    setSuccessData(data);
    setShowSuccessMessage(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
      setSuccessData(null);
    }, 3000);
  }, []);

  // Process celebration queue
  const processCelebration = useCallback(async (event: CelebrationEvent) => {
    switch (event.type) {
      case 'step-completed':
        await createConfetti({
          particleCount: 50,
          spread: 60,
          origin: { x: 0.5, y: 0.7 }
        });
        break;

      case 'booking-completed':
        await createConfetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6B6B'],
          shapes: ['star', 'circle']
        });
        showSuccess(event.data);
        break;

      case 'service-selected':
        createFloatingHearts();
        break;

      default:
        break;
    }
  }, [createConfetti, showSuccess, createFloatingHearts]);

  // Process celebration queue
  useEffect(() => {
    if (celebrationQueue.length === 0 || isProcessing) {
      return;
    }

    const processQueue = async () => {
      setIsProcessing(true);
      const event = celebrationQueue[0];
      
      await processCelebration(event);
      
      // Remove processed event from queue
      setCelebrationQueue(prev => prev.slice(1));
      
      // Wait a bit before processing next celebration
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    };

    processQueue();
  }, [celebrationQueue, isProcessing, processCelebration]);

  // Listen for celebration events
  useEffect(() => {
    const handleCelebration = (event: CustomEvent) => {
      const celebrationEvent: CelebrationEvent = {
        type: event.type as any,
        data: event.detail,
        timestamp: Date.now()
      };

      setCelebrationQueue(prev => [...prev, celebrationEvent]);
    };

    window.addEventListener('step-completed' as any, handleCelebration);
    window.addEventListener('booking-completed' as any, handleCelebration);
    window.addEventListener('service-selected' as any, handleCelebration);

    return () => {
      window.removeEventListener('step-completed' as any, handleCelebration);
      window.removeEventListener('booking-completed' as any, handleCelebration);
      window.removeEventListener('service-selected' as any, handleCelebration);
    };
  }, []);

  if (prefersReducedMotion && !showSuccessMessage) {
    return null;
  }

  return (
    <>
      {/* Success Message */}
      {showSuccessMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          data-testid="success-message"
        >
          <div 
            className={`
              bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md text-center border-2 border-brand-gold
              ${!prefersReducedMotion ? 'animate-bounce-in' : ''}
            `}
            data-testid="success-animation"
          >
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-brand-charcoal mb-2">
              Booking Confirmed! 🎉
            </h3>
            <p className="text-gray-600 mb-4">
              Your event booking has been successfully submitted!
            </p>
            {successData?.bookingReference && (
              <div className="bg-brand-gold/20 rounded-lg p-3">
                <p className="text-sm text-brand-charcoal font-medium">
                  Booking Reference: {successData.bookingReference}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Hearts */}
      {floatingHearts.length > 0 && (
        <div 
          className="fixed inset-0 pointer-events-none z-40"
          data-testid="floating-hearts"
        >
          {floatingHearts.map((heart) => (
            <div
              key={heart.id}
              className={`
                absolute text-red-500 text-2xl
                ${!prefersReducedMotion ? 'animate-float-up' : ''}
              `}
              style={{
                left: `${heart.x}%`,
                top: `${heart.y}%`,
                fontSize: `${heart.size}rem`,
                animationDelay: `${heart.delay}s`,
                animationDuration: '2s'
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bounce-in {
          0% { 
            transform: scale(0) translateY(20px); 
            opacity: 0; 
          }
          50% { 
            transform: scale(1.1) translateY(-10px); 
            opacity: 1; 
          }
          100% { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
          }
        }
        
        @keyframes float-up {
          0% { 
            transform: translateY(0) scale(0); 
            opacity: 0; 
          }
          20% { 
            transform: translateY(-10px) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(-100px) scale(0.5); 
            opacity: 0; 
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-bounce-in,
          .animate-float-up {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}