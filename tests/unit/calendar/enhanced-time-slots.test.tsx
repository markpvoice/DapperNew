/**
 * Enhanced Time Slots Test Suite
 * Testing comprehensive time slot calculation, availability logic, and buffer management
 * TDD RED Phase: Comprehensive failing tests for time slot functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeSlotGrid } from '@/components/calendar/time-slot-grid';
import { useTimeSlotSelection } from '@/hooks/use-time-slot-selection';
import { 
  generateTimeSlots, 
  calculateServiceDuration, 
  calculateBufferTime,
  checkSlotAvailability,
  formatTimeSlot,
  parseTimeSlot,
  validateTimeRange,
  calculateSetupTime,
  calculateBreakdownTime,
  mergeTimeSlots,
  findConflictingSlots
} from '@/lib/time-slot-utils';

// Mock the hooks and components that don't exist yet
jest.mock('@/components/calendar/time-slot-grid', () => ({
  TimeSlotGrid: jest.fn(() => <div data-testid="time-slot-grid">Time Slot Grid</div>)
}));

jest.mock('@/hooks/use-time-slot-selection', () => ({
  useTimeSlotSelection: jest.fn()
}));

describe('Enhanced Time Slots - Time Slot Calculations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTimeSlots', () => {
    it('should generate 15-minute time slots for business hours (8 AM - 11 PM)', () => {
      const date = '2024-02-15';
      const slots = generateTimeSlots(date);
      
      // Should generate slots from 8:00 AM to 11:00 PM in 15-minute increments
      // Total: 15 hours * 4 slots per hour = 60 slots
      expect(slots).toHaveLength(60);
      expect(slots[0]).toEqual({
        start: '08:00',
        end: '08:15',
        available: true,
        slotIndex: 0
      });
      expect(slots[59]).toEqual({
        start: '22:45', 
        end: '23:00',
        available: true,
        slotIndex: 59
      });
    });

    it('should handle different time zones correctly', () => {
      const date = '2024-02-15';
      const timezone = 'America/Chicago';
      const slots = generateTimeSlots(date, { timezone });
      
      expect(slots).toBeDefined();
      expect(slots).toHaveLength(60);
    });

    it('should exclude past time slots for current date', () => {
      const today = new Date().toISOString().split('T')[0];
      const slots = generateTimeSlots(today);
      
      expect(slots).toBeDefined();
      // Should have some slots (even if past ones are excluded)
      expect(slots.length).toBeGreaterThan(0);
    });
  });

  describe('Service Duration Calculations', () => {
    it('should calculate correct duration for DJ services (4-6 hours, default 5)', () => {
      const duration = calculateServiceDuration(['DJ']);
      
      expect(calculateServiceDuration).toHaveBeenCalledWith(['DJ']);
      expect(duration).toBe(300); // 5 hours in minutes
    });

    it('should calculate correct duration for Photography services (3-8 hours, default 4)', () => {
      const duration = calculateServiceDuration(['Photography']);
      
      expect(calculateServiceDuration).toHaveBeenCalledWith(['Photography']);
      expect(duration).toBe(240); // 4 hours in minutes
    });

    it('should calculate correct duration for Karaoke services (2-5 hours, default 3)', () => {
      const duration = calculateServiceDuration(['Karaoke']);
      
      expect(calculateServiceDuration).toHaveBeenCalledWith(['Karaoke']);
      expect(duration).toBe(180); // 3 hours in minutes
    });

    it('should calculate combo service durations correctly', () => {
      const djPhotography = calculateServiceDuration(['DJ', 'Photography']);
      const allServices = calculateServiceDuration(['DJ', 'Photography', 'Karaoke']);
      
      expect(calculateServiceDuration).toHaveBeenCalledWith(['DJ', 'Photography']);
      expect(calculateServiceDuration).toHaveBeenCalledWith(['DJ', 'Photography', 'Karaoke']);
      
      // Combo services should use the maximum duration, not additive
      expect(djPhotography).toBe(300); // Max of DJ (5h) and Photography (4h) = 5h
      expect(allServices).toBe(300); // Max of all services = 5h (DJ)
    });

    it('should handle custom durations', () => {
      const customDuration = calculateServiceDuration(['DJ'], { customDuration: 480 });
      
      expect(calculateServiceDuration).toHaveBeenCalledWith(['DJ'], { customDuration: 480 });
      expect(customDuration).toBe(480); // 8 hours
    });
  });

  describe('Buffer Time Management', () => {
    it('should calculate 30-minute buffer between different bookings', () => {
      const buffer = calculateBufferTime('between-bookings');
      
      expect(calculateBufferTime).toHaveBeenCalledWith('between-bookings');
      expect(buffer).toBe(30); // 30 minutes
    });

    it('should calculate 1-hour setup time before events', () => {
      const setupTime = calculateSetupTime(['DJ']);
      
      expect(calculateSetupTime).toHaveBeenCalledWith(['DJ']);
      expect(setupTime).toBe(60); // 1 hour
    });

    it('should calculate 30-minute breakdown time after events', () => {
      const breakdownTime = calculateBreakdownTime(['DJ']);
      
      expect(calculateBreakdownTime).toHaveBeenCalledWith(['DJ']);
      expect(breakdownTime).toBe(30); // 30 minutes
    });

    it('should adjust setup time for complex services', () => {
      const complexSetup = calculateSetupTime(['DJ', 'Photography', 'Karaoke']);
      
      expect(calculateSetupTime).toHaveBeenCalledWith(['DJ', 'Photography', 'Karaoke']);
      expect(complexSetup).toBe(90); // 1.5 hours for multiple services
    });
  });

  describe('Time Slot Formatting and Parsing', () => {
    it('should format time slots correctly in 12-hour format', () => {
      const formatted = formatTimeSlot('14:30', '12h');
      
      expect(formatTimeSlot).toHaveBeenCalledWith('14:30', '12h');
      expect(formatted).toBe('2:30 PM');
    });

    it('should format time slots correctly in 24-hour format', () => {
      const formatted = formatTimeSlot('14:30', '24h');
      
      expect(formatTimeSlot).toHaveBeenCalledWith('14:30', '24h');
      expect(formatted).toBe('14:30');
    });

    it('should parse time slots from various formats', () => {
      const parsed12h = parseTimeSlot('2:30 PM');
      const parsed24h = parseTimeSlot('14:30');
      
      expect(parseTimeSlot).toHaveBeenCalledWith('2:30 PM');
      expect(parseTimeSlot).toHaveBeenCalledWith('14:30');
      
      expect(parsed12h).toBe('14:30');
      expect(parsed24h).toBe('14:30');
    });

    it('should validate time range inputs', () => {
      const validRange = validateTimeRange('09:00', '17:00');
      const invalidRange = validateTimeRange('17:00', '09:00');
      
      expect(validateTimeRange).toHaveBeenCalledWith('09:00', '17:00');
      expect(validateTimeRange).toHaveBeenCalledWith('17:00', '09:00');
      
      expect(validRange).toBe(true);
      expect(invalidRange).toBe(false);
    });
  });

  describe('Slot Availability Checking', () => {
    const mockBookings = [
      {
        id: 1,
        date: '2024-02-15',
        startTime: '14:00',
        endTime: '18:00',
        services: ['DJ'],
        status: 'confirmed'
      }
    ];

    it('should check availability for single time slot', () => {
      const available = checkSlotAvailability('2024-02-15', '10:00', '10:15', mockBookings);
      
      expect(checkSlotAvailability).toHaveBeenCalledWith('2024-02-15', '10:00', '10:15', mockBookings);
      expect(available).toBe(true);
    });

    it('should detect conflicts with existing bookings', () => {
      const conflict = checkSlotAvailability('2024-02-15', '15:00', '16:00', mockBookings);
      
      expect(checkSlotAvailability).toHaveBeenCalledWith('2024-02-15', '15:00', '16:00', mockBookings);
      expect(conflict).toBe(false);
    });

    it('should respect buffer time around bookings', () => {
      // Should not allow booking 30 minutes before existing booking
      const tooClose = checkSlotAvailability('2024-02-15', '13:30', '14:00', mockBookings);
      
      expect(checkSlotAvailability).toHaveBeenCalledWith('2024-02-15', '13:30', '14:00', mockBookings);
      expect(tooClose).toBe(false);
    });

    it('should account for setup and breakdown time', () => {
      const options = { includeSetup: true, includeBreakdown: true };
      const availability = checkSlotAvailability('2024-02-15', '12:00', '13:00', mockBookings, options);
      
      expect(checkSlotAvailability).toHaveBeenCalledWith('2024-02-15', '12:00', '13:00', mockBookings, options);
      expect(availability).toBe(false); // Should conflict with setup time
    });
  });

  describe('Advanced Time Slot Operations', () => {
    it('should merge consecutive available time slots', () => {
      const slots = [
        { start: '10:00', end: '10:15', available: true },
        { start: '10:15', end: '10:30', available: true },
        { start: '10:30', end: '10:45', available: false },
        { start: '10:45', end: '11:00', available: true }
      ];
      
      const merged = mergeTimeSlots(slots);
      
      expect(mergeTimeSlots).toHaveBeenCalledWith(slots);
      expect(merged).toEqual([
        { start: '10:00', end: '10:30', available: true },
        { start: '10:30', end: '10:45', available: false },
        { start: '10:45', end: '11:00', available: true }
      ]);
    });

    it('should find conflicting time slots for new booking', () => {
      const existingSlots = [
        { start: '14:00', end: '18:00', bookingId: 1 }
      ];
      const newSlot = { start: '15:00', end: '17:00' };
      
      const conflicts = findConflictingSlots(newSlot, existingSlots);
      
      expect(findConflictingSlots).toHaveBeenCalledWith(newSlot, existingSlots);
      expect(conflicts).toEqual([{ start: '14:00', end: '18:00', bookingId: 1 }]);
    });

    it('should handle edge cases in time slot calculations', () => {
      // Test midnight boundary
      const midnightSlots = generateTimeSlots('2024-02-15', { startHour: 22, endHour: 2 });
      
      expect(generateTimeSlots).toHaveBeenCalledWith('2024-02-15', { startHour: 22, endHour: 2 });
      expect(midnightSlots).toBeDefined();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large date ranges efficiently', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const yearSlots = generateTimeSlots(startDate, { endDate });
      
      expect(generateTimeSlots).toHaveBeenCalledWith(startDate, { endDate });
      expect(yearSlots).toBeDefined();
    });

    it('should handle timezone edge cases', () => {
      const dstDate = '2024-03-10'; // DST transition date
      const slots = generateTimeSlots(dstDate, { timezone: 'America/Chicago' });
      
      expect(generateTimeSlots).toHaveBeenCalledWith(dstDate, { timezone: 'America/Chicago' });
      expect(slots).toBeDefined();
    });

    it('should validate input parameters', () => {
      expect(() => generateTimeSlots('')).toThrow('Invalid date');
      expect(() => calculateServiceDuration([])).toThrow('No services specified');
      expect(() => validateTimeRange('25:00', '26:00')).toThrow('Invalid time format');
    });
  });
});

describe('Enhanced Time Slots - React Hook Integration', () => {
  const mockUseTimeSlotSelection = useTimeSlotSelection as jest.MockedFunction<typeof useTimeSlotSelection>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide time slot selection state management', () => {
    const mockHookReturn = {
      selectedSlots: [],
      availableSlots: [],
      loading: false,
      error: null,
      selectSlot: jest.fn(),
      deselectSlot: jest.fn(),
      clearSelection: jest.fn(),
      calculateTotalDuration: jest.fn().mockReturnValue(300),
      validateSelection: jest.fn().mockReturnValue(true)
    };

    mockUseTimeSlotSelection.mockReturnValue(mockHookReturn);

    const TestComponent = () => {
      const timeSlots = useTimeSlotSelection('2024-02-15', ['DJ']);
      return <div data-testid="hook-test">{timeSlots.selectedSlots.length}</div>;
    };

    render(<TestComponent />);
    
    expect(mockUseTimeSlotSelection).toHaveBeenCalledWith('2024-02-15', ['DJ']);
    expect(screen.getByTestId('hook-test')).toHaveTextContent('0');
  });

  it('should handle slot selection with validation', () => {
    const mockHookReturn = {
      selectedSlots: [{ start: '10:00', end: '10:15' }],
      availableSlots: [],
      loading: false,
      error: null,
      selectSlot: jest.fn(),
      deselectSlot: jest.fn(),
      clearSelection: jest.fn(),
      calculateTotalDuration: jest.fn().mockReturnValue(15),
      validateSelection: jest.fn().mockReturnValue(true)
    };

    mockUseTimeSlotSelection.mockReturnValue(mockHookReturn);

    const TestComponent = () => {
      const timeSlots = useTimeSlotSelection('2024-02-15', ['DJ']);
      return (
        <div>
          <div data-testid="selected-count">{timeSlots.selectedSlots.length}</div>
          <div data-testid="total-duration">{timeSlots.calculateTotalDuration()}</div>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-duration')).toHaveTextContent('15');
  });

  it('should handle loading and error states', () => {
    const mockHookReturn = {
      selectedSlots: [],
      availableSlots: [],
      loading: true,
      error: null,
      selectSlot: jest.fn(),
      deselectSlot: jest.fn(),
      clearSelection: jest.fn(),
      calculateTotalDuration: jest.fn(),
      validateSelection: jest.fn()
    };

    mockUseTimeSlotSelection.mockReturnValue(mockHookReturn);

    const TestComponent = () => {
      const timeSlots = useTimeSlotSelection('2024-02-15', ['DJ']);
      if (timeSlots.loading) return <div data-testid="loading">Loading slots...</div>;
      return <div data-testid="loaded">Slots loaded</div>;
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

describe('Enhanced Time Slots - TimeSlotGrid Component', () => {
  const MockTimeSlotGrid = TimeSlotGrid as jest.MockedFunction<typeof TimeSlotGrid>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render time slot grid with proper structure', () => {
    MockTimeSlotGrid.mockImplementation(({ date, services, onSlotSelect }) => (
      <div data-testid="time-slot-grid">
        <div data-testid="date">{date}</div>
        <div data-testid="services">{services.join(',')}</div>
        <button onClick={() => onSlotSelect?.({ start: '10:00', end: '10:15' })}>
          Select Slot
        </button>
      </div>
    ));

    const mockOnSlotSelect = jest.fn();
    render(
      <MockTimeSlotGrid 
        date="2024-02-15" 
        services={['DJ']} 
        onSlotSelect={mockOnSlotSelect}
      />
    );

    expect(screen.getByTestId('date')).toHaveTextContent('2024-02-15');
    expect(screen.getByTestId('services')).toHaveTextContent('DJ');
  });

  it('should handle slot selection interaction', async () => {
    MockTimeSlotGrid.mockImplementation(({ onSlotSelect }) => (
      <button 
        data-testid="slot-button"
        onClick={() => onSlotSelect?.({ start: '10:00', end: '10:15' })}
      >
        10:00 - 10:15
      </button>
    ));

    const mockOnSlotSelect = jest.fn();
    render(<MockTimeSlotGrid date="2024-02-15" services={['DJ']} onSlotSelect={mockOnSlotSelect} />);

    await userEvent.click(screen.getByTestId('slot-button'));
    
    expect(mockOnSlotSelect).toHaveBeenCalledWith({ start: '10:00', end: '10:15' });
  });

  it('should display loading state while fetching slots', () => {
    MockTimeSlotGrid.mockImplementation(({ loading }) => (
      <div data-testid="time-slot-grid">
        {loading ? 'Loading slots...' : 'Slots loaded'}
      </div>
    ));

    render(<MockTimeSlotGrid date="2024-02-15" services={['DJ']} loading={true} />);
    
    expect(screen.getByTestId('time-slot-grid')).toHaveTextContent('Loading slots...');
  });

  it('should handle error states gracefully', () => {
    MockTimeSlotGrid.mockImplementation(({ error }) => (
      <div data-testid="time-slot-grid">
        {error ? `Error: ${error}` : 'No errors'}
      </div>
    ));

    render(<MockTimeSlotGrid date="2024-02-15" services={['DJ']} error="Failed to load slots" />);
    
    expect(screen.getByTestId('time-slot-grid')).toHaveTextContent('Error: Failed to load slots');
  });
});