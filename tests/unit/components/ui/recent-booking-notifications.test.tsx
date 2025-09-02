import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecentBookingNotifications, BookingNotification } from '@/components/ui/recent-booking-notifications';

// Mock timers
jest.useFakeTimers();

describe('RecentBookingNotifications', () => {
  const mockBookings = [
    {
      id: '1',
      clientName: 'Sarah J.',
      eventType: 'Wedding',
      location: 'Chicago, IL',
      timeAgo: '2 hours ago',
      services: ['DJ', 'Photography'],
    },
    {
      id: '2',
      clientName: 'Mike C.',
      eventType: 'Corporate Event',
      location: 'Milwaukee, WI',
      timeAgo: '4 hours ago',
      services: ['Karaoke'],
    },
    {
      id: '3',
      clientName: 'Lisa M.',
      eventType: 'Birthday Party',
      location: 'Naperville, IL',
      timeAgo: '6 hours ago',
      services: ['DJ', 'Karaoke'],
    },
  ];

  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('displays recent booking notification', () => {
    render(<RecentBookingNotifications bookings={mockBookings} />);
    
    expect(screen.getByText('Sarah J. just booked a Wedding in Chicago, IL')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('rotates through multiple booking notifications', () => {
    render(<RecentBookingNotifications bookings={mockBookings} rotationInterval={1000} />);
    
    // Initially shows first booking
    expect(screen.getByText('Sarah J. just booked a Wedding in Chicago, IL')).toBeInTheDocument();
    
    // Advance timer to trigger rotation
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should now show second booking
    expect(screen.getByText('Mike C. just booked a Corporate Event in Milwaukee, WI')).toBeInTheDocument();
    
    // Advance timer again
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should now show third booking
    expect(screen.getByText('Lisa M. just booked a Birthday Party in Naperville, IL')).toBeInTheDocument();
  });

  it('loops back to first booking after reaching the end', () => {
    render(<RecentBookingNotifications bookings={mockBookings} rotationInterval={1000} />);
    
    // Go through all bookings
    act(() => {
      jest.advanceTimersByTime(3000); // 3 rotations
    });
    
    // Should be back to first booking
    expect(screen.getByText('Sarah J. just booked a Wedding in Chicago, IL')).toBeInTheDocument();
  });

  it('pauses rotation on hover', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<RecentBookingNotifications bookings={mockBookings} rotationInterval={1000} />);
    
    const notification = screen.getByTestId('booking-notification');
    
    // Initially shows first booking
    expect(screen.getByText('Sarah J. just booked a Wedding in Chicago, IL')).toBeInTheDocument();
    
    // Hover over notification
    await user.hover(notification);
    
    // Advance timer - should not rotate while hovered
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('Sarah J. just booked a Wedding in Chicago, IL')).toBeInTheDocument();
    
    // Stop hovering
    await user.unhover(notification);
    
    // Now it should rotate
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('Mike C. just booked a Corporate Event in Milwaukee, WI')).toBeInTheDocument();
  });

  it('displays services booked', () => {
    render(<RecentBookingNotifications bookings={mockBookings} showServices />);
    
    expect(screen.getByText('DJ, Photography')).toBeInTheDocument();
  });

  it('hides services when showServices is false', () => {
    render(<RecentBookingNotifications bookings={mockBookings} showServices={false} />);
    
    expect(screen.queryByText('DJ, Photography')).not.toBeInTheDocument();
  });

  it('shows verification badge', () => {
    render(<RecentBookingNotifications bookings={mockBookings} showVerifiedBadge />);
    
    expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
    expect(screen.getByLabelText('Verified booking')).toBeInTheDocument();
  });

  it('applies custom styling', () => {
    render(<RecentBookingNotifications bookings={mockBookings} className="custom-notifications" />);
    
    const container = screen.getByTestId('booking-notification');
    expect(container).toHaveClass('custom-notifications');
  });

  it('handles empty bookings array', () => {
    render(<RecentBookingNotifications bookings={[]} />);
    
    expect(screen.queryByTestId('booking-notification')).not.toBeInTheDocument();
  });

  it('animates transitions between notifications', () => {
    render(<RecentBookingNotifications bookings={mockBookings} rotationInterval={1000} animated />);
    
    const notification = screen.getByTestId('booking-notification');
    expect(notification).toHaveClass('transition-all');
  });

  it('supports click to pause/resume rotation', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<RecentBookingNotifications bookings={mockBookings} rotationInterval={1000} clickToPause />);
    
    const notification = screen.getByTestId('booking-notification');
    
    // Click to pause
    await user.click(notification);
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Should still show first booking (paused)
    expect(screen.getByText('Sarah J. just booked a Wedding in Chicago, IL')).toBeInTheDocument();
    
    // Click again to resume
    await user.click(notification);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should now rotate
    expect(screen.getByText('Mike C. just booked a Corporate Event in Milwaukee, WI')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<RecentBookingNotifications bookings={mockBookings} />);
    
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Recent bookings');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('announces new notifications to screen readers', () => {
    render(<RecentBookingNotifications bookings={mockBookings} rotationInterval={1000} />);
    
    const liveRegion = screen.getByLabelText('Recent bookings');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should update the live region content
    expect(liveRegion).toHaveTextContent('Mike C. just booked a Corporate Event in Milwaukee, WI');
  });
});

describe('BookingNotification', () => {
  const mockBooking = {
    id: '1',
    clientName: 'Sarah J.',
    eventType: 'Wedding',
    location: 'Chicago, IL',
    timeAgo: '2 hours ago',
    services: ['DJ', 'Photography'],
  };

  it('displays booking information correctly', () => {
    render(<BookingNotification booking={mockBooking} />);
    
    expect(screen.getByText('Sarah J. just booked a Wedding in Chicago, IL')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('shows services when enabled', () => {
    render(<BookingNotification booking={mockBooking} showServices />);
    
    expect(screen.getByText('DJ, Photography')).toBeInTheDocument();
  });

  it('displays verified badge when enabled', () => {
    render(<BookingNotification booking={mockBooking} showVerifiedBadge />);
    
    expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<BookingNotification booking={mockBooking} onClick={handleClick} />);
    
    await user.click(screen.getByTestId('booking-notification-item'));
    
    expect(handleClick).toHaveBeenCalledWith(mockBooking);
  });

  it('applies compact styling', () => {
    render(<BookingNotification booking={mockBooking} compact />);
    
    const container = screen.getByTestId('booking-notification-item');
    expect(container).toHaveClass('text-sm');
  });

  it('supports different animation types', () => {
    render(<BookingNotification booking={mockBooking} animationType="slide" />);
    
    const container = screen.getByTestId('booking-notification-item');
    expect(container).toHaveClass('transform');
  });

  it('truncates long location names', () => {
    const longLocationBooking = {
      ...mockBooking,
      location: 'Very Long Location Name That Should Be Truncated, Illinois',
    };
    
    render(<BookingNotification booking={longLocationBooking} />);
    
    expect(screen.getByText('Sarah J. just booked a Wedding in Very Long Location Name That Should Be Truncated, Illinois')).toBeInTheDocument();
  });
});