import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiStepBookingForm } from '@/components/forms/MultiStepBookingForm';

// Mock the API calls
jest.mock('@/lib/api', () => ({
  createBooking: jest.fn(),
  checkAvailability: jest.fn(),
}));

// Mock canvas-confetti to prevent JSDOM issues
jest.mock('canvas-confetti', () => {
  return {
    __esModule: true,
    default: jest.fn(() => Promise.resolve()),
  };
});

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('MultiStepBookingForm', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // Clear all mocks and state
    jest.clearAllMocks();
    
    // Clear any DOM state first
    cleanup();
    
    // Reset localStorage mocks with fresh instances
    localStorageMock.getItem.mockClear().mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    
    // Make sure localStorage returns null consistently
    localStorageMock.getItem.mockImplementation(() => null);
    
    // Reset any window event listeners that might persist
    if (typeof window !== 'undefined') {
      // Remove any existing listeners
      const events = ['step-completed', 'booking-completed', 'service-selected'];
      events.forEach(event => {
        window.removeEventListener(event as any, jest.fn());
      });
    }
  });
  
  afterEach(() => {
    // Ensure complete cleanup after each test
    cleanup();
  });

  it('renders the first step (service selection) by default', () => {
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    expect(screen.getByRole('heading', { name: 'Select Services' })).toBeInTheDocument();
    expect(screen.getByText('DJ Services')).toBeInTheDocument();
    expect(screen.getByText('Karaoke')).toBeInTheDocument();
    expect(screen.getByText('Photography')).toBeInTheDocument();
  });

  it('shows progress indicator with correct step', () => {
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    const progressSteps = screen.getAllByTestId(/step-\d+/);
    expect(progressSteps).toHaveLength(5);
    
    // Check that the first step indicator exists and has proper attributes
    const firstStepIndicator = screen.getByTestId('step-indicator-0');
    expect(firstStepIndicator).toBeInTheDocument();
    
    // Check progress bar shows current step
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('advances to next step when service is selected and next is clicked', async () => {
    const user = userEvent.setup();
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Select DJ service using the service card
    const djServiceCard = screen.getByTestId('service-card-dj');
    await user.click(djServiceCard);
    
    // Click next
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Should now be on step 2 (date/time selection)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Select Date & Time' })).toBeInTheDocument();
    });
  });

  it('prevents advancing without selecting at least one service', async () => {
    const user = userEvent.setup();
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Try to click next without selecting service
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Should show error and stay on step 1
    await waitFor(() => {
      expect(screen.getByText('Please select at least one service')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Select Services' })).toBeInTheDocument();
  });

  it('allows going back to previous step', async () => {
    const user = userEvent.setup();
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Select service and advance to step 2
    const djServiceCard = screen.getByTestId('service-card-dj');
    await user.click(djServiceCard);
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Should be on step 2
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Select Date & Time' })).toBeInTheDocument();
    });
    
    // Click back
    await user.click(screen.getByRole('button', { name: /back/i }));
    
    // Should be back on step 1
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Select Services' })).toBeInTheDocument();
    });
  });

  it('shows pricing information for selected services', async () => {
    const user = userEvent.setup();
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Select DJ service
    const djServiceCard = screen.getByTestId('service-card-dj');
    await user.click(djServiceCard);
    
    // Should show pricing summary
    await waitFor(() => {
      expect(screen.getByText(/Total Estimated: \$300 - \$800/)).toBeInTheDocument();
    });
  });

  it('calculates total price correctly for multiple services', async () => {
    const user = userEvent.setup();
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Select multiple services
    const djServiceCard = screen.getByTestId('service-card-dj');
    const photoServiceCard = screen.getByTestId('service-card-photography');
    await user.click(djServiceCard);
    await user.click(photoServiceCard);
    
    // Should show combined pricing - DJ ($300-800) + Photography ($300-800) = $600-1600
    await waitFor(() => {
      expect(screen.getByText(/Total Estimated: \$600 - \$1600/)).toBeInTheDocument();
    });
  });

  it('validates required fields on each step', async () => {
    const user = userEvent.setup();
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Select service and advance to step 2
    const djServiceCard = screen.getByTestId('service-card-dj');
    await user.click(djServiceCard);
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Should be on step 2
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Select Date & Time' })).toBeInTheDocument();
    });
    
    // Try to advance without selecting date
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please select an event date')).toBeInTheDocument();
    });
  });

  it('shows booking summary on final step', async () => {
    const user = userEvent.setup();
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Fill out step 1 - Select services
    const djServiceCard = screen.getByTestId('service-card-dj');
    await user.click(djServiceCard);
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Fill out step 2 - Date & Time
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Select Date & Time' })).toBeInTheDocument();
    });
    const eventDateInput = screen.getByLabelText(/event date/i);
    const eventTimeInput = screen.getByLabelText(/start time/i);
    await user.type(eventDateInput, '2024-12-25');
    await user.type(eventTimeInput, '18:00');
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Fill out step 3 - Event Details
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Event Details' })).toBeInTheDocument();
    });
    await user.selectOptions(screen.getByLabelText(/event type/i), 'wedding');
    await user.type(screen.getByLabelText(/venue name/i), 'Test Venue');
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Fill out step 4 - Contact Information
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Contact Information' })).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '555-123-4567');
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Should now be on step 5 - Review & Confirm
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Review & Confirm' })).toBeInTheDocument();
    });
    
    // Should show booking summary
    expect(screen.getByText('DJ Services')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onComplete when form is successfully submitted', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    const { createBooking } = require('@/lib/api');
    createBooking.mockResolvedValue({ success: true, bookingId: 'booking-123' });
    
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Fill out complete form through all steps
    // Step 1 - Services
    const djServiceCard = screen.getByTestId('service-card-dj');
    await user.click(djServiceCard);
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 2 - Date & Time
    await waitFor(() => screen.getByRole('heading', { name: 'Select Date & Time' }));
    await user.type(screen.getByLabelText(/event date/i), '2024-12-25');
    await user.type(screen.getByLabelText(/start time/i), '18:00');
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 3 - Event Details
    await waitFor(() => screen.getByRole('heading', { name: 'Event Details' }));
    await user.selectOptions(screen.getByLabelText(/event type/i), 'wedding');
    await user.type(screen.getByLabelText(/venue name/i), 'Test Venue');
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 4 - Contact Information
    await waitFor(() => screen.getByRole('heading', { name: 'Contact Information' }));
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '555-123-4567');
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 5 - Submit
    await waitFor(() => screen.getByRole('heading', { name: 'Review & Confirm' }));
    await user.click(screen.getByRole('button', { name: /submit booking/i }));
    
    // Should call API and onComplete callback
    await waitFor(() => {
      expect(createBooking).toHaveBeenCalledTimes(1);
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('persists form data when navigating between steps', async () => {
    const user = userEvent.setup();
    render(<MultiStepBookingForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Select services
    const djServiceCard = screen.getByTestId('service-card-dj');
    const photoServiceCard = screen.getByTestId('service-card-photography');
    await user.click(djServiceCard);
    await user.click(photoServiceCard);
    
    // Go to next step
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Should be on step 2
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Select Date & Time' })).toBeInTheDocument();
    });
    
    // Go back
    await user.click(screen.getByRole('button', { name: /back/i }));
    
    // Should be back on step 1
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Select Services' })).toBeInTheDocument();
    });
    
    // Services should still be selected (check aria-pressed state)
    const djServiceCardAfter = screen.getByTestId('service-card-dj');
    const photoServiceCardAfter = screen.getByTestId('service-card-photography');
    expect(djServiceCardAfter).toHaveAttribute('aria-pressed', 'true');
    expect(photoServiceCardAfter).toHaveAttribute('aria-pressed', 'true');
  });
});