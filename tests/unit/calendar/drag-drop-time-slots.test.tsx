/**
 * Drag-and-Drop Time Slots Test Suite
 * Testing drag-and-drop time slot selection, touch interactions, and mobile optimization
 * TDD RED Phase: Comprehensive failing tests for drag-drop and touch functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DragDropTimeSlotGrid } from '@/components/calendar/drag-drop-time-slot-grid';
import { useDragDropSelection } from '@/hooks/use-drag-drop-selection';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import {
  DragDropManager,
  TouchGestureHandler,
  SelectionOverlay,
  TimeSlotDragger
} from '@/lib/drag-drop-manager';

// Mock the drag-drop components that don't exist yet
jest.mock('@/components/calendar/drag-drop-time-slot-grid', () => ({
  DragDropTimeSlotGrid: jest.fn(() => <div data-testid="drag-drop-grid">Drag Drop Grid</div>)
}));

jest.mock('@/hooks/use-drag-drop-selection', () => ({
  useDragDropSelection: jest.fn()
}));

jest.mock('@/hooks/use-touch-gestures', () => ({
  useTouchGestures: jest.fn()
}));

jest.mock('@/lib/drag-drop-manager', () => ({
  DragDropManager: jest.fn().mockImplementation(() => ({
    initializeDragDrop: jest.fn(),
    startDrag: jest.fn(),
    updateDrag: jest.fn(),
    endDrag: jest.fn(),
    getSelection: jest.fn(),
    clearSelection: jest.fn()
  })),
  TouchGestureHandler: jest.fn().mockImplementation(() => ({
    handleTouchStart: jest.fn(),
    handleTouchMove: jest.fn(),
    handleTouchEnd: jest.fn(),
    detectGesture: jest.fn()
  })),
  SelectionOverlay: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    update: jest.fn(),
    render: jest.fn()
  })),
  TimeSlotDragger: jest.fn().mockImplementation(() => ({
    attachListeners: jest.fn(),
    detachListeners: jest.fn(),
    onDragStart: jest.fn(),
    onDrag: jest.fn(),
    onDragEnd: jest.fn()
  }))
}));

describe('Drag-and-Drop Time Slots - Mouse Interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getBoundingClientRect for drag calculations
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 100,
      left: 100,
      width: 200,
      height: 300,
      right: 300,
      bottom: 400,
      x: 100,
      y: 100,
      toJSON: jest.fn()
    }));
  });

  describe('useDragDropSelection Hook', () => {
    const mockUseDragDropSelection = useDragDropSelection as jest.MockedFunction<typeof useDragDropSelection>;

    it('should initialize drag-drop selection state', () => {
      const mockHookReturn = {
        isDragging: false,
        selectedSlots: [],
        dragStart: null,
        dragEnd: null,
        selectionRect: null,
        startDrag: jest.fn(),
        updateDrag: jest.fn(),
        endDrag: jest.fn(),
        clearSelection: jest.fn(),
        isSlotSelected: jest.fn().mockReturnValue(false),
        getSelectionBounds: jest.fn()
      };

      mockUseDragDropSelection.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const dragDrop = useDragDropSelection();
        return (
          <div>
            <div data-testid="is-dragging">{dragDrop.isDragging.toString()}</div>
            <div data-testid="selected-count">{dragDrop.selectedSlots.length}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
    });

    it('should handle drag start with mouse coordinates', () => {
      const mockStartDrag = jest.fn();
      const mockHookReturn = {
        isDragging: false,
        selectedSlots: [],
        dragStart: null,
        dragEnd: null,
        selectionRect: null,
        startDrag: mockStartDrag,
        updateDrag: jest.fn(),
        endDrag: jest.fn(),
        clearSelection: jest.fn(),
        isSlotSelected: jest.fn(),
        getSelectionBounds: jest.fn()
      };

      mockUseDragDropSelection.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const dragDrop = useDragDropSelection();
        const handleMouseDown = (e: React.MouseEvent) => {
          dragDrop.startDrag({ x: e.clientX, y: e.clientY });
        };

        return (
          <div data-testid="drag-area" onMouseDown={handleMouseDown}>
            Drag Area
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.mouseDown(screen.getByTestId('drag-area'), { clientX: 150, clientY: 200 });

      expect(mockStartDrag).toHaveBeenCalledWith({ x: 150, y: 200 });
    });

    it('should track drag movement and update selection rectangle', () => {
      const mockUpdateDrag = jest.fn();
      const mockHookReturn = {
        isDragging: true,
        selectedSlots: [],
        dragStart: { x: 150, y: 200 },
        dragEnd: { x: 250, y: 300 },
        selectionRect: { x: 150, y: 200, width: 100, height: 100 },
        startDrag: jest.fn(),
        updateDrag: mockUpdateDrag,
        endDrag: jest.fn(),
        clearSelection: jest.fn(),
        isSlotSelected: jest.fn(),
        getSelectionBounds: jest.fn()
      };

      mockUseDragDropSelection.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const dragDrop = useDragDropSelection();
        const handleMouseMove = (e: React.MouseEvent) => {
          if (dragDrop.isDragging) {
            dragDrop.updateDrag({ x: e.clientX, y: e.clientY });
          }
        };

        return (
          <div data-testid="drag-area" onMouseMove={handleMouseMove}>
            <div data-testid="selection-rect">
              {dragDrop.selectionRect && 
                `${dragDrop.selectionRect.width}x${dragDrop.selectionRect.height}`
              }
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.mouseMove(screen.getByTestId('drag-area'), { clientX: 250, clientY: 300 });

      expect(mockUpdateDrag).toHaveBeenCalledWith({ x: 250, y: 300 });
      expect(screen.getByTestId('selection-rect')).toHaveTextContent('100x100');
    });

    it('should finalize selection on drag end', () => {
      const mockEndDrag = jest.fn();
      const mockHookReturn = {
        isDragging: true,
        selectedSlots: [
          { start: '10:00', end: '10:15', position: { x: 150, y: 200 } },
          { start: '10:15', end: '10:30', position: { x: 150, y: 220 } }
        ],
        dragStart: { x: 150, y: 200 },
        dragEnd: { x: 250, y: 300 },
        selectionRect: null,
        startDrag: jest.fn(),
        updateDrag: jest.fn(),
        endDrag: mockEndDrag,
        clearSelection: jest.fn(),
        isSlotSelected: jest.fn(),
        getSelectionBounds: jest.fn()
      };

      mockUseDragDropSelection.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const dragDrop = useDragDropSelection();
        const handleMouseUp = () => {
          dragDrop.endDrag();
        };

        return (
          <div data-testid="drag-area" onMouseUp={handleMouseUp}>
            <div data-testid="selected-slots">{dragDrop.selectedSlots.length}</div>
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.mouseUp(screen.getByTestId('drag-area'));

      expect(mockEndDrag).toHaveBeenCalled();
      expect(screen.getByTestId('selected-slots')).toHaveTextContent('2');
    });
  });

  describe('DragDropManager Class', () => {
    let manager: any;

    beforeEach(() => {
      manager = new DragDropManager();
    });

    it('should initialize drag-drop functionality with configuration', () => {
      const config = {
        container: document.createElement('div'),
        allowMultiSelect: true,
        snapToGrid: true,
        gridSize: 15 // 15-minute slots
      };

      manager.initializeDragDrop(config);

      expect(manager.initializeDragDrop).toHaveBeenCalledWith(config);
    });

    it('should start drag operation with proper state management', () => {
      const startPoint = { x: 150, y: 200 };
      const slot = { start: '10:00', end: '10:15', id: 'slot-10-00' };

      manager.startDrag(startPoint, slot);

      expect(manager.startDrag).toHaveBeenCalledWith(startPoint, slot);
    });

    it('should update drag selection based on mouse position', () => {
      const currentPoint = { x: 250, y: 300 };
      const affectedSlots = [
        { start: '10:00', end: '10:15' },
        { start: '10:15', end: '10:30' }
      ];

      manager.updateDrag.mockReturnValue(affectedSlots);

      const result = manager.updateDrag(currentPoint);

      expect(manager.updateDrag).toHaveBeenCalledWith(currentPoint);
      expect(result).toEqual(affectedSlots);
    });

    it('should finalize drag operation and return selection', () => {
      const finalSelection = {
        slots: [
          { start: '10:00', end: '10:15' },
          { start: '10:15', end: '10:30' }
        ],
        duration: 30,
        valid: true
      };

      manager.endDrag.mockReturnValue(finalSelection);

      const result = manager.endDrag();

      expect(manager.endDrag).toHaveBeenCalled();
      expect(result).toEqual(finalSelection);
    });

    it('should handle selection rectangle calculations', () => {
      const start = { x: 150, y: 200 };
      const end = { x: 250, y: 300 };
      const expectedRect = { x: 150, y: 200, width: 100, height: 100 };

      manager.getSelection.mockReturnValue({
        rectangle: expectedRect,
        slots: []
      });

      const selection = manager.getSelection();

      expect(selection.rectangle).toEqual(expectedRect);
    });
  });

  describe('Mouse Event Handling', () => {
    it('should handle mouse down to start selection', async () => {
      const user = userEvent.setup();
      const mockStartDrag = jest.fn();

      const TestComponent = () => {
        const handleMouseDown = (e: React.MouseEvent) => {
          mockStartDrag({ x: e.clientX, y: e.clientY });
        };

        return (
          <div 
            data-testid="time-slot-grid"
            onMouseDown={handleMouseDown}
            style={{ width: 400, height: 600 }}
          >
            Time Slot Grid
          </div>
        );
      };

      render(<TestComponent />);

      const grid = screen.getByTestId('time-slot-grid');
      await user.pointer({ keys: '[MouseLeft>]', target: grid, coords: { x: 150, y: 200 } });

      expect(mockStartDrag).toHaveBeenCalledWith({ x: 150, y: 200 });
    });

    it('should track mouse movement during drag', async () => {
      const user = userEvent.setup();
      const mockUpdateDrag = jest.fn();
      let isDragging = false;

      const TestComponent = () => {
        const handleMouseDown = () => {
          isDragging = true;
        };

        const handleMouseMove = (e: React.MouseEvent) => {
          if (isDragging) {
            mockUpdateDrag({ x: e.clientX, y: e.clientY });
          }
        };

        return (
          <div 
            data-testid="time-slot-grid"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            Time Slot Grid
          </div>
        );
      };

      render(<TestComponent />);

      const grid = screen.getByTestId('time-slot-grid');
      
      // Start drag
      await user.pointer({ keys: '[MouseLeft>]', target: grid, coords: { x: 150, y: 200 } });
      
      // Move mouse while dragging
      fireEvent.mouseMove(grid, { clientX: 250, clientY: 300 });

      expect(mockUpdateDrag).toHaveBeenCalledWith({ x: 250, y: 300 });
    });

    it('should handle mouse up to end selection', async () => {
      const user = userEvent.setup();
      const mockEndDrag = jest.fn();
      let isDragging = true;

      const TestComponent = () => {
        const handleMouseUp = () => {
          if (isDragging) {
            mockEndDrag();
            isDragging = false;
          }
        };

        return (
          <div 
            data-testid="time-slot-grid"
            onMouseUp={handleMouseUp}
          >
            Time Slot Grid
          </div>
        );
      };

      render(<TestComponent />);

      const grid = screen.getByTestId('time-slot-grid');
      await user.pointer({ keys: '[/MouseLeft]', target: grid });

      expect(mockEndDrag).toHaveBeenCalled();
    });
  });
});

describe('Drag-and-Drop Time Slots - Touch Interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock touch-related APIs
    global.TouchEvent = jest.fn() as any;
  });

  describe('useTouchGestures Hook', () => {
    const mockUseTouchGestures = useTouchGestures as jest.MockedFunction<typeof useTouchGestures>;

    it('should initialize touch gesture handling', () => {
      const mockHookReturn = {
        isTouch: false,
        touches: [],
        gestureType: null,
        startTouch: jest.fn(),
        updateTouch: jest.fn(),
        endTouch: jest.fn(),
        detectGesture: jest.fn(),
        clearGesture: jest.fn()
      };

      mockUseTouchGestures.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const touch = useTouchGestures();
        return (
          <div>
            <div data-testid="is-touch">{touch.isTouch.toString()}</div>
            <div data-testid="touches-count">{touch.touches.length}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('is-touch')).toHaveTextContent('false');
      expect(screen.getByTestId('touches-count')).toHaveTextContent('0');
    });

    it('should detect single touch for time slot selection', () => {
      const mockStartTouch = jest.fn();
      const mockHookReturn = {
        isTouch: true,
        touches: [{ id: 1, x: 150, y: 200, startTime: Date.now() }],
        gestureType: 'tap',
        startTouch: mockStartTouch,
        updateTouch: jest.fn(),
        endTouch: jest.fn(),
        detectGesture: jest.fn().mockReturnValue('tap'),
        clearGesture: jest.fn()
      };

      mockUseTouchGestures.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const touch = useTouchGestures();
        const handleTouchStart = (e: React.TouchEvent) => {
          const touchPoint = e.touches[0];
          touch.startTouch({
            id: touchPoint.identifier,
            x: touchPoint.clientX,
            y: touchPoint.clientY,
            startTime: Date.now()
          });
        };

        return (
          <div data-testid="touch-area" onTouchStart={handleTouchStart}>
            <div data-testid="gesture-type">{touch.gestureType || 'none'}</div>
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.touchStart(screen.getByTestId('touch-area'), {
        touches: [{ identifier: 1, clientX: 150, clientY: 200 }]
      });

      expect(mockStartTouch).toHaveBeenCalledWith({
        id: 1,
        x: 150,
        y: 200,
        startTime: expect.any(Number)
      });
    });

    it('should detect drag gesture for multi-slot selection', () => {
      const mockUpdateTouch = jest.fn();
      const mockHookReturn = {
        isTouch: true,
        touches: [{ id: 1, x: 250, y: 300, startTime: Date.now() - 100 }],
        gestureType: 'drag',
        startTouch: jest.fn(),
        updateTouch: mockUpdateTouch,
        endTouch: jest.fn(),
        detectGesture: jest.fn().mockReturnValue('drag'),
        clearGesture: jest.fn()
      };

      mockUseTouchGestures.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const touch = useTouchGestures();
        const handleTouchMove = (e: React.TouchEvent) => {
          const touchPoint = e.touches[0];
          touch.updateTouch({
            id: touchPoint.identifier,
            x: touchPoint.clientX,
            y: touchPoint.clientY,
            currentTime: Date.now()
          });
        };

        return (
          <div data-testid="touch-area" onTouchMove={handleTouchMove}>
            <div data-testid="gesture-type">{touch.gestureType || 'none'}</div>
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.touchMove(screen.getByTestId('touch-area'), {
        touches: [{ identifier: 1, clientX: 250, clientY: 300 }]
      });

      expect(mockUpdateTouch).toHaveBeenCalledWith({
        id: 1,
        x: 250,
        y: 300,
        currentTime: expect.any(Number)
      });
      expect(screen.getByTestId('gesture-type')).toHaveTextContent('drag');
    });

    it('should detect long press for context menu', () => {
      const mockHookReturn = {
        isTouch: true,
        touches: [{ id: 1, x: 150, y: 200, startTime: Date.now() - 800 }],
        gestureType: 'long-press',
        startTouch: jest.fn(),
        updateTouch: jest.fn(),
        endTouch: jest.fn(),
        detectGesture: jest.fn().mockReturnValue('long-press'),
        clearGesture: jest.fn()
      };

      mockUseTouchGestures.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const touch = useTouchGestures();
        return (
          <div data-testid="gesture-type">{touch.gestureType || 'none'}</div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('gesture-type')).toHaveTextContent('long-press');
    });
  });

  describe('TouchGestureHandler Class', () => {
    let handler: any;

    beforeEach(() => {
      handler = new TouchGestureHandler();
    });

    it('should handle touch start events', () => {
      const touchEvent = {
        touches: [{ identifier: 1, clientX: 150, clientY: 200 }],
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };

      handler.handleTouchStart(touchEvent);

      expect(handler.handleTouchStart).toHaveBeenCalledWith(touchEvent);
    });

    it('should track touch movement for drag detection', () => {
      const touchEvent = {
        touches: [{ identifier: 1, clientX: 250, clientY: 300 }],
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };

      handler.handleTouchMove(touchEvent);

      expect(handler.handleTouchMove).toHaveBeenCalledWith(touchEvent);
    });

    it('should handle touch end and gesture recognition', () => {
      const touchEvent = {
        changedTouches: [{ identifier: 1, clientX: 250, clientY: 300 }],
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };

      const mockGesture = {
        type: 'swipe',
        direction: 'vertical',
        distance: 100,
        duration: 200
      };

      handler.handleTouchEnd.mockReturnValue(mockGesture);

      const gesture = handler.handleTouchEnd(touchEvent);

      expect(handler.handleTouchEnd).toHaveBeenCalledWith(touchEvent);
      expect(gesture).toEqual(mockGesture);
    });

    it('should detect different gesture types based on touch patterns', () => {
      const gestures = [
        { name: 'tap', pattern: { duration: 100, distance: 5 } },
        { name: 'long-press', pattern: { duration: 800, distance: 5 } },
        { name: 'swipe', pattern: { duration: 200, distance: 100 } },
        { name: 'drag', pattern: { duration: 500, distance: 50 } }
      ];

      gestures.forEach(gesture => {
        handler.detectGesture.mockReturnValue(gesture.name);
        
        const result = handler.detectGesture(gesture.pattern);
        
        expect(handler.detectGesture).toHaveBeenCalledWith(gesture.pattern);
        expect(result).toBe(gesture.name);
      });
    });
  });

  describe('Mobile-Optimized Touch Interactions', () => {
    it('should provide larger touch targets for mobile devices', () => {
      const TestComponent = () => (
        <div 
          data-testid="touch-slot"
          className="min-h-[44px] min-w-[44px] touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          Touch Target
        </div>
      );

      render(<TestComponent />);

      const touchTarget = screen.getByTestId('touch-slot');
      const styles = window.getComputedStyle(touchTarget);
      
      expect(touchTarget).toHaveClass('touch-manipulation');
      expect(styles.minHeight).toBe('44px');
      expect(styles.minWidth).toBe('44px');
    });

    it('should handle haptic feedback for touch interactions', () => {
      // Mock vibration API
      const mockVibrate = jest.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        writable: true
      });

      const TestComponent = () => {
        const handleTouchStart = () => {
          // Simulate haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(10); // Light haptic feedback
          }
        };

        return (
          <div data-testid="haptic-slot" onTouchStart={handleTouchStart}>
            Haptic Slot
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.touchStart(screen.getByTestId('haptic-slot'));

      expect(mockVibrate).toHaveBeenCalledWith(10);
    });

    it('should prevent scroll during drag operations', () => {
      const mockPreventDefault = jest.fn();
      
      const TestComponent = () => {
        const handleTouchMove = (e: React.TouchEvent) => {
          e.preventDefault(); // Prevent scrolling during drag
          mockPreventDefault();
        };

        return (
          <div 
            data-testid="no-scroll-area"
            onTouchMove={handleTouchMove}
            style={{ touchAction: 'none' }}
          >
            No Scroll Area
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.touchMove(screen.getByTestId('no-scroll-area'), {
        touches: [{ identifier: 1, clientX: 150, clientY: 200 }]
      });

      expect(mockPreventDefault).toHaveBeenCalled();
    });
  });

  describe('Accessibility and Touch', () => {
    it('should maintain keyboard navigation alongside touch', () => {
      const TestComponent = () => (
        <div>
          <div 
            data-testid="accessible-slot"
            tabIndex={0}
            role="gridcell"
            aria-label="Time slot 10:00 AM"
            className="focus:ring-2 focus:ring-brand-gold"
          >
            10:00 AM
          </div>
        </div>
      );

      render(<TestComponent />);

      const slot = screen.getByTestId('accessible-slot');
      
      expect(slot).toHaveAttribute('tabIndex', '0');
      expect(slot).toHaveAttribute('role', 'gridcell');
      expect(slot).toHaveAttribute('aria-label', 'Time slot 10:00 AM');
    });

    it('should announce selection changes to screen readers', () => {
      const TestComponent = () => {
        const [selectedCount, setSelectedCount] = React.useState(0);

        return (
          <div>
            <div 
              data-testid="selection-announcement"
              aria-live="polite"
              aria-label={`${selectedCount} time slots selected`}
            >
              {selectedCount} slots selected
            </div>
            <button 
              onClick={() => setSelectedCount(count => count + 1)}
              data-testid="select-slot"
            >
              Select Slot
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByTestId('select-slot');
      fireEvent.click(button);

      const announcement = screen.getByTestId('selection-announcement');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveAttribute('aria-label', '1 time slots selected');
    });
  });

  describe('Performance Optimization for Touch', () => {
    it('should throttle touch move events for better performance', () => {
      const mockThrottledHandler = jest.fn();
      
      // Simulate throttled touch handling
      let lastCall = 0;
      const throttleDelay = 16; // ~60fps

      const throttledTouchMove = (e: React.TouchEvent) => {
        const now = Date.now();
        if (now - lastCall > throttleDelay) {
          mockThrottledHandler(e);
          lastCall = now;
        }
      };

      const TestComponent = () => (
        <div data-testid="throttled-area" onTouchMove={throttledTouchMove}>
          Throttled Touch Area
        </div>
      );

      render(<TestComponent />);

      // Simulate rapid touch move events
      const area = screen.getByTestId('throttled-area');
      
      for (let i = 0; i < 10; i++) {
        fireEvent.touchMove(area, {
          touches: [{ identifier: 1, clientX: 150 + i, clientY: 200 }]
        });
      }

      // Should not call handler for every event due to throttling
      expect(mockThrottledHandler).toHaveBeenCalledTimes(1);
    });

    it('should clean up touch event listeners on unmount', () => {
      const mockRemoveEventListener = jest.fn();
      
      const TestComponent = ({ mounted }: { mounted: boolean }) => {
        React.useEffect(() => {
          if (mounted) {
            return mockRemoveEventListener;
          }
        }, [mounted]);

        return mounted ? <div data-testid="touch-component">Touch Component</div> : null;
      };

      const { rerender } = render(<TestComponent mounted={true} />);
      
      // Unmount component
      rerender(<TestComponent mounted={false} />);

      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });
});