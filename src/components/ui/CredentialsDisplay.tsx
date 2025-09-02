'use client';

import React from 'react';

interface CredentialsDisplayProps {
  className?: string;
}

export function CredentialsDisplay({ className = '' }: CredentialsDisplayProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-4 md:p-6 lg:p-8 ${className}`}
      data-testid="credentials-container"
      tabIndex={0}
      role="region"
      aria-label="Professional credentials and certifications"
    >
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-brand-charcoal mb-6 text-center">
        Professional Credentials & Certifications
      </h2>
      
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        data-testid="credentials-grid"
      >
        {/* Liability Insurance Badge */}
        <div 
          className="credential-item bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          data-testid="credential-item"
          tabIndex={0}
          aria-label="Liability insurance certificate"
        >
          <div className="flex items-center justify-center mb-3">
            <div 
              className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center"
              data-testid="shield-icon"
              aria-hidden="true"
            >
              <ShieldIcon />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2 text-center" data-testid="brand-text">
            Liability Insurance
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Fully covered with <span className="font-bold text-brand-gold" data-testid="brand-gold-accent">$1,000,000</span> liability insurance
          </p>
          <img 
            src="/images/insurance-certificate.png" 
            alt="Insurance certificate verification"
            className="hidden"
          />
        </div>

        {/* Professional Association Badge */}
        <div 
          className="credential-item bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          data-testid="credential-item"
          tabIndex={0}
          aria-label="Professional membership certification"
        >
          <div className="flex items-center justify-center mb-3">
            <div 
              className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center"
              data-testid="checkmark-icon"
              aria-hidden="true"
            >
              <CheckmarkIcon />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2 text-center" data-testid="brand-text">
            Professional Memberships
          </h3>
          <p className="text-sm text-gray-600 text-center">
            National Association of <span className="font-bold text-brand-gold" data-testid="brand-gold-accent">DJ Association</span> certified member
          </p>
          <img 
            src="/images/professional-certification.png" 
            alt="Professional certification badge"
            className="hidden"
          />
        </div>

        {/* Years of Experience Badge */}
        <div 
          className="credential-item bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          data-testid="credential-item"
          tabIndex={0}
          aria-label="Years of professional experience"
        >
          <div className="flex items-center justify-center mb-3">
            <div 
              className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center"
              data-testid="star-icon"
              aria-hidden="true"
            >
              <StarIcon />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2 text-center" data-testid="brand-text">
            Extensive Experience
          </h3>
          <p className="text-sm text-gray-600 text-center">
            <span className="font-bold text-brand-gold text-xl" data-testid="brand-gold-accent">15+ Years</span><br />
            of professional experience in entertainment services
          </p>
        </div>

        {/* Equipment Certification Badge */}
        <div 
          className="credential-item bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          data-testid="credential-item"
          tabIndex={0}
          aria-label="Professional equipment certification"
        >
          <div className="flex items-center justify-center mb-3">
            <div 
              className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center"
              data-testid="shield-icon"
              aria-hidden="true"
            >
              <ShieldIcon />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2 text-center" data-testid="brand-text">
            Professional Equipment
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Industry-standard equipment with <span className="font-bold text-brand-gold" data-testid="brand-gold-accent">certified setup</span> procedures
          </p>
        </div>

        {/* COVID Safety Protocols Badge */}
        <div 
          className="credential-item bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          data-testid="credential-item"
          tabIndex={0}
          aria-label="COVID safety protocols certification"
        >
          <div className="flex items-center justify-center mb-3">
            <div 
              className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center"
              data-testid="checkmark-icon"
              aria-hidden="true"
            >
              <CheckmarkIcon />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2 text-center" data-testid="brand-text">
            COVID Safe Protocols
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Full <span className="font-bold text-brand-gold" data-testid="brand-gold-accent">sanitization</span> and safety measures implemented
          </p>
        </div>

        {/* Additional Professional Certifications Badge */}
        <div 
          className="credential-item bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          data-testid="credential-item"
          tabIndex={0}
          aria-label="Additional professional certifications"
        >
          <div className="flex items-center justify-center mb-3">
            <div 
              className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center"
              data-testid="star-icon"
              aria-hidden="true"
            >
              <StarIcon />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2 text-center" data-testid="brand-text">
            Quality Certifications
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Certified in sound engineering and <span className="font-bold text-brand-gold" data-testid="brand-gold-accent">event management</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function ShieldIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L3 7v4c0 6.04 4.04 11.5 9 12 4.96-.5 9-5.96 9-12V7l-9-5z" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l2.4 7.4h7.8l-6.3 4.6 2.4 7.4L12 16.8l-5.3 4.6 2.4-7.4L2.8 9.4h7.8L12 2z" />
    </svg>
  );
}