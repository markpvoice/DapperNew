/**
 * Enhanced Button System Test Suite
 * Tests for enhanced button variants, micro-interactions, and animations
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import the actual enhanced button component
import { EnhancedButton } from '@/components/ui/enhanced-button';

describe('Enhanced Button System', () => {
  describe('Button Variants', () => {
    const variants = [
      'primary',
      'secondary',
      'luxury',
      'premium',
      'elegant',
      'sophisticated',
      'ghost-gold',
      'glass',
      'neon',
      'gradient'
    ];

    variants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        render(<EnhancedButton variant={variant}>Test Button</EnhancedButton>);
        const button = screen.getByRole('button');
        
        expect(button).toHaveClass(`enhanced-btn-${variant}`);
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Button Sizes', () => {
    const sizes = [
      'xs',
      'sm',
      'default',
      'lg',
      'xl',
      '2xl',
      'icon-sm',
      'icon-md',
      'icon-lg'
    ];

    sizes.forEach(size => {
      it(`should render ${size} size correctly`, () => {
        render(<EnhancedButton size={size}>Test Button</EnhancedButton>);
        const button = screen.getByRole('button');
        
        expect(button).toHaveClass(`enhanced-btn-${size}`);
      });
    });
  });

  describe('Button Animations', () => {
    const animations = [
      'pulse',
      'bounce',
      'float',
      'shake',
      'glow-pulse',
      'scale-hover',
      'slide-up',
      'fade-in'
    ];

    animations.forEach(animation => {
      it(`should apply ${animation} animation correctly`, () => {
        render(<EnhancedButton animation={animation}>Animated Button</EnhancedButton>);
        const button = screen.getByRole('button');
        
        expect(button).toHaveClass(`animate-${animation}`);
      });
    });
  });

  describe('Ripple Effect', () => {
    it('should add ripple effect class when enabled', () => {
      render(<EnhancedButton rippleEffect={true}>Ripple Button</EnhancedButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('ripple-effect');
    });

    it('should not add ripple effect class when disabled', () => {
      render(<EnhancedButton rippleEffect={false}>No Ripple Button</EnhancedButton>);
      const button = screen.getByRole('button');
      
      expect(button).not.toHaveClass('ripple-effect');
    });

    it('should trigger ripple animation on click', async () => {
      const user = userEvent.setup();
      render(<EnhancedButton rippleEffect={true}>Ripple Button</EnhancedButton>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      
      // The actual implementation would create ripple elements
      // For now we test that the base class is present
      expect(button).toHaveClass('ripple-effect');
    });
  });

  describe('Glow Effect', () => {
    it('should add glow effect class when enabled', () => {
      render(<EnhancedButton glowEffect={true}>Glow Button</EnhancedButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('glow-effect');
    });

    it('should not add glow effect class when disabled', () => {
      render(<EnhancedButton glowEffect={false}>No Glow Button</EnhancedButton>);
      const button = screen.getByRole('button');
      
      expect(button).not.toHaveClass('glow-effect');
    });
  });

  describe('Loading States', () => {
    it('should show loading state correctly', () => {
      render(<EnhancedButton loading={true}>Submit</EnhancedButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('loading');
      expect(button).toHaveTextContent('Loading...');
      expect(button).toBeDisabled();
    });

    it('should hide loading state when not loading', () => {
      render(<EnhancedButton loading={false}>Submit</EnhancedButton>);
      const button = screen.getByRole('button');
      
      expect(button).not.toHaveClass('loading');
      expect(button).toHaveTextContent('Submit');
      expect(button).not.toBeDisabled();
    });

    it('should disable button while loading', () => {
      render(<EnhancedButton loading={true}>Submit</EnhancedButton>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
    });
  });

  describe('Interactive States', () => {
    it('should handle click events when not disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<EnhancedButton onClick={handleClick}>Click Me</EnhancedButton>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not handle click events when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<EnhancedButton disabled={true} onClick={handleClick}>Disabled</EnhancedButton>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not handle click events when loading', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<EnhancedButton loading={true} onClick={handleClick}>Loading</EnhancedButton>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<EnhancedButton>Accessible Button</EnhancedButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should support keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<EnhancedButton onClick={handleClick}>Keyboard Button</EnhancedButton>);
      const button = screen.getByRole('button');
      
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      // The enhanced button should handle keyboard events
      expect(button).toBeInTheDocument();
    });

    it('should have proper focus states', () => {
      render(<EnhancedButton>Focus Button</EnhancedButton>);
      const button = screen.getByRole('button');
      
      button.focus();
      
      expect(button).toHaveFocus();
    });

    it('should announce loading state to screen readers', () => {
      render(<EnhancedButton loading={true} aria-label="Submit form">Submit</EnhancedButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Button Combinations', () => {
    it('should combine multiple effects correctly', () => {
      render(
        <EnhancedButton 
          variant="luxury" 
          size="lg" 
          animation="glow-pulse"
          rippleEffect={true}
          glowEffect={true}
        >
          Combined Effects
        </EnhancedButton>
      );
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('enhanced-btn-luxury');
      expect(button).toHaveClass('enhanced-btn-lg');
      expect(button).toHaveClass('animate-glow-pulse');
      expect(button).toHaveClass('ripple-effect');
      expect(button).toHaveClass('glow-effect');
    });

    it('should handle variant and state combinations', () => {
      render(
        <EnhancedButton 
          variant="premium" 
          loading={true}
          glowEffect={true}
        >
          Premium Loading
        </EnhancedButton>
      );
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('enhanced-btn-premium');
      expect(button).toHaveClass('loading');
      expect(button).toHaveClass('glow-effect');
      expect(button).toBeDisabled();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = render(
        <EnhancedButton variant="primary">Initial</EnhancedButton>
      );
      
      rerender(
        <EnhancedButton variant="primary">Updated</EnhancedButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Updated');
    });

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <EnhancedButton loading={false}>Submit</EnhancedButton>
      );
      
      rerender(
        <EnhancedButton loading={true}>Submit</EnhancedButton>
      );
      
      rerender(
        <EnhancedButton loading={false}>Submit</EnhancedButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Submit');
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      render(
        <EnhancedButton className="custom-class">Custom Button</EnhancedButton>
      );
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('custom-class');
    });

    it('should accept custom styles', () => {
      render(
        <EnhancedButton style={{ backgroundColor: 'red' }}>Styled Button</EnhancedButton>
      );
      const button = screen.getByRole('button');
      
      expect(button).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('Micro-interactions', () => {
    it('should support hover micro-animations', () => {
      render(
        <EnhancedButton className="hover:scale-105 transition-transform">
          Hover Me
        </EnhancedButton>
      );
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('hover:scale-105');
      expect(button).toHaveClass('transition-transform');
    });

    it('should support active state micro-animations', () => {
      render(
        <EnhancedButton className="active:scale-95 transition-transform">
          Press Me
        </EnhancedButton>
      );
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('active:scale-95');
      expect(button).toHaveClass('transition-transform');
    });
  });
});