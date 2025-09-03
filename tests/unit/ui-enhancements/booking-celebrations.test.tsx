/**
 * @fileoverview Test Suite for Booking Journey Celebrations and Delight Moments
 * 
 * TDD implementation for Phase 3 Feature 1:
 * - Enhanced form step celebrations
 * - Success confetti effects
 * - Progress milestone celebrations
 * - Sound effects & haptic feedback
 * - Accessibility compliance
 * 
 * Following RED-GREEN-REFACTOR TDD cycle
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingCelebrations } from '@/components/ui/booking-celebrations';
import { useCelebrationEffects } from '@/hooks/use-celebration-effects';
import { renderHook } from '@testing-library/react';

// Mock audio and vibration APIs
const mockVibrate = jest.fn();
const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockPause = jest.fn();

beforeAll(() => {
  // Mock navigator.vibrate
  Object.defineProperty(navigator, 'vibrate', {
    value: mockVibrate,
    writable: true,
  });

  // Mock Audio API
  global.Audio = jest.fn().mockImplementation(() => ({
    play: mockPlay,
    pause: mockPause,
    load: jest.fn(),
    currentTime: 0,
    duration: 0,
    volume: 0.5,
    muted: false,
    paused: true,
    ended: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  // Mock HTMLCanvasElement for confetti
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    drawImage: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    canvas: {
      width: 800,
      height: 600,
    },
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset reduced motion preference
  (window.matchMedia as jest.Mock).mockImplementation((query) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

describe('BookingCelebrations Component', () => {
  describe('Rendering and Basic Props', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(
          <BookingCelebrations
            step={1}
            totalSteps={5}
            isVisible={true}
            onComplete={jest.fn()}
          />
        );
      }).not.toThrow();
    });

    it('should display correct step progress', () => {
      render(
        <BookingCelebrations
          step={3}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('celebration-progress')).toBeInTheDocument();
      expect(screen.getByTestId('celebration-progress')).toHaveAttribute('data-step', '3');
      expect(screen.getByTestId('celebration-progress')).toHaveAttribute('data-total', '5');
    });

    it('should not render when not visible', () => {
      render(
        <BookingCelebrations
          step={1}
          totalSteps={5}
          isVisible={false}
          onComplete={jest.fn()}
        />
      );

      expect(screen.queryByTestId('celebration-container')).not.toBeInTheDocument();
    });

    it('should accept custom celebration type', () => {
      render(
        <BookingCelebrations
          step={5}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="success"
        />
      );

      expect(screen.getByTestId('celebration-container')).toHaveAttribute('data-type', 'success');
    });

    it('should handle step completion celebration', () => {
      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="step-complete"
        />
      );

      expect(screen.getByTestId('step-celebration')).toBeInTheDocument();
    });
  });

  describe('Step Completion Celebrations', () => {
    it('should trigger step completion animation', async () => {
      const onComplete = jest.fn();
      
      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={onComplete}
          celebrationType="step-complete"
        />
      );

      const stepElement = screen.getByTestId('step-celebration');
      expect(stepElement).toHaveClass('animate-step-complete');

      // Wait for animation to complete
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith('step-complete');
      }, { timeout: 2000 });
    });

    it('should show progress bar animation', () => {
      render(
        <BookingCelebrations
          step={3}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
        />
      );

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle('width: 60%'); // 3/5 = 60%
      expect(progressBar).toHaveClass('animate-progress-fill');
    });

    it('should display checkmark for completed steps', () => {
      render(
        <BookingCelebrations
          step={4}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
        />
      );

      // Should show 3 completed steps (current step - 1)
      const checkmarks = screen.getAllByTestId('step-checkmark');
      expect(checkmarks).toHaveLength(3);
      
      checkmarks.forEach(checkmark => {
        expect(checkmark).toHaveClass('animate-check-scale');
      });
    });

    it('should pulse current step indicator', () => {
      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
        />
      );

      const currentStep = screen.getByTestId('current-step-indicator');
      expect(currentStep).toHaveClass('animate-pulse-glow');
    });
  });

  describe('Milestone Celebrations (50%, 75%, 100%)', () => {
    it('should trigger 50% milestone celebration', async () => {
      const onComplete = jest.fn();
      
      render(
        <BookingCelebrations
          step={3}
          totalSteps={5}
          isVisible={true}
          onComplete={onComplete}
          celebrationType="milestone"
        />
      );

      const milestone = screen.getByTestId('milestone-celebration');
      expect(milestone).toHaveAttribute('data-milestone', '60'); // 3/5 = 60%, rounds to 50% milestone
      expect(milestone).toHaveClass('animate-milestone-burst');

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith('milestone', { percentage: 60 });
      });
    });

    it('should trigger 75% milestone celebration', async () => {
      const onComplete = jest.fn();
      
      render(
        <BookingCelebrations
          step={4}
          totalSteps={5}
          isVisible={true}
          onComplete={onComplete}
          celebrationType="milestone"
        />
      );

      const milestone = screen.getByTestId('milestone-celebration');
      expect(milestone).toHaveAttribute('data-milestone', '80'); // 4/5 = 80%, rounds to 75% milestone
      expect(milestone).toHaveClass('animate-milestone-burst');
    });

    it('should trigger 100% completion celebration', async () => {
      const onComplete = jest.fn();
      
      render(
        <BookingCelebrations
          step={5}
          totalSteps={5}
          isVisible={true}
          onComplete={onComplete}
          celebrationType="success"
        />
      );

      const success = screen.getByTestId('success-celebration');
      expect(success).toHaveAttribute('data-milestone', '100');
      expect(success).toHaveClass('animate-success-burst');
    });

    it('should display milestone message', () => {
      render(
        <BookingCelebrations
          step={3}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="milestone"
        />
      );

      expect(screen.getByText('Halfway there! 🎉')).toBeInTheDocument();
    });

    it('should display completion message', () => {
      render(
        <BookingCelebrations
          step={5}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="success"
        />
      );

      expect(screen.getByText('Booking Complete! 🎊')).toBeInTheDocument();
    });
  });

  describe('Confetti Effects', () => {
    it('should render confetti canvas for success celebration', () => {
      render(
        <BookingCelebrations
          step={5}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="success"
        />
      );

      const canvas = screen.getByTestId('confetti-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas.tagName).toBe('CANVAS');
    });

    it('should trigger confetti animation on mount', async () => {
      render(
        <BookingCelebrations
          step={5}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="success"
        />
      );

      const canvas = screen.getByTestId('confetti-canvas');
      await waitFor(() => {
        expect(canvas).toHaveAttribute('data-animating', 'true');
      });
    });

    it('should clean up confetti animation', async () => {
      const { unmount } = render(
        <BookingCelebrations
          step={5}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="success"
        />
      );

      unmount();
      
      // Ensure cleanup doesn't throw errors
      expect(() => unmount()).not.toThrow();
    });

    it('should not show confetti for step celebrations', () => {
      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="step-complete"
        />
      );

      expect(screen.queryByTestId('confetti-canvas')).not.toBeInTheDocument();
    });
  });

  describe('Sound Effects', () => {
    it('should play step completion sound', async () => {
      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="step-complete"
          enableSounds={true}
        />
      );

      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalledWith('/sounds/step-complete.mp3');
        expect(mockPlay).toHaveBeenCalled();
      });
    });

    it('should play milestone sound', async () => {
      render(
        <BookingCelebrations
          step={3}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="milestone"
          enableSounds={true}
        />
      );

      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalledWith('/sounds/milestone.mp3');
        expect(mockPlay).toHaveBeenCalled();
      });
    });

    it('should play success sound', async () => {
      render(
        <BookingCelebrations
          step={5}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="success"
          enableSounds={true}
        />
      );

      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalledWith('/sounds/success.mp3');
        expect(mockPlay).toHaveBeenCalled();
      });
    });

    it('should not play sounds when disabled', () => {
      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="step-complete"
          enableSounds={false}
        />
      );

      expect(global.Audio).not.toHaveBeenCalled();
      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('should handle sound play errors gracefully', async () => {
      mockPlay.mockRejectedValueOnce(new Error('Sound failed to play'));

      expect(() => {
        render(
          <BookingCelebrations
            step={2}
            totalSteps={5}
            isVisible={true}
            onComplete={jest.fn()}
            celebrationType="step-complete"
            enableSounds={true}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger vibration for step completion', async () => {
      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="step-complete"
          enableHaptics={true}
        />
      );

      await waitFor(() => {
        expect(mockVibrate).toHaveBeenCalledWith([100]); // Light vibration
      });
    });

    it('should trigger stronger vibration for milestones', async () => {
      render(
        <BookingCelebrations
          step={3}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="milestone"
          enableHaptics={true}
        />
      );

      await waitFor(() => {
        expect(mockVibrate).toHaveBeenCalledWith([200, 100, 200]); // Pattern vibration
      });
    });

    it('should trigger success vibration pattern', async () => {
      render(
        <BookingCelebrations
          step={5}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="success"
          enableHaptics={true}
        />
      );

      await waitFor(() => {
        expect(mockVibrate).toHaveBeenCalledWith([300, 100, 300, 100, 300]); // Success pattern
      });
    });

    it('should not vibrate when disabled', () => {
      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="step-complete"
          enableHaptics={false}
        />
      );

      expect(mockVibrate).not.toHaveBeenCalled();
    });

    it('should handle devices without vibration support', () => {
      // Mock navigator.vibrate as undefined
      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        writable: true,
      });

      expect(() => {
        render(
          <BookingCelebrations
            step={2}
            totalSteps={5}
            isVisible={true}
            onComplete={jest.fn()}
            celebrationType="step-complete"
            enableHaptics={true}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should respect reduced motion preferences', () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="step-complete"
        />
      );

      const celebration = screen.getByTestId('celebration-container');
      expect(celebration).toHaveAttribute('data-reduced-motion', 'true');
    });

    it('should disable animations when reduced motion is preferred', () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="step-complete"
        />
      );

      const stepElement = screen.queryByTestId('step-celebration');
      expect(stepElement).not.toHaveClass('animate-step-complete');
    });

    it('should provide screen reader announcements', async () => {
      render(
        <BookingCelebrations
          step={3}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="milestone"
        />
      );

      const announcement = screen.getByTestId('sr-announcement');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveAttribute('aria-atomic', 'true');
      expect(announcement).toHaveTextContent('Milestone reached: 60% complete');
    });

    it('should have proper ARIA labels', () => {
      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
        />
      );

      const container = screen.getByTestId('celebration-container');
      expect(container).toHaveAttribute('aria-label', 'Booking progress celebration');
      
      const progress = screen.getByTestId('celebration-progress');
      expect(progress).toHaveAttribute('aria-label', 'Step 2 of 5 completed');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onComplete = jest.fn();

      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={onComplete}
          celebrationType="step-complete"
        />
      );

      const container = screen.getByTestId('celebration-container');
      container.focus();
      
      await user.keyboard('{Enter}');
      expect(onComplete).toHaveBeenCalled();
    });

    it('should support high contrast mode', () => {
      // Mock high contrast media query
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === '(prefers-contrast: high)' ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <BookingCelebrations
          step={2}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
        />
      );

      const container = screen.getByTestId('celebration-container');
      expect(container).toHaveAttribute('data-high-contrast', 'true');
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause memory leaks with multiple renders', () => {
      const { rerender } = render(
        <BookingCelebrations
          step={1}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
        />
      );

      // Rerender with different props multiple times
      for (let i = 2; i <= 5; i++) {
        rerender(
          <BookingCelebrations
            step={i}
            totalSteps={5}
            isVisible={true}
            onComplete={jest.fn()}
          />
        );
      }

      // Should not throw or cause issues
      expect(screen.getByTestId('celebration-container')).toBeInTheDocument();
    });

    it('should cleanup animation frames on unmount', () => {
      const cancelAnimationFrame = jest.spyOn(window, 'cancelAnimationFrame');
      
      const { unmount } = render(
        <BookingCelebrations
          step={5}
          totalSteps={5}
          isVisible={true}
          onComplete={jest.fn()}
          celebrationType="success"
        />
      );

      unmount();
      
      expect(cancelAnimationFrame).toHaveBeenCalled();
      cancelAnimationFrame.mockRestore();
    });

    it('should throttle rapid state changes', async () => {
      const onComplete = jest.fn();
      const { rerender } = render(
        <BookingCelebrations
          step={1}
          totalSteps={5}
          isVisible={true}
          onComplete={onComplete}
        />
      );

      // Rapidly change steps
      for (let i = 2; i <= 5; i++) {
        rerender(
          <BookingCelebrations
            step={i}
            totalSteps={5}
            isVisible={true}
            onComplete={onComplete}
            celebrationType="step-complete"
          />
        );
      }

      // Should only trigger completion once per actual step change
      await waitFor(() => {
        expect(onComplete.mock.calls.length).toBeLessThanOrEqual(4); // Max 4 step completions
      });
    });
  });
});

describe('useCelebrationEffects Hook', () => {
  describe('Basic Functionality', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 1,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: true,
        })
      );

      expect(result.current.progress).toBe(20); // 1/5 = 20%
      expect(result.current.isAnimating).toBe(false);
      expect(result.current.celebrationType).toBe('none');
    });

    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 3,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: true,
        })
      );

      expect(result.current.progress).toBe(60); // 3/5 = 60%
    });

    it('should detect milestone celebrations', () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 3,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: true,
        })
      );

      act(() => {
        result.current.triggerCelebration('milestone');
      });

      expect(result.current.celebrationType).toBe('milestone');
      expect(result.current.milestone).toBe(50); // Nearest milestone to 60%
    });

    it('should handle step completion', () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: true,
        })
      );

      act(() => {
        result.current.triggerCelebration('step-complete');
      });

      expect(result.current.celebrationType).toBe('step-complete');
      expect(result.current.isAnimating).toBe(true);
    });

    it('should handle success celebration', () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 5,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: true,
        })
      );

      act(() => {
        result.current.triggerCelebration('success');
      });

      expect(result.current.celebrationType).toBe('success');
      expect(result.current.progress).toBe(100);
    });
  });

  describe('Sound Management', () => {
    it('should play sounds when enabled', async () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: false,
        })
      );

      await act(async () => {
        result.current.triggerCelebration('step-complete');
      });

      expect(global.Audio).toHaveBeenCalledWith('/sounds/step-complete.mp3');
      expect(mockPlay).toHaveBeenCalled();
    });

    it('should not play sounds when disabled', async () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: false,
          enableHaptics: false,
        })
      );

      await act(async () => {
        result.current.triggerCelebration('step-complete');
      });

      expect(global.Audio).not.toHaveBeenCalled();
      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('should handle different sound files for different celebrations', async () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 3,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: false,
        })
      );

      await act(async () => {
        result.current.triggerCelebration('milestone');
      });

      expect(global.Audio).toHaveBeenCalledWith('/sounds/milestone.mp3');

      await act(async () => {
        result.current.triggerCelebration('success');
      });

      expect(global.Audio).toHaveBeenCalledWith('/sounds/success.mp3');
    });
  });

  describe('Haptic Feedback Management', () => {
    it('should trigger haptics when enabled', async () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: false,
          enableHaptics: true,
        })
      );

      await act(async () => {
        result.current.triggerCelebration('step-complete');
      });

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockVibrate).toHaveBeenCalledWith([100]);
    });

    it('should not trigger haptics when disabled', async () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: false,
          enableHaptics: false,
        })
      );

      await act(async () => {
        result.current.triggerCelebration('step-complete');
      });

      expect(mockVibrate).not.toHaveBeenCalled();
    });

    it('should use different vibration patterns', async () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 3,
          totalSteps: 5,
          enableSounds: false,
          enableHaptics: true,
        })
      );

      // Test milestone vibration
      await act(async () => {
        result.current.triggerCelebration('milestone');
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockVibrate).toHaveBeenCalledWith([200, 100, 200]);

      // Test success vibration
      await act(async () => {
        result.current.triggerCelebration('success');
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockVibrate).toHaveBeenCalledWith([300, 100, 300, 100, 300]);
    });
  });

  describe('Accessibility Features', () => {
    it('should respect reduced motion preferences', () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: true,
        })
      );

      expect(result.current.prefersReducedMotion).toBe(true);
      
      act(() => {
        result.current.triggerCelebration('step-complete');
      });

      expect(result.current.isAnimating).toBe(false); // Should not animate
    });

    it('should provide screen reader announcements', () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 3,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: true,
        })
      );

      act(() => {
        result.current.triggerCelebration('milestone');
      });

      expect(result.current.announcement).toBe('Milestone reached: 60% complete');
    });

    it('should update announcement for different celebration types', () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: true,
        })
      );

      act(() => {
        result.current.triggerCelebration('step-complete');
      });

      expect(result.current.announcement).toBe('Step 2 completed');

      act(() => {
        result.current.triggerCelebration('success');
      });

      expect(result.current.announcement).toBe('Booking completed successfully!');
    });
  });

  describe('Animation Management', () => {
    it('should reset animations after completion', async () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: false,
          enableHaptics: false,
        })
      );

      act(() => {
        result.current.triggerCelebration('step-complete');
      });

      expect(result.current.isAnimating).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for animation
      });

      expect(result.current.isAnimating).toBe(false);
    });

    it('should provide reset functionality', () => {
      const { result } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: false,
          enableHaptics: false,
        })
      );

      act(() => {
        result.current.triggerCelebration('step-complete');
      });

      expect(result.current.celebrationType).toBe('step-complete');

      act(() => {
        result.current.resetCelebration();
      });

      expect(result.current.celebrationType).toBe('none');
      expect(result.current.isAnimating).toBe(false);
      expect(result.current.announcement).toBe('');
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('should cleanup resources on unmount', () => {
      const { unmount } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: true,
          enableHaptics: true,
        })
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should cancel pending animations on unmount', () => {
      const clearTimeout = jest.spyOn(window, 'clearTimeout');
      
      const { result, unmount } = renderHook(() => 
        useCelebrationEffects({
          step: 2,
          totalSteps: 5,
          enableSounds: false,
          enableHaptics: false,
        })
      );

      act(() => {
        result.current.triggerCelebration('step-complete');
      });

      unmount();
      
      expect(clearTimeout).toHaveBeenCalled();
      clearTimeout.mockRestore();
    });
  });
});