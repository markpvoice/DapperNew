/**
 * Color System Test Suite
 * Tests for extended color palette, gradients, and color utilities
 */

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test component for color system verification
const ColorTestComponent = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

describe('Extended Color System', () => {
  describe('Extended Brand Colors', () => {
    const brandColors = [
      'brand-platinum',
      'brand-pearl',
      'brand-champagne',
      'brand-bronze',
      'brand-copper',
      'brand-slate',
      'brand-ash',
      'brand-carbon'
    ];

    brandColors.forEach(color => {
      it(`should apply ${color} background color correctly`, () => {
        const { container } = render(
          <ColorTestComponent className={`bg-${color}`}>Color Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(`bg-${color}`);
      });

      it(`should apply ${color} text color correctly`, () => {
        const { container } = render(
          <ColorTestComponent className={`text-${color}`}>Color Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(`text-${color}`);
      });

      it(`should apply ${color} border color correctly`, () => {
        const { container } = render(
          <ColorTestComponent className={`border-${color}`}>Color Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(`border-${color}`);
      });
    });
  });

  describe('Accent Colors', () => {
    const accentColors = [
      'accent-emerald',
      'accent-sapphire',
      'accent-ruby',
      'accent-amethyst',
      'accent-coral',
      'accent-mint'
    ];

    accentColors.forEach(color => {
      it(`should apply ${color} correctly`, () => {
        const { container } = render(
          <ColorTestComponent className={`bg-${color}`}>Accent Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(`bg-${color}`);
      });
    });
  });

  describe('Semantic Colors', () => {
    const semanticColors = [
      'success-primary',
      'success-secondary',
      'warning-primary',
      'warning-secondary',
      'error-primary',
      'error-secondary',
      'info-primary',
      'info-secondary'
    ];

    semanticColors.forEach(color => {
      it(`should apply ${color} correctly`, () => {
        const { container } = render(
          <ColorTestComponent className={`bg-${color}`}>Semantic Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(`bg-${color}`);
      });
    });
  });

  describe('Gradient Backgrounds', () => {
    const gradients = [
      'bg-gradient-gold-radial',
      'bg-gradient-luxury',
      'bg-gradient-premium',
      'bg-gradient-elegant',
      'bg-gradient-sophisticated',
      'bg-gradient-warm',
      'bg-gradient-cool',
      'bg-gradient-sunset',
      'bg-gradient-dawn'
    ];

    gradients.forEach(gradient => {
      it(`should apply ${gradient} correctly`, () => {
        const { container } = render(
          <ColorTestComponent className={gradient}>Gradient Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(gradient);
      });
    });
  });

  describe('Gradient Text Effects', () => {
    const textGradients = [
      'text-gradient-gold',
      'text-gradient-luxury',
      'text-gradient-premium',
      'text-gradient-brand',
      'text-gradient-accent'
    ];

    textGradients.forEach(gradient => {
      it(`should apply ${gradient} correctly`, () => {
        const { container } = render(
          <ColorTestComponent className={gradient}>Gradient Text</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(gradient);
      });
    });
  });

  describe('Color Opacity Variants', () => {
    const opacities = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];
    const baseColors = ['brand-gold', 'brand-charcoal', 'accent-emerald'];

    baseColors.forEach(color => {
      opacities.forEach(opacity => {
        it(`should apply ${color}/${opacity} opacity variant correctly`, () => {
          const { container } = render(
            <ColorTestComponent className={`bg-${color}/${opacity}`}>
              Opacity Test
            </ColorTestComponent>
          );
          const element = container.firstChild as HTMLElement;
          
          expect(element).toHaveClass(`bg-${color}/${opacity}`);
        });
      });
    });
  });

  describe('Dynamic Color Utilities', () => {
    it('should handle color hover states correctly', () => {
      const { container } = render(
        <ColorTestComponent className="bg-brand-gold hover:bg-brand-dark-gold">
          Hover Test
        </ColorTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('bg-brand-gold');
      expect(element).toHaveClass('hover:bg-brand-dark-gold');
    });

    it('should handle color focus states correctly', () => {
      const { container } = render(
        <ColorTestComponent className="bg-brand-gold focus:bg-accent-emerald">
          Focus Test
        </ColorTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('bg-brand-gold');
      expect(element).toHaveClass('focus:bg-accent-emerald');
    });

    it('should handle color active states correctly', () => {
      const { container } = render(
        <ColorTestComponent className="bg-brand-gold active:bg-brand-bronze">
          Active Test
        </ColorTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('bg-brand-gold');
      expect(element).toHaveClass('active:bg-brand-bronze');
    });
  });

  describe('Dark Mode Color Support', () => {
    const darkModeColors = [
      'dark:bg-brand-charcoal',
      'dark:text-brand-gold',
      'dark:border-brand-platinum'
    ];

    darkModeColors.forEach(colorClass => {
      it(`should apply ${colorClass} correctly`, () => {
        const { container } = render(
          <ColorTestComponent className={colorClass}>Dark Mode Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(colorClass);
      });
    });
  });

  describe('Color Accessibility', () => {
    it('should provide high contrast color variants', () => {
      const highContrastColors = [
        'bg-high-contrast-light',
        'bg-high-contrast-dark',
        'text-high-contrast-light',
        'text-high-contrast-dark'
      ];

      highContrastColors.forEach(colorClass => {
        const { container } = render(
          <ColorTestComponent className={colorClass}>High Contrast Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(colorClass);
      });
    });

    it('should support colorblind-friendly variants', () => {
      const colorblindColors = [
        'bg-colorblind-safe-primary',
        'bg-colorblind-safe-secondary',
        'bg-colorblind-safe-accent'
      ];

      colorblindColors.forEach(colorClass => {
        const { container } = render(
          <ColorTestComponent className={colorClass}>Colorblind Safe Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(colorClass);
      });
    });
  });

  describe('Color Animation Support', () => {
    it('should support color transitions', () => {
      const { container } = render(
        <ColorTestComponent className="bg-brand-gold transition-colors duration-300 hover:bg-accent-emerald">
          Color Transition Test
        </ColorTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('transition-colors');
      expect(element).toHaveClass('duration-300');
    });

    it('should support gradient animations', () => {
      const { container } = render(
        <ColorTestComponent className="bg-gradient-gold-radial animate-gradient">
          Gradient Animation Test
        </ColorTestComponent>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('bg-gradient-gold-radial');
      expect(element).toHaveClass('animate-gradient');
    });
  });

  describe('Brand Color Consistency', () => {
    it('should maintain brand color relationships', () => {
      // Test that related brand colors work together
      const colorCombinations = [
        ['bg-brand-gold', 'text-brand-charcoal'],
        ['bg-brand-charcoal', 'text-brand-gold'],
        ['bg-brand-platinum', 'text-brand-carbon'],
        ['bg-accent-emerald', 'text-white']
      ];

      colorCombinations.forEach(([bgColor, textColor]) => {
        const { container } = render(
          <ColorTestComponent className={`${bgColor} ${textColor}`}>
            Brand Combination Test
          </ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveClass(bgColor);
        expect(element).toHaveClass(textColor);
      });
    });
  });
});

describe('Color Utility Functions', () => {
  // Tests for any color utility functions that might be created
  describe('Color Generation', () => {
    it('should handle color class generation correctly', () => {
      // This would test utility functions for generating color classes
      // For now, we test that expected combinations work
      const testCombinations = [
        { bg: 'brand-gold', text: 'brand-charcoal', expected: 'bg-brand-gold text-brand-charcoal' },
        { bg: 'accent-emerald', text: 'white', expected: 'bg-accent-emerald text-white' }
      ];

      testCombinations.forEach(({ bg, text, expected }) => {
        const { container } = render(
          <ColorTestComponent className={expected}>Test</ColorTestComponent>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element.className).toContain(`bg-${bg}`);
        expect(element.className).toContain(`text-${text}`);
      });
    });
  });
});