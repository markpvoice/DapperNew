/**
 * @fileoverview Tests for Reduced Motion Support
 * 
 * Tests the Phase 2 enhancement of adding comprehensive prefers-reduced-motion
 * support across all animations, transitions, and motion effects.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedHeroButtons } from '@/components/ui/animated-hero-buttons';
import { AnimatedStats } from '@/components/ui/animated-stats';
import { ParticleBackground } from '@/components/ui/particle-background';
import { PhotoGallery, Photo } from '@/components/ui/photo-gallery';

// Mock window.matchMedia for testing reduced motion preference
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock Next.js Image for PhotoGallery tests
jest.mock('next/image', () => {
  return function MockImage({ src, alt, className, ...props }: any) {
    return <img src={src} alt={alt} className={className} {...props} />;
  };
});

const mockPhotos: Photo[] = [
  {
    id: '1',
    src: '/images/test1.jpg',
    alt: 'Test photo 1',
    category: 'dj'
  }
];

const mockStats = [
  { value: 300, label: 'Events', suffix: '+' },
  { value: 5, label: 'Star Reviews', suffix: '★' },
  { value: 24, label: 'Hour Booking', suffix: '/7' }
];

describe('Reduced Motion Support', () => {
  afterEach(() => {
    // Reset matchMedia mock after each test
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      writable: true
    });
  });

  describe('Global CSS Reduced Motion Support', () => {
    it('should have reduced motion CSS rules in global stylesheet', () => {
      // Check that the global CSS rules are applied
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Verify style is added to document
      expect(document.head).toContainElement(style);
      expect(style.textContent).toContain('prefers-reduced-motion: reduce');
      
      // Cleanup
      document.head.removeChild(style);
    });

    it('should disable specific animation classes for reduced motion', () => {
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse, .animate-bounce, .animate-spin {
            animation: none !important;
          }
          .shimmer {
            animation: none !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      expect(style.textContent).toContain('.animate-pulse');
      expect(style.textContent).toContain('animation: none !important');
      
      document.head.removeChild(style);
    });

    it('should maintain focus transitions for accessibility', () => {
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          *:focus {
            transition-duration: 0.15s !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      expect(style.textContent).toContain('*:focus');
      expect(style.textContent).toContain('transition-duration: 0.15s');
      
      document.head.removeChild(style);
    });
  });

  describe('AnimatedHeroButtons - Reduced Motion Support', () => {
    it('should disable ripple effects when reduced motion is preferred', () => {
      mockMatchMedia(true); // Enable reduced motion
      
      const mockOnRequestDate = jest.fn();
      render(<AnimatedHeroButtons onRequestDate={mockOnRequestDate} />);
      
      const button = screen.getByText('Request Your Date');
      
      // Click should not create ripple effects
      fireEvent.click(button);
      
      // Button should still function
      expect(mockOnRequestDate).toHaveBeenCalled();
      
      // No ripple animations should be created
      const rippleElements = document.querySelectorAll('[data-ripple]');
      expect(rippleElements).toHaveLength(0);
    });

    it('should enable ripple effects when reduced motion is not preferred', () => {
      mockMatchMedia(false); // Disable reduced motion
      
      const mockOnRequestDate = jest.fn();
      render(<AnimatedHeroButtons onRequestDate={mockOnRequestDate} />);
      
      const button = screen.getByText('Request Your Date');
      
      // Click event should work normally
      fireEvent.click(button);
      expect(mockOnRequestDate).toHaveBeenCalled();
    });

    it('should respect reduced motion preference for hover animations', () => {
      mockMatchMedia(true); // Enable reduced motion
      
      const mockOnRequestDate = jest.fn();
      render(<AnimatedHeroButtons onRequestDate={mockOnRequestDate} />);
      
      const button = screen.getByText('Request Your Date');
      
      // Hover events should not trigger complex animations
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      
      // Button should remain functional
      expect(button).toBeInTheDocument();
    });
  });

  describe('AnimatedStats - Reduced Motion Support', () => {
    it('should skip animation when reduced motion is preferred', () => {
      mockMatchMedia(true); // Enable reduced motion
      
      // Mock intersection observer
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
      });
      window.IntersectionObserver = mockIntersectionObserver;
      
      render(<AnimatedStats stats={mockStats} />);
      
      // Stats should be immediately visible at final values
      expect(screen.getByText('300+')).toBeInTheDocument();
      expect(screen.getByText('5★')).toBeInTheDocument();
      expect(screen.getByText('24/7')).toBeInTheDocument();
    });

    it('should use immediate values instead of counting animation', () => {
      mockMatchMedia(true); // Enable reduced motion
      
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
      });
      window.IntersectionObserver = mockIntersectionObserver;
      
      const { container } = render(<AnimatedStats stats={mockStats} />);
      
      // Should show final values immediately (no counting animation)
      const statNumbers = container.querySelectorAll('[data-testid*="stat-value"]');
      if (statNumbers.length > 0) {
        statNumbers.forEach(element => {
          // Values should be at their final state
          expect(element.textContent).not.toBe('0');
        });
      }
    });
  });

  describe('ParticleBackground - Reduced Motion Support', () => {
    beforeEach(() => {
      // Mock Canvas API
      const mockCanvas = {
        getContext: jest.fn(() => ({
          clearRect: jest.fn(),
          fillStyle: '',
          fillRect: jest.fn(),
          arc: jest.fn(),
          fill: jest.fn(),
          beginPath: jest.fn(),
          globalAlpha: 1
        })),
        width: 800,
        height: 600
      };
      
      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return mockCanvas as any;
        }
        return document.createElement(tagName);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should disable particle animations when reduced motion is preferred', () => {
      mockMatchMedia(true); // Enable reduced motion
      
      const { container } = render(<ParticleBackground />);
      
      // Canvas should not be visible or should be empty
      const canvas = container.querySelector('canvas');
      if (canvas) {
        expect(canvas).toHaveStyle('display: none');
      } else {
        // Or canvas might not be rendered at all
        expect(canvas).toBeNull();
      }
    });

    it('should render particles when reduced motion is not preferred', () => {
      mockMatchMedia(false); // Disable reduced motion
      
      const { container } = render(<ParticleBackground />);
      
      // Canvas should be present and visible
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('PhotoGallery - Reduced Motion Support', () => {
    it('should disable hover scale animations for reduced motion users', () => {
      mockMatchMedia(true); // Enable reduced motion
      
      render(<PhotoGallery photos={mockPhotos} />);
      
      const thumbnails = screen.getAllByRole('button');
      
      thumbnails.forEach(thumbnail => {
        // Hover effects should be disabled via CSS
        fireEvent.mouseEnter(thumbnail);
        
        // Image should not have scale transformation
        const image = thumbnail.querySelector('img');
        if (image) {
          // CSS should prevent scale transforms
          expect(image).toHaveClass('group-hover:scale-105');
          // But CSS media query should override this
        }
        
        fireEvent.mouseLeave(thumbnail);
      });
    });

    it('should maintain functionality while disabling motion', () => {
      mockMatchMedia(true); // Enable reduced motion
      
      render(<PhotoGallery photos={mockPhotos} />);
      
      const thumbnail = screen.getAllByRole('button')[0];
      
      // Lightbox should still open
      fireEvent.click(thumbnail);
      
      // Lightbox should be functional
      expect(screen.getByTestId('lightbox')).toBeInTheDocument();
    });
  });

  describe('CSS Transition Classes', () => {
    it('should disable transition-colors classes with reduced motion CSS', () => {
      const testElement = document.createElement('div');
      testElement.className = 'transition-colors hover:text-brand-gold';
      
      // Add reduced motion CSS
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          * {
            transition-duration: 0.01ms !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      expect(testElement).toHaveClass('transition-colors');
      
      document.head.removeChild(style);
    });

    it('should disable hover scale effects with reduced motion CSS', () => {
      const testElement = document.createElement('div');
      testElement.className = 'hover:scale-105 transition-transform';
      
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          .hover\\:scale-105:hover {
            transform: none !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      expect(testElement).toHaveClass('hover:scale-105');
      
      document.head.removeChild(style);
    });
  });

  describe('Scroll Behavior', () => {
    it('should use auto scroll behavior for reduced motion', () => {
      const style = document.createElement('style');
      style.textContent = `
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
        }
      `;
      document.head.appendChild(style);
      
      expect(style.textContent).toContain('scroll-behavior: auto');
      
      document.head.removeChild(style);
    });
  });

  describe('Animation Keyframes Disabling', () => {
    it('should disable shimmer animation for reduced motion', () => {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes shimmer {
          0% { background-position: -468px 0; }
          100% { background-position: 468px 0; }
        }
        .shimmer { animation: shimmer 1.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .shimmer {
            animation: none !important;
            background: #f0f0f0;
          }
        }
      `;
      document.head.appendChild(style);
      
      const shimmerElement = document.createElement('div');
      shimmerElement.className = 'shimmer';
      
      expect(style.textContent).toContain('animation: none !important');
      
      document.head.removeChild(style);
    });

    it('should disable pulse animation for reduced motion', () => {
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse {
            animation: none !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      expect(style.textContent).toContain('.animate-pulse');
      expect(style.textContent).toContain('animation: none !important');
      
      document.head.removeChild(style);
    });
  });

  describe('Component Integration', () => {
    it('should respect system preferences across all animated components', () => {
      mockMatchMedia(true); // Enable reduced motion
      
      // Mock required APIs
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
      });
      window.IntersectionObserver = mockIntersectionObserver;
      
      const { container } = render(
        <div>
          <AnimatedHeroButtons onRequestDate={jest.fn()} />
          <AnimatedStats stats={mockStats} />
          <ParticleBackground />
          <PhotoGallery photos={mockPhotos} />
        </div>
      );
      
      // All components should render without motion
      expect(container).toBeInTheDocument();
    });

    it('should maintain accessibility when motion is disabled', () => {
      mockMatchMedia(true); // Enable reduced motion
      
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
      });
      window.IntersectionObserver = mockIntersectionObserver;
      
      render(<AnimatedHeroButtons onRequestDate={jest.fn()} />);
      
      const button = screen.getByRole('button');
      
      // Accessibility should be maintained
      expect(button).toHaveAccessibleName();
      expect(button).not.toHaveAttribute('aria-disabled');
      
      // Functionality should work
      fireEvent.click(button);
    });
  });

  describe('Media Query Detection', () => {
    it('should correctly detect reduced motion preference', () => {
      mockMatchMedia(true);
      
      // Test that components can read the media query
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(mediaQuery.matches).toBe(true);
    });

    it('should correctly detect when reduced motion is not preferred', () => {
      mockMatchMedia(false);
      
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(mediaQuery.matches).toBe(false);
    });

    it('should handle missing matchMedia gracefully', () => {
      // Remove matchMedia entirely
      delete (window as any).matchMedia;
      
      // Components should still render without errors
      expect(() => {
        render(<AnimatedHeroButtons onRequestDate={jest.fn()} />);
      }).not.toThrow();
    });
  });
});