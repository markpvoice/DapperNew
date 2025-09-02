/**
 * @fileoverview Progress Celebration Tests - TDD Implementation
 * 
 * Tests for progress celebration animation component:
 * - Confetti animations on step completion
 * - Progress bar celebration particles
 * - Achievement badges and success messages
 * - Reduced motion support and performance optimization
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressCelebration } from '@/components/ui/progress-celebration';

describe('ProgressCelebration', () => {
  const defaultProps = {
    show: true,
    stepName: 'Select Services',
    stepNumber: 1,
    totalSteps: 5,
    celebrationType: 'step-completion' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((callback) => {
      setTimeout(callback, 16);
      return 1;
    });
    
    global.cancelAnimationFrame = jest.fn();

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Visibility and Display', () => {
    test('renders celebration when show is true', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      expect(screen.getByTestId('progress-celebration')).toBeInTheDocument();
    });

    test('does not render when show is false', () => {
      render(<ProgressCelebration {...defaultProps} show={false} />);
      
      expect(screen.queryByTestId('progress-celebration')).not.toBeInTheDocument();
    });

    test('auto-hides after animation duration', async () => {
      const onComplete = jest.fn();
      render(<ProgressCelebration {...defaultProps} onComplete={onComplete} />);
      
      expect(screen.getByTestId('progress-celebration')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });

    test('supports different celebration types', () => {
      const { rerender } = render(<ProgressCelebration {...defaultProps} />);
      expect(screen.getByTestId('step-completion-celebration')).toBeInTheDocument();
      
      rerender(<ProgressCelebration {...defaultProps} celebrationType="form-submission" />);
      expect(screen.getByTestId('form-submission-celebration')).toBeInTheDocument();
      
      rerender(<ProgressCelebration {...defaultProps} celebrationType="booking-confirmed" />);
      expect(screen.getByTestId('booking-confirmed-celebration')).toBeInTheDocument();
    });
  });

  describe('Confetti Animation', () => {
    test('displays confetti particles', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const confettiContainer = screen.getByTestId('confetti-container');
      expect(confettiContainer).toBeInTheDocument();
      
      const particles = screen.getAllByTestId(/confetti-particle-\d+/);
      expect(particles.length).toBeGreaterThanOrEqual(50);
    });

    test('generates particles with different colors', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const particles = screen.getAllByTestId(/confetti-particle-\d+/);
      const colors = particles.map(p => p.style.backgroundColor);
      const uniqueColors = [...new Set(colors)];
      
      expect(uniqueColors.length).toBeGreaterThanOrEqual(4);
      expect(uniqueColors).toContain('rgb(255, 215, 0)'); // Gold
      expect(uniqueColors).toContain('rgb(255, 69, 0)'); // Red-orange
    });

    test('animates particles with physics', async () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const firstParticle = screen.getByTestId('confetti-particle-0');
      const initialTransform = firstParticle.style.transform;
      
      await waitFor(() => {
        const currentTransform = firstParticle.style.transform;
        expect(currentTransform).not.toBe(initialTransform);
      }, { timeout: 1000 });
    });

    test('particles fall with gravity effect', async () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const particle = screen.getByTestId('confetti-particle-0');
      
      // Check initial position
      expect(particle).toHaveAttribute('data-initial-y', expect.any(String));
      
      await waitFor(() => {
        const currentY = particle.getAttribute('data-current-y');
        const initialY = particle.getAttribute('data-initial-y');
        expect(parseFloat(currentY!)).toBeGreaterThan(parseFloat(initialY!));
      }, { timeout: 1000 });
    });

    test('configures different confetti intensities', () => {
      const { rerender } = render(<ProgressCelebration {...defaultProps} intensity="low" />);
      let particles = screen.getAllByTestId(/confetti-particle-\d+/);
      const lowCount = particles.length;
      
      rerender(<ProgressCelebration {...defaultProps} intensity="high" />);
      particles = screen.getAllByTestId(/confetti-particle-\d+/);
      const highCount = particles.length;
      
      expect(highCount).toBeGreaterThan(lowCount);
    });

    test('cleans up particles after animation', async () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const confettiContainer = screen.getByTestId('confetti-container');
      expect(confettiContainer.children.length).toBeGreaterThan(0);
      
      await waitFor(() => {
        expect(confettiContainer.children.length).toBe(0);
      }, { timeout: 4000 });
    });
  });

  describe('Celebration Messages', () => {
    test('displays step completion message', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      expect(screen.getByTestId('celebration-message')).toBeInTheDocument();
      expect(screen.getByTestId('celebration-message')).toHaveTextContent('Step completed: Select Services');
    });

    test('shows progress indicator', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('progress-indicator')).toHaveTextContent('1 of 5 steps completed');
    });

    test('displays achievement badge', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const achievementBadge = screen.getByTestId('achievement-badge');
      expect(achievementBadge).toBeInTheDocument();
      expect(achievementBadge).toHaveTextContent('Achievement Unlocked!');
    });

    test('customizes messages for different celebration types', () => {
      const { rerender } = render(<ProgressCelebration {...defaultProps} celebrationType="form-submission" />);
      expect(screen.getByTestId('celebration-message')).toHaveTextContent('Form submitted successfully!');
      
      rerender(<ProgressCelebration {...defaultProps} celebrationType="booking-confirmed" />);
      expect(screen.getByTestId('celebration-message')).toHaveTextContent('Booking confirmed!');
    });

    test('shows motivational text for progress', () => {
      render(<ProgressCelebration {...defaultProps} stepNumber={1} />);
      expect(screen.getByTestId('motivational-text')).toHaveTextContent('Great start! Keep going!');
      
      render(<ProgressCelebration {...defaultProps} stepNumber={3} />);
      expect(screen.getByTestId('motivational-text')).toHaveTextContent('Halfway there! You\'re doing great!');
      
      render(<ProgressCelebration {...defaultProps} stepNumber={5} />);
      expect(screen.getByTestId('motivational-text')).toHaveTextContent('Final step! Almost finished!');
    });

    test('animates text appearance', async () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const message = screen.getByTestId('celebration-message');
      expect(message).toHaveClass('animate-scale-in');
      
      await waitFor(() => {
        expect(message).toHaveClass('animate-scale-in-complete');
      }, { timeout: 1000 });
    });
  });

  describe('Achievement Badges', () => {
    test('displays different badge types for milestones', () => {
      const { rerender } = render(<ProgressCelebration {...defaultProps} stepNumber={1} />);
      expect(screen.getByTestId('badge-icon')).toHaveAttribute('data-badge-type', 'star');
      
      rerender(<ProgressCelebration {...defaultProps} stepNumber={3} />);
      expect(screen.getByTestId('badge-icon')).toHaveAttribute('data-badge-type', 'trophy');
      
      rerender(<ProgressCelebration {...defaultProps} stepNumber={5} />);
      expect(screen.getByTestId('badge-icon')).toHaveAttribute('data-badge-type', 'crown');
    });

    test('animates badge appearance with scaling', async () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const badge = screen.getByTestId('achievement-badge');
      expect(badge).toHaveClass('animate-bounce-in');
      
      await waitFor(() => {
        const transform = window.getComputedStyle(badge).transform;
        expect(transform).toContain('scale');
      }, { timeout: 500 });
    });

    test('shows badge shine effect', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const badge = screen.getByTestId('achievement-badge');
      const shineEffect = badge.querySelector('[data-testid="badge-shine"]');
      
      expect(shineEffect).toBeInTheDocument();
      expect(shineEffect).toHaveClass('animate-shine');
    });

    test('plays achievement sound effect', () => {
      const mockAudio = {
        play: jest.fn(),
        pause: jest.fn(),
        currentTime: 0,
        volume: 0.3
      };
      
      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      
      render(<ProgressCelebration {...defaultProps} playSound={true} />);
      
      expect(global.Audio).toHaveBeenCalledWith('/sounds/achievement.mp3');
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });

    test('respects user sound preferences', () => {
      const mockAudio = { play: jest.fn() };
      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      
      render(<ProgressCelebration {...defaultProps} playSound={false} />);
      
      expect(global.Audio).not.toHaveBeenCalled();
      expect(mockAudio.play).not.toHaveBeenCalled();
    });
  });

  describe('Progress Bar Celebration', () => {
    test('displays enhanced progress bar during celebration', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const progressBar = screen.getByTestId('celebration-progress-bar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('data-celebrating', 'true');
    });

    test('shows progress bar particles', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const progressParticles = screen.getAllByTestId(/progress-particle-\d+/);
      expect(progressParticles.length).toBeGreaterThanOrEqual(5);
    });

    test('animates progress bar fill with celebration effect', async () => {
      render(<ProgressCelebration {...defaultProps} stepNumber={2} totalSteps={5} />);
      
      const progressBar = screen.getByTestId('celebration-progress-bar');
      const progressFill = progressBar.querySelector('[data-testid="progress-fill"]');
      
      expect(progressFill).toHaveStyle('width: 40%'); // 2/5 = 40%
      expect(progressFill).toHaveClass('animate-fill-celebration');
    });

    test('shows step checkmarks with animation', () => {
      render(<ProgressCelebration {...defaultProps} stepNumber={2} />);
      
      const checkmark1 = screen.getByTestId('step-checkmark-1');
      const checkmark2 = screen.getByTestId('step-checkmark-2');
      
      expect(checkmark1).toBeInTheDocument();
      expect(checkmark1).toHaveClass('animate-checkmark-complete');
      
      expect(checkmark2).toBeInTheDocument();
      expect(checkmark2).toHaveClass('animate-checkmark-active');
    });
  });

  describe('Reduced Motion Support', () => {
    test('respects prefers-reduced-motion setting', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<ProgressCelebration {...defaultProps} />);
      
      // Should still show celebration but without animations
      expect(screen.getByTestId('progress-celebration')).toBeInTheDocument();
      expect(screen.getByTestId('celebration-message')).toBeInTheDocument();
      
      // Animations should be disabled
      const confettiContainer = screen.getByTestId('confetti-container');
      expect(confettiContainer).toHaveAttribute('data-reduced-motion', 'true');
    });

    test('shows static celebration elements for reduced motion', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<ProgressCelebration {...defaultProps} />);
      
      expect(screen.getByTestId('static-celebration-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('confetti-container')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides appropriate ARIA attributes', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const celebration = screen.getByTestId('progress-celebration');
      expect(celebration).toHaveAttribute('role', 'status');
      expect(celebration).toHaveAttribute('aria-live', 'polite');
      expect(celebration).toHaveAttribute('aria-label', 'Step completed: Select Services');
    });

    test('announces completion to screen readers', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const message = screen.getByTestId('celebration-message');
      expect(message).toHaveAttribute('aria-live', 'assertive');
    });

    test('provides alternative text for visual elements', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const badge = screen.getByTestId('achievement-badge');
      expect(badge).toHaveAttribute('aria-label', 'Achievement unlocked: Step 1 completed');
    });

    test('supports keyboard focus for interactive elements', () => {
      render(<ProgressCelebration {...defaultProps} showContinueButton={true} />);
      
      const continueButton = screen.getByTestId('continue-button');
      expect(continueButton).toHaveAttribute('tabIndex', '0');
      
      continueButton.focus();
      expect(document.activeElement).toBe(continueButton);
    });

    test('provides proper heading hierarchy', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Step Completed!');
    });
  });

  describe('Performance Optimization', () => {
    test('uses GPU acceleration for animations', () => {
      render(<ProgressCelebration {...defaultProps} />);
      
      const celebration = screen.getByTestId('progress-celebration');
      expect(celebration).toHaveStyle('will-change: transform');
      expect(celebration).toHaveStyle('transform: translateZ(0)');
    });

    test('debounces rapid celebration triggers', () => {
      const onComplete = jest.fn();
      const { rerender } = render(<ProgressCelebration {...defaultProps} onComplete={onComplete} />);
      
      // Rapid re-renders should not trigger multiple celebrations
      rerender(<ProgressCelebration {...defaultProps} onComplete={onComplete} show={false} />);
      rerender(<ProgressCelebration {...defaultProps} onComplete={onComplete} show={true} />);
      rerender(<ProgressCelebration {...defaultProps} onComplete={onComplete} show={false} />);
      rerender(<ProgressCelebration {...defaultProps} onComplete={onComplete} show={true} />);
      
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('cleans up animations on unmount', () => {
      const { unmount } = render(<ProgressCelebration {...defaultProps} />);
      
      expect(global.cancelAnimationFrame).toHaveBeenCalledTimes(0);
      
      unmount();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    test('optimizes particle count based on device performance', () => {
      // Mock slower device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2,
        writable: true
      });
      
      render(<ProgressCelebration {...defaultProps} />);
      
      const particles = screen.getAllByTestId(/confetti-particle-\d+/);
      const lowEndCount = particles.length;
      
      // Mock faster device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 8,
        writable: true
      });
      
      render(<ProgressCelebration {...defaultProps} />);
      
      const highEndParticles = screen.getAllByTestId(/confetti-particle-\d+/);
      expect(highEndParticles.length).toBeGreaterThanOrEqual(lowEndCount);
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts particle count for mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      
      render(<ProgressCelebration {...defaultProps} />);
      
      const particles = screen.getAllByTestId(/confetti-particle-\d+/);
      expect(particles.length).toBeLessThan(50); // Reduced for mobile performance
    });

    test('uses appropriate sizes for touch targets', () => {
      render(<ProgressCelebration {...defaultProps} showContinueButton={true} />);
      
      const continueButton = screen.getByTestId('continue-button');
      expect(continueButton).toHaveStyle('min-height: 44px');
      expect(continueButton).toHaveClass('touch-manipulation');
    });

    test('optimizes animations for mobile devices', () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true
      });
      
      render(<ProgressCelebration {...defaultProps} />);
      
      const celebration = screen.getByTestId('progress-celebration');
      expect(celebration).toHaveAttribute('data-mobile-optimized', 'true');
    });
  });

  describe('Integration with Form Flow', () => {
    test('listens for step completion events', () => {
      render(<ProgressCelebration {...defaultProps} show={false} />);
      
      // Simulate step completion event
      fireEvent(window, new CustomEvent('step-completed', {
        detail: { 
          step: 1, 
          stepName: 'Select Services', 
          totalSteps: 5 
        }
      }));
      
      expect(screen.getByTestId('progress-celebration')).toBeInTheDocument();
    });

    test('handles form submission completion', () => {
      render(<ProgressCelebration {...defaultProps} show={false} />);
      
      fireEvent(window, new CustomEvent('booking-completed', {
        detail: {
          bookingReference: 'DSE-123',
          clientName: 'John Doe'
        }
      }));
      
      expect(screen.getByTestId('booking-confirmed-celebration')).toBeInTheDocument();
    });

    test('customizes celebration based on event data', () => {
      render(<ProgressCelebration {...defaultProps} show={false} />);
      
      fireEvent(window, new CustomEvent('step-completed', {
        detail: { 
          step: 5, 
          stepName: 'Review & Confirm', 
          totalSteps: 5,
          isLastStep: true
        }
      }));
      
      expect(screen.getByTestId('final-step-celebration')).toBeInTheDocument();
      expect(screen.getByTestId('celebration-message')).toHaveTextContent('All steps completed!');
    });
  });
});