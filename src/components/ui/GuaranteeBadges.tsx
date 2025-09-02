'use client';

import React from 'react';

interface GuaranteeBadgesProps {
  className?: string;
}

export function GuaranteeBadges({ className = '' }: GuaranteeBadgesProps) {
  return (
    <div 
      className={`bg-gradient-to-r from-brand-gold to-yellow-400 rounded-lg shadow-xl p-3 md:p-4 lg:p-6 text-white ${className}`}
      data-testid="guarantees-container"
      tabIndex={0}
      role="region"
      aria-label="Service guarantees and commitments"
    >
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-center mb-4">
        Our Commitment & Guarantees
      </h2>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
        data-testid="guarantees-grid"
      >
        {/* Satisfaction Guarantee */}
        <div 
          className="guarantee-badge bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:scale-105 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white"
          data-testid="guarantee-badge"
          tabIndex={0}
          aria-label="Satisfaction guarantee commitment"
        >
          <div className="flex items-center justify-center mb-2">
            <div 
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              data-testid="shield-guarantee-icon"
              aria-hidden="true"
            >
              <ShieldIcon />
            </div>
          </div>
          <h3 className="text-sm font-bold text-center mb-1 text-white" data-testid="white-text">
            <span className="text-2xl font-bold text-white" data-testid="trust-element">100%</span> Satisfaction
          </h3>
          <p className="text-xs text-center opacity-90 text-white" data-testid="white-text">
            <span className="font-bold text-white" data-testid="trust-element">Guaranteed</span> or we make it right
          </p>
          <img 
            src="/images/satisfaction-guarantee.png" 
            alt="Satisfaction guarantee shield"
            className="hidden"
          />
        </div>

        {/* Money-Back Guarantee */}
        <div 
          className="guarantee-badge bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:scale-105 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white"
          data-testid="guarantee-badge"
          tabIndex={0}
          aria-label="Money back guarantee policy"
        >
          <div className="flex items-center justify-center mb-2">
            <div 
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              data-testid="checkmark-guarantee-icon"
              aria-hidden="true"
            >
              <CheckmarkIcon />
            </div>
          </div>
          <h3 className="text-sm font-bold text-center mb-1 text-white" data-testid="white-text">
            Money Back Promise
          </h3>
          <p className="text-xs text-center opacity-90 text-white" data-testid="white-text">
            <span className="font-bold text-white" data-testid="trust-element">30 Day</span> money-back guarantee
          </p>
          <img 
            src="/images/money-back-guarantee.png" 
            alt="Money back guarantee"
            className="hidden"
          />
        </div>

        {/* Equipment Backup Guarantee */}
        <div 
          className="guarantee-badge bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:scale-105 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white"
          data-testid="guarantee-badge"
          tabIndex={0}
          aria-label="Equipment backup guarantee policy"
        >
          <div className="flex items-center justify-center mb-2">
            <div 
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              data-testid="shield-guarantee-icon"
              aria-hidden="true"
            >
              <ShieldIcon />
            </div>
          </div>
          <h3 className="text-sm font-bold text-center mb-1 text-white" data-testid="white-text">
            Backup Equipment
          </h3>
          <p className="text-xs text-center opacity-90 text-white" data-testid="white-text">
            <span className="font-bold text-white" data-testid="trust-element">Always Ready</span> with backup systems
          </p>
        </div>

        {/* Cancellation Policy */}
        <div 
          className="guarantee-badge bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:scale-105 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white"
          data-testid="guarantee-badge"
          tabIndex={0}
          aria-label="Clear cancellation policy information"
        >
          <div className="flex items-center justify-center mb-2">
            <div 
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              data-testid="checkmark-guarantee-icon"
              aria-hidden="true"
            >
              <CheckmarkIcon />
            </div>
          </div>
          <h3 className="text-sm font-bold text-center mb-1 text-white" data-testid="white-text">
            Cancellation Policy
          </h3>
          <p className="text-xs text-center opacity-90 text-white" data-testid="white-text">
            Fair <span className="font-bold text-white" data-testid="trust-element">24 Hour</span> cancellation policy
          </p>
        </div>

        {/* Professional Service Guarantee */}
        <div 
          className="guarantee-badge bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:scale-105 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white"
          data-testid="guarantee-badge"
          tabIndex={0}
          aria-label="Professional service quality guarantee"
        >
          <div className="flex items-center justify-center mb-2">
            <div 
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              data-testid="star-guarantee-icon"
              aria-hidden="true"
            >
              <StarIcon />
            </div>
          </div>
          <h3 className="text-sm font-bold text-center mb-1 text-white" data-testid="white-text">
            Professional Service
          </h3>
          <p className="text-xs text-center opacity-90 text-white" data-testid="white-text">
            <span className="font-bold text-white" data-testid="trust-element">Licensed & Insured</span> professionals
          </p>
        </div>

        {/* Punctuality Guarantee */}
        <div 
          className="guarantee-badge bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:scale-105 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white"
          data-testid="guarantee-badge"
          tabIndex={0}
          aria-label="On-time arrival punctuality guarantee"
        >
          <div className="flex items-center justify-center mb-2">
            <div 
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              data-testid="checkmark-guarantee-icon"
              aria-hidden="true"
            >
              <CheckmarkIcon />
            </div>
          </div>
          <h3 className="text-sm font-bold text-center mb-1 text-white" data-testid="white-text">
            On Time Promise
          </h3>
          <p className="text-xs text-center opacity-90 text-white" data-testid="white-text">
            <span className="font-bold text-white" data-testid="trust-element">Punctuality</span> commitment guaranteed
          </p>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-xs opacity-75">
          These are our <span className="font-bold text-white" data-testid="trust-element">commitment</span> to providing exceptional service
        </p>
      </div>
    </div>
  );
}

// Icon Components (same as CredentialsDisplay for consistency)
function ShieldIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L3 7v4c0 6.04 4.04 11.5 9 12 4.96-.5 9-5.96 9-12V7l-9-5z" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l2.4 7.4h7.8l-6.3 4.6 2.4 7.4L12 16.8l-5.3 4.6 2.4-7.4L2.8 9.4h7.8L12 2z" />
    </svg>
  );
}