// API utilities for client-side API calls

export interface CreateBookingData {
  services: string[];
  eventDate: string;
  eventTime?: string;
  eventEndTime?: string;
  eventType: string;
  venue: string;
  venueAddress?: string;
  guestCount?: number;
  specialRequests?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export interface AvailabilityResponse {
  available: boolean;
  date: string;
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingData): Promise<BookingResponse> {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Booking creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check date availability
 */
export async function checkAvailability(date: string): Promise<AvailabilityResponse> {
  try {
    const response = await fetch(`/api/bookings/availability?date=${encodeURIComponent(date)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Availability check failed:', error);
    return {
      available: false,
      date
    };
  }
}

/**
 * Get booking by ID
 */
export async function getBooking(id: string) {
  try {
    const response = await fetch(`/api/bookings/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get booking failed:', error);
    throw error;
  }
}

/**
 * Submit contact form
 */
export async function submitContact(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Contact submission failed:', error);
    throw error;
  }
}