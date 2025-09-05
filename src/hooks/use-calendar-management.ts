/**
 * @fileoverview Admin Calendar Management Hook
 * 
 * Custom React hook for managing admin calendar operations and availability data.
 * Provides functionality for viewing, blocking, and managing calendar dates.
 */

import { useState, useEffect, useCallback } from 'react';

interface CalendarBooking {
  id: string;
  clientName: string;
  eventType: string;
  bookingReference: string;
}

interface CalendarDay {
  date: string;
  isAvailable: boolean;
  blockedReason: string | null;
  booking: CalendarBooking | null;
}

interface CalendarData {
  success: boolean;
  calendar: CalendarDay[];
}

interface UseCalendarManagementReturn {
  calendarData: CalendarDay[];
  loading: boolean;
  error: string | null;
  selectedDate: string | null;
  currentMonth: number;
  currentYear: number;
  setSelectedDate: (_date: string | null) => void;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  goToMonth: (_year: number, _month: number) => void;
  blockDate: (_date: string, _reason: string) => Promise<boolean>;
  unblockDate: (_date: string) => Promise<boolean>;
  setMaintenanceBlock: (_date: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useCalendarManagement(): UseCalendarManagementReturn {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

      const response = await fetch(
        `/api/calendar?startDate=${startDate}&endDate=${endDate}&includeBookings=true`
      );

      if (!response.ok) {
        throw new Error('Failed to load calendar data');
      }

      const data: CalendarData = await response.json();
      setCalendarData(data.calendar || []);
    } catch (err) {
      setError('Failed to load calendar data');
      setCalendarData([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);

  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);

  const goToMonth = useCallback((year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  }, []);

  const blockDate = useCallback(async (date: string, reason: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/calendar/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          available: false,
          blockedReason: reason,
        }),
      });

      if (!response.ok) {
        return false;
      }

      await fetchCalendarData();
      return true;
    } catch (err) {
      return false;
    }
  }, [fetchCalendarData]);

  const unblockDate = useCallback(async (date: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/calendar/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          available: true,
          blockedReason: null,
        }),
      });

      if (!response.ok) {
        return false;
      }

      await fetchCalendarData();
      return true;
    } catch (err) {
      return false;
    }
  }, [fetchCalendarData]);

  const setMaintenanceBlock = useCallback(async (date: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/calendar/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          available: false,
          blockedReason: 'Maintenance',
        }),
      });

      if (!response.ok) {
        return false;
      }

      await fetchCalendarData();
      return true;
    } catch (err) {
      return false;
    }
  }, [fetchCalendarData]);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchCalendarData();
  }, [fetchCalendarData]);

  return {
    calendarData,
    loading,
    error,
    selectedDate,
    currentMonth,
    currentYear,
    setSelectedDate,
    goToNextMonth,
    goToPreviousMonth,
    goToMonth,
    blockDate,
    unblockDate,
    setMaintenanceBlock,
    refresh,
  };
}