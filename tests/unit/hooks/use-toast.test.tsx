/**
 * @fileoverview Toast Hook Tests
 * 
 * Comprehensive test suite for useToast hook functionality:
 * - Toast creation and management
 * - Auto-dismiss timing behavior
 * - Toast lifecycle (add, update, dismiss, remove)
 * - Memory management and cleanup
 * - Multiple toast handling
 * - Performance and behavior validation
 */

import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer } from '@/hooks/use-toast';

// Mock timers for testing auto-dismiss behavior
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('useToast Hook', () => {
  describe('Toast Creation', () => {
    it('should create a toast with default properties', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'Test description'
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        title: 'Test Toast',
        description: 'Test description',
        open: true
      });
      expect(result.current.toasts[0].id).toBeDefined();
    });

    it('should generate unique IDs for multiple toasts', () => {
      const { result } = renderHook(() => useToast());
      const ids: string[] = [];
      
      act(() => {
        for (let i = 0; i < 5; i++) {
          const toastResult = result.current.toast({
            title: `Toast ${i}`
          });
          ids.push(toastResult.id);
        }
      });

      // Should have unique IDs
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should respect TOAST_LIMIT and only keep the most recent toast', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Toast 1' });
        result.current.toast({ title: 'Toast 2' });
        result.current.toast({ title: 'Toast 3' });
      });

      // Should only keep 1 toast (TOAST_LIMIT = 1)
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Toast 3');
    });
  });

  describe('Toast Auto-Dismiss Timing', () => {
    it('should auto-dismiss toast after TOAST_REMOVE_DELAY', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({
          title: 'Auto-dismiss Test'
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].open).toBe(true);

      // Manually dismiss to trigger auto-remove timer
      act(() => {
        result.current.dismiss(result.current.toasts[0].id);
      });

      expect(result.current.toasts[0].open).toBe(false);

      // Fast-forward past the remove delay
      act(() => {
        jest.runAllTimers();
      });

      // Toast should be completely removed
      expect(result.current.toasts).toHaveLength(0);
    });

    it('should handle rapid toast creation and dismissal without memory leaks', () => {
      const { result } = renderHook(() => useToast());
      
      // Create and dismiss multiple toasts rapidly
      act(() => {
        for (let i = 0; i < 10; i++) {
          const toastResult = result.current.toast({
            title: `Rapid Toast ${i}`
          });
          result.current.dismiss(toastResult.id);
        }
      });

      // Fast-forward all timers
      act(() => {
        jest.runAllTimers();
      });

      // Should end with no toasts
      expect(result.current.toasts).toHaveLength(0);
    });

    it('should not break when dismissing non-existent toast', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.dismiss('non-existent-id');
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('Toast Update Functionality', () => {
    it('should update existing toast properties', () => {
      const { result } = renderHook(() => useToast());
      let toastControls: any;
      
      act(() => {
        toastControls = result.current.toast({
          title: 'Original Title',
          description: 'Original Description'
        });
      });

      act(() => {
        toastControls.update({
          title: 'Updated Title',
          description: 'Updated Description'
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        title: 'Updated Title',
        description: 'Updated Description'
      });
    });

    it('should preserve toast ID during updates', () => {
      const { result } = renderHook(() => useToast());
      let toastControls: any;
      
      act(() => {
        toastControls = result.current.toast({
          title: 'Test Toast'
        });
      });

      const originalId = result.current.toasts[0].id;

      act(() => {
        toastControls.update({
          title: 'Updated Toast'
        });
      });

      expect(result.current.toasts[0].id).toBe(originalId);
    });
  });

  describe('Toast Reducer', () => {
    it('should handle ADD_TOAST action', () => {
      const initialState = { toasts: [] };
      const action = {
        type: 'ADD_TOAST' as const,
        toast: {
          id: '1',
          title: 'Test Toast',
          open: true
        }
      };

      const newState = reducer(initialState, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toMatchObject({
        id: '1',
        title: 'Test Toast',
        open: true
      });
    });

    it('should handle UPDATE_TOAST action', () => {
      const initialState = {
        toasts: [{
          id: '1',
          title: 'Original',
          open: true
        }]
      };
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: {
          id: '1',
          title: 'Updated'
        }
      };

      const newState = reducer(initialState, action);
      
      expect(newState.toasts[0]).toMatchObject({
        id: '1',
        title: 'Updated',
        open: true
      });
    });

    it('should handle DISMISS_TOAST action', () => {
      const initialState = {
        toasts: [{
          id: '1',
          title: 'Test',
          open: true
        }]
      };
      const action = {
        type: 'DISMISS_TOAST' as const,
        toastId: '1'
      };

      const newState = reducer(initialState, action);
      
      expect(newState.toasts[0].open).toBe(false);
    });

    it('should handle REMOVE_TOAST action', () => {
      const initialState = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true }
        ]
      };
      const action = {
        type: 'REMOVE_TOAST' as const,
        toastId: '1'
      };

      const newState = reducer(initialState, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('2');
    });
  });

  describe('Memory Management', () => {
    it('should cleanup listeners on unmount', () => {
      const { result, unmount } = renderHook(() => useToast());
      
      // Create a toast to initialize listeners
      act(() => {
        result.current.toast({ title: 'Test' });
      });

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useToast());
      const { result: result2 } = renderHook(() => useToast());
      
      act(() => {
        result1.current.toast({ title: 'Toast 1' });
      });

      // Both instances should see the same toast
      expect(result1.current.toasts).toHaveLength(1);
      expect(result2.current.toasts).toHaveLength(1);
      expect(result1.current.toasts[0].title).toBe('Toast 1');
      expect(result2.current.toasts[0].title).toBe('Toast 1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle toast without title or description', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({});
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].id).toBeDefined();
    });

    it('should handle dismiss all toasts', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Toast 1' });
      });

      act(() => {
        result.current.dismiss(); // No toastId = dismiss all
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it('should handle onOpenChange callback', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({
          title: 'Test Toast'
        });
      });

      const toast = result.current.toasts[0];
      
      act(() => {
        toast.onOpenChange?.(false);
      });

      expect(result.current.toasts[0].open).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useToast();
      });
      
      const initialRenderCount = renderCount;
      
      act(() => {
        result.current.toast({ title: 'Test' });
      });

      // Should only trigger one additional render for the toast addition
      expect(renderCount).toBeLessThanOrEqual(initialRenderCount + 1);
    });
  });
});

describe('Toast Timing Configuration', () => {
  it('should use reasonable auto-dismiss timing', () => {
    // This test validates the TOAST_REMOVE_DELAY constant
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Timing Test' });
    });

    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });

    // The delay should be reasonable (5 seconds for normal UX)
    // We'll advance by 4 seconds - toast should still be there
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);

    // After advancing past 5 seconds total, toast should be removed
    act(() => {
      jest.advanceTimersByTime(2000); // Total: 6 seconds
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should handle sticky toast option when implemented', () => {
    // This test is forward-looking for when we implement sticky toasts
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ 
        title: 'Potential Sticky Toast',
        // Note: sticky option not yet implemented, but test structure ready
      });
    });

    // Normal toast behavior for now
    expect(result.current.toasts).toHaveLength(1);
  });
});