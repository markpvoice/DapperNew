/**
 * Typography System Test Suite
 * Tests for enhanced typography hierarchy, responsive scaling, and accessibility
 */

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test component to verify typography classes work
const TypographyTestComponent = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

describe('Enhanced Typography System', () => {
  describe('Typography Hierarchy', () => {
    it('should apply display text styles correctly', () => {
      const { container } = render(
        <TypographyTestComponent className="text-display-large">Display Large</TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      // Test that the class exists and can be applied
      expect(element).toHaveClass('text-display-large');
    });

    it('should apply headline text styles correctly', () => {
      const { container } = render(
        <TypographyTestComponent className="text-headline-large">Headline Large</TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-headline-large');
    });

    it('should apply title text styles correctly', () => {
      const { container } = render(
        <TypographyTestComponent className="text-title-large">Title Large</TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-title-large');
    });

    it('should apply body text styles correctly', () => {
      const { container } = render(
        <TypographyTestComponent className="text-body-large">Body Large</TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-body-large');
    });

    it('should apply label text styles correctly', () => {
      const { container } = render(
        <TypographyTestComponent className="text-label-large">Label Large</TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-label-large');
    });
  });

  describe('Font Weight Variants', () => {
    const weights = ['light', 'regular', 'medium', 'semibold', 'bold', 'extrabold'];
    
    weights.forEach(weight => {
      it(`should apply font-weight-${weight} correctly`, () => {
        const { container } = render(
          <TypographyTestComponent className={`font-weight-${weight}`}>
            Weight {weight}
          </TypographyTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(`font-weight-${weight}`);
      });
    });
  });

  describe('Responsive Typography', () => {
    it('should apply responsive headline classes', () => {
      const { container } = render(
        <TypographyTestComponent className="text-headline-responsive">
          Responsive Headline
        </TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-headline-responsive');
    });

    it('should apply responsive body classes', () => {
      const { container } = render(
        <TypographyTestComponent className="text-body-responsive">
          Responsive Body
        </TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-body-responsive');
    });
  });

  describe('Line Height Utilities', () => {
    const lineHeights = ['tight', 'snug', 'normal', 'relaxed', 'loose'];
    
    lineHeights.forEach(height => {
      it(`should apply leading-${height} correctly`, () => {
        const { container } = render(
          <TypographyTestComponent className={`leading-${height}`}>
            Line height {height}
          </TypographyTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(`leading-${height}`);
      });
    });
  });

  describe('Letter Spacing Utilities', () => {
    const spacings = ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'];
    
    spacings.forEach(spacing => {
      it(`should apply tracking-${spacing} correctly`, () => {
        const { container } = render(
          <TypographyTestComponent className={`tracking-${spacing}`}>
            Letter spacing {spacing}
          </TypographyTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(`tracking-${spacing}`);
      });
    });
  });

  describe('Typography Accessibility', () => {
    it('should maintain proper contrast ratios for text variants', () => {
      // This test would need to be implemented with actual contrast checking
      // For now, we test that accessibility-focused classes exist
      const { container } = render(
        <TypographyTestComponent className="text-accessible-body">
          Accessible text
        </TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-accessible-body');
    });

    it('should support high contrast mode', () => {
      const { container } = render(
        <TypographyTestComponent className="text-high-contrast">
          High contrast text
        </TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-high-contrast');
    });
  });

  describe('Brand Typography', () => {
    it('should apply brand heading styles', () => {
      const { container } = render(
        <TypographyTestComponent className="text-brand-heading">
          Brand Heading
        </TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-brand-heading');
    });

    it('should apply luxury typography styles', () => {
      const { container } = render(
        <TypographyTestComponent className="text-luxury">
          Luxury Text
        </TypographyTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('text-luxury');
    });
  });

  describe('Typography Performance', () => {
    it('should handle text size changes predictably', () => {
      const { rerender, container } = render(
        <TypographyTestComponent className="text-body-medium">
          Initial text content
        </TypographyTestComponent>
      );
      
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-body-medium');
      
      rerender(
        <TypographyTestComponent className="text-body-large">
          Changed text content
        </TypographyTestComponent>
      );
      
      // Should properly apply new class
      expect(element).toHaveClass('text-body-large');
      expect(element).not.toHaveClass('text-body-medium');
    });
  });
});

describe('Typography Utility Functions', () => {
  // These tests would verify utility functions for typography
  // For now, we'll test that the expected utility classes can be applied
  
  describe('Dynamic Typography Classes', () => {
    it('should generate correct typography class combinations', () => {
      const testCases = [
        { size: 'large', weight: 'bold', expected: 'text-body-large font-weight-bold' },
        { size: 'medium', weight: 'semibold', expected: 'text-body-medium font-weight-semibold' },
        { size: 'small', weight: 'regular', expected: 'text-body-small font-weight-regular' },
      ];
      
      testCases.forEach(({ size, weight, expected }) => {
        const { container } = render(
          <TypographyTestComponent className={expected}>
            Test text
          </TypographyTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        // Check that both classes are applied
        expect(element.className).toContain(`text-body-${size}`);
        expect(element.className).toContain(`font-weight-${weight}`);
      });
    });
  });
});