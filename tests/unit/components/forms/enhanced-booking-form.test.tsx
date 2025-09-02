/**
 * @fileoverview Enhanced Booking Form UX Tests - TDD Implementation
 * 
 * Tests for enhanced booking form UX features:
 * - Instant pricing calculator with real-time updates
 * - Service preview modals with photos/videos and testimonials  
 * - Progress celebration animations and confetti effects
 * - "What happens next?" preview guidance
 * - Enhanced form validation with better UX feedback
 * - Mobile responsiveness and accessibility compliance
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiStepBookingForm } from '@/components/forms/MultiStepBookingForm';

// Mock components that we'll enhance
jest.mock('@/components/ui/instant-pricing-calculator', () => ({
  InstantPricingCalculator: ({ services, onPriceChange }: any) => (
    <div data-testid="pricing-calculator">
      <div data-testid="total-price">
        Total: ${services.length * 300} - ${services.length * 800}
      </div>
      <div data-testid="package-discount">
        {services.length > 1 && 'Package discount applied!'}
      </div>
      <div data-testid="breakdown">
        {services.map((service: string) => (
          <div key={service} data-testid={`service-price-${service}`}>
            {service}: $300 - $800
          </div>
        ))}
      </div>
    </div>
  )
}));

jest.mock('@/components/ui/service-preview-modal', () => ({
  ServicePreviewModal: ({ isOpen, serviceId, onClose }: any) => (
    isOpen ? (
      <div data-testid="service-preview-modal">
        <button onClick={onClose} data-testid="close-modal">Close</button>
        <div data-testid="service-photos">Sample photos for {serviceId}</div>
        <div data-testid="service-videos">Sample videos for {serviceId}</div>
        <div data-testid="service-testimonials">Customer testimonials</div>
        <div data-testid="service-equipment">Equipment details</div>
      </div>
    ) : null
  )
}));

jest.mock('@/components/ui/progress-celebration', () => ({
  ProgressCelebration: ({ show, stepName }: any) => (
    show ? (
      <div data-testid="progress-celebration">
        <div data-testid="confetti-animation">🎉</div>
        <div data-testid="celebration-message">Step completed: {stepName}</div>
        <div data-testid="achievement-badge">Achievement unlocked!</div>
      </div>
    ) : null
  )
}));

jest.mock('@/components/ui/what-happens-next', () => ({
  WhatHappensNext: ({ currentStep, formData }: any) => (
    <div data-testid="what-happens-next">
      <div data-testid="next-step-preview">
        Next: {currentStep === 0 ? 'Select date and time' : 'Provide details'}
      </div>
      <div data-testid="timeline-info">Timeline information</div>
      <div data-testid="preparation-guidance">What to prepare</div>
      <div data-testid="support-contact">Support: (555) 123-4567</div>
    </div>
  )
}));

// Mock hooks and utilities
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

jest.mock('@/lib/api', () => ({
  createBooking: jest.fn().mockResolvedValue({
    success: true,
    bookingId: 'DSE-TEST-123'
  })
}));

describe('Enhanced Booking Form UX', () => {
  const mockProps = {
    onComplete: jest.fn(),
    onCancel: jest.fn(),
    initialData: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('Instant Pricing Calculator', () => {
    test('shows pricing calculator when services are selected', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Select a service
      const djService = screen.getByTestId('service-card-dj');
      await userEvent.click(djService);
      
      // Should show pricing calculator
      expect(screen.getByTestId('pricing-calculator')).toBeInTheDocument();
      expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $300 - $800');
    });

    test('updates pricing in real-time as services are selected/deselected', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Select DJ service
      await userEvent.click(screen.getByTestId('service-card-dj'));
      expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $300 - $800');
      
      // Add karaoke service
      await userEvent.click(screen.getByTestId('service-card-karaoke'));
      expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $600 - $1600');
      
      // Remove DJ service
      await userEvent.click(screen.getByTestId('service-card-dj'));
      expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $300 - $800');
    });

    test('shows package discount for multiple services', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Select multiple services
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByTestId('service-card-photography'));
      
      expect(screen.getByTestId('package-discount')).toHaveTextContent('Package discount applied!');
    });

    test('shows detailed cost breakdown', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByTestId('service-card-karaoke'));
      
      expect(screen.getByTestId('service-price-dj')).toHaveTextContent('dj: $300 - $800');
      expect(screen.getByTestId('service-price-karaoke')).toHaveTextContent('karaoke: $300 - $800');
    });

    test('maintains pricing accuracy throughout form', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Select services and progress through form
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      // Should still show pricing on subsequent steps
      expect(screen.getByTestId('pricing-calculator')).toBeInTheDocument();
    });
  });

  describe('Service Preview Modals', () => {
    test('opens preview modal when service info button is clicked', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Look for preview button on service card
      const previewButton = screen.getByTestId('service-preview-dj');
      await userEvent.click(previewButton);
      
      expect(screen.getByTestId('service-preview-modal')).toBeInTheDocument();
    });

    test('shows photos and videos in preview modal', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-preview-dj'));
      
      expect(screen.getByTestId('service-photos')).toBeInTheDocument();
      expect(screen.getByTestId('service-videos')).toBeInTheDocument();
      expect(screen.getByTestId('service-photos')).toHaveTextContent('Sample photos for dj');
    });

    test('displays service-specific testimonials', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-preview-photography'));
      
      expect(screen.getByTestId('service-testimonials')).toBeInTheDocument();
      expect(screen.getByTestId('service-testimonials')).toHaveTextContent('Customer testimonials');
    });

    test('shows equipment and setup information', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-preview-karaoke'));
      
      expect(screen.getByTestId('service-equipment')).toBeInTheDocument();
      expect(screen.getByTestId('service-equipment')).toHaveTextContent('Equipment details');
    });

    test('closes modal when close button is clicked', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-preview-dj'));
      expect(screen.getByTestId('service-preview-modal')).toBeInTheDocument();
      
      await userEvent.click(screen.getByTestId('close-modal'));
      expect(screen.queryByTestId('service-preview-modal')).not.toBeInTheDocument();
    });

    test('supports keyboard navigation in modal', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-preview-dj'));
      const modal = screen.getByTestId('service-preview-modal');
      
      // Test ESC key closes modal
      fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });
      expect(screen.queryByTestId('service-preview-modal')).not.toBeInTheDocument();
    });
  });

  describe('Progress Celebration Animations', () => {
    test('shows confetti animation when step is completed', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Complete first step
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByTestId('progress-celebration')).toBeInTheDocument();
      expect(screen.getByTestId('confetti-animation')).toBeInTheDocument();
    });

    test('displays step completion message', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByTestId('celebration-message')).toHaveTextContent('Step completed: Select Services');
    });

    test('shows achievement badges for completed sections', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByTestId('achievement-badge')).toHaveTextContent('Achievement unlocked!');
    });

    test('respects reduced motion preferences', async () => {
      // Mock reduced motion preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      // Should still show celebration but without animations
      expect(screen.getByTestId('celebration-message')).toBeInTheDocument();
    });

    test('progress bar fills with celebration particles', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      // Check that progress bar shows celebration effects
      const progressBar = screen.getByTestId('animated-progress-bar');
      expect(progressBar).toHaveAttribute('data-celebrating', 'true');
    });
  });

  describe('What Happens Next Preview', () => {
    test('shows next step preview at each stage', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      expect(screen.getByTestId('what-happens-next')).toBeInTheDocument();
      expect(screen.getByTestId('next-step-preview')).toHaveTextContent('Next: Select date and time');
    });

    test('displays timeline information', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      expect(screen.getByTestId('timeline-info')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-info')).toHaveTextContent('Timeline information');
    });

    test('provides preparation guidance for next step', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      expect(screen.getByTestId('preparation-guidance')).toBeInTheDocument();
      expect(screen.getByTestId('preparation-guidance')).toHaveTextContent('What to prepare');
    });

    test('shows contact information and support', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      expect(screen.getByTestId('support-contact')).toBeInTheDocument();
      expect(screen.getByTestId('support-contact')).toHaveTextContent('Support: (555) 123-4567');
    });

    test('updates preview content based on current step', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Complete first step and move to next
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByTestId('next-step-preview')).toHaveTextContent('Next: Provide details');
    });
  });

  describe('Enhanced Form Validation', () => {
    test('shows real-time validation feedback', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Try to proceed without selecting services
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByTestId('validation-error-services')).toBeInTheDocument();
      expect(screen.getByTestId('validation-error-services')).toHaveTextContent('Please select at least one service');
    });

    test('provides helpful error messages with suggestions', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      const errorMessage = screen.getByTestId('validation-error-services');
      expect(errorMessage).toHaveAttribute('data-suggestion', 'Choose from our DJ, Karaoke, or Photography services');
    });

    test('shows validation success feedback', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-card-dj'));
      
      expect(screen.getByTestId('validation-success-services')).toBeInTheDocument();
      expect(screen.getByTestId('validation-success-services')).toHaveTextContent('Great choice! DJ services selected');
    });

    test('validates email format with helpful feedback', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate to contact step
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      // Fill date/time
      await userEvent.type(screen.getByTestId('event-date'), '2024-12-25');
      await userEvent.type(screen.getByLabelText(/start time/i), '18:00');
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      // Fill event details
      await userEvent.selectOptions(screen.getByTestId('event-type'), 'wedding');
      await userEvent.type(screen.getByLabelText(/venue name/i), 'Test Venue');
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      // Enter invalid email
      await userEvent.type(screen.getByTestId('client-email'), 'invalid-email');
      
      expect(screen.getByTestId('validation-error-email')).toBeInTheDocument();
      expect(screen.getByTestId('validation-error-email')).toHaveTextContent('Please enter a valid email address (e.g., john@example.com)');
    });

    test('validates phone number format', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate to contact step
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      await userEvent.type(screen.getByTestId('event-date'), '2024-12-25');
      await userEvent.type(screen.getByLabelText(/start time/i), '18:00');
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      await userEvent.selectOptions(screen.getByTestId('event-type'), 'wedding');
      await userEvent.type(screen.getByLabelText(/venue name/i), 'Test Venue');
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      // Enter invalid phone
      await userEvent.type(screen.getByTestId('client-phone'), '123');
      
      expect(screen.getByTestId('validation-error-phone')).toBeInTheDocument();
      expect(screen.getByTestId('validation-error-phone')).toHaveTextContent('Please enter a valid phone number (at least 10 digits)');
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts layout for mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<MultiStepBookingForm {...mockProps} />);
      
      const form = screen.getByTestId('booking-form');
      expect(form).toHaveClass('mobile-optimized');
    });

    test('touch targets meet 44px minimum', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      const serviceCards = screen.getAllByTestId(/service-card-/);
      serviceCards.forEach(card => {
        expect(card).toHaveStyle('min-height: 44px');
        expect(card).toHaveStyle('min-width: 44px');
      });
    });

    test('supports swipe gestures on mobile', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      const form = screen.getByTestId('booking-form');
      
      // Simulate swipe left gesture
      fireEvent.touchStart(form, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchMove(form, { touches: [{ clientX: 50, clientY: 100 }] });
      fireEvent.touchEnd(form);
      
      // Should navigate to next step (if valid)
      expect(screen.getByTestId('swipe-navigation')).toHaveAttribute('data-direction', 'left');
    });

    test('scales fonts appropriately for mobile', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-xl sm:text-2xl');
    });
  });

  describe('Accessibility Compliance', () => {
    test('maintains proper heading hierarchy', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      // No h1 should be present within form (reserved for page title)
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });

    test('provides ARIA labels for form controls', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      const serviceCards = screen.getAllByTestId(/service-card-/);
      serviceCards.forEach(card => {
        expect(card).toHaveAttribute('aria-label');
        expect(card).toHaveAttribute('role', 'button');
      });
    });

    test('supports screen readers with live regions', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-card-dj'));
      
      expect(screen.getByTestId('pricing-calculator')).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByTestId('validation-messages')).toHaveAttribute('aria-live', 'assertive');
    });

    test('keyboard navigation works throughout form', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      const firstService = screen.getByTestId('service-card-dj');
      firstService.focus();
      
      // Test Enter key selection
      fireEvent.keyDown(firstService, { key: 'Enter' });
      expect(screen.getByTestId('pricing-calculator')).toBeInTheDocument();
      
      // Test Tab navigation
      fireEvent.keyDown(firstService, { key: 'Tab' });
      expect(document.activeElement).toBe(screen.getByTestId('service-card-karaoke'));
    });

    test('form validation errors are announced to screen readers', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      const errorMessage = screen.getByTestId('validation-error-services');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });

    test('progress indicator is accessible', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      const progressBar = screen.getByTestId('animated-progress-bar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '5');
    });
  });

  describe('Performance Considerations', () => {
    test('lazy loads service preview content', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Preview content should not be loaded initially
      expect(screen.queryByTestId('service-photos')).not.toBeInTheDocument();
      
      // Only loads when modal is opened
      await userEvent.click(screen.getByTestId('service-preview-dj'));
      expect(screen.getByTestId('service-photos')).toBeInTheDocument();
    });

    test('debounces pricing calculations', async () => {
      const mockCalculate = jest.fn();
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Rapidly select/deselect services
      const djCard = screen.getByTestId('service-card-dj');
      await userEvent.click(djCard);
      await userEvent.click(djCard);
      await userEvent.click(djCard);
      
      // Should debounce calculations
      await waitFor(() => {
        expect(mockCalculate).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });

    test('optimizes animation performance', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      const celebrationElement = screen.getByTestId('progress-celebration');
      expect(celebrationElement).toHaveStyle('will-change: transform');
      expect(celebrationElement).toHaveStyle('transform: translateZ(0)'); // Force GPU acceleration
    });
  });

  describe('Integration with Existing Features', () => {
    test('maintains existing data-testid attributes', () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Verify existing test IDs still work
      expect(screen.getByTestId('service-card-dj')).toBeInTheDocument();
      expect(screen.getByTestId('animated-progress-bar')).toBeInTheDocument();
    });

    test('preserves API integration', async () => {
      const { createBooking } = require('@/lib/api');
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Complete entire form
      await userEvent.click(screen.getByTestId('service-card-dj'));
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await userEvent.type(screen.getByTestId('event-date'), '2024-12-25');
      await userEvent.type(screen.getByLabelText(/start time/i), '18:00');
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await userEvent.selectOptions(screen.getByTestId('event-type'), 'wedding');
      await userEvent.type(screen.getByLabelText(/venue name/i), 'Test Venue');
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await userEvent.type(screen.getByTestId('client-name'), 'John Doe');
      await userEvent.type(screen.getByTestId('client-email'), 'john@example.com');
      await userEvent.type(screen.getByTestId('client-phone'), '5551234567');
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await userEvent.click(screen.getByTestId('submit-booking'));
      
      expect(createBooking).toHaveBeenCalledWith({
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '5551234567',
        eventDate: '2024-12-25',
        eventStartTime: '18:00',
        eventEndTime: undefined,
        eventType: 'wedding',
        services: ['dj'],
        venue: 'Test Venue',
        venueAddress: undefined,
        guestCount: undefined,
        specialRequests: undefined
      });
    });

    test('maintains localStorage auto-save functionality', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      await userEvent.click(screen.getByTestId('service-card-dj'));
      
      // Check localStorage was updated
      const savedData = localStorage.getItem('dapper-squad-booking-draft');
      expect(savedData).toBeTruthy();
      
      const parsedData = JSON.parse(savedData!);
      expect(parsedData.services).toContain('dj');
    });
  });
});