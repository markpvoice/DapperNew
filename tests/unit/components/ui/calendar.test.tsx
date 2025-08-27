import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '@/components/ui/calendar';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Calendar', () => {
  const mockOnDateSelect = jest.fn();
  const mockOnMonthChange = jest.fn();

  // Mock calendar data - generating a full month of data
  const generateMockCalendarData = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day).toISOString().split('T')[0];
      let isAvailable = true;
      let blockedReason = null;
      let booking = null;
      
      // Set specific test conditions
      if (day === 15) {
        isAvailable = true; // Available date for testing
      } else if (day === 20) {
        isAvailable = false;
        blockedReason = 'Booked';
        booking = {
          id: 1,
          clientName: 'John Doe',
          eventType: 'Wedding',
        };
      } else if (day === 25) {
        isAvailable = false;
        blockedReason = 'Pending';
      } else {
        // Most other days unavailable for simplicity
        isAvailable = false;
        blockedReason = 'Unavailable';
      }
      
      calendar.push({ date, isAvailable, blockedReason, booking });
    }
    
    return {
      success: true,
      startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
      endDate: new Date(year, month + 1, 0).toISOString().split('T')[0],
      calendar,
      totalDays: daysInMonth,
      availableDays: 1,
      bookedDays: daysInMonth - 1,
    };
  };

  const mockCalendarData = generateMockCalendarData(2024, 0); // January 2024

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to be consistent
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    
    // Mock fetch to return different data based on query parameters
    (fetch as jest.Mock).mockImplementation((url: string) => {
      const urlObj = new URL(url, 'http://localhost');
      const startDate = urlObj.searchParams.get('startDate');
      
      if (startDate) {
        const date = new Date(startDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const data = generateMockCalendarData(year, month);
        
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(data),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCalendarData),
      });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders calendar with month header', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });
  });

  it('renders day headers', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });
  });

  it('loads calendar data on mount', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calendar')
      );
    });
  });

  it('displays available dates with green styling', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      const availableDate = screen.getByTestId('date-2024-01-15');
      expect(availableDate).toHaveClass('bg-green-100');
      expect(availableDate).toHaveClass('text-green-700');
    });
  });

  it('displays booked dates with red styling', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      const bookedDate = screen.getByTestId('date-2024-01-20');
      expect(bookedDate).toHaveClass('bg-red-100');
      expect(bookedDate).toHaveClass('text-red-700');
    });
  });

  it('displays pending dates with yellow styling', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      const pendingDate = screen.getByTestId('date-2024-01-25');
      expect(pendingDate).toHaveClass('bg-yellow-100');
      expect(pendingDate).toHaveClass('text-yellow-700');
    });
  });

  it('calls onDateSelect when available date is clicked', async () => {
    const user = userEvent.setup();
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('date-2024-01-15')).toBeInTheDocument();
    });
    
    await user.click(screen.getByTestId('date-2024-01-15'));
    
    expect(mockOnDateSelect).toHaveBeenCalledWith('2024-01-15');
  });

  it('does not call onDateSelect when unavailable date is clicked', async () => {
    const user = userEvent.setup();
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('date-2024-01-20')).toBeInTheDocument();
    });
    
    await user.click(screen.getByTestId('date-2024-01-20'));
    
    expect(mockOnDateSelect).not.toHaveBeenCalled();
  });

  it('navigates to previous month when previous button is clicked', async () => {
    const user = userEvent.setup();
    render(<Calendar onDateSelect={mockOnDateSelect} onMonthChange={mockOnMonthChange} />);
    
    const prevButton = screen.getByLabelText('Previous month');
    await user.click(prevButton);
    
    expect(mockOnMonthChange).toHaveBeenCalledWith(2023, 11); // December 2023
  });

  it('navigates to next month when next button is clicked', async () => {
    const user = userEvent.setup();
    render(<Calendar onDateSelect={mockOnDateSelect} onMonthChange={mockOnMonthChange} />);
    
    const nextButton = screen.getByLabelText('Next month');
    await user.click(nextButton);
    
    expect(mockOnMonthChange).toHaveBeenCalledWith(2024, 1); // February 2024
  });

  it('shows loading state while fetching data', () => {
    // Mock pending promise
    (fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
  });

  it('shows error state when API call fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading calendar')).toBeInTheDocument();
    });
  });

  it('highlights selected date', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} selectedDate="2024-01-15" />);
    
    await waitFor(() => {
      const selectedDate = screen.getByTestId('date-2024-01-15');
      expect(selectedDate).toHaveClass('ring-2');
      expect(selectedDate).toHaveClass('ring-brand-gold');
    });
  });

  it('displays current date with special styling', async () => {
    // Mock current date
    const mockToday = new Date('2024-01-15');
    jest.spyOn(Date, 'now').mockReturnValue(mockToday.getTime());
    
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      const todayDate = screen.getByTestId('date-2024-01-15');
      expect(todayDate).toHaveClass('font-bold');
    });
    
    Date.now.mockRestore();
  });

  it('supports mobile responsive layout', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    const calendar = screen.getByTestId('calendar-grid');
    expect(calendar).toHaveClass('grid-cols-7');
    expect(calendar).toHaveClass('gap-1');
  });

  it('shows tooltip on hover for booked dates', async () => {
    const user = userEvent.setup();
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('date-2024-01-20')).toBeInTheDocument();
    });
    
    await user.hover(screen.getByTestId('date-2024-01-20'));
    
    await waitFor(() => {
      expect(screen.getByText('Booked - John Doe (Wedding)')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('date-2024-01-15')).toBeInTheDocument();
    });
    
    const availableDate = screen.getByTestId('date-2024-01-15');
    availableDate.focus();
    
    await user.keyboard('{Enter}');
    
    expect(mockOnDateSelect).toHaveBeenCalledWith('2024-01-15');
  });

  it('supports custom initial date', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} initialDate={new Date('2024-06-01')} />);
    
    await waitFor(() => {
      expect(screen.getByText('June 2024')).toBeInTheDocument();
    });
  });

  it('refreshes data when month changes', async () => {
    const user = userEvent.setup();
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    
    const nextButton = screen.getByLabelText('Next month');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    await waitFor(() => {
      const calendar = screen.getByRole('grid');
      expect(calendar).toHaveAttribute('aria-label', 'Calendar');
    });
    
    await waitFor(() => {
      const availableDate = screen.getByTestId('date-2024-01-15');
      expect(availableDate).toHaveAttribute('role', 'gridcell');
      expect(availableDate).toHaveAttribute('tabindex', '0');
    });
  });
});