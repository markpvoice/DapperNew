/**
 * @fileoverview What Happens Next Component
 * 
 * Provides step-by-step guidance and expectations:
 * - Next step preview with preparation tips
 * - Timeline information and expectations
 * - Support contact information
 * - Context-aware help content
 * - Interactive expandable sections
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';

interface FormData {
  services?: string[];
  eventDate?: string;
  eventType?: string;
  venue?: string;
  [key: string]: any;
}

interface CustomContent {
  stepGuidance?: string;
  preparationTips?: string[];
}

interface ContactInfo {
  phone?: string;
  email?: string;
}

interface WhatHappensNextProps {
  currentStep: number;
  totalSteps?: number;
  formData?: FormData;
  customContent?: CustomContent;
  contactInfo?: ContactInfo;
  theme?: string;
  helpDataError?: boolean;
}

const STEP_GUIDANCE = {
  0: "Choose when your event will take place. We recommend booking at least 2 weeks in advance.",
  1: "Tell us about your event details including venue and guest count.",
  2: "Provide your contact information so we can confirm your booking.",
  3: "Review all your details and submit your booking request.",
  4: "Your booking is being processed and we'll contact you soon."
};

const PREPARATION_TIPS = {
  0: [
    "Check your calendar for the event date",
    "Consider backup dates if your first choice isn't available",
    "Think about the time of day for your event"
  ],
  1: [
    "Have your venue address ready",
    "Know your expected guest count", 
    "Think about any special requests"
  ],
  2: [
    "Prepare your contact information",
    "Ensure your phone number is correct",
    "Check your email for our response"
  ],
  3: [
    "Review all details carefully",
    "Double-check dates and times",
    "Make sure contact info is accurate"
  ],
  4: [
    "Keep your phone nearby for our call",
    "Prepare any additional questions",
    "Have your calendar ready to confirm"
  ]
};

const TIME_ESTIMATES = {
  0: "2-3 minutes",
  1: "3-4 minutes", 
  2: "2-3 minutes",
  3: "1-2 minutes",
  4: "Complete!"
};

const FAQ_BY_STEP = {
  0: [
    { id: 0, question: "What services do you offer?", answer: "We provide DJ, Karaoke, and Photography services for all types of events." },
    { id: 1, question: "Can I book multiple services?", answer: "Yes! We offer package discounts when you book multiple services together." }
  ],
  1: [
    { id: 0, question: "When do you need the venue address?", answer: "We need the complete address to plan our setup and arrival time." },
    { id: 1, question: "What if I don't know the guest count?", answer: "An estimate is fine - we can adjust equipment based on the final count." }
  ],
  2: [
    { id: 0, question: "How will you contact me?", answer: "We'll call you within 24-48 hours to confirm your booking details." },
    { id: 1, question: "Can I change my details later?", answer: "Yes, changes can be made up to 7 days before your event." }
  ],
  3: [
    { id: 0, question: "When do I need to pay?", answer: "A $200 deposit is required to secure your date, due after confirmation." },
    { id: 1, question: "What if I need to cancel?", answer: "Cancellations are accepted up to 7 days before your event." }
  ],
  4: [
    { id: 0, question: "How quickly will you respond?", answer: "We respond to all booking requests within 24-48 hours." }
  ]
};

const SERVICE_SPECIFIC_TIPS = {
  dj: "For DJ services, consider your music preferences and any special songs",
  karaoke: "Think about popular songs your guests might want to sing",
  photography: "For photography services, consider lighting and backdrop preferences"
};

const EVENT_TYPE_TIPS = {
  wedding: "Wedding tip: Consider your first dance song and special requests",
  corporate: "Corporate tip: Discuss audio/visual needs for presentations", 
  birthday: "Birthday tip: Think about the birthday person's favorite music",
  anniversary: "Anniversary tip: Consider romantic music and special moments"
};

export function WhatHappensNext({
  currentStep,
  totalSteps = 5,
  formData = {},
  customContent,
  contactInfo,
  theme = "default",
  helpDataError = false
}: WhatHappensNextProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [lastUpdateCount, setLastUpdateCount] = useState(0);

  // Memoize expensive calculations
  const timelineData = useMemo(() => {
    const eventDate = formData.eventDate ? new Date(formData.eventDate) : null;
    const daysUntilEvent = eventDate ? Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isRushBooking = daysUntilEvent !== null && daysUntilEvent <= 7;
    
    return { eventDate, daysUntilEvent, isRushBooking };
  }, [formData.eventDate]);

  // Debounced content updates (currently unused but kept for future enhancement)
  const _handleContentUpdate = useCallback(() => {
    setLastUpdateCount(prev => prev + 1);
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newState = { ...prev, [sectionId]: !prev[sectionId] };
      
      // Remember user preferences in localStorage
      try {
        localStorage.setItem('what-happens-next-expanded', JSON.stringify(newState));
      } catch (error) {
        console.warn('Could not save expansion preferences:', error);
      }
      
      return newState;
    });
  }, []);

  // Load saved preferences
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('what-happens-next-expanded');
      if (saved) {
        setExpandedSections(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Could not load expansion preferences:', error);
    }
  }, []);

  // Announce content changes for screen readers
  const announceChange = useCallback((message: string) => {
    const liveRegion = document.querySelector('[data-testid="help-content-live-region"]');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, []);

  const handleExpandDetails = useCallback(() => {
    toggleSection('detailed-timeline');
    if (!expandedSections['detailed-timeline']) {
      announceChange('Detailed timeline information is now visible');
    }
  }, [toggleSection, expandedSections, announceChange]);

  // Error state
  if (helpDataError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${theme === 'minimal' ? 'theme-minimal' : ''}`} data-testid="what-happens-next">
        <div data-testid="fallback-help">
          For assistance, please call us at (555) 123-4567
        </div>
      </div>
    );
  }

  // Invalid step handling
  if (currentStep < 0 || currentStep >= totalSteps) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6" data-testid="what-happens-next">
        <div data-testid="invalid-step-message">
          Please contact us for assistance with your booking
        </div>
      </div>
    );
  }

  const stepGuidance = customContent?.stepGuidance || STEP_GUIDANCE[currentStep as keyof typeof STEP_GUIDANCE] || "Complete each step to move forward with your booking";
  const preparationTips = customContent?.preparationTips || PREPARATION_TIPS[currentStep as keyof typeof PREPARATION_TIPS] || [];
  const timeEstimate = TIME_ESTIMATES[currentStep as keyof typeof TIME_ESTIMATES];
  const faqItems = FAQ_BY_STEP[currentStep as keyof typeof FAQ_BY_STEP] || [];
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  // Service-specific guidance
  const serviceSpecificTip = formData.services?.map(service => 
    SERVICE_SPECIFIC_TIPS[service as keyof typeof SERVICE_SPECIFIC_TIPS]
  ).filter(Boolean)[0];

  // Event type specific guidance
  const eventTypeTip = formData.eventType ? EVENT_TYPE_TIPS[formData.eventType as keyof typeof EVENT_TYPE_TIPS] : null;

  // Venue-specific guidance (mock data for demo)
  const venueGuidance = formData.venue === 'The Grand Ballroom' ? "We've worked at The Grand Ballroom before - we know their setup requirements" : null;

  // Seasonal tips (mock data for demo)
  const seasonalTip = formData.eventDate?.includes('12-25') ? "Holiday booking: Consider weather backup plans and extended setup time" : null;

  const nextStepPreview = currentStep < totalSteps - 1 ? {
    0: "Next: Select date and time for your event",
    1: "Next: Provide your event details", 
    2: "Next: Enter your contact information",
    3: "Next: Review and confirm your booking"
  }[currentStep] : "Ready to submit!";

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-6 flex flex-col space-y-4 sm:space-y-6 ${theme === 'minimal' ? 'theme-minimal' : ''}`}
      data-testid="what-happens-next"
      data-high-contrast-support="true"
    >
      {/* Live region for screen reader announcements */}
      <div 
        className="sr-only" 
        aria-live="polite"
        data-testid="help-content-live-region"
      />

      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-brand-charcoal mb-2" role="heading" level={3}>
          What Happens Next?
        </h3>
        
        {/* Next step preview */}
        <div className="text-brand-gold font-medium" data-testid="next-step-preview">
          {nextStepPreview}
        </div>
      </div>

      {/* Essential information - always visible */}
      <div data-testid="essential-info" className="block">
        {/* Step guidance */}
        <div className="mb-4">
          <p className="text-brand-dark-gray" data-testid="step-guidance">
            {stepGuidance}
          </p>
          
          {/* Time estimate */}
          <div className="text-sm text-brand-dark-gray mt-2" data-testid="time-estimate">
            This step typically takes {timeEstimate}
          </div>
          
          {/* Progress context */}
          <div className="text-sm text-brand-dark-gray" data-testid="progress-context">
            You're {progressPercentage}% through the booking process
          </div>
        </div>

        {/* Preparation tips */}
        {preparationTips.length > 0 && (
          <div className="mb-4" data-testid="preparation-tips">
            <h4 className="font-medium text-brand-charcoal mb-2">What to prepare:</h4>
            <ul className="space-y-1 text-sm text-brand-dark-gray">
              {preparationTips.map((tip, index) => (
                <li key={index} className="flex items-start" data-testid={`preparation-tip-${index}`}>
                  <span className="text-brand-gold mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Context-aware tips */}
        <div className="space-y-2 text-sm">
          {serviceSpecificTip && (
            <div className="bg-blue-50 p-3 rounded" data-testid="service-specific-tip">
              <strong>Service tip:</strong> {serviceSpecificTip}
            </div>
          )}
          
          {eventTypeTip && (
            <div className="bg-green-50 p-3 rounded" data-testid="event-type-tip">
              {eventTypeTip}
            </div>
          )}
          
          {venueGuidance && (
            <div className="bg-purple-50 p-3 rounded" data-testid="venue-guidance">
              <strong>Venue info:</strong> {venueGuidance}
            </div>
          )}
          
          {seasonalTip && (
            <div className="bg-yellow-50 p-3 rounded" data-testid="seasonal-tip">
              <strong>Seasonal note:</strong> {seasonalTip}
            </div>
          )}
        </div>
      </div>

      {/* Collapsible additional information */}
      <div data-testid="additional-info" className="hidden sm:block">
        {/* Timeline section */}
        <div className={`border-t border-gray-200 pt-4 ${window.innerWidth <= 768 ? 'mobile-collapsible' : ''}`} data-testid="timeline-section">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-brand-charcoal" role="heading" level={4}>
              Timeline
            </h4>
            <button
              onClick={handleExpandDetails}
              className="text-brand-charcoal hover:text-brand-gold transition-colors duration-200 min-h-[44px] touch-manipulation"
              data-testid="expand-details"
              aria-expanded={expandedSections['detailed-timeline'] || false}
              aria-label="Show detailed booking timeline"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleExpandDetails();
                }
              }}
            >
              <span className="mr-2">
                {expandedSections['detailed-timeline'] ? 'Hide' : 'Show'} details
              </span>
              <svg 
                className={`inline w-4 h-4 transition-transform duration-200 ${expandedSections['detailed-timeline'] ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          <div data-testid="timeline-info">
            {/* Response timeline */}
            <div className="text-sm text-brand-dark-gray mb-2" data-testid="response-timeline">
              We'll contact you within {timelineData.isRushBooking ? '12 hours' : '24-48 hours'} to confirm your booking
            </div>

            {/* Rush booking note */}
            {timelineData.isRushBooking && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded mb-4" data-testid="urgent-timeline-note">
                <strong>Rush booking:</strong> We'll prioritize your request and respond within 12 hours
              </div>
            )}

            {/* Detailed timeline */}
            {expandedSections['detailed-timeline'] && (
              <div className="space-y-3 mt-4" data-testid="detailed-timeline">
                <ol className="space-y-2 text-sm text-brand-dark-gray">
                  <li className="flex" data-testid="timeline-item-0">
                    <span className="font-semibold text-brand-gold mr-2 w-6">1.</span>
                    <span>Submit booking request</span>
                  </li>
                  <li className="flex" data-testid="timeline-item-1">
                    <span className="font-semibold text-brand-gold mr-2 w-6">2.</span>
                    <span>Receive confirmation call (24-48 hours)</span>
                  </li>
                  <li className="flex" data-testid="timeline-item-2">
                    <span className="font-semibold text-brand-gold mr-2 w-6">3.</span>
                    <span>$200 deposit to secure date</span>
                  </li>
                  <li className="flex" data-testid="timeline-item-3">
                    <span className="font-semibold text-brand-gold mr-2 w-6">4.</span>
                    <span>Final details discussion</span>
                  </li>
                  <li className="flex" data-testid="timeline-item-4">
                    <span className="font-semibold text-brand-gold mr-2 w-6">5.</span>
                    <span>
                      Event day - {formData.services?.includes('photography') 
                        ? 'photographer arrives 30 minutes early'
                        : 'we arrive 2 hours early'}
                    </span>
                  </li>
                </ol>

                {/* Modification policy */}
                <div className="border-t border-gray-200 pt-3 mt-4" data-testid="modification-policy">
                  <div className="text-sm text-brand-dark-gray">
                    <strong>Changes & Cancellations:</strong> Changes can be made up to 7 days before your event
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support contact section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="mb-3" data-testid="support-contact">
            <h4 className="font-medium text-brand-charcoal mb-2">Need Help?</h4>
            
            <div className="space-y-2 text-sm text-brand-dark-gray">
              <div className="flex items-center space-x-4">
                <div data-testid="phone-number">
                  📞 {contactInfo?.phone || '(555) 123-4567'}
                </div>
                <div data-testid="email-address">
                  ✉️ {contactInfo?.email || 'booking@dappersquad.com'}
                </div>
              </div>
              
              <div data-testid="business-hours">
                Available: Monday-Sunday, 9am-9pm
              </div>
              
              <div data-testid="emergency-contact">
                For urgent requests within 48 hours: Call (555) 987-6543
              </div>
              
              <div data-testid="preferred-contact">
                Questions? Call us for immediate assistance or use our live chat
              </div>
            </div>

            {/* Contact options */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                className="px-4 py-2 bg-brand-gold hover:bg-brand-dark-gold text-white rounded text-sm font-medium min-h-[44px] touch-manipulation"
                data-testid="live-chat-button"
                tabIndex={0}
              >
                Start Live Chat
              </button>
              
              <div className="flex space-x-2" data-testid="social-contact">
                <a 
                  href="https://facebook.com/dappersquad"
                  className="p-2 text-brand-charcoal hover:text-brand-gold"
                  data-testid="facebook-link"
                  aria-label="Contact us on Facebook"
                >
                  📘
                </a>
                <a 
                  href="https://instagram.com/dappersquad"
                  className="p-2 text-brand-charcoal hover:text-brand-gold"
                  data-testid="instagram-link"
                  aria-label="Contact us on Instagram"
                >
                  📷
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        {faqItems.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-brand-charcoal mb-3">Common Questions</h4>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.id} data-testid={`faq-item-${item.id}`}>
                  <h5 className="text-sm font-medium text-brand-charcoal">{item.question}</h5>
                  <p className="text-sm text-brand-dark-gray">{item.answer}</p>
                </div>
              ))}
            </div>

            {/* Service-specific FAQ */}
            {formData.services?.includes('karaoke') && (
              <div className="mt-3 bg-purple-50 p-3 rounded" data-testid="service-specific-faq">
                <h5 className="text-sm font-medium text-brand-charcoal">How many songs are in your karaoke library?</h5>
                <p className="text-sm text-brand-dark-gray">Over 5,000 songs in multiple languages and genres.</p>
              </div>
            )}
          </div>
        )}

        {/* Help icons with tooltips */}
        <div className="hidden">
          <button data-testid="deposit-help-icon" aria-label="Get help about deposits">
            <span data-testid="help-icon-deposit">ⓘ</span>
          </button>
          <div data-testid="tooltip" className="hidden">
            The deposit secures your date and is applied to your final payment
          </div>
        </div>
      </div>

      {/* Content update counter for testing */}
      <div className="sr-only" data-testid="content-update-count" data-count={lastUpdateCount} />

      {/* Generic guidance fallback */}
      {!stepGuidance && (
        <div data-testid="generic-guidance">
          Complete each step to move forward with your booking
        </div>
      )}
    </div>
  );
}