/**
 * @fileoverview Enhanced Service Card Component
 * 
 * Service selection cards with micro-interactions:
 * - Hover animations and glow effects
 * - Selection states with checkmark animations
 * - Popular badges with pulse effects
 * - Smooth transitions and accessibility
 */

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  isSelected: boolean;
  isPopular?: boolean;
  imageSrc?: string;
  onSelect: (_serviceId: string) => void;
  className?: string;
}

export function ServiceCard({
  id,
  name,
  description,
  priceRange,
  isSelected,
  isPopular = false,
  imageSrc,
  onSelect,
  className = ''
}: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rippleCoords, setRippleCoords] = useState<{ x: number; y: number } | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Handle card selection with ripple effect
  const handleCardClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!prefersReducedMotion) {
      setRippleCoords({ x, y });
      setTimeout(() => setRippleCoords(null), 600);
    }

    onSelect(id);

    // Dispatch custom event for celebration service
    if (window) {
      window.dispatchEvent(new CustomEvent('service-selected', {
        detail: { serviceId: id, serviceName: name }
      }));
    }
  }, [id, name, onSelect, prefersReducedMotion]);

  // Handle mouse enter/leave
  const handleMouseEnter = useCallback(() => {
    if (!prefersReducedMotion) {
      setIsHovered(true);
    }
  }, [prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      className={`
        relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-300
        ${isSelected 
          ? 'border-brand-gold bg-brand-gold/10 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-brand-gold/50 hover:shadow-md'
        }
        ${isHovered && !prefersReducedMotion ? 'transform scale-105' : ''}
        ${className}
      `}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${name} service`}
      data-testid={`service-card-${id}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div 
          className={`
            absolute top-2 right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white 
            text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md
            ${!prefersReducedMotion ? 'animate-pulse-gentle' : ''}
          `}
          data-testid="popular-badge"
        >
          POPULAR
        </div>
      )}

      {/* Ripple Effect */}
      {rippleCoords && !prefersReducedMotion && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: rippleCoords.x - 25,
            top: rippleCoords.y - 25,
            width: 50,
            height: 50
          }}
          data-testid="ripple-effect"
        >
          <div className="absolute inset-0 bg-brand-gold/30 rounded-full animate-ripple" />
        </div>
      )}

      {/* Glow Effect on Hover */}
      {isHovered && !prefersReducedMotion && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-transparent rounded-lg pointer-events-none animate-glow"
          data-testid="glow-effect"
        />
      )}

      <div className="relative z-10">
        {/* Service Icon/Image */}
        {imageSrc ? (
          <div className="mb-4 h-16 w-16 mx-auto">
            <Image 
              src={imageSrc} 
              alt={`${name} icon`}
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="mb-4 h-16 w-16 mx-auto bg-brand-gold/20 rounded-full flex items-center justify-center">
            <div className="text-2xl font-bold text-brand-gold">
              {name.charAt(0)}
            </div>
          </div>
        )}

        {/* Service Name */}
        <h3 className={`
          text-xl font-bold text-center mb-2 transition-colors duration-200
          ${isSelected ? 'text-brand-gold' : 'text-brand-charcoal'}
        `}>
          {name}
        </h3>

        {/* Service Description */}
        <p className="text-gray-600 text-center text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* Price Range */}
        <div className={`
          text-center font-medium transition-colors duration-200
          ${isSelected ? 'text-brand-gold' : 'text-brand-charcoal'}
        `}>
          {priceRange}
        </div>

        {/* Selection Indicator */}
        <div className={`
          mt-4 flex items-center justify-center transition-all duration-300
          ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}>
          <div className={`
            w-6 h-6 rounded-full bg-brand-gold flex items-center justify-center
            ${!prefersReducedMotion && isSelected ? 'animate-scale-in' : ''}
          `}>
            <svg 
              className="w-4 h-4 text-brand-charcoal" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              data-testid="checkmark-icon"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(4); opacity: 0; }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
        
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-gentle,
          .animate-ripple,
          .animate-glow,
          .animate-scale-in {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}