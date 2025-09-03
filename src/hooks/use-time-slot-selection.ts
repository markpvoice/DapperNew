/**
 * useTimeSlotSelection Hook
 * React hook for managing time slot selection state and interactions
 * TDD GREEN Phase: Minimal implementation to make tests pass
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  generateTimeSlots,
  calculateServiceDuration,
  checkSlotAvailability as _checkSlotAvailability,
  TimeSlot
} from '@/lib/time-slot-utils';

export interface TimeSlotSelection {
  start: string;
  end: string;
  slotIndex?: number;
  position?: { x: number; y: number };
}

export interface UseTimeSlotSelectionReturn {
  selectedSlots: TimeSlotSelection[];
  availableSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  selectSlot: (_slot: TimeSlotSelection) => void;
  deselectSlot: (_slot: TimeSlotSelection) => void;
  clearSelection: () => void;
  calculateTotalDuration: () => number;
  validateSelection: () => boolean;
}

export interface UseTimeSlotSelectionOptions {
  allowMultiSelect?: boolean;
  maxSlots?: number;
  onSelectionChange?: (_slots: TimeSlotSelection[]) => void;
  onValidationError?: (_error: string) => void;
}

/**
 * Hook for managing time slot selection with validation and state management
 */
export function useTimeSlotSelection(
  date: string,
  services: string[],
  options: UseTimeSlotSelectionOptions = {}
): UseTimeSlotSelectionReturn {
  const {
    allowMultiSelect = true,
    maxSlots = 24, // 6 hours max by default
    onSelectionChange,
    onValidationError
  } = options;

  // State management
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotSelection[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available time slots for the date
  useEffect(() => {
    if (!date || services.length === 0) {
      setError('Date and services are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate time slots for the date
      const slots = generateTimeSlots(date, {
        timezone: 'America/Chicago'
      });

      setAvailableSlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots');
    } finally {
      setLoading(false);
    }
  }, [date, services]);

  // Select a time slot
  const selectSlot = useCallback((slot: TimeSlotSelection) => {
    setSelectedSlots(current => {
      // If not allowing multi-select, replace current selection
      if (!allowMultiSelect) {
        const newSelection = [slot];
        onSelectionChange?.(newSelection);
        return newSelection;
      }

      // Check if slot is already selected
      const isAlreadySelected = current.some(s => 
        s.start === slot.start && s.end === slot.end
      );

      if (isAlreadySelected) {
        return current; // Don't add duplicates
      }

      // Check max slots limit
      if (current.length >= maxSlots) {
        onValidationError?.('Maximum number of slots reached');
        return current;
      }

      // Add new slot to selection
      const newSelection = [...current, slot].sort((a, b) => 
        a.start.localeCompare(b.start)
      );

      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [allowMultiSelect, maxSlots, onSelectionChange, onValidationError]);

  // Deselect a time slot
  const deselectSlot = useCallback((slot: TimeSlotSelection) => {
    setSelectedSlots(current => {
      const newSelection = current.filter(s => 
        !(s.start === slot.start && s.end === slot.end)
      );
      
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Clear all selected slots
  const clearSelection = useCallback(() => {
    setSelectedSlots([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  // Calculate total duration of selected slots
  const calculateTotalDuration = useCallback((): number => {
    if (selectedSlots.length === 0) {return 0;}

    return selectedSlots.reduce((total, slot) => {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      return total + (endMinutes - startMinutes);
    }, 0);
  }, [selectedSlots]);

  // Validate current selection
  const validateSelection = useCallback((): boolean => {
    if (selectedSlots.length === 0) {return false;}

    // Check if slots are consecutive for multi-select
    if (allowMultiSelect && selectedSlots.length > 1) {
      const sortedSlots = [...selectedSlots].sort((a, b) => 
        a.start.localeCompare(b.start)
      );

      for (let i = 0; i < sortedSlots.length - 1; i++) {
        if (sortedSlots[i].end !== sortedSlots[i + 1].start) {
          onValidationError?.('Selected slots must be consecutive');
          return false;
        }
      }
    }

    // Validate against service duration requirements
    const totalDuration = calculateTotalDuration();
    const requiredDuration = calculateServiceDuration(services);
    
    if (totalDuration < requiredDuration - 30) { // Allow 30 minutes flexibility
      onValidationError?.(
        `Selected duration (${totalDuration} min) is less than recommended for ${services.join(', ')} (${requiredDuration} min)`
      );
      return false;
    }

    return true;
  }, [selectedSlots, allowMultiSelect, services, calculateTotalDuration, onValidationError]);

  return {
    selectedSlots,
    availableSlots,
    loading,
    error,
    selectSlot,
    deselectSlot,
    clearSelection,
    calculateTotalDuration,
    validateSelection
  };
}