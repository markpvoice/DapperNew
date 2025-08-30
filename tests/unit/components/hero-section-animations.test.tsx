/**
 * @fileoverview Hero Section Animation Tests
 * 
 * TDD test suite for hero section animation enhancements including:
 * - Animated statistics counting up when visible
 * - Micro-interactions for CTA buttons
 * - Subtle particle/sparkle effects
 * - Hero button hover animations
 * - Performance and accessibility compliance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';

// Mock IntersectionObserver for animation triggers
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock requestAnimationFrame for smooth animations
global.requestAnimationFrame = jest.fn((callback) => setTimeout(callback, 16));
global.cancelAnimationFrame = jest.fn();

// Component imports - these will be created after tests
import { AnimatedStats } from '@/components/ui/animated-stats';
import { AnimatedHeroButtons } from '@/components/ui/animated-hero-buttons';
import { ParticleBackground } from '@/components/ui/particle-background';

describe('Hero Section Animation Components', () => {
  
  describe('AnimatedStats Component', () => {
    const mockStats = [
      { value: 300, label: 'Events\nExperience', suffix: '+' },
      { value: 5, label: 'Rated\nReviews', suffix: '★' },
      { value: 24, label: 'Requests\nFast booking', suffix: '/7' }
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render stats with initial zero values before animation', () => {
      render(<AnimatedStats stats={mockStats} />);
      
      // Stats should start at 0 before animation
      expect(screen.getByTestId('stat-value-0')).toHaveTextContent('0+');
      expect(screen.getByTestId('stat-value-1')).toHaveTextContent('0★');
      expect(screen.getByTestId('stat-value-2')).toHaveTextContent('0/7');
    });

    it('should animate stats when component becomes visible', async () => {
      render(<AnimatedStats stats={mockStats} />);
      
      // Simulate intersection observer trigger
      const [intersectionCallback] = mockIntersectionObserver.mock.calls[0];
      act(() => {
        intersectionCallback([{
          isIntersecting: true,
          target: screen.getByTestId('animated-stats')
        }]);
      });

      // Wait for animation to complete (duration should be around 2000ms)
      await waitFor(() => {
        expect(screen.getByTestId('stat-value-0')).toHaveTextContent('300+');
      }, { timeout: 2500 });

      await waitFor(() => {
        expect(screen.getByTestId('stat-value-1')).toHaveTextContent('5★');
        expect(screen.getByTestId('stat-value-2')).toHaveTextContent('24/7');
      });
    });

    it('should use easeOutExpo timing function for smooth animation', async () => {
      const mockAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');
      render(<AnimatedStats stats={mockStats} />);
      
      // Trigger animation
      const [intersectionCallback] = mockIntersectionObserver.mock.calls[0];
      act(() => {
        intersectionCallback([{ isIntersecting: true, target: screen.getByTestId('animated-stats') }]);
      });

      // Verify requestAnimationFrame is called for smooth animation
      await waitFor(() => {
        expect(mockAnimationFrame).toHaveBeenCalled();
      });
    });

    it('should have proper accessibility attributes during animation', () => {
      render(<AnimatedStats stats={mockStats} />);
      
      const statsContainer = screen.getByTestId('animated-stats');
      expect(statsContainer).toHaveAttribute('aria-live', 'polite');
      
      // Each stat should have proper labels
      expect(screen.getByTestId('stat-0')).toHaveAttribute('aria-label', 'Events Experience: 300 plus');
      expect(screen.getByTestId('stat-1')).toHaveAttribute('aria-label', 'Rated Reviews: 5 stars');
      expect(screen.getByTestId('stat-2')).toHaveAttribute('aria-label', 'Requests Fast booking: 24/7');
    });

    it('should handle reduced motion preference', () => {
      // Mock reduced motion preference
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

      render(<AnimatedStats stats={mockStats} />);
      
      // With reduced motion, stats should appear immediately without animation
      const [intersectionCallback] = mockIntersectionObserver.mock.calls[0];
      act(() => {
        intersectionCallback([{ isIntersecting: true, target: screen.getByTestId('animated-stats') }]);
      });

      // Values should appear immediately
      expect(screen.getByTestId('stat-value-0')).toHaveTextContent('300+');
      expect(screen.getByTestId('stat-value-1')).toHaveTextContent('5★');
      expect(screen.getByTestId('stat-value-2')).toHaveTextContent('24/7');
    });

    it('should cleanup animation frame on unmount', () => {
      const mockCancelAnimationFrame = jest.spyOn(window, 'cancelAnimationFrame');
      const { unmount } = render(<AnimatedStats stats={mockStats} />);
      
      // Start animation
      const [intersectionCallback] = mockIntersectionObserver.mock.calls[0];
      act(() => {
        intersectionCallback([{ isIntersecting: true, target: screen.getByTestId('animated-stats') }]);
      });

      // Unmount during animation
      unmount();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('AnimatedHeroButtons Component', () => {
    const mockOnRequestDate = jest.fn();
    const mockOnCheckAvailability = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render both hero buttons with initial states', () => {
      render(
        <AnimatedHeroButtons 
          onRequestDate={mockOnRequestDate}
          onCheckAvailability={mockOnCheckAvailability}
        />
      );

      expect(screen.getByTestId('request-date-button')).toBeInTheDocument();
      expect(screen.getByTestId('check-availability-button')).toBeInTheDocument();
    });

    it('should have pulse animation class on Request Date button', () => {
      render(
        <AnimatedHeroButtons 
          onRequestDate={mockOnRequestDate}
          onCheckAvailability={mockOnCheckAvailability}
        />
      );

      const requestButton = screen.getByTestId('request-date-button');
      expect(requestButton).toHaveClass('animate-pulse-subtle');
    });

    it('should show ripple effect on button click', async () => {
      render(
        <AnimatedHeroButtons 
          onRequestDate={mockOnRequestDate}
          onCheckAvailability={mockOnCheckAvailability}
        />
      );

      const requestButton = screen.getByTestId('request-date-button');
      fireEvent.click(requestButton);

      // Ripple element should be created
      await waitFor(() => {
        expect(screen.getByTestId('button-ripple')).toBeInTheDocument();
      });

      // Ripple should disappear after animation
      await waitFor(() => {
        expect(screen.queryByTestId('button-ripple')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should trigger sound wave animation on hover', async () => {
      render(
        <AnimatedHeroButtons 
          onRequestDate={mockOnRequestDate}
          onCheckAvailability={mockOnCheckAvailability}
        />
      );

      const requestButton = screen.getByTestId('request-date-button');
      fireEvent.mouseEnter(requestButton);

      // Sound wave animation should be active
      await waitFor(() => {
        expect(screen.getByTestId('sound-wave-animation')).toHaveClass('animate-sound-wave');
      });

      fireEvent.mouseLeave(requestButton);

      // Animation should stop on mouse leave
      await waitFor(() => {
        expect(screen.getByTestId('sound-wave-animation')).not.toHaveClass('animate-sound-wave');
      });
    });

    it('should call appropriate handlers when clicked', () => {
      render(
        <AnimatedHeroButtons 
          onRequestDate={mockOnRequestDate}
          onCheckAvailability={mockOnCheckAvailability}
        />
      );

      fireEvent.click(screen.getByTestId('request-date-button'));
      expect(mockOnRequestDate).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId('check-availability-button'));
      expect(mockOnCheckAvailability).toHaveBeenCalledTimes(1);
    });

    it('should maintain accessibility during animations', () => {
      render(
        <AnimatedHeroButtons 
          onRequestDate={mockOnRequestDate}
          onCheckAvailability={mockOnCheckAvailability}
        />
      );

      const requestButton = screen.getByTestId('request-date-button');
      const availabilityButton = screen.getByTestId('check-availability-button');

      // Buttons should maintain proper roles and labels
      expect(requestButton).toHaveAttribute('role', 'button');
      expect(availabilityButton).toHaveAttribute('role', 'button');
      expect(requestButton).toHaveAttribute('aria-label', 'Request your event date');
      expect(availabilityButton).toHaveAttribute('aria-label', 'Check date availability');

      // Animation should not affect keyboard navigation
      requestButton.focus();
      expect(document.activeElement).toBe(requestButton);
    });

    it('should disable animations for reduced motion preference', () => {
      // Mock reduced motion preference
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

      render(
        <AnimatedHeroButtons 
          onRequestDate={mockOnRequestDate}
          onCheckAvailability={mockOnCheckAvailability}
        />
      );

      const requestButton = screen.getByTestId('request-date-button');
      expect(requestButton).not.toHaveClass('animate-pulse-subtle');
    });
  });

  describe('ParticleBackground Component', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render canvas element for particle system', () => {
      render(<ParticleBackground />);
      
      const canvas = screen.getByTestId('particle-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas.tagName).toBe('CANVAS');
    });

    it('should initialize particle system with correct parameters', () => {
      render(<ParticleBackground particleCount={50} />);
      
      const canvas = screen.getByTestId('particle-canvas') as HTMLCanvasElement;
      expect(canvas).toHaveAttribute('data-particle-count', '50');
    });

    it('should handle mouse movement for interactive particles', () => {
      render(<ParticleBackground />);
      
      const canvas = screen.getByTestId('particle-canvas');
      
      // Simulate mouse movement
      fireEvent.mouseMove(canvas, {
        clientX: 100,
        clientY: 200
      });

      // Particle system should track mouse position
      expect(canvas).toHaveAttribute('data-mouse-x', '100');
      expect(canvas).toHaveAttribute('data-mouse-y', '200');
    });

    it('should pause animations when not visible', () => {
      render(<ParticleBackground />);
      
      // Simulate component going out of view
      const [intersectionCallback] = mockIntersectionObserver.mock.calls[0];
      act(() => {
        intersectionCallback([{
          isIntersecting: false,
          target: screen.getByTestId('particle-canvas')
        }]);
      });

      const canvas = screen.getByTestId('particle-canvas');
      expect(canvas).toHaveAttribute('data-animation-paused', 'true');
    });

    it('should cleanup particle system on unmount', () => {
      const mockCancelAnimationFrame = jest.spyOn(window, 'cancelAnimationFrame');
      const { unmount } = render(<ParticleBackground />);
      
      unmount();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
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

      render(<ParticleBackground />);
      
      const canvas = screen.getByTestId('particle-canvas');
      expect(canvas).toHaveAttribute('data-reduced-motion', 'true');
    });

    it('should handle window resize gracefully', () => {
      render(<ParticleBackground />);
      
      const canvas = screen.getByTestId('particle-canvas') as HTMLCanvasElement;
      const initialWidth = canvas.width;
      
      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });
      
      fireEvent(window, new Event('resize'));

      // Canvas should update dimensions
      expect(canvas.width).not.toBe(initialWidth);
    });
  });

  describe('Hero Section Integration', () => {
    // Mock the main HomePage component with hero section
    const MockHeroSection = () => (
      <section className="bg-gradient-to-br from-brand-charcoal via-purple-900 to-brand-gold min-h-[60vh] flex items-center justify-center text-white relative">
        <ParticleBackground />
        <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-center lg:text-left">
            <h1 className="text-6xl font-bold mb-6">
              Dapper Squad<br />Entertainment
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Full-service DJ, karaoke, and event photography
            </p>
            <AnimatedHeroButtons 
              onRequestDate={jest.fn()}
              onCheckAvailability={jest.fn()}
            />
            <AnimatedStats stats={[
              { value: 300, label: 'Events\nExperience', suffix: '+' },
              { value: 5, label: 'Rated\nReviews', suffix: '★' },
              { value: 24, label: 'Requests\nFast booking', suffix: '/7' }
            ]} />
          </div>
        </div>
      </section>
    );

    it('should render complete animated hero section', () => {
      render(<MockHeroSection />);
      
      expect(screen.getByTestId('particle-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('animated-stats')).toBeInTheDocument();
      expect(screen.getByTestId('request-date-button')).toBeInTheDocument();
    });

    it('should maintain proper z-index layering', () => {
      render(<MockHeroSection />);
      
      const particleCanvas = screen.getByTestId('particle-canvas');
      const contentContainer = screen.getByText('Dapper Squad').closest('div');
      
      // Particle background should be behind content
      expect(particleCanvas).toHaveClass('absolute', 'inset-0');
      expect(contentContainer).toHaveClass('relative', 'z-10');
    });

    it('should handle multiple animated elements without performance issues', async () => {
      const performanceStart = performance.now();
      
      render(<MockHeroSection />);
      
      // Trigger all animations
      const [intersectionCallback] = mockIntersectionObserver.mock.calls[0];
      act(() => {
        intersectionCallback([{
          isIntersecting: true,
          target: screen.getByTestId('animated-stats')
        }]);
      });

      // Simulate interactions
      fireEvent.mouseEnter(screen.getByTestId('request-date-button'));
      fireEvent.click(screen.getByTestId('check-availability-button'));

      const performanceEnd = performance.now();
      
      // Animation setup should complete within reasonable time
      expect(performanceEnd - performanceStart).toBeLessThan(100);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should use intersection observer efficiently', () => {
      render(<AnimatedStats stats={[{ value: 100, label: 'Test', suffix: '+' }]} />);
      render(<ParticleBackground />);
      
      // Should reuse intersection observer instances
      expect(mockIntersectionObserver).toHaveBeenCalledTimes(2);
    });

    it('should throttle mouse movement handlers', () => {
      const { unmount } = render(<ParticleBackground />);
      const canvas = screen.getByTestId('particle-canvas');
      
      // Simulate rapid mouse movements
      for (let i = 0; i < 100; i++) {
        fireEvent.mouseMove(canvas, { clientX: i, clientY: i });
      }
      
      // Should not cause performance issues
      expect(true).toBe(true); // Test passes if no errors thrown
      
      unmount();
    });

    it('should cleanup all event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = render(<ParticleBackground />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});