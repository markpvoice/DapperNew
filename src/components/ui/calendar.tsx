'use client';

import React, { useState, useEffect } from 'react';

interface CalendarDay {
  date: string;
  isAvailable: boolean;
  blockedReason: string | null;
  booking: {
    id: number;
    clientName: string;
    eventType: string;
  } | null;
}

interface CalendarData {
  success: boolean;
  startDate: string;
  endDate: string;
  calendar: CalendarDay[];
  totalDays: number;
  availableDays: number;
  bookedDays: number;
}

interface CalendarProps {
  onDateSelect?: (_date: string) => void;
  onMonthChange?: (_year: number, _month: number) => void;
  selectedDate?: string;
  initialDate?: Date;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({ 
  onDateSelect, 
  onMonthChange, 
  selectedDate, 
  initialDate = new Date(),
  className = '' 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Load calendar data
  const loadCalendarData = async (_year: number, _month: number) => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(_year, _month, 1);
      const endDate = new Date(_year, _month + 1, 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `/api/calendar?startDate=${startDateStr}&endDate=${endDateStr}&includeBookings=true`
      );

      if (!response.ok) {
        throw new Error('Failed to load calendar data');
      }

      const _data: CalendarData = await response.json();
      setCalendarData(_data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading calendar');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or month changes
  useEffect(() => {
    loadCalendarData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const _date = new Date(startDate);
      _date.setDate(startDate.getDate() + i);
      
      const dateStr = _date.toISOString().split('T')[0];
      const dayNumber = _date.getDate();
      const isCurrentMonth = _date.getMonth() === currentMonth;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;

      // Find availability data for this date
      const dayData = calendarData?.calendar.find(item => item.date === dateStr);
      const isPastDate = _date < today;
      
      // Past dates are never available, future dates use data or default to available
      const isAvailable = isPastDate ? false : (dayData ? dayData.isAvailable : true);
      const blockedReason = isPastDate ? 'Past date' : dayData?.blockedReason;
      const booking = dayData?.booking;

      // Skip days not in current month
      if (!isCurrentMonth) {
        days.push(
          <div key={dateStr} className="p-2 text-transparent select-none">
            {dayNumber}
          </div>
        );
        continue;
      }

      // Determine styling based on availability
      let bgClass = 'bg-gray-100 text-gray-400';
      let cursorClass = 'cursor-default';
      let hoverClass = '';

      if (isPastDate) {
        // Past dates are clearly disabled
        bgClass = 'bg-gray-50 text-gray-300';
        cursorClass = 'cursor-not-allowed';
      } else if (isAvailable) {
        bgClass = 'bg-green-100 text-green-700';
        cursorClass = 'cursor-pointer';
        hoverClass = 'hover:bg-green-200';
      } else if (blockedReason === 'Pending') {
        bgClass = 'bg-yellow-100 text-yellow-700';
      } else {
        bgClass = 'bg-red-100 text-red-700';
      }

      // Add selected and today styles
      const selectedClass = isSelected ? 'ring-2 ring-brand-gold ring-offset-1' : '';
      const todayClass = isToday ? 'font-bold' : '';

      // Handle click
      const handleClick = () => {
        if (isAvailable && onDateSelect) {
          onDateSelect(dateStr);
        }
      };

      // Handle keyboard events
      const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && isAvailable && onDateSelect) {
          e.preventDefault();
          onDateSelect(dateStr);
        }
      };

      // Generate tooltip content
      const getTooltipContent = () => {
        if (!dayData) {
          return null;
        }
        
        if (booking) {
          return `Booked - ${booking.clientName} (${booking.eventType})`;
        } else if (blockedReason === 'Pending') {
          return 'Pending confirmation';
        } else if (!isAvailable) {
          return 'Unavailable';
        }
        return 'Available - Click to select';
      };

      days.push(
        <div
          key={dateStr}
          data-testid={`date-${dateStr}`}
          role="gridcell"
          tabIndex={isAvailable ? 0 : -1}
          className={`
            p-4 rounded-lg font-medium transition-all relative
            ${bgClass} ${cursorClass} ${hoverClass} ${selectedClass} ${todayClass}
          `}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setHoveredDate(dateStr)}
          onMouseLeave={() => setHoveredDate(null)}
          aria-label={`${MONTH_NAMES[currentMonth]} ${dayNumber}, ${currentYear}${isAvailable ? ' - Available' : ' - Unavailable'}`}
        >
          {dayNumber}
          
          {/* Tooltip */}
          {hoveredDate === dateStr && getTooltipContent() && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-10">
              {getTooltipContent()}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth - 1);
    setCurrentDate(newDate);
    
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + 1);
    setCurrentDate(newDate);
    
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-8 border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-lg">Loading calendar...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl p-8 border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-lg">Error loading calendar</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-4 md:p-8 border border-gray-200 ${className}`}>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h3 className="text-xl md:text-2xl font-bold">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <div className="flex gap-2 md:gap-4">
          <button
            aria-label="Previous month"
            onClick={goToPreviousMonth}
            className="bg-gray-100 border-none p-2 md:p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"
          >
            ◀
          </button>
          <button
            aria-label="Next month"
            onClick={goToNextMonth}
            className="bg-gray-100 border-none p-2 md:p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        role="grid"
        aria-label="Calendar"
        data-testid="calendar-grid"
        className="grid grid-cols-7 gap-1 md:gap-2 text-center"
      >
        {/* Day Headers */}
        {DAY_NAMES.map(day => (
          <div key={day} className="font-bold p-2 md:p-4 text-gray-600 text-sm md:text-base">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {generateCalendarGrid()}
      </div>

      {/* Calendar Summary */}
      {calendarData && (
        <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <div className="text-gray-600">
            <strong>{calendarData.availableDays}</strong> available
          </div>
          <div className="text-gray-600">
            <strong>{calendarData.bookedDays}</strong> booked/pending
          </div>
        </div>
      )}
    </div>
  );
}