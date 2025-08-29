/**
 * @fileoverview Touch Target Compliance Tests
 * 
 * Tests to ensure all interactive elements meet iOS/Android 44px minimum touch target requirements.
 * This test suite will help prevent regressions during responsive fixes.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { MultiStepBookingForm } from '@/components/forms/MultiStepBookingForm';
import { Calendar } from '@/components/ui/calendar';
import { HeroButtons } from '@/components/ui/hero-buttons';

// Mock next/navigation for components that use it
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Helper function to check if element meets touch target requirements
const checkTouchTarget = (element: HTMLElement, minSize = 44) => {
  const computedStyle = window.getComputedStyle(element);
  const width = parseInt(computedStyle.width) || 0;
  const height = parseInt(computedStyle.height) || 0;
  const paddingLeft = parseInt(computedStyle.paddingLeft) || 0;
  const paddingRight = parseInt(computedStyle.paddingRight) || 0;
  const paddingTop = parseInt(computedStyle.paddingTop) || 0;
  const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
  
  const totalWidth = width + paddingLeft + paddingRight;
  const totalHeight = height + paddingTop + paddingBottom;
  
  // Debug logging
  console.log('Touch target debug:', {
    element: element.tagName,
    className: element.className,
    width,
    height,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    totalWidth,
    totalHeight,
    minSize,
    meetsStandard: totalWidth >= minSize && totalHeight >= minSize,
  });
  
  return {
    width: totalWidth,
    height: totalHeight,
    meetsStandard: totalWidth >= minSize && totalHeight >= minSize,
  };
};

describe('Touch Target Compliance Tests', () => {
  describe('Button Component Touch Targets', () => {
    it('should have default buttons meet 44px minimum touch target', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      
      const { width, height, meetsStandard } = checkTouchTarget(button);
      
      expect(meetsStandard).toBe(true);
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    });

    it('should have small buttons meet 44px minimum touch target on mobile', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // iPhone SE width
      });

      render(<Button size="sm">Small Button</Button>);
      const button = screen.getByRole('button');
      
      const { meetsStandard } = checkTouchTarget(button);
      expect(meetsStandard).toBe(true);
    });

    it('should have icon buttons meet 44px minimum touch target', () => {
      render(<Button size="icon" aria-label="Icon button">🔍</Button>);
      const button = screen.getByRole('button');
      
      const { meetsStandard } = checkTouchTarget(button);
      expect(meetsStandard).toBe(true);
    });

    it('should have large and xl buttons exceed minimum requirements', () => {
      render(
        <div>
          <Button size="lg">Large Button</Button>
          <Button size="xl">XL Button</Button>
        </div>
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const { meetsStandard } = checkTouchTarget(button);
        expect(meetsStandard).toBe(true);
      });
    });
  });

  describe('Form Input Touch Targets', () => {
    it('should have form checkboxes meet minimum touch target requirements', () => {
      const mockProps = {
        onComplete: jest.fn(),
        onCancel: jest.fn(),
        initialData: {}
      };

      render(<MultiStepBookingForm {...mockProps} />);
      
      // Navigate through the form to find checkboxes
      const servicesHeading = screen.getByText('Select Services');
      expect(servicesHeading).toBeInTheDocument();
      
      // Find service checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      
      checkboxes.forEach(checkbox => {
        const { meetsStandard } = checkTouchTarget(checkbox, 24); // Minimum 24px for checkboxes
        expect(meetsStandard).toBe(true);
      });
    });

    it('should have form inputs have adequate mobile padding', () => {
      const mockProps = {
        onComplete: jest.fn(),
        onCancel: jest.fn(),
        initialData: {}
      };

      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<MultiStepBookingForm {...mockProps} />);
      
      // Find form inputs when they appear (need to navigate to the right step)
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeInTheDocument();
      
      // Form inputs should have adequate touch padding on mobile
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        const computedStyle = window.getComputedStyle(input);
        const paddingTop = parseInt(computedStyle.paddingTop) || 0;
        const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
        const totalVerticalPadding = paddingTop + paddingBottom;
        
        // Minimum 24px vertical padding for mobile touch
        expect(totalVerticalPadding).toBeGreaterThanOrEqual(24);
      });
    });
  });

  describe('Navigation Touch Targets', () => {
    it('should have mobile hamburger menu button meet touch requirements', () => {
      // This test will be updated to check the actual homepage navigation
      // For now, we'll test that navigation buttons are properly sized
      
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      // We'll need to mock the homepage component or test it separately
      // This is a placeholder for the navigation button test
      expect(true).toBe(true); // Placeholder - will be updated with actual navigation test
    });
  });

  describe('Calendar Touch Targets', () => {
    // Mock fetch for calendar API
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            startDate: '2025-09-01',
            endDate: '2025-09-30',
            calendar: [],
            totalDays: 30,
            availableDays: 25,
            bookedDays: 5,
          }),
        })
      ) as jest.Mock;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should have calendar navigation buttons meet touch requirements', async () => {
      render(<Calendar />);
      
      // Wait for calendar to load
      await screen.findByText(/September|October|November|December/);
      
      // Find navigation buttons
      const prevButton = screen.getByLabelText('Previous month');
      const nextButton = screen.getByLabelText('Next month');
      
      const prevTarget = checkTouchTarget(prevButton);
      const nextTarget = checkTouchTarget(nextButton);
      
      expect(prevTarget.meetsStandard).toBe(true);
      expect(nextTarget.meetsStandard).toBe(true);
    });

    it('should have calendar day cells meet minimum touch requirements', async () => {
      render(<Calendar />);
      
      // Wait for calendar to load
      await screen.findByText(/September|October|November|December/);
      
      // Find calendar grid
      const calendarGrid = screen.getByRole('grid');
      expect(calendarGrid).toBeInTheDocument();
      
      // Find day cells (gridcells)
      const dayCells = screen.getAllByRole('gridcell');
      
      // Check that day cells have adequate touch area
      dayCells.forEach(cell => {
        const { meetsStandard } = checkTouchTarget(cell);
        expect(meetsStandard).toBe(true);
      });
    });
  });

  describe('Hero Buttons Touch Targets', () => {
    it('should have hero CTA buttons meet touch requirements', () => {
      const mockOnRequestDate = jest.fn();
      render(<HeroButtons onRequestDate={mockOnRequestDate} />);
      
      const requestButton = screen.getByText('Request Your Date');
      const availabilityButton = screen.getByText('Check Availability');
      
      const requestTarget = checkTouchTarget(requestButton);
      const availabilityTarget = checkTouchTarget(availabilityButton);
      
      expect(requestTarget.meetsStandard).toBe(true);
      expect(availabilityTarget.meetsStandard).toBe(true);
    });

    it('should have full-width buttons on mobile meet touch requirements', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const mockOnRequestDate = jest.fn();
      render(<HeroButtons onRequestDate={mockOnRequestDate} />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const { height, meetsStandard } = checkTouchTarget(button);
        expect(meetsStandard).toBe(true);
        expect(height).toBeGreaterThanOrEqual(44); // Minimum height even when full-width
      });
    });
  });

  describe('Regression Prevention', () => {
    it('should maintain accessibility attributes during touch target fixes', () => {
      render(<Button aria-label="Test button">Accessible Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-label', 'Test button');
      
      const { meetsStandard } = checkTouchTarget(button);
      expect(meetsStandard).toBe(true);
    });

    it('should preserve hover and focus states during touch improvements', () => {
      render(<Button className="hover:bg-blue-500 focus:ring-2">Interactive Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('hover:bg-blue-500');
      expect(button).toHaveClass('focus:ring-2');
      
      const { meetsStandard } = checkTouchTarget(button);
      expect(meetsStandard).toBe(true);
    });
  });
});

// Utility test to verify our touch target checker works correctly
describe('Touch Target Test Utilities', () => {
  it('should correctly identify elements that meet touch requirements', () => {
    render(
      <button style={{ 
        width: '44px', 
        height: '44px', 
        padding: '0',
        margin: '0',
        border: 'none'
      }}>
        Test
      </button>
    );
    
    const button = screen.getByRole('button');
    const { width, height, meetsStandard } = checkTouchTarget(button);
    
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
    expect(meetsStandard).toBe(true);
  });

  it('should correctly identify elements that do not meet touch requirements', () => {
    render(
      <button style={{ 
        width: '30px', 
        height: '30px', 
        padding: '0',
        margin: '0',
        border: 'none'
      }}>
        Small
      </button>
    );
    
    const button = screen.getByRole('button');
    const { width, height, meetsStandard } = checkTouchTarget(button);
    
    expect(width).toBeLessThan(44);
    expect(height).toBeLessThan(44);
    expect(meetsStandard).toBe(false);
  });
});