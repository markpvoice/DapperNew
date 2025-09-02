/**
 * @fileoverview What Happens Next Tests - TDD Implementation
 * 
 * Tests for the "What happens next?" preview guidance component:
 * - Step-by-step preview information
 * - Timeline expectations and preparation guidance
 * - Support contact information
 * - Context-aware help content
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WhatHappensNext } from '@/components/ui/what-happens-next';

describe('WhatHappensNext', () => {
  const defaultProps = {
    currentStep: 0,
    totalSteps: 5,
    formData: {
      services: ['dj'],
      eventDate: '2024-12-25',
      eventType: 'wedding'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step Preview Information', () => {
    test('shows next step preview for each current step', () => {
      const { rerender } = render(<WhatHappensNext {...defaultProps} currentStep={0} />);
      expect(screen.getByTestId('next-step-preview')).toHaveTextContent('Next: Select date and time for your event');
      
      rerender(<WhatHappensNext {...defaultProps} currentStep={1} />);
      expect(screen.getByTestId('next-step-preview')).toHaveTextContent('Next: Provide your event details');
      
      rerender(<WhatHappensNext {...defaultProps} currentStep={2} />);
      expect(screen.getByTestId('next-step-preview')).toHaveTextContent('Next: Enter your contact information');
      
      rerender(<WhatHappensNext {...defaultProps} currentStep={3} />);
      expect(screen.getByTestId('next-step-preview')).toHaveTextContent('Next: Review and confirm your booking');
    });

    test('provides step-specific guidance', () => {
      render(<WhatHappensNext {...defaultProps} currentStep={0} />);
      
      expect(screen.getByTestId('step-guidance')).toHaveTextContent(
        'Choose when your event will take place. We recommend booking at least 2 weeks in advance.'
      );
    });

    test('shows preparation tips for upcoming step', () => {
      render(<WhatHappensNext {...defaultProps} currentStep={1} />);
      
      const preparationTips = screen.getByTestId('preparation-tips');
      expect(preparationTips).toBeInTheDocument();
      
      const tips = screen.getAllByTestId(/preparation-tip-\d+/);
      expect(tips[0]).toHaveTextContent('Have your venue address ready');
      expect(tips[1]).toHaveTextContent('Know your expected guest count');
      expect(tips[2]).toHaveTextContent('Think about any special requests');
    });

    test('adapts content based on selected services', () => {
      render(<WhatHappensNext {...defaultProps} formData={{ ...defaultProps.formData, services: ['dj', 'photography'] }} />);
      
      expect(screen.getByTestId('service-specific-tip')).toHaveTextContent(
        'For photography services, consider lighting and backdrop preferences'
      );
    });

    test('shows time estimates for each step', () => {
      render(<WhatHappensNext {...defaultProps} currentStep={0} />);
      
      expect(screen.getByTestId('time-estimate')).toHaveTextContent('This step typically takes 2-3 minutes');
    });

    test('displays progress context', () => {
      render(<WhatHappensNext {...defaultProps} currentStep={2} />);
      
      expect(screen.getByTestId('progress-context')).toHaveTextContent('You\'re 40% through the booking process');
    });
  });

  describe('Timeline Information', () => {
    test('displays booking process timeline', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      expect(screen.getByTestId('timeline-info')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-title')).toHaveTextContent('What to Expect');
    });

    test('shows response timeline', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      expect(screen.getByTestId('response-timeline')).toHaveTextContent(
        'We\'ll contact you within 24-48 hours to confirm your booking'
      );
    });

    test('displays deposit and payment timeline', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const timelineItems = screen.getAllByTestId(/timeline-item-\d+/);
      
      expect(timelineItems[0]).toHaveTextContent('Submit booking request');
      expect(timelineItems[1]).toHaveTextContent('Receive confirmation call (24-48 hours)');
      expect(timelineItems[2]).toHaveTextContent('$200 deposit to secure date');
      expect(timelineItems[3]).toHaveTextContent('Final details discussion');
      expect(timelineItems[4]).toHaveTextContent('Event day - we arrive 2 hours early');
    });

    test('shows service-specific timeline adjustments', () => {
      render(<WhatHappensNext {...defaultProps} formData={{ ...defaultProps.formData, services: ['photography'] }} />);
      
      expect(screen.getByTestId('timeline-item-4')).toHaveTextContent('Event day - photographer arrives 30 minutes early');
    });

    test('adapts timeline for event date proximity', () => {
      const nearFutureDate = new Date();
      nearFutureDate.setDate(nearFutureDate.getDate() + 7);
      
      render(<WhatHappensNext {...defaultProps} formData={{ ...defaultProps.formData, eventDate: nearFutureDate.toISOString().split('T')[0] }} />);
      
      expect(screen.getByTestId('urgent-timeline-note')).toHaveTextContent(
        'Rush booking: We\'ll prioritize your request and respond within 12 hours'
      );
    });

    test('shows cancellation and modification policy', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      expect(screen.getByTestId('modification-policy')).toHaveTextContent(
        'Changes can be made up to 7 days before your event'
      );
    });
  });

  describe('Support Contact Information', () => {
    test('displays primary contact information', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      expect(screen.getByTestId('support-contact')).toBeInTheDocument();
      expect(screen.getByTestId('phone-number')).toHaveTextContent('(555) 123-4567');
      expect(screen.getByTestId('email-address')).toHaveTextContent('booking@dappersquad.com');
    });

    test('shows business hours', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      expect(screen.getByTestId('business-hours')).toHaveTextContent(
        'Available: Monday-Sunday, 9am-9pm'
      );
    });

    test('provides emergency contact for urgent needs', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      expect(screen.getByTestId('emergency-contact')).toHaveTextContent(
        'For urgent requests within 48 hours: Call (555) 987-6543'
      );
    });

    test('shows preferred contact methods by step', () => {
      render(<WhatHappensNext {...defaultProps} currentStep={0} />);
      
      expect(screen.getByTestId('preferred-contact')).toHaveTextContent(
        'Questions? Call us for immediate assistance or use our live chat'
      );
    });

    test('includes social media contact options', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      expect(screen.getByTestId('social-contact')).toBeInTheDocument();
      expect(screen.getByTestId('facebook-link')).toHaveAttribute('href', 'https://facebook.com/dappersquad');
      expect(screen.getByTestId('instagram-link')).toHaveAttribute('href', 'https://instagram.com/dappersquad');
    });

    test('provides live chat availability', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const liveChatButton = screen.getByTestId('live-chat-button');
      expect(liveChatButton).toBeInTheDocument();
      expect(liveChatButton).toHaveTextContent('Start Live Chat');
    });
  });

  describe('Context-Aware Help Content', () => {
    test('shows relevant FAQ based on current step', () => {
      render(<WhatHappensNext {...defaultProps} currentStep={0} />);
      
      const faqItems = screen.getAllByTestId(/faq-item-\d+/);
      expect(faqItems[0]).toHaveTextContent('What services do you offer?');
      expect(faqItems[1]).toHaveTextContent('Can I book multiple services?');
    });

    test('adapts help content for selected services', () => {
      render(<WhatHappensNext {...defaultProps} formData={{ ...defaultProps.formData, services: ['karaoke'] }} />);
      
      expect(screen.getByTestId('service-specific-faq')).toHaveTextContent(
        'How many songs are in your karaoke library?'
      );
    });

    test('shows relevant tips based on event type', () => {
      render(<WhatHappensNext {...defaultProps} formData={{ ...defaultProps.formData, eventType: 'wedding' }} />);
      
      expect(screen.getByTestId('event-type-tip')).toHaveTextContent(
        'Wedding tip: Consider your first dance song and special requests'
      );
    });

    test('provides venue-specific guidance when available', () => {
      render(<WhatHappensNext {...defaultProps} formData={{ ...defaultProps.formData, venue: 'The Grand Ballroom' }} />);
      
      expect(screen.getByTestId('venue-guidance')).toHaveTextContent(
        'We\'ve worked at The Grand Ballroom before - we know their setup requirements'
      );
    });

    test('shows seasonal or holiday-specific tips', () => {
      render(<WhatHappensNext {...defaultProps} formData={{ ...defaultProps.formData, eventDate: '2024-12-25' }} />);
      
      expect(screen.getByTestId('seasonal-tip')).toHaveTextContent(
        'Holiday booking: Consider weather backup plans and extended setup time'
      );
    });
  });

  describe('Interactive Features', () => {
    test('allows expanding detailed information', async () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const expandButton = screen.getByTestId('expand-details');
      expect(screen.queryByTestId('detailed-timeline')).not.toBeInTheDocument();
      
      await userEvent.click(expandButton);
      expect(screen.getByTestId('detailed-timeline')).toBeInTheDocument();
    });

    test('provides inline help tooltips', async () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const helpIcon = screen.getByTestId('deposit-help-icon');
      
      await userEvent.hover(helpIcon);
      expect(screen.getByTestId('tooltip')).toHaveTextContent(
        'The deposit secures your date and is applied to your final payment'
      );
      
      await userEvent.unhover(helpIcon);
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const expandButton = screen.getByTestId('expand-details');
      expandButton.focus();
      
      fireEvent.keyDown(expandButton, { key: 'Enter' });
      expect(screen.getByTestId('detailed-timeline')).toBeInTheDocument();
      
      // Tab navigation through help content
      fireEvent.keyDown(expandButton, { key: 'Tab' });
      expect(document.activeElement).toBe(screen.getByTestId('live-chat-button'));
    });

    test('remembers user preferences for expanded sections', async () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      await userEvent.click(screen.getByTestId('expand-details'));
      
      // Simulate re-render (as would happen when step changes)
      render(<WhatHappensNext {...defaultProps} currentStep={1} />);
      
      // Should remember that details were expanded
      expect(screen.getByTestId('detailed-timeline')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides proper heading hierarchy', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('What Happens Next?');
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Timeline');
    });

    test('includes ARIA labels for interactive elements', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const expandButton = screen.getByTestId('expand-details');
      expect(expandButton).toHaveAttribute('aria-label', 'Show detailed booking timeline');
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('announces content changes to screen readers', async () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const liveRegion = screen.getByTestId('help-content-live-region');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      
      await userEvent.click(screen.getByTestId('expand-details'));
      
      expect(liveRegion).toHaveTextContent('Detailed timeline information is now visible');
    });

    test('provides alternative text for help icons', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const helpIcons = screen.getAllByTestId(/help-icon-/);
      helpIcons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-label', expect.stringContaining('help'));
      });
    });

    test('supports high contrast mode', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const component = screen.getByTestId('what-happens-next');
      expect(component).toHaveAttribute('data-high-contrast-support', 'true');
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts layout for mobile screens', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const component = screen.getByTestId('what-happens-next');
      expect(component).toHaveClass('flex', 'flex-col', 'space-y-4', 'sm:space-y-6');
    });

    test('uses collapsible sections on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      
      render(<WhatHappensNext {...defaultProps} />);
      
      const timelineSection = screen.getByTestId('timeline-section');
      expect(timelineSection).toHaveClass('mobile-collapsible');
    });

    test('prioritizes essential information on small screens', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const essentialInfo = screen.getByTestId('essential-info');
      expect(essentialInfo).toHaveClass('block');
      
      const additionalInfo = screen.getByTestId('additional-info');
      expect(additionalInfo).toHaveClass('hidden', 'sm:block');
    });

    test('uses touch-friendly button sizes', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveStyle('min-height: 44px');
        expect(button).toHaveClass('touch-manipulation');
      });
    });
  });

  describe('Performance', () => {
    test('lazy loads non-essential content', () => {
      render(<WhatHappensNext {...defaultProps} />);
      
      // Detailed timeline should not be in DOM initially
      expect(screen.queryByTestId('detailed-timeline')).not.toBeInTheDocument();
    });

    test('memoizes expensive calculations', () => {
      const calculateSpy = jest.spyOn(Date.prototype, 'getTime');
      
      render(<WhatHappensNext {...defaultProps} />);
      
      // Should only calculate timeline once
      expect(calculateSpy).toHaveBeenCalledTimes(1);
      
      calculateSpy.mockRestore();
    });

    test('debounces rapid content updates', () => {
      const { rerender } = render(<WhatHappensNext {...defaultProps} />);
      
      // Rapid step changes should be debounced
      rerender(<WhatHappensNext {...defaultProps} currentStep={1} />);
      rerender(<WhatHappensNext {...defaultProps} currentStep={2} />);
      rerender(<WhatHappensNext {...defaultProps} currentStep={3} />);
      
      // Should only trigger one content update
      expect(screen.getByTestId('content-update-count')).toHaveAttribute('data-count', '1');
    });
  });

  describe('Error Handling', () => {
    test('handles missing form data gracefully', () => {
      render(<WhatHappensNext {...defaultProps} formData={{}} />);
      
      expect(screen.getByTestId('generic-guidance')).toHaveTextContent(
        'Complete each step to move forward with your booking'
      );
    });

    test('shows fallback content when help data is unavailable', () => {
      render(<WhatHappensNext {...defaultProps} helpDataError={true} />);
      
      expect(screen.getByTestId('fallback-help')).toHaveTextContent(
        'For assistance, please call us at (555) 123-4567'
      );
    });

    test('handles invalid step numbers', () => {
      render(<WhatHappensNext {...defaultProps} currentStep={99} />);
      
      expect(screen.getByTestId('invalid-step-message')).toHaveTextContent(
        'Please contact us for assistance with your booking'
      );
    });
  });

  describe('Content Customization', () => {
    test('supports custom help content injection', () => {
      const customContent = {
        stepGuidance: 'Custom guidance for this step',
        preparationTips: ['Custom tip 1', 'Custom tip 2']
      };
      
      render(<WhatHappensNext {...defaultProps} customContent={customContent} />);
      
      expect(screen.getByTestId('step-guidance')).toHaveTextContent('Custom guidance for this step');
    });

    test('allows override of contact information', () => {
      const customContact = {
        phone: '(555) 999-9999',
        email: 'custom@example.com'
      };
      
      render(<WhatHappensNext {...defaultProps} contactInfo={customContact} />);
      
      expect(screen.getByTestId('phone-number')).toHaveTextContent('(555) 999-9999');
      expect(screen.getByTestId('email-address')).toHaveTextContent('custom@example.com');
    });

    test('supports theme customization', () => {
      render(<WhatHappensNext {...defaultProps} theme="minimal" />);
      
      const component = screen.getByTestId('what-happens-next');
      expect(component).toHaveClass('theme-minimal');
    });
  });
});