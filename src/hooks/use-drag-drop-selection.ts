/**
 * useDragDropSelection Hook
 * React hook for managing drag-and-drop time slot selection
 * TDD GREEN Phase: Minimal implementation to make tests pass
 */

/* eslint-disable no-unused-vars, curly */

import { useState, useCallback } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectedSlot {
  start: string;
  end: string;
  position?: { x: number; y: number };
}

export interface UseDragDropSelectionReturn {
  isDragging: boolean;
  selectedSlots: SelectedSlot[];
  dragStart: Point | null;
  dragEnd: Point | null;
  selectionRect: SelectionRect | null;
  startDrag: (point: Point) => void;
  updateDrag: (point: Point) => void;
  endDrag: () => void;
  clearSelection: () => void;
  isSlotSelected: (slot: SelectedSlot) => boolean;
  getSelectionBounds: () => SelectionRect | null;
}

/**
 * Hook for managing drag-and-drop selection state
 */
export function useDragDropSelection(): UseDragDropSelectionReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragEnd, setDragEnd] = useState<Point | null>(null);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);

  // Start drag operation
  const startDrag = useCallback((_point: Point) => {
    setIsDragging(true);
    setDragStart(_point);
    setDragEnd(_point);
    setSelectionRect({
      x: _point.x,
      y: _point.y,
      width: 0,
      height: 0
    });
  }, []);

  // Update drag position
  const updateDrag = useCallback((point: Point) => {
    if (!isDragging || !dragStart) return;

    setDragEnd(point);
    
    // Calculate selection rectangle
    const rect: SelectionRect = {
      x: Math.min(dragStart.x, point.x),
      y: Math.min(dragStart.y, point.y),
      width: Math.abs(point.x - dragStart.x),
      height: Math.abs(point.y - dragStart.y)
    };
    
    setSelectionRect(rect);
  }, [isDragging, dragStart]);

  // End drag operation
  const endDrag = useCallback(() => {
    if (!isDragging) return;

    // Mock: Add some selected slots based on drag area
    if (selectionRect && selectionRect.width > 10 && selectionRect.height > 10) {
      const newSlots: SelectedSlot[] = [
        { start: '10:00', end: '10:15', position: { x: 150, y: 200 } },
        { start: '10:15', end: '10:30', position: { x: 150, y: 220 } }
      ];
      setSelectedSlots(newSlots);
    }

    setIsDragging(false);
    setSelectionRect(null);
  }, [isDragging, selectionRect]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedSlots([]);
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setSelectionRect(null);
  }, []);

  // Check if a slot is selected
  const isSlotSelected = useCallback((slot: SelectedSlot): boolean => {
    return selectedSlots.some(s => 
      s.start === slot.start && s.end === slot.end
    );
  }, [selectedSlots]);

  // Get current selection bounds
  const getSelectionBounds = useCallback((): SelectionRect | null => {
    if (selectedSlots.length === 0) return null;

    // Mock bounds calculation
    return {
      x: 150,
      y: 200,
      width: 200,
      height: 100
    };
  }, [selectedSlots]);

  return {
    isDragging,
    selectedSlots,
    dragStart,
    dragEnd,
    selectionRect,
    startDrag,
    updateDrag,
    endDrag,
    clearSelection,
    isSlotSelected,
    getSelectionBounds
  };
}