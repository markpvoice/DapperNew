// API utilities for client-side API calls

export interface CreateBookingData {
  services: string[];
  eventDate: string;
  eventStartTime?: string;
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

export interface MonthAvailabilityResponse {
  success: boolean;
  month: number;
  year: number;
  availableDates: string[];
  totalAvailable: number;
  error?: string;
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
    // Parse the date to extract month and year for the API
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1; // Convert 0-based to 1-based month
    const year = dateObj.getFullYear();
    
    const response = await fetch(`/api/bookings/availability?month=${month}&year=${year}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Check if the specific date is in the available dates array
    const dateStr = date; // Assuming date is already in YYYY-MM-DD format
    const isAvailable = result.success && result.availableDates?.includes(dateStr);
    
    return {
      available: isAvailable,
      date: dateStr
    };
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