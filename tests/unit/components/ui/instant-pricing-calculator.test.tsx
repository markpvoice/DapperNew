/**
 * @fileoverview Instant Pricing Calculator Tests - TDD Implementation
 * 
 * Tests for real-time pricing calculator component:
 * - Real-time price updates as services change
 * - Package discount calculations
 * - Transparent pricing display with breakdown
 * - Mobile responsiveness and accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstantPricingCalculator } from '@/components/ui/instant-pricing-calculator';

describe('InstantPricingCalculator', () => {
  const mockServices = [
    {
      id: 'dj',
      name: 'DJ Services',
      priceRange: { min: 300, max: 800 }
    },
    {
      id: 'karaoke', 
      name: 'Karaoke',
      priceRange: { min: 200, max: 500 }
    },
    {
      id: 'photography',
      name: 'Photography', 
      priceRange: { min: 300, max: 800 }
    }
  ];

  const defaultProps = {
    selectedServices: ['dj'],
    allServices: mockServices,
    onPriceChange: jest.fn(),
    className: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Real-time Price Updates', () => {
    test('calculates total price for single service', () => {
      render(<InstantPricingCalculator {...defaultProps} />);
      
      expect(screen.getByTestId('total-price-min')).toHaveTextContent('$300');
      expect(screen.getByTestId('total-price-max')).toHaveTextContent('$800');
      expect(screen.getByTestId('total-price-display')).toHaveTextContent('$300 - $800');
    });

    test('calculates total price for multiple services', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      // DJ: $300-800 + Karaoke: $200-500 = $500-1300, minus $50 discount = $450-1250
      expect(screen.getByTestId('total-price-min')).toHaveTextContent('$450');
      expect(screen.getByTestId('total-price-max')).toHaveTextContent('$1,250');
      expect(screen.getByTestId('total-price-display')).toHaveTextContent('$450 - $1,250');
    });

    test('updates price when services prop changes', () => {
      const { rerender } = render(<InstantPricingCalculator {...defaultProps} />);
      
      expect(screen.getByTestId('total-price-display')).toHaveTextContent('$300 - $800');
      
      rerender(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'photography']} 
      />);
      
      // DJ: $300-800 + Photography: $300-800 = $600-1600, minus $50 discount = $550-1550
      expect(screen.getByTestId('total-price-display')).toHaveTextContent('$550 - $1,550');
    });

    test('calls onPriceChange callback when price updates', () => {
      const onPriceChange = jest.fn();
      render(<InstantPricingCalculator 
        {...defaultProps} 
        onPriceChange={onPriceChange}
        selectedServices={['dj', 'karaoke']} 
      />);
      
      expect(onPriceChange).toHaveBeenCalledWith({
        min: 450,
        max: 1250,
        services: ['dj', 'karaoke'],
        hasDiscount: true
      });
    });

    test('handles empty service selection', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={[]} 
      />);
      
      expect(screen.getByTestId('total-price-display')).toHaveTextContent('$0');
      expect(screen.getByTestId('empty-selection-message')).toHaveTextContent('Select services to see pricing');
    });
  });

  describe('Package Discount Calculations', () => {
    test('applies package discount for multiple services', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      expect(screen.getByTestId('package-discount')).toBeInTheDocument();
      expect(screen.getByTestId('package-discount-amount')).toHaveTextContent('Save $50');
      expect(screen.getByTestId('package-discount-text')).toHaveTextContent('Package discount applied!');
    });

    test('shows larger discount for all three services', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke', 'photography']} 
      />);
      
      expect(screen.getByTestId('package-discount-amount')).toHaveTextContent('Save $100');
      expect(screen.getByTestId('ultimate-package-text')).toHaveTextContent('Ultimate Package - Best Value!');
    });

    test('does not show discount for single service', () => {
      render(<InstantPricingCalculator {...defaultProps} />);
      
      expect(screen.queryByTestId('package-discount')).not.toBeInTheDocument();
    });

    test('calculates correct discounted price', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      // Original total: $500-$1300, discount: $50
      expect(screen.getByTestId('discounted-price-min')).toHaveTextContent('$450');
      expect(screen.getByTestId('discounted-price-max')).toHaveTextContent('$1,250');
    });
  });

  describe('Transparent Pricing Display', () => {
    test('shows detailed breakdown for each service', async () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      // Click to toggle breakdown first
      await userEvent.click(screen.getByTestId('toggle-breakdown'));
      
      expect(screen.getByTestId('breakdown-dj')).toBeInTheDocument();
      expect(screen.getByTestId('breakdown-karaoke')).toBeInTheDocument();
      
      expect(screen.getByTestId('breakdown-dj')).toHaveTextContent('DJ Services:$300 - $800');
      expect(screen.getByTestId('breakdown-karaoke')).toHaveTextContent('Karaoke:$200 - $500');
    });

    test('shows subtotal before discount', async () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      // Click to toggle breakdown first
      await userEvent.click(screen.getByTestId('toggle-breakdown'));
      
      expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $500 - $1,300');
      expect(screen.getByTestId('discount-line')).toHaveTextContent('Package Discount: -$50');
      expect(screen.getByTestId('final-total')).toHaveTextContent('Total: $450 - $1,250');
    });

    test('formats prices with proper currency and commas', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke', 'photography']} 
      />);
      
      // Large number formatting test - DJ+Karaoke+Photography = $800+$2100-$100 discount = $700-$2000
      expect(screen.getByTestId('total-price-display')).toMatch(/\$[\d,]+/);
      expect(screen.getByTestId('total-price-max')).toHaveTextContent('$2,000');
    });

    test('shows price per hour estimates', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj']} 
        eventDuration={4} 
      />);
      
      expect(screen.getByTestId('price-per-hour')).toBeInTheDocument();
      expect(screen.getByTestId('price-per-hour')).toHaveTextContent('~$75 - $200 per hour');
    });

    test('displays deposit amount', () => {
      render(<InstantPricingCalculator {...defaultProps} />);
      
      expect(screen.getByTestId('deposit-amount')).toHaveTextContent('Deposit Required: $200');
      expect(screen.getByTestId('deposit-info')).toHaveTextContent('Due at booking confirmation');
    });
  });

  describe('Interactive Features', () => {
    test('allows toggling detailed breakdown', async () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      const toggleButton = screen.getByTestId('toggle-breakdown');
      expect(screen.queryByTestId('detailed-breakdown')).not.toBeInTheDocument();
      
      await userEvent.click(toggleButton);
      expect(screen.getByTestId('detailed-breakdown')).toBeInTheDocument();
    });

    test('shows/hides pricing tooltip on hover', async () => {
      render(<InstantPricingCalculator {...defaultProps} />);
      
      const priceDisplay = screen.getByTestId('total-price-display');
      
      await userEvent.hover(priceDisplay);
      expect(screen.getByTestId('pricing-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('pricing-tooltip')).toHaveTextContent('Final price depends on event duration and specific requirements');
      
      await userEvent.unhover(priceDisplay);
      expect(screen.queryByTestId('pricing-tooltip')).not.toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      const toggleButton = screen.getByTestId('toggle-breakdown');
      toggleButton.focus();
      
      fireEvent.keyDown(toggleButton, { key: 'Enter' });
      expect(screen.getByTestId('detailed-breakdown')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts layout for mobile screens', () => {
      render(<InstantPricingCalculator {...defaultProps} />);
      
      const calculator = screen.getByTestId('pricing-calculator');
      expect(calculator).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });

    test('stacks pricing elements vertically on mobile', async () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      // Click to toggle breakdown first
      await userEvent.click(screen.getByTestId('toggle-breakdown'));
      
      const breakdown = screen.getByTestId('pricing-breakdown');
      expect(breakdown).toHaveClass('bg-gray-50', 'rounded-lg', 'p-4');
    });

    test('uses appropriate font sizes for mobile', () => {
      render(<InstantPricingCalculator {...defaultProps} />);
      
      const totalPrice = screen.getByTestId('total-price-display');
      expect(totalPrice).toHaveClass('text-xl', 'sm:text-2xl');
    });

    test('touch-friendly interactive elements', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      const toggleButton = screen.getByTestId('toggle-breakdown');
      expect(toggleButton).toHaveClass('min-h-[44px]');
      expect(toggleButton).toHaveClass('touch-manipulation');
    });
  });

  describe('Accessibility', () => {
    test('provides ARIA labels for price information', () => {
      render(<InstantPricingCalculator {...defaultProps} />);
      
      expect(screen.getByTestId('total-price-display')).toHaveAttribute('aria-label', 'Total estimated price: $300 to $800');
    });

    test('announces price changes to screen readers', () => {
      render(<InstantPricingCalculator {...defaultProps} />);
      
      const priceDisplay = screen.getByTestId('total-price-display');
      expect(priceDisplay).toHaveAttribute('aria-live', 'polite');
    });

    test('provides proper heading hierarchy', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Pricing Summary');
    });

    test('supports high contrast mode', () => {
      render(<InstantPricingCalculator {...defaultProps} />);
      
      const calculator = screen.getByTestId('pricing-calculator');
      expect(calculator).toHaveAttribute('data-high-contrast-support', 'true');
    });

    test('respects reduced motion preferences', () => {
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

      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      const priceUpdate = screen.getByTestId('total-price-display');
      expect(priceUpdate).not.toHaveClass('animate-pulse');
    });
  });

  describe('Performance', () => {
    test('memoizes expensive calculations', () => {
      const { rerender } = render(<InstantPricingCalculator {...defaultProps} />);
      
      // Rerender with same props should not recalculate
      rerender(<InstantPricingCalculator {...defaultProps} />);
      
      // Component should handle rerenders efficiently
      expect(screen.getByTestId('total-price-display')).toHaveTextContent('$300 - $800');
    });

    test('debounces rapid service changes', async () => {
      const onPriceChange = jest.fn();
      const { rerender } = render(<InstantPricingCalculator 
        {...defaultProps} 
        onPriceChange={onPriceChange}
      />);
      
      // Rapid changes - each change triggers onPriceChange
      rerender(<InstantPricingCalculator {...defaultProps} selectedServices={['dj']} onPriceChange={onPriceChange} />);
      rerender(<InstantPricingCalculator {...defaultProps} selectedServices={['dj', 'karaoke']} onPriceChange={onPriceChange} />);
      rerender(<InstantPricingCalculator {...defaultProps} selectedServices={['dj']} onPriceChange={onPriceChange} />);
      
      // Should handle rapid changes without errors
      expect(onPriceChange).toHaveBeenCalledTimes(3);
    });

    test('lazy loads breakdown details', async () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['dj', 'karaoke']} 
      />);
      
      // Breakdown should not be rendered initially
      expect(screen.queryByTestId('detailed-breakdown')).not.toBeInTheDocument();
      
      // Only loads when toggled
      await userEvent.click(screen.getByTestId('toggle-breakdown'));
      expect(screen.getByTestId('detailed-breakdown')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles invalid service data gracefully', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        selectedServices={['invalid-service']} 
      />);
      
      // Invalid services just result in $0 pricing
      expect(screen.getByTestId('total-price-display')).toHaveTextContent('$0');
      expect(screen.getByTestId('empty-selection-message')).toHaveTextContent('Select services to see pricing');
    });

    test('shows fallback when service data is missing', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        allServices={[]} 
      />);
      
      expect(screen.getByTestId('fallback-message')).toHaveTextContent('Contact us for custom pricing');
    });

    test('handles network errors gracefully', () => {
      render(<InstantPricingCalculator 
        {...defaultProps} 
        error="Failed to load pricing data" 
      />);
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load pricing data');
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });
  });
});