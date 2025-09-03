/**
 * EnhancedCalendar Component
 * Enhanced calendar with time slot selection integration
 * TDD GREEN Phase: Minimal implementation to make tests pass
 */

'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { TimeSlotGrid } from './time-slot-grid';

export interface EnhancedCalendarProps {
  onDateSelect?: (_date: string) => void;
  onTimeSlotSelect?: (_date: string, _slot: { start: string; end: string }) => void;
  selectedDate?: string;
  services?: string[];
  showTimeSlots?: boolean;
  className?: string;
}

/**
 * Enhanced calendar component with integrated time slot selection
 */
export function EnhancedCalendar({
  onDateSelect,
  onTimeSlotSelect,
  selectedDate,
  services = ['DJ'],
  showTimeSlots = false,
  className = ''
}: EnhancedCalendarProps) {
  const [currentSelectedDate, setCurrentSelectedDate] = useState(selectedDate);
  const [showSlots, setShowSlots] = useState(showTimeSlots);

  const handleDateSelect = (date: string) => {
    setCurrentSelectedDate(date);
    setShowSlots(true);
    onDateSelect?.(date);
  };

  const handleTimeSlotSelect = (slot: { start: string; end: string }) => {
    if (currentSelectedDate) {
      onTimeSlotSelect?.(currentSelectedDate, slot);
    }
  };

  return (
    <div className={`enhanced-calendar ${className}`} data-testid="enhanced-calendar">
      {/* Main Calendar */}
      <div className="calendar-section">
        <Calendar
          onDateSelect={handleDateSelect}
          selectedDate={currentSelectedDate}
          className="mb-6"
        />
      </div>

      {/* Time Slot Section */}
      {showSlots && currentSelectedDate && (
        <div className="time-slots-section" data-testid="time-slots-section">
          <h3 className="text-lg font-semibold mb-4">
            Select Time for {currentSelectedDate}
          </h3>
          <TimeSlotGrid
            date={currentSelectedDate}
            services={services}
            onSlotSelect={handleTimeSlotSelect}
          />
        </div>
      )}

      {/* Summary Section */}
      {currentSelectedDate && (
        <div className="selection-summary" data-testid="selection-summary">
          <div className="text-sm text-gray-600">
            Selected Date: {currentSelectedDate}
          </div>
          {services.length > 0 && (
            <div className="text-sm text-gray-600">
              Services: {services.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}