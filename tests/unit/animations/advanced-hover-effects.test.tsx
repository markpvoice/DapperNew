/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAdvancedHover } from '../../../src/hooks/use-advanced-hover';
import { HoverEnhancedCard } from '../../../src/components/animations/hover-enhanced-card';

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

// Mock getBoundingClientRect for position calculations
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  x: 0,
  y: 0,
  width: 200,
  height: 200,
  top: 100,
  left: 100,
  bottom: 300,
  right: 300,
  toJSON: jest.fn(),
}));

describe('useAdvancedHover Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Hover State Management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAdvancedHover());

      expect(result.current.isHovered).toBe(false);
      expect(result.current.mousePosition).toEqual({ x: 0, y: 0 });
      expect(result.current.transformStyle).toBe('');
      expect(result.current.hoverHandlers).toBeDefined();
    });

    it('should update hover state on mouse enter/leave', () => {
      const { result } = renderHook(() => useAdvancedHover());

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(result.current.isHovered).toBe(true);

      act(() => {
        result.current.hoverHandlers.onMouseLeave();
      });

      expect(result.current.isHovered).toBe(false);
    });

    it('should track mouse position during hover', () => {
      const { result } = renderHook(() => useAdvancedHover());

      act(() => {
        result.current.hoverHandlers.onMouseMove({
          clientX: 175,
          clientY: 125,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(result.current.mousePosition.x).toBe(175);
      expect(result.current.mousePosition.y).toBe(125);
    });
  });

  describe('Animation Effects', () => {
    it('should generate scale transform on hover', () => {
      const { result } = renderHook(() => useAdvancedHover({ 
        scale: 1.05,
        enableScale: true 
      }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(result.current.transformStyle).toContain('scale(1.05)');
    });

    it('should generate rotation transform on hover', () => {
      const { result } = renderHook(() => useAdvancedHover({ 
        rotateX: 5,
        rotateY: 5,
        enableTilt: true 
      }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      act(() => {
        result.current.hoverHandlers.onMouseMove({
          clientX: 175,
          clientY: 125,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(result.current.transformStyle).toContain('rotateX');
      expect(result.current.transformStyle).toContain('rotateY');
    });

    it('should generate glow effect on hover', () => {
      const { result } = renderHook(() => useAdvancedHover({ 
        enableGlow: true,
        glowColor: '#FFD700' 
      }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(result.current.glowStyle).toContain('drop-shadow');
      expect(result.current.glowStyle).toContain('#FFD700');
    });

    it('should apply magnetic effect with mouse following', () => {
      const { result } = renderHook(() => useAdvancedHover({ 
        enableMagnetic: true,
        magneticStrength: 0.3 
      }));

      act(() => {
        result.current.hoverHandlers.onMouseMove({
          clientX: 175,
          clientY: 125,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(result.current.transformStyle).toContain('translate');
    });
  });

  describe('Performance Optimization', () => {
    it('should apply will-change on hover start', () => {
      const element = document.createElement('div');
      const { result } = renderHook(() => useAdvancedHover({ element }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(element.style.willChange).toBe('transform, filter');
    });

    it('should remove will-change on hover end', () => {
      const element = document.createElement('div');
      const { result } = renderHook(() => useAdvancedHover({ element }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      act(() => {
        result.current.hoverHandlers.onMouseLeave();
      });

      expect(element.style.willChange).toBe('auto');
    });

    it('should throttle mouse move events', () => {
      const { result } = renderHook(() => useAdvancedHover({ 
        throttleMs: 16 
      }));

      const mockEvent = {
        clientX: 150,
        clientY: 150,
        target: document.createElement('div'),
      } as MouseEvent;

      // Fire multiple mouse move events rapidly
      act(() => {
        result.current.hoverHandlers.onMouseMove(mockEvent);
        result.current.hoverHandlers.onMouseMove(mockEvent);
        result.current.hoverHandlers.onMouseMove(mockEvent);
      });

      // Only one should be processed within throttle period
      expect(result.current.mousePosition.x).toBe(150);
    });

    it('should use GPU-accelerated transforms', () => {
      const { result } = renderHook(() => useAdvancedHover({ 
        enableScale: true,
        scale: 1.1 
      }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      // Should use translate3d for GPU acceleration
      expect(result.current.transformStyle).toContain('translate3d');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should respect prefers-reduced-motion', () => {
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

      const { result } = renderHook(() => useAdvancedHover({ 
        enableScale: true,
        scale: 1.1 
      }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      // Should disable animations when reduced motion is preferred
      expect(result.current.transformStyle).toBe('');
    });

    it('should provide keyboard focus handlers', () => {
      const { result } = renderHook(() => useAdvancedHover());

      expect(result.current.hoverHandlers.onFocus).toBeDefined();
      expect(result.current.hoverHandlers.onBlur).toBeDefined();
    });

    it('should handle focus events similar to hover', () => {
      const { result } = renderHook(() => useAdvancedHover({ 
        enableScale: true,
        scale: 1.05 
      }));

      act(() => {
        result.current.hoverHandlers.onFocus();
      });

      expect(result.current.isHovered).toBe(true);
      expect(result.current.transformStyle).toContain('scale(1.05)');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing target element gracefully', () => {
      const { result } = renderHook(() => useAdvancedHover());

      expect(() => {
        result.current.hoverHandlers.onMouseMove({
          clientX: 150,
          clientY: 150,
          target: null,
        } as any);
      }).not.toThrow();
    });

    it('should handle invalid mouse coordinates', () => {
      const { result } = renderHook(() => useAdvancedHover());

      expect(() => {
        result.current.hoverHandlers.onMouseMove({
          clientX: NaN,
          clientY: undefined,
          target: document.createElement('div'),
        } as any);
      }).not.toThrow();
    });

    it('should cleanup animation frames on unmount', () => {
      const { result, unmount } = renderHook(() => useAdvancedHover());

      act(() => {
        result.current.hoverHandlers.onMouseMove({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Custom Animation Configurations', () => {
    it('should support custom easing functions', () => {
      const customEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';
      const { result } = renderHook(() => useAdvancedHover({ 
        easing: customEasing,
        enableScale: true 
      }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(result.current.transitionStyle).toContain(customEasing);
    });

    it('should support custom transition duration', () => {
      const { result } = renderHook(() => useAdvancedHover({ 
        duration: 500,
        enableScale: true 
      }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(result.current.transitionStyle).toContain('500ms');
    });

    it('should support selective effect enabling', () => {
      const { result } = renderHook(() => useAdvancedHover({ 
        enableScale: false,
        enableTilt: true,
        enableGlow: false,
        enableMagnetic: true,
        rotateX: 10,
        rotateY: 10
      }));

      act(() => {
        result.current.hoverHandlers.onMouseEnter({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(result.current.transformStyle).not.toContain('scale');
      expect(result.current.transformStyle).toContain('rotate');
      expect(result.current.glowStyle).toBe('');
    });
  });

  describe('Memory Management', () => {
    it('should cleanup event listeners on unmount', () => {
      const element = document.createElement('div');
      const { unmount } = renderHook(() => useAdvancedHover({ element }));

      unmount();

      expect(element.style.willChange).toBe('');
    });

    it('should cancel pending animations on unmount', () => {
      const { result, unmount } = renderHook(() => useAdvancedHover());

      act(() => {
        result.current.hoverHandlers.onMouseMove({
          clientX: 150,
          clientY: 150,
          target: document.createElement('div'),
        } as MouseEvent);
      });

      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('HoverEnhancedCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children with hover effects', () => {
    render(
      <HoverEnhancedCard>
        <div data-testid="card-content">Card Content</div>
      </HoverEnhancedCard>
    );

    const content = screen.getByTestId('card-content');
    expect(content).toBeInTheDocument();
  });

  it('should apply hover effects on mouse enter', () => {
    const { container } = render(
      <HoverEnhancedCard scale={1.05} enableScale>
        <div>Card Content</div>
      </HoverEnhancedCard>
    );

    const card = container.firstChild as HTMLElement;
    
    fireEvent.mouseEnter(card);

    expect(card.style.transform).toContain('scale(1.05)');
  });

  it('should remove hover effects on mouse leave', () => {
    const { container } = render(
      <HoverEnhancedCard scale={1.05} enableScale>
        <div>Card Content</div>
      </HoverEnhancedCard>
    );

    const card = container.firstChild as HTMLElement;
    
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);

    expect(card.style.transform).not.toContain('scale(1.05)');
  });

  it('should apply glow effects when enabled', () => {
    const { container } = render(
      <HoverEnhancedCard enableGlow glowColor="#FFD700">
        <div>Card Content</div>
      </HoverEnhancedCard>
    );

    const card = container.firstChild as HTMLElement;
    
    fireEvent.mouseEnter(card);

    expect(card.style.filter).toContain('drop-shadow');
  });

  it('should handle mouse movement for magnetic effects', () => {
    const { container } = render(
      <HoverEnhancedCard enableMagnetic magneticStrength={0.2}>
        <div>Card Content</div>
      </HoverEnhancedCard>
    );

    const card = container.firstChild as HTMLElement;
    
    fireEvent.mouseMove(card, { clientX: 150, clientY: 150 });

    expect(card.style.transform).toContain('translate');
  });

  it('should apply tilt effects based on mouse position', () => {
    const { container } = render(
      <HoverEnhancedCard enableTilt rotateX={10} rotateY={10}>
        <div>Card Content</div>
      </HoverEnhancedCard>
    );

    const card = container.firstChild as HTMLElement;
    
    fireEvent.mouseEnter(card);
    fireEvent.mouseMove(card, { clientX: 175, clientY: 125 });

    expect(card.style.transform).toContain('rotateX');
    expect(card.style.transform).toContain('rotateY');
  });

  it('should handle custom className and styling', () => {
    const { container } = render(
      <HoverEnhancedCard 
        className="custom-card" 
        style={{ backgroundColor: 'red' }}
      >
        <div>Card Content</div>
      </HoverEnhancedCard>
    );

    const card = container.firstChild as HTMLElement;
    
    expect(card).toHaveClass('custom-card');
    expect(card.style.backgroundColor).toBe('red');
  });

  it('should support keyboard interactions', () => {
    const { container } = render(
      <HoverEnhancedCard enableScale scale={1.05}>
        <div>Card Content</div>
      </HoverEnhancedCard>
    );

    const card = container.firstChild as HTMLElement;
    
    fireEvent.focus(card);

    expect(card.style.transform).toContain('scale(1.05)');
    
    fireEvent.blur(card);

    expect(card.style.transform).not.toContain('scale(1.05)');
  });

  it('should respect accessibility settings', () => {
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
      <HoverEnhancedCard enableScale scale={1.05}>
        <div>Card Content</div>
      </HoverEnhancedCard>
    );

    const card = container.firstChild as HTMLElement;
    
    fireEvent.mouseEnter(card);

    // Should not apply animations when reduced motion is preferred
    expect(card.style.transform).toBe('');
  });
});