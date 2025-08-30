/**
 * @fileoverview Booking Form Micro-interactions & Celebrations Tests
 * 
 * TDD test suite for booking form animation enhancements including:
 * - Step completion celebrations (confetti, check marks)
 * - Progress bar animations
 * - Service selection micro-interactions
 * - Form validation delight elements
 * - Booking confirmation celebrations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock animation libraries
jest.mock('canvas-confetti', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock the toast system
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock the booking API
jest.mock('@/lib/api', () => ({
  createBooking: jest.fn()
}));

// Component imports - these will be enhanced after tests
import { EnhancedMultiStepBookingForm } from '@/components/forms/enhanced-multistep-booking-form';
import { AnimatedProgressBar } from '@/components/ui/animated-progress-bar';
import { CelebrationService } from '@/components/ui/celebration-service';
import { ServiceCard } from '@/components/ui/service-card';

// Mock requestAnimationFrame for animations
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

describe('Booking Form Celebrations & Micro-interactions', () => {

  describe('AnimatedProgressBar Component', () => {
    const mockSteps = [
      'Select Services',
      'Date & Time', 
      'Event Details',
      'Contact Info',
      'Confirm'
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render progress bar with all steps', () => {
      render(
        <AnimatedProgressBar 
          steps={mockSteps}
          currentStep={0}
          completedSteps={[]}
        />
      );

      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      mockSteps.forEach((step, index) => {
        expect(screen.getByTestId(`step-${index}`)).toBeInTheDocument();
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('should animate progress bar fill when step advances', async () => {
      const { rerender } = render(
        <AnimatedProgressBar 
          steps={mockSteps}
          currentStep={0}
          completedSteps={[]}
        />
      );

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle('width: 0%');

      // Advance to step 1
      rerender(
        <AnimatedProgressBar 
          steps={mockSteps}
          currentStep={1}
          completedSteps={[0]}
        />
      );

      await waitFor(() => {
        expect(progressFill).toHaveStyle('width: 20%'); // 1/5 steps
      });
    });

    it('should show check mark animation for completed steps', async () => {
      render(
        <AnimatedProgressBar 
          steps={mockSteps}
          currentStep={2}
          completedSteps={[0, 1]}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('checkmark-0')).toHaveClass('animate-scale-in');
        expect(screen.getByTestId('checkmark-1')).toHaveClass('animate-scale-in');
      });

      // Future steps should not have checkmarks
      expect(screen.queryByTestId('checkmark-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('checkmark-3')).not.toBeInTheDocument();
    });

    it('should pulse current step indicator', () => {
      render(
        <AnimatedProgressBar 
          steps={mockSteps}
          currentStep={2}
          completedSteps={[0, 1]}
        />
      );

      const currentStepIndicator = screen.getByTestId('step-indicator-2');
      expect(currentStepIndicator).toHaveClass('animate-pulse-gentle');
    });

    it('should handle reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
        })),
      });

      render(
        <AnimatedProgressBar 
          steps={mockSteps}
          currentStep={1}
          completedSteps={[0]}
        />
      );

      // Animations should be disabled
      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).not.toHaveClass('transition-all');
    });

    it('should have proper ARIA attributes for accessibility', () => {
      render(
        <AnimatedProgressBar 
          steps={mockSteps}
          currentStep={2}
          completedSteps={[0, 1]}
        />
      );

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '2');
      expect(progressBar).toHaveAttribute('aria-valuemax', '5');
      expect(progressBar).toHaveAttribute('aria-label', 'Form completion progress');
    });
  });

  describe('CelebrationService Component', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should trigger confetti animation on step completion', async () => {
      const mockConfetti = require('canvas-confetti').default;
      
      render(<CelebrationService />);
      
      // Trigger step completion celebration
      fireEvent(window, new CustomEvent('step-completed', { 
        detail: { stepIndex: 1, stepName: 'Date & Time' }
      }));

      await waitFor(() => {
        expect(mockConfetti).toHaveBeenCalledWith({
          particleCount: 50,
          spread: 60,
          origin: { x: 0.5, y: 0.7 },
          colors: ['#FFD700', '#FFA500', '#FF6B6B'],
          shapes: ['circle', 'square'],
          scalar: 0.8
        });
      });
    });

    it('should show animated success message for booking completion', async () => {
      render(<CelebrationService />);
      
      // Trigger booking completion celebration
      fireEvent(window, new CustomEvent('booking-completed', { 
        detail: { bookingReference: 'DSE-123456-ABC' }
      }));

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
        expect(screen.getByText('Booking Confirmed! 🎉')).toBeInTheDocument();
        expect(screen.getByTestId('success-animation')).toHaveClass('animate-bounce-in');
      });

      // Success message should auto-hide after 3 seconds
      await waitFor(() => {
        expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
      }, { timeout: 3500 });
    });

    it('should create floating hearts animation for service selection', async () => {
      render(<CelebrationService />);
      
      fireEvent(window, new CustomEvent('service-selected', { 
        detail: { serviceId: 'dj', serviceName: 'DJ Services' }
      }));

      await waitFor(() => {
        const heartsContainer = screen.getByTestId('floating-hearts');
        expect(heartsContainer).toBeInTheDocument();
        expect(heartsContainer.children.length).toBeGreaterThan(0);
      });

      // Hearts should disappear after animation
      await waitFor(() => {
        expect(screen.queryByTestId('floating-hearts')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle multiple simultaneous celebrations gracefully', async () => {
      const mockConfetti = require('canvas-confetti').default;
      render(<CelebrationService />);
      
      // Trigger multiple celebrations rapidly
      fireEvent(window, new CustomEvent('service-selected'));
      fireEvent(window, new CustomEvent('step-completed'));
      fireEvent(window, new CustomEvent('service-selected'));

      await waitFor(() => {
        // Should queue celebrations rather than overlap
        expect(mockConfetti).toHaveBeenCalledTimes(1);
      });
    });

    it('should respect reduced motion preferences', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
        })),
      });

      const mockConfetti = require('canvas-confetti').default;
      render(<CelebrationService />);
      
      fireEvent(window, new CustomEvent('step-completed'));

      // Confetti should not be triggered with reduced motion
      expect(mockConfetti).not.toHaveBeenCalled();
    });
  });

  describe('ServiceCard Component with Micro-interactions', () => {
    const mockService = {
      id: 'dj',
      name: 'DJ Services',
      description: 'Professional DJ with premium sound system',
      priceRange: { min: 300, max: 800 },
      popular: true
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render service card with hover animations', () => {
      render(
        <ServiceCard 
          service={mockService}
          isSelected={false}
          onSelect={jest.fn()}
        />
      );

      const card = screen.getByTestId('service-card-dj');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('transform', 'transition-all', 'duration-300');
    });

    it('should show selection animation when service is chosen', async () => {
      const mockOnSelect = jest.fn();
      render(
        <ServiceCard 
          service={mockService}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByTestId('service-card-dj');
      fireEvent.click(card);

      expect(mockOnSelect).toHaveBeenCalledWith('dj');
      
      await waitFor(() => {
        expect(card).toHaveClass('animate-pulse-once');
      });
    });

    it('should display popular badge with sparkle animation', () => {
      render(
        <ServiceCard 
          service={mockService}
          isSelected={false}
          onSelect={jest.fn()}
        />
      );

      const popularBadge = screen.getByTestId('popular-badge');
      expect(popularBadge).toBeInTheDocument();
      expect(popularBadge).toHaveClass('animate-sparkle');
      expect(popularBadge).toHaveTextContent('Popular');
    });

    it('should show price range with animation on hover', async () => {
      render(
        <ServiceCard 
          service={mockService}
          isSelected={false}
          onSelect={jest.fn()}
        />
      );

      const card = screen.getByTestId('service-card-dj');
      fireEvent.mouseEnter(card);

      await waitFor(() => {
        const priceDisplay = screen.getByTestId('price-display');
        expect(priceDisplay).toHaveClass('animate-slide-up');
        expect(priceDisplay).toHaveTextContent('$300 - $800');
      });
    });

    it('should have visual selection state with checkmark', () => {
      render(
        <ServiceCard 
          service={mockService}
          isSelected={true}
          onSelect={jest.fn()}
        />
      );

      const card = screen.getByTestId('service-card-dj');
      const checkmark = screen.getByTestId('selection-checkmark');
      
      expect(card).toHaveClass('ring-2', 'ring-brand-gold');
      expect(checkmark).toBeInTheDocument();
      expect(checkmark).toHaveClass('animate-scale-in');
    });

    it('should handle keyboard interactions with focus animations', async () => {
      const mockOnSelect = jest.fn();
      render(
        <ServiceCard 
          service={mockService}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByTestId('service-card-dj');
      
      // Focus the card
      card.focus();
      expect(card).toHaveClass('focus:ring-2', 'focus:ring-brand-gold');

      // Select with Enter key
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnSelect).toHaveBeenCalledWith('dj');

      // Select with Space key  
      fireEvent.keyDown(card, { key: ' ' });
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('EnhancedMultiStepBookingForm Integration', () => {
    const mockProps = {
      onComplete: jest.fn(),
      onCancel: jest.fn(),
      initialData: {}
    };

    beforeEach(() => {
      jest.clearAllMocks();
      const { createBooking } = require('@/lib/api');
      createBooking.mockResolvedValue({
        success: true,
        booking: { id: '123', bookingReference: 'DSE-123456-ABC' }
      });
    });

    it('should render enhanced form with all animation components', () => {
      render(<EnhancedMultiStepBookingForm {...mockProps} />);

      expect(screen.getByTestId('enhanced-booking-form')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByTestId('celebration-service')).toBeInTheDocument();
    });

    it('should trigger step completion celebration when advancing', async () => {
      const user = userEvent.setup();
      render(<EnhancedMultiStepBookingForm {...mockProps} />);

      // Select a service to enable next step
      const djCard = screen.getByTestId('service-card-dj');
      await user.click(djCard);

      // Advance to next step
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Should trigger celebration event
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator-1')).toHaveClass('animate-pulse-gentle');
      });
    });

    it('should show form validation with delightful error states', async () => {
      const user = userEvent.setup();
      render(<EnhancedMultiStepBookingForm {...mockProps} />);

      // Try to advance without selecting services
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        const errorMessage = screen.getByTestId('validation-error');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('animate-shake');
        expect(errorMessage).toHaveTextContent('Please select at least one service');
      });
    });

    it('should complete full booking flow with celebrations', async () => {
      const user = userEvent.setup();
      const mockConfetti = require('canvas-confetti').default;
      
      render(<EnhancedMultiStepBookingForm {...mockProps} />);

      // Complete all form steps
      // Step 1: Select service
      await user.click(screen.getByTestId('service-card-dj'));
      await user.click(screen.getByText('Next'));

      // Step 2: Date & Time
      const dateInput = screen.getByLabelText('Event Date');
      await user.type(dateInput, '2025-12-25');
      const timeInput = screen.getByLabelText('Start Time');
      await user.type(timeInput, '18:00');
      await user.click(screen.getByText('Next'));

      // Step 3: Event Details
      const eventTypeSelect = screen.getByLabelText('Event Type');
      await user.selectOptions(eventTypeSelect, 'wedding');
      const venueInput = screen.getByLabelText('Venue Name');
      await user.type(venueInput, 'Grand Ballroom');
      await user.click(screen.getByText('Next'));

      // Step 4: Contact Information
      const nameInput = screen.getByLabelText('Full Name');
      await user.type(nameInput, 'John Doe');
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'john@example.com');
      const phoneInput = screen.getByLabelText('Phone Number');
      await user.type(phoneInput, '555-123-4567');
      await user.click(screen.getByText('Next'));

      // Step 5: Confirm booking
      const confirmButton = screen.getByText('Confirm Booking');
      await user.click(confirmButton);

      // Should trigger final celebration
      await waitFor(() => {
        expect(mockConfetti).toHaveBeenCalledWith({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6B6B'],
          shapes: ['star', 'circle']
        });
      });

      expect(screen.getByText('Booking Confirmed! 🎉')).toBeInTheDocument();
    });

    it('should handle booking submission errors gracefully', async () => {
      const user = userEvent.setup();
      const { createBooking } = require('@/lib/api');
      createBooking.mockRejectedValue(new Error('Network error'));

      render(<EnhancedMultiStepBookingForm {...mockProps} />);

      // Complete form and submit
      // ... (complete form steps as above) ...
      
      // Mock form completion and submit
      const form = screen.getByTestId('enhanced-booking-form');
      fireEvent.submit(form);

      await waitFor(() => {
        const errorMessage = screen.getByTestId('submission-error');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('animate-shake');
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });

    it('should maintain animations during loading states', async () => {
      const user = userEvent.setup();
      const { createBooking } = require('@/lib/api');
      
      // Mock slow API response
      createBooking.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            success: true, 
            booking: { id: '123', bookingReference: 'DSE-123456-ABC' }
          }), 1000)
        )
      );

      render(<EnhancedMultiStepBookingForm {...mockProps} />);

      // Mock form submission
      const form = screen.getByTestId('enhanced-booking-form');
      fireEvent.submit(form);

      // Should show loading animation
      await waitFor(() => {
        const submitButton = screen.getByText('Submitting...');
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toHaveClass('animate-pulse');
        expect(submitButton).toBeDisabled();
      });

      // Loading spinner should be visible
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should preserve form data during animations', async () => {
      const user = userEvent.setup();
      render(<EnhancedMultiStepBookingForm {...mockProps} />);

      // Fill form data
      await user.click(screen.getByTestId('service-card-dj'));
      
      // Trigger celebration animation
      fireEvent(window, new CustomEvent('service-selected'));

      // Form data should remain intact during animation
      expect(screen.getByTestId('service-card-dj')).toHaveClass('ring-2', 'ring-brand-gold');
      
      // Should still be able to continue with form
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });

    it('should handle rapid user interactions during animations', async () => {
      const user = userEvent.setup();
      render(<EnhancedMultiStepBookingForm {...mockProps} />);

      const djCard = screen.getByTestId('service-card-dj');
      const karaokeCard = screen.getByTestId('service-card-karaoke');

      // Rapidly select/deselect services
      await user.click(djCard);
      await user.click(karaokeCard);
      await user.click(djCard);
      await user.click(karaokeCard);

      // Form should handle rapid interactions gracefully
      await waitFor(() => {
        // Both services should be selected
        expect(djCard).toHaveClass('ring-2', 'ring-brand-gold');
        expect(karaokeCard).toHaveClass('ring-2', 'ring-brand-gold');
      });
    });
  });

  describe('Accessibility and Performance', () => {
    it('should maintain WCAG compliance during animations', async () => {
      render(<EnhancedMultiStepBookingForm onComplete={jest.fn()} onCancel={jest.fn()} />);

      // All interactive elements should remain keyboard accessible
      const serviceCard = screen.getByTestId('service-card-dj');
      expect(serviceCard).toHaveAttribute('tabIndex', '0');
      expect(serviceCard).toHaveAttribute('role', 'button');
      
      // Form should maintain proper ARIA labels
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('aria-live', 'polite');
    });

    it('should not impact form performance during animations', async () => {
      const performanceStart = performance.now();
      
      render(<EnhancedMultiStepBookingForm onComplete={jest.fn()} onCancel={jest.fn()} />);
      
      // Trigger multiple animations
      fireEvent(window, new CustomEvent('service-selected'));
      fireEvent(window, new CustomEvent('step-completed'));
      
      const performanceEnd = performance.now();
      
      // Should complete within reasonable time
      expect(performanceEnd - performanceStart).toBeLessThan(100);
    });

    it('should cleanup animations on component unmount', () => {
      const { unmount } = render(<CelebrationService />);
      
      const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
      unmount();
      
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });
  });
});