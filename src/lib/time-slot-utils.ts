/**
 * Time Slot Utilities
 * Comprehensive time slot calculation, buffer management, and service duration logic
 * TDD GREEN Phase: Minimal implementation to make tests pass
 */

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  slotIndex?: number;
  position?: { x: number; y: number };
}

export interface ServiceDuration {
  service: string;
  defaultHours: number;
  minHours: number;
  maxHours: number;
}

export interface Booking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  services: string[];
  status: string;
}

export interface GenerateTimeSlotsOptions {
  timezone?: string;
  startHour?: number;
  endHour?: number;
  endDate?: string;
}

export interface AvailabilityCheckOptions {
  includeSetup?: boolean;
  includeBreakdown?: boolean;
}

// Service duration configuration (in minutes)
const SERVICE_DURATIONS: Record<string, ServiceDuration> = {
  'DJ': {
    service: 'DJ',
    defaultHours: 5,
    minHours: 4,
    maxHours: 6
  },
  'Photography': {
    service: 'Photography', 
    defaultHours: 4,
    minHours: 3,
    maxHours: 8
  },
  'Karaoke': {
    service: 'Karaoke',
    defaultHours: 3,
    minHours: 2,
    maxHours: 5
  }
};

// Time constants
const SLOT_DURATION_MINUTES = 15;
const BUSINESS_START_HOUR = 8; // 8 AM
const BUSINESS_END_HOUR = 23; // 11 PM
const BUFFER_TIME_MINUTES = 30;
const SETUP_TIME_MINUTES = 60;
const BREAKDOWN_TIME_MINUTES = 30;

/**
 * Generate time slots for a given date with 15-minute granularity
 */
export function generateTimeSlots(
  date: string,
  options: GenerateTimeSlotsOptions = {}
): TimeSlot[] {
  if (!date) {
    throw new Error('Invalid date');
  }

  const {
    startHour = BUSINESS_START_HOUR,
    endHour = BUSINESS_END_HOUR,
    timezone: _timezone = 'America/Chicago'
  } = options;

  const slots: TimeSlot[] = [];
  const targetDate = new Date(date + 'T00:00:00');
  const currentTime = new Date();
  const isToday = targetDate.toDateString() === currentTime.toDateString();

  // Generate slots from startHour to endHour in 15-minute increments
  const totalSlots = (endHour - startHour) * 4; // 4 slots per hour

  for (let i = 0; i < totalSlots; i++) {
    const slotStartMinutes = startHour * 60 + i * SLOT_DURATION_MINUTES;
    const slotEndMinutes = slotStartMinutes + SLOT_DURATION_MINUTES;

    const startHours = Math.floor(slotStartMinutes / 60);
    const startMins = slotStartMinutes % 60;
    const endHours = Math.floor(slotEndMinutes / 60);
    const endMins = slotEndMinutes % 60;

    const start = `${startHours.toString().padStart(2, '0')}:${startMins.toString().padStart(2, '0')}`;
    const end = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    // Check if slot is in the past for today
    let available = true;
    if (isToday) {
      const slotDateTime = new Date(targetDate);
      slotDateTime.setHours(startHours, startMins, 0, 0);
      available = slotDateTime >= currentTime;
    }

    slots.push({
      start,
      end,
      available,
      slotIndex: i
    });
  }

  return slots;
}

/**
 * Calculate service duration in minutes
 */
export function calculateServiceDuration(
  services: string[],
  options: { customDuration?: number } = {}
): number {
  if (services.length === 0) {
    throw new Error('No services specified');
  }

  if (options.customDuration) {
    return options.customDuration;
  }

  // For multiple services, use the maximum duration (not additive)
  let maxDuration = 0;
  
  for (const service of services) {
    const serviceConfig = SERVICE_DURATIONS[service];
    if (serviceConfig) {
      const durationMinutes = serviceConfig.defaultHours * 60;
      maxDuration = Math.max(maxDuration, durationMinutes);
    }
  }

  return maxDuration;
}

/**
 * Calculate buffer time between bookings
 */
export function calculateBufferTime(type: string): number {
  switch (type) {
    case 'between-bookings':
      return BUFFER_TIME_MINUTES;
    default:
      return BUFFER_TIME_MINUTES;
  }
}

/**
 * Calculate setup time before events
 */
export function calculateSetupTime(services: string[]): number {
  const baseSetupTime = SETUP_TIME_MINUTES;
  
  // Add extra setup time for complex service combinations
  if (services.length >= 3) {
    return baseSetupTime + 30; // 1.5 hours for multiple services
  }
  
  return baseSetupTime;
}

/**
 * Calculate breakdown time after events
 */
export function calculateBreakdownTime(_services: string[]): number {
  return BREAKDOWN_TIME_MINUTES;
}

/**
 * Check if a time slot is available
 */
export function checkSlotAvailability(
  date: string,
  startTime: string,
  endTime: string,
  bookings: Booking[],
  options: AvailabilityCheckOptions = {}
): boolean {
  const { includeSetup = false, includeBreakdown = false } = options;

  // Convert times to minutes for easier comparison
  const slotStart = timeToMinutes(startTime);
  const slotEnd = timeToMinutes(endTime);

  for (const booking of bookings) {
    if (booking.date !== date) {continue;}

    let bookingStart = timeToMinutes(booking.startTime);
    let bookingEnd = timeToMinutes(booking.endTime);

    // Include setup and breakdown time if requested
    if (includeSetup) {
      bookingStart -= calculateSetupTime(booking.services);
    }
    if (includeBreakdown) {
      bookingEnd += calculateBreakdownTime(booking.services);
    }

    // Add buffer time around bookings
    const bufferTime = calculateBufferTime('between-bookings');
    bookingStart -= bufferTime;
    bookingEnd += bufferTime;

    // Check for overlap
    if (slotStart < bookingEnd && slotEnd > bookingStart) {
      return false;
    }
  }

  return true;
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(time: string, format: '12h' | '24h'): string {
  const [hours, minutes] = time.split(':').map(Number);
  
  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  return time;
}

/**
 * Parse time slot from various formats
 */
export function parseTimeSlot(timeStr: string): string {
  // Handle 12-hour format
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // Already in 24-hour format
  return timeStr;
}

/**
 * Validate time range
 */
export function validateTimeRange(startTime: string, endTime: string): boolean {
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error('Invalid time format');
  }
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  return startMinutes < endMinutes;
}

/**
 * Merge consecutive available time slots
 */
export function mergeTimeSlots(slots: TimeSlot[]): TimeSlot[] {
  if (slots.length === 0) {return [];}
  
  const merged: TimeSlot[] = [];
  let current = { ...slots[0] };
  
  for (let i = 1; i < slots.length; i++) {
    const next = slots[i];
    
    // If consecutive and same availability, merge
    if (current.end === next.start && current.available === next.available) {
      current.end = next.end;
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  
  merged.push(current);
  return merged;
}

/**
 * Find conflicting time slots
 */
export function findConflictingSlots(
  newSlot: { start: string; end: string },
  existingSlots: { start: string; end: string; bookingId?: number }[]
): { start: string; end: string; bookingId?: number }[] {
  const newStart = timeToMinutes(newSlot.start);
  const newEnd = timeToMinutes(newSlot.end);
  
  return existingSlots.filter(slot => {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);
    
    // Check for overlap
    return newStart < slotEnd && newEnd > slotStart;
  });
}

/**
 * Helper function to convert time string to minutes
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Helper function to convert minutes to time string
 */
function _minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}