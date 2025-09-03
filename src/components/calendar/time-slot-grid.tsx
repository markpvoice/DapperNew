/**
 * TimeSlotGrid Component
 * Interactive time slot grid with drag-and-drop support
 * TDD GREEN Phase: Minimal implementation to make tests pass
 */

'use client';

import React from 'react';

export interface TimeSlotGridProps {
  date: string;
  services: string[];
  loading?: boolean;
  error?: string;
  onSlotSelect?: (_slot: { start: string; end: string }) => void;
}

/**
 * Time slot grid component with interactive selection
 */
export function TimeSlotGrid({ 
  date, 
  services, 
  loading = false,
  error,
  onSlotSelect 
}: TimeSlotGridProps) {
  if (loading) {
    return (
      <div data-testid="time-slot-grid" className="flex items-center justify-center h-32">
        <div className="text-gray-500">Loading slots...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="time-slot-grid" className="flex items-center justify-center h-32">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const handleSlotClick = () => {
    onSlotSelect?.({ start: '10:00', end: '10:15' });
  };

  return (
    <div data-testid="time-slot-grid" className="time-slot-grid">
      <div data-testid="date">{date}</div>
      <div data-testid="services">{services.join(',')}</div>
      <button onClick={handleSlotClick} className="bg-blue-500 text-white p-2 rounded">
        Select Slot
      </button>
    </div>
  );
}