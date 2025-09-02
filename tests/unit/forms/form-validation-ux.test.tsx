/**
 * @fileoverview Tests for Form Validation UX Enhancements
 * 
 * Tests the Phase 2 enhancement of adding aria-live, inputmode, 
 * autocomplete and accessibility improvements to form validation.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiStepBookingForm } from '@/components/forms/MultiStepBookingForm';

// Mock the hooks and API calls
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

jest.mock('@/lib/api', () => ({
  createBooking: jest.fn().mockResolvedValue({
    success: true,
    bookingReference: 'DSE-123456-ABC'
  })
}));

describe('Form Validation UX Enhancements', () => {
  const mockProps = {
    onComplete: jest.fn(),
    onCancel: jest.fn(),
    initialData: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Date Input Enhancements', () => {
    it('should have proper accessibility attributes for date input', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // First select a service (required for step validation)
      const djServiceButton = screen.getByText('DJ Services');
      fireEvent.click(djServiceButton);
      
      // Navigate to date selection step
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        
        // Should have min attribute set to today
        const today = new Date().toISOString().split('T')[0];
        expect(dateInput).toHaveAttribute('min', today);
        
        // Should have aria-invalid initially false
        expect(dateInput).toHaveAttribute('aria-invalid', 'false');
        
        // Should not have aria-describedby when no error
        expect(dateInput).not.toHaveAttribute('aria-describedby');
      });
    });

    it('should show accessible error message when date validation fails', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // First select a service (required for step validation)
      const djServiceButton = screen.getByText('DJ Services');
      fireEvent.click(djServiceButton);
      
      // Navigate to date selection step
      fireEvent.click(screen.getByText('Next'));
      
      // Try to proceed without selecting date
      await waitFor(() => {
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        const errorMessage = screen.getByText('Please select an event date');
        
        // Error message should have proper ARIA attributes
        expect(errorMessage).toHaveAttribute('id', 'eventDate-error');
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
        
        // Input should reference error message
        expect(dateInput).toHaveAttribute('aria-describedby', 'eventDate-error');
        expect(dateInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Time Input Enhancements', () => {
    it('should have proper accessibility attributes for time inputs', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // First select a service (required for step validation)
      const djServiceButton = screen.getByText('DJ Services');
      fireEvent.click(djServiceButton);
      
      // Navigate to date/time step
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        const startTimeInput = screen.getByLabelText(/start time/i);
        
        // Should have proper initial ARIA attributes
        expect(startTimeInput).toHaveAttribute('aria-invalid', 'false');
        expect(startTimeInput).not.toHaveAttribute('aria-describedby');
      });
    });

    it('should show accessible error for missing start time', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // First select a service (required for step validation)
      const djServiceButton = screen.getByText('DJ Services');
      fireEvent.click(djServiceButton);
      
      // Navigate to date/time step
      fireEvent.click(screen.getByText('Next'));
      
      // Fill date but not time, then try to proceed
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const startTimeInput = screen.getByLabelText(/start time/i);
        const errorMessage = screen.getByText('Please select an event time');
        
        // Error message should have proper ARIA attributes
        expect(errorMessage).toHaveAttribute('id', 'eventStartTime-error');
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
        
        // Input should reference error message
        expect(startTimeInput).toHaveAttribute('aria-describedby', 'eventStartTime-error');
        expect(startTimeInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Contact Information Input Enhancements', () => {
    beforeEach(async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate through steps to contact info
      fireEvent.click(screen.getByText('Next')); // Skip service selection
      
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
        const timeInput = screen.getByLabelText(/start time/i);
        fireEvent.change(timeInput, { target: { value: '18:00' } });
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const eventTypeSelect = screen.getByTestId('event-type');
        fireEvent.change(eventTypeSelect, { target: { value: 'wedding' } });
        const venueInput = screen.getByLabelText(/venue name/i);
        fireEvent.change(venueInput, { target: { value: 'Test Venue' } });
        fireEvent.click(screen.getByText('Next'));
      });
    });

    it('should have proper autocomplete attributes for name input', async () => {
      await waitFor(() => {
        const nameInput = screen.getByTestId('client-name');
        
        expect(nameInput).toHaveAttribute('autoComplete', 'name');
        expect(nameInput).toHaveAttribute('aria-invalid', 'false');
        expect(nameInput).not.toHaveAttribute('aria-describedby');
      });
    });

    it('should have proper inputmode and autocomplete for email input', async () => {
      await waitFor(() => {
        const emailInput = screen.getByTestId('client-email');
        
        expect(emailInput).toHaveAttribute('inputMode', 'email');
        expect(emailInput).toHaveAttribute('autoComplete', 'email');
        expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('should have proper inputmode and autocomplete for phone input', async () => {
      await waitFor(() => {
        const phoneInput = screen.getByTestId('client-phone');
        
        expect(phoneInput).toHaveAttribute('inputMode', 'tel');
        expect(phoneInput).toHaveAttribute('autoComplete', 'tel');
        expect(phoneInput).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('should show accessible error messages for contact validation', async () => {
      // Try to proceed without filling required fields
      await waitFor(() => {
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const nameInput = screen.getByTestId('client-name');
        const emailInput = screen.getByTestId('client-email');
        const phoneInput = screen.getByTestId('client-phone');
        
        // Check name field error
        const nameError = screen.getByText('Please enter your full name');
        expect(nameError).toHaveAttribute('id', 'clientName-error');
        expect(nameError).toHaveAttribute('role', 'alert');
        expect(nameError).toHaveAttribute('aria-live', 'polite');
        expect(nameInput).toHaveAttribute('aria-describedby', 'clientName-error');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        
        // Check email field error
        const emailError = screen.getByText('Please enter a valid email address');
        expect(emailError).toHaveAttribute('id', 'clientEmail-error');
        expect(emailError).toHaveAttribute('role', 'alert');
        expect(emailError).toHaveAttribute('aria-live', 'polite');
        expect(emailInput).toHaveAttribute('aria-describedby', 'clientEmail-error');
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        
        // Check phone field error
        const phoneError = screen.getByText('Please enter a valid phone number');
        expect(phoneError).toHaveAttribute('id', 'clientPhone-error');
        expect(phoneError).toHaveAttribute('role', 'alert');
        expect(phoneError).toHaveAttribute('aria-live', 'polite');
        expect(phoneInput).toHaveAttribute('aria-describedby', 'clientPhone-error');
        expect(phoneInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Event Details Input Enhancements', () => {
    it('should have proper accessibility attributes for event type select', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate to event details step
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
        const timeInput = screen.getByLabelText(/start time/i);
        fireEvent.change(timeInput, { target: { value: '18:00' } });
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const eventTypeSelect = screen.getByTestId('event-type');
        
        expect(eventTypeSelect).toHaveAttribute('aria-invalid', 'false');
        expect(eventTypeSelect).not.toHaveAttribute('aria-describedby');
      });
    });

    it('should show accessible error for event type validation', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate to event details and try to proceed without selection
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
        const timeInput = screen.getByLabelText(/start time/i);
        fireEvent.change(timeInput, { target: { value: '18:00' } });
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const eventTypeSelect = screen.getByTestId('event-type');
        const errorMessage = screen.getByText('Please select an event type');
        
        expect(errorMessage).toHaveAttribute('id', 'eventType-error');
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
        expect(eventTypeSelect).toHaveAttribute('aria-describedby', 'eventType-error');
        expect(eventTypeSelect).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have proper autocomplete for venue input', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate to event details step
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
        const timeInput = screen.getByLabelText(/start time/i);
        fireEvent.change(timeInput, { target: { value: '18:00' } });
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const venueInput = screen.getByLabelText(/venue name/i);
        
        expect(venueInput).toHaveAttribute('autoComplete', 'organization');
        expect(venueInput).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('should have proper autocomplete for venue address textarea', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate to event details step
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
        const timeInput = screen.getByLabelText(/start time/i);
        fireEvent.change(timeInput, { target: { value: '18:00' } });
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const addressTextarea = screen.getByLabelText(/venue address/i);
        
        expect(addressTextarea).toHaveAttribute('autoComplete', 'street-address');
      });
    });

    it('should have proper inputmode and constraints for guest count', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate to event details step
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
        const timeInput = screen.getByLabelText(/start time/i);
        fireEvent.change(timeInput, { target: { value: '18:00' } });
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const guestCountInput = screen.getByLabelText(/expected guest count/i);
        
        expect(guestCountInput).toHaveAttribute('inputMode', 'numeric');
        expect(guestCountInput).toHaveAttribute('min', '1');
        expect(guestCountInput).toHaveAttribute('max', '10000');
      });
    });
  });

  describe('Error Message Accessibility', () => {
    it('should announce errors to screen readers with aria-live', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate to step with validation and trigger error
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        
        errorMessages.forEach(message => {
          expect(message).toHaveAttribute('aria-live', 'polite');
        });
      });
    });

    it('should clear error states when fields are corrected', async () => {
      const user = userEvent.setup();
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate to contact step and trigger validation error
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        const dateInput = screen.getByTestId('event-date');
        fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
        const timeInput = screen.getByLabelText(/start time/i);
        fireEvent.change(timeInput, { target: { value: '18:00' } });
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const eventTypeSelect = screen.getByTestId('event-type');
        fireEvent.change(eventTypeSelect, { target: { value: 'wedding' } });
        const venueInput = screen.getByLabelText(/venue name/i);
        fireEvent.change(venueInput, { target: { value: 'Test Venue' } });
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Next')); // Trigger validation errors
      });
      
      await waitFor(() => {
        const nameInput = screen.getByTestId('client-name');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
      
      // Fill the name field
      await user.type(screen.getByTestId('client-name'), 'John Doe');
      
      await waitFor(() => {
        const nameInput = screen.getByTestId('client-name');
        // Error state should be cleared
        expect(nameInput).toHaveAttribute('aria-invalid', 'false');
        expect(nameInput).not.toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Form Progress and Navigation', () => {
    it('should maintain accessibility during form progression', async () => {
      render(<MultiStepBookingForm {...mockProps} />);
      
      // Each step should maintain proper form structure
      const form = screen.getByRole('dialog');
      expect(form).toHaveAttribute('aria-modal', 'true');
      
      // Progress through steps
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        // Form should still be accessible
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});