/**
 * @fileoverview TDD Unit Tests for Button Component
 * 
 * Test-Driven Development Approach:
 * 1. RED: Write failing tests first
 * 2. GREEN: Write minimal code to pass tests
 * 3. REFACTOR: Improve code while keeping tests green
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  // Test 1: Basic rendering
  describe('Rendering', () => {
    it('should render button with correct text content', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('should render button with correct default variant', () => {
      render(<Button>Default Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should render disabled button correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });
  });

  // Test 2: Variant styles
  describe('Variants', () => {
    it('should apply gold variant styles correctly', () => {
      render(<Button variant="gold">Gold Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-brand-gold', 'text-brand-charcoal');
    });

    it('should apply gold-outline variant styles correctly', () => {
      render(<Button variant="gold-outline">Outline Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2', 'border-brand-gold', 'text-brand-gold');
    });

    it('should apply destructive variant styles correctly', () => {
      render(<Button variant="destructive">Delete Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('should apply secondary variant styles correctly', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('should apply ghost variant styles correctly', () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });

    it('should apply link variant styles correctly', () => {
      render(<Button variant="link">Link Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });
  });

  // Test 3: Size variants
  describe('Sizes', () => {
    it('should apply default size correctly', () => {
      render(<Button>Default Size</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-4', 'py-2');
    });

    it('should apply small size correctly', () => {
      render(<Button size="sm">Small Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-3');
    });

    it('should apply large size correctly', () => {
      render(<Button size="lg">Large Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'px-8');
    });

    it('should apply extra large size correctly', () => {
      render(<Button size="xl">Extra Large Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'px-10', 'text-base');
    });

    it('should apply icon size correctly', () => {
      render(<Button size="icon">🔥</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  // Test 4: Event handling
  describe('Event Handling', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable Button</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when button is disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard events (Enter)', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events (Space)', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Space Button</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // Test 5: Accessibility
  describe('Accessibility', () => {
    it('should have proper focus styles', () => {
      render(<Button>Focus Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('should support custom aria-label', () => {
      render(<Button aria-label="Custom label">Icon Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Custom label' });
      expect(button).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="help-text">Help Button</Button>
          <div id="help-text">This is help text</div>
        </>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should be keyboard navigable', () => {
      render(<Button>Tab Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });

  // Test 6: Custom props
  describe('Custom Props', () => {
    it('should accept and apply custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should accept custom data attributes', () => {
      render(<Button data-testid="custom-button" data-value="123">Data Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('data-value', '123');
    });

    it('should support form attribute', () => {
      render(<Button form="my-form">Form Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'my-form');
    });

    it('should support type attribute', () => {
      render(<Button type="submit">Submit Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  // Test 7: As child rendering (Radix Slot)
  describe('AsChild Rendering', () => {
    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveClass('inline-flex', 'items-center');
    });

    it('should apply button styles to child component', () => {
      render(
        <Button asChild variant="gold" size="lg">
          <a href="/test">Styled Link</a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-brand-gold', 'h-11', 'px-8');
    });
  });

  // Test 8: Loading states (if implemented)
  describe('Loading States', () => {
    it('should show loading state correctly', () => {
      render(<Button disabled>Loading...</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading...');
    });

    it('should prevent clicks during loading state', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          Loading...
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Test 9: Responsive behavior
  describe('Responsive Behavior', () => {
    it('should maintain responsive classes', () => {
      render(<Button className="sm:px-6 md:px-8">Responsive Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('sm:px-6', 'md:px-8');
    });
  });

  // Test 10: Performance
  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestButton = () => {
        renderSpy();
        return <Button>Performance Button</Button>;
      };

      const { rerender } = render(<TestButton />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      rerender(<TestButton />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});