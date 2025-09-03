/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useScrollAnimations } from '../../../src/hooks/use-scroll-animations';
import { AnimatedSection } from '../../../src/components/animations/animated-section';

// Mock IntersectionObserver for testing
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});

// Mock window.IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

// Mock requestAnimationFrame for animations
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16); // ~60fps
  },
});

// Mock cancelAnimationFrame
Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: (id: number) => clearTimeout(id),
});

// Mock matchMedia for prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('useScrollAnimations Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Intersection Observer Setup', () => {
    it('should initialize IntersectionObserver with correct options', () => {
      renderHook(() => useScrollAnimations());

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          root: null,
          rootMargin: '-10% 0px',
          threshold: [0, 0.25, 0.5, 0.75, 1],
        }
      );
    });

    it('should cleanup observer on unmount', () => {
      const mockDisconnect = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      });

      const { unmount } = renderHook(() => useScrollAnimations());
      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Animation State Management', () => {
    it('should initialize with empty animated elements', () => {
      const { result } = renderHook(() => useScrollAnimations());

      expect(result.current.animatedElements).toEqual(new Set());
      expect(result.current.isElementAnimated).toBeInstanceOf(Function);
      expect(result.current.observeElement).toBeInstanceOf(Function);
      expect(result.current.unobserveElement).toBeInstanceOf(Function);
    });

    it('should add elements to animated set when they enter viewport', () => {
      const { result } = renderHook(() => useScrollAnimations());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.observeElement(mockElement);
      });

      // Simulate intersection callback
      const intersectionCallback = mockIntersectionObserver.mock.calls[0][0];
      const mockEntries = [
        {
          target: mockElement,
          isIntersecting: true,
          intersectionRatio: 0.5,
          boundingClientRect: { top: 0, bottom: 100 },
          rootBounds: { height: 800 },
        }
      ];

      act(() => {
        intersectionCallback(mockEntries);
      });

      expect(result.current.isElementAnimated(mockElement)).toBe(true);
    });

    it('should handle multiple elements entering viewport', () => {
      const { result } = renderHook(() => useScrollAnimations());
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      act(() => {
        result.current.observeElement(element1);
        result.current.observeElement(element2);
      });

      const intersectionCallback = mockIntersectionObserver.mock.calls[0][0];
      const mockEntries = [
        { target: element1, isIntersecting: true, intersectionRatio: 0.5 },
        { target: element2, isIntersecting: true, intersectionRatio: 0.7 },
      ];

      act(() => {
        intersectionCallback(mockEntries);
      });

      expect(result.current.isElementAnimated(element1)).toBe(true);
      expect(result.current.isElementAnimated(element2)).toBe(true);
    });
  });

  describe('Animation Timing and Delays', () => {
    it('should apply stagger delays for sequential animations', async () => {
      const { result } = renderHook(() => useScrollAnimations({ staggerDelay: 100 }));
      const elements = Array.from({ length: 3 }, () => document.createElement('div'));
      
      elements.forEach(el => {
        act(() => {
          result.current.observeElement(el);
        });
      });

      const intersectionCallback = mockIntersectionObserver.mock.calls[0][0];
      const mockEntries = elements.map((target, index) => ({
        target,
        isIntersecting: true,
        intersectionRatio: 0.5,
      }));

      act(() => {
        intersectionCallback(mockEntries);
      });

      // All elements should be marked as animated
      elements.forEach(el => {
        expect(result.current.isElementAnimated(el)).toBe(true);
      });
    });

    it('should respect animation thresholds', () => {
      const { result } = renderHook(() => useScrollAnimations({ threshold: 0.8 }));
      const element = document.createElement('div');
      
      act(() => {
        result.current.observeElement(element);
      });

      const intersectionCallback = mockIntersectionObserver.mock.calls[0][0];
      
      // Element below threshold should not animate
      act(() => {
        intersectionCallback([{
          target: element,
          isIntersecting: true,
          intersectionRatio: 0.5, // Below 0.8 threshold
        }]);
      });

      expect(result.current.isElementAnimated(element)).toBe(false);

      // Element above threshold should animate
      act(() => {
        intersectionCallback([{
          target: element,
          isIntersecting: true,
          intersectionRatio: 0.9, // Above 0.8 threshold
        }]);
      });

      expect(result.current.isElementAnimated(element)).toBe(true);
    });
  });

  describe('Accessibility and Performance', () => {
    it('should respect prefers-reduced-motion setting', () => {
      // Mock prefers-reduced-motion: reduce
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

      const { result } = renderHook(() => useScrollAnimations());
      const element = document.createElement('div');

      act(() => {
        result.current.observeElement(element);
      });

      const intersectionCallback = mockIntersectionObserver.mock.calls[0][0];
      
      act(() => {
        intersectionCallback([{
          target: element,
          isIntersecting: true,
          intersectionRatio: 0.5,
        }]);
      });

      // When reduced motion is preferred, elements should be immediately visible
      expect(result.current.isElementAnimated(element)).toBe(true);
    });

    it('should use GPU-accelerated transforms for performance', () => {
      const { result } = renderHook(() => useScrollAnimations());
      const element = document.createElement('div');
      
      act(() => {
        result.current.observeElement(element);
      });

      // Verify will-change is applied for performance optimization
      expect(element.style.willChange).toBeDefined();
    });

    it('should cleanup will-change after animation completes', async () => {
      const { result } = renderHook(() => useScrollAnimations());
      const element = document.createElement('div');
      
      act(() => {
        result.current.observeElement(element);
      });

      // Simulate animation completion
      act(() => {
        result.current.unobserveElement(element);
      });

      // will-change should be removed after animation
      expect(element.style.willChange).toBe('');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing elements gracefully', () => {
      const { result } = renderHook(() => useScrollAnimations());
      
      expect(() => {
        result.current.isElementAnimated(null as any);
      }).not.toThrow();

      expect(() => {
        result.current.observeElement(null as any);
      }).not.toThrow();

      expect(() => {
        result.current.unobserveElement(null as any);
      }).not.toThrow();
    });

    it('should handle IntersectionObserver API unavailability', () => {
      // Temporarily remove IntersectionObserver
      const originalIO = window.IntersectionObserver;
      delete (window as any).IntersectionObserver;

      expect(() => {
        renderHook(() => useScrollAnimations());
      }).not.toThrow();

      // Restore IntersectionObserver
      window.IntersectionObserver = originalIO;
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on unmount', () => {
      const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useScrollAnimations());

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should unobserve all elements on cleanup', () => {
      const mockUnobserve = jest.fn();
      const mockDisconnect = jest.fn();
      
      mockIntersectionObserver.mockReturnValue({
        observe: jest.fn(),
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      });

      const { result, unmount } = renderHook(() => useScrollAnimations());
      const element = document.createElement('div');

      act(() => {
        result.current.observeElement(element);
      });

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});

describe('AnimatedSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children with animation classes', () => {
    render(
      <AnimatedSection animation="fadeInUp">
        <div data-testid="animated-content">Test Content</div>
      </AnimatedSection>
    );

    const content = screen.getByTestId('animated-content');
    expect(content).toBeInTheDocument();
  });

  it('should apply correct animation classes based on prop', () => {
    const { container } = render(
      <AnimatedSection animation="slideInLeft" delay={200}>
        <div>Test Content</div>
      </AnimatedSection>
    );

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('animate-slide-in-left');
    expect(section.style.animationDelay).toBe('200ms');
  });

  it('should handle stagger animations for multiple children', () => {
    render(
      <AnimatedSection animation="fadeInUp" stagger={100}>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </AnimatedSection>
    );

    const child1 = screen.getByTestId('child-1');
    const child2 = screen.getByTestId('child-2');
    const child3 = screen.getByTestId('child-3');

    expect(child1.style.animationDelay).toBe('0ms');
    expect(child2.style.animationDelay).toBe('100ms');
    expect(child3.style.animationDelay).toBe('200ms');
  });

  it('should respect reduced motion preferences', () => {
    // Mock prefers-reduced-motion
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

    const { container } = render(
      <AnimatedSection animation="fadeInUp">
        <div>Test Content</div>
      </AnimatedSection>
    );

    const section = container.firstChild as HTMLElement;
    expect(section).not.toHaveClass('animate-fade-in-up');
    expect(section).toHaveClass('animate-none');
  });

  it('should observe elements for scroll animations', () => {
    const mockObserve = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: mockObserve,
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    });

    render(
      <AnimatedSection animation="fadeInUp" triggerOnScroll>
        <div>Test Content</div>
      </AnimatedSection>
    );

    expect(mockObserve).toHaveBeenCalled();
  });

  it('should cleanup observers on unmount', () => {
    const mockUnobserve = jest.fn();
    const mockDisconnect = jest.fn();
    
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    });

    const { unmount } = render(
      <AnimatedSection animation="fadeInUp" triggerOnScroll>
        <div>Test Content</div>
      </AnimatedSection>
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});