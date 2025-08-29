/**
 * @fileoverview Admin Calendar Management Component
 * 
 * Admin interface for viewing and managing calendar availability.
 * Allows blocking/unblocking dates and setting maintenance periods.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCalendarManagement } from '@/hooks/useCalendarManagement';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface DialogState {
  type: 'block' | 'unblock' | 'range' | null;
  isOpen: boolean;
  reason: string;
  startDate: string;
  endDate: string;
}

export function CalendarManagement() {
  const {
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
  } = useCalendarManagement();

  const [dialog, setDialog] = useState<DialogState>({
    type: null,
    isOpen: false,
    reason: '',
    startDate: '',
    endDate: '',
  });

  const closeDialog = () => {
    setDialog({
      type: null,
      isOpen: false,
      reason: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleBlockDate = async () => {
    if (!selectedDate || !dialog.reason) {
      return;
    }
    
    const success = await blockDate(selectedDate, dialog.reason);
    if (success) {
      setSelectedDate(null);
      closeDialog();
    }
  };

  const handleUnblockDate = async () => {
    if (!selectedDate) {
      return;
    }
    
    const success = await unblockDate(selectedDate);
    if (success) {
      setSelectedDate(null);
      closeDialog();
    }
  };

  const handleMaintenanceBlock = async () => {
    if (!selectedDate) {
      return;
    }
    
    const success = await setMaintenanceBlock(selectedDate);
    if (success) {
      setSelectedDate(null);
    }
  };

  const generateCalendarGrid = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayNumber = date.getDate();
      const isCurrentMonth = date.getMonth() === currentMonth;

      if (!isCurrentMonth) {
        days.push(
          <div key={dateStr} className="p-2 text-transparent select-none">
            {dayNumber}
          </div>
        );
        continue;
      }

      const dayData = calendarData.find(item => item.date === dateStr);
      const isSelected = dateStr === selectedDate;

      let bgClass = 'bg-green-100 text-green-800'; // Default: Available
      
      if (!dayData?.isAvailable || dayData?.booking) {
        if (dayData?.booking || dayData?.blockedReason === 'Booked Event') {
          // Booked dates
          bgClass = 'bg-red-100 text-red-800';
        } else if (dayData?.blockedReason === 'Maintenance') {
          // Maintenance dates
          bgClass = 'bg-gray-100 text-gray-800';
        } else {
          // Other blocked dates
          bgClass = 'bg-yellow-100 text-yellow-800';
        }
      }

      const selectedClass = isSelected ? 'ring-2 ring-blue-500' : '';

      days.push(
        <div
          key={dateStr}
          data-testid={`calendar-date-${dateStr}`}
          className={`p-3 rounded cursor-pointer transition-all relative ${bgClass} ${selectedClass}`}
          onClick={() => setSelectedDate(dateStr)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedDate(dateStr);
            }
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const nextDate = new Date(date);
              nextDate.setDate(date.getDate() + 1);
              const nextElement = document.querySelector(`[data-testid="calendar-date-${nextDate.toISOString().split('T')[0]}"]`) as HTMLElement;
              nextElement?.focus();
            }
          }}
          tabIndex={0}
        >
          <div className="font-semibold">{dayNumber}</div>
          {dayData?.booking && (
            <div className="text-xs mt-1">
              <div>{dayData.booking.clientName}</div>
              <div>{dayData.booking.eventType}</div>
              <div>{dayData.booking.bookingReference}</div>
            </div>
          )}
          {dayData?.blockedReason && !dayData.booking && (
            <div className="text-xs mt-1">{dayData.blockedReason}</div>
          )}
        </div>
      );
    }

    return days;
  };

  const handleMonthSelectorChange = (value: string) => {
    goToMonth(currentYear, parseInt(value));
  };

  const handleYearSelectorChange = (value: string) => {
    goToMonth(parseInt(value), currentMonth);
  };

  const calculateStats = () => {
    const available = calendarData.filter(day => day.isAvailable).length;
    const booked = calendarData.filter(day => day.booking).length;
    const blocked = calendarData.filter(day => !day.isAvailable && !day.booking).length;
    
    return {
      total: calendarData.length,
      available,
      booked,
      blocked,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div data-testid="calendar-loading" className="p-8 text-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="calendar-error" className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          data-testid="retry-btn"
          onClick={refresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div data-testid="calendar-management" aria-label="Calendar Management" className="p-6">
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/admin" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-brand-gold transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Calendar Management</h1>
      
      {/* Calendar Controls */}
      <div data-testid="calendar-controls" className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        
        <div className="flex items-center gap-4">
          <button
            data-testid="prev-month-btn"
            aria-label="Previous month"
            onClick={goToPreviousMonth}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ←
          </button>
          
          <div data-testid="month-year-selector" className="flex gap-2">
            <select
              data-testid="month-selector"
              value={currentMonth}
              onChange={(e) => handleMonthSelectorChange(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {MONTH_NAMES.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            
            <select
              data-testid="year-selector"
              value={currentYear}
              onChange={(e) => handleYearSelectorChange(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <button
            data-testid="next-month-btn"
            aria-label="Next month"
            onClick={goToNextMonth}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        data-testid="calendar-grid"
        role="grid"
        className="grid grid-cols-7 gap-2 mb-6"
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-600">
            {day}
          </div>
        ))}
        {generateCalendarGrid()}
      </div>

      {/* Date Actions */}
      {selectedDate && (
        <div data-testid="date-actions" className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-3">Actions for {selectedDate}</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setDialog({ type: 'block', isOpen: true, reason: '', startDate: '', endDate: '' })}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Block Date
            </button>
            <button
              onClick={() => setDialog({ type: 'unblock', isOpen: true, reason: '', startDate: '', endDate: '' })}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Unblock Date
            </button>
            <button
              onClick={handleMaintenanceBlock}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Set Maintenance
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      <div data-testid="bulk-actions" className="mb-6">
        <button
          onClick={() => setDialog({ type: 'range', isOpen: true, reason: '', startDate: '', endDate: '' })}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Block Date Range
        </button>
      </div>

      {/* Calendar Legend */}
      <div data-testid="calendar-legend" className="flex justify-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div data-testid="legend-available" className="w-4 h-4 bg-green-100 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div data-testid="legend-booked" className="w-4 h-4 bg-red-100 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div data-testid="legend-maintenance" className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span>Blocked</span>
        </div>
      </div>

      {/* Calendar Statistics */}
      <div data-testid="calendar-stats" className="grid grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-white rounded border">
          <div className="text-sm text-gray-600">Total Days:</div>
          <div className="text-lg font-semibold">{stats.total}</div>
        </div>
        <div className="p-3 bg-white rounded border">
          <div className="text-sm text-gray-600">Available:</div>
          <div className="text-lg font-semibold text-green-600">{stats.available}</div>
        </div>
        <div className="p-3 bg-white rounded border">
          <div className="text-sm text-gray-600">Booked:</div>
          <div className="text-lg font-semibold text-red-600">{stats.booked}</div>
        </div>
        <div className="p-3 bg-white rounded border">
          <div className="text-sm text-gray-600">Blocked:</div>
          <div className="text-lg font-semibold text-gray-600">{stats.blocked}</div>
        </div>
      </div>

      {/* Block Reason Dialog */}
      {dialog.isOpen && dialog.type === 'block' && (
        <div
          data-testid="block-reason-dialog"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Block Date</h3>
            <input
              type="text"
              placeholder="Reason for blocking..."
              value={dialog.reason}
              onChange={(e) => setDialog(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockDate}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock Confirmation Dialog */}
      {dialog.isOpen && dialog.type === 'unblock' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Unblock Date</h3>
            <p className="mb-4">Confirm unblock this date?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUnblockDate}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Confirm Unblock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Dialog */}
      {dialog.isOpen && dialog.type === 'range' && (
        <div
          data-testid="date-range-dialog"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Block Date Range</h3>
            <div className="space-y-4">
              <input
                data-testid="range-start-date"
                type="date"
                value={dialog.startDate}
                onChange={(e) => setDialog(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
              <input
                data-testid="range-end-date"
                type="date"
                value={dialog.endDate}
                onChange={(e) => setDialog(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Reason for blocking range..."
                value={dialog.reason}
                onChange={(e) => setDialog(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeDialog}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {/* TODO: Implement range blocking */}}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Block Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}