/**
 * @fileoverview Tests for Mobile Navigation UX Improvements
 * 
 * Tests the Phase 2 enhancement of adding proper ARIA attributes
 * and accessibility improvements to mobile navigation.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock the calendar section component
jest.mock('@/components/ui/calendar-section', () => {
  return function MockCalendarSection() {
    return <div data-testid="calendar-section">Calendar Section</div>;
  };
});

// Mock other complex components to focus on navigation
jest.mock('@/components/ui/photo-gallery', () => {
  return function MockPhotoGallery() {
    return <div data-testid="photo-gallery">Photo Gallery</div>;
  };
});

jest.mock('@/components/ui/animated-hero-buttons', () => {
  return function MockAnimatedHeroButtons({ onRequestDate }: any) {
    return (
      <button onClick={onRequestDate} data-testid="animated-hero-buttons">
        Animated Hero Buttons
      </button>
    );
  };
});

jest.mock('@/components/ui/animated-stats', () => {
  return function MockAnimatedStats() {
    return <div data-testid="animated-stats">Animated Stats</div>;
  };
});

jest.mock('@/components/ui/particle-background', () => {
  return function MockParticleBackground() {
    return <div data-testid="particle-background">Particle Background</div>;
  };
});

jest.mock('@/components/forms/MultiStepBookingForm', () => {
  return function MockMultiStepBookingForm({ onCancel }: any) {
    return (
      <div data-testid="booking-form">
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

describe('Mobile Navigation UX Improvements', () => {
  beforeEach(() => {
    // Reset any DOM state
    document.body.innerHTML = '';
  });

  describe('Mobile Menu Button ARIA Attributes', () => {
    it('should have proper aria-expanded attribute that starts as false', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded to true when menu is opened', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      
      // Click to open menu
      fireEvent.click(mobileMenuButton);
      
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper aria-controls attribute linking to menu', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      expect(mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    });

    it('should have proper id attribute for aria-labelledby reference', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      expect(mobileMenuButton).toHaveAttribute('id', 'mobile-menu-button');
    });

    it('should update aria-label based on menu state', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      
      // Initially closed
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Open mobile menu');
      
      // Open menu
      fireEvent.click(mobileMenuButton);
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Close mobile menu');
      
      // Close menu
      fireEvent.click(mobileMenuButton);
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Open mobile menu');
    });
  });

  describe('Mobile Menu Dropdown ARIA Attributes', () => {
    it('should have proper id attribute matching aria-controls', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      
      // Open menu
      fireEvent.click(mobileMenuButton);
      
      const mobileMenu = screen.getByRole('menu');
      expect(mobileMenu).toHaveAttribute('id', 'mobile-menu');
    });

    it('should have proper role="menu" attribute', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      
      // Open menu
      fireEvent.click(mobileMenuButton);
      
      const mobileMenu = screen.getByRole('menu');
      expect(mobileMenu).toBeInTheDocument();
    });

    it('should have proper aria-labelledby attribute', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      
      // Open menu
      fireEvent.click(mobileMenuButton);
      
      const mobileMenu = screen.getByRole('menu');
      expect(mobileMenu).toHaveAttribute('aria-labelledby', 'mobile-menu-button');
    });

    it('should only be rendered when menu is open', () => {
      render(<HomePage />);
      
      // Menu should not be present initially
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      
      // Open menu
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      fireEvent.click(mobileMenuButton);
      
      // Menu should be present
      expect(screen.getByRole('menu')).toBeInTheDocument();
      
      // Close menu
      fireEvent.click(mobileMenuButton);
      
      // Menu should be gone
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Menu Items ARIA Attributes', () => {
    it('should have proper role="menuitem" on all navigation links', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      fireEvent.click(mobileMenuButton);
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(5); // Services, Gallery, Availability, Pricing, Contact
      
      // Check specific menu items
      expect(screen.getByRole('menuitem', { name: 'Services' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Gallery' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Availability' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Pricing' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Contact' })).toBeInTheDocument();
    });

    it('should close menu when navigation links are clicked', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      fireEvent.click(mobileMenuButton);
      
      // Menu is open
      expect(screen.getByRole('menu')).toBeInTheDocument();
      
      // Click on a menu item
      const servicesLink = screen.getByRole('menuitem', { name: 'Services' });
      fireEvent.click(servicesLink);
      
      // Menu should close
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Mobile Menu Visual State Changes', () => {
    it('should change button icon when menu is opened/closed', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      
      // Should show hamburger icon initially (3 lines)
      let svgPath = mobileMenuButton.querySelector('path');
      expect(svgPath).toHaveAttribute('d', 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5');
      
      // Open menu - should show X icon
      fireEvent.click(mobileMenuButton);
      
      svgPath = mobileMenuButton.querySelector('path');
      expect(svgPath).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12');
      
      // Close menu - should show hamburger icon again
      fireEvent.click(mobileMenuButton);
      
      svgPath = mobileMenuButton.querySelector('path');
      expect(svgPath).toHaveAttribute('d', 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be accessible via keyboard', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      
      // Should be focusable
      mobileMenuButton.focus();
      expect(document.activeElement).toBe(mobileMenuButton);
      
      // Should open with Enter key
      fireEvent.keyDown(mobileMenuButton, { key: 'Enter' });
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should allow keyboard navigation through menu items', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      fireEvent.click(mobileMenuButton);
      
      const menuItems = screen.getAllByRole('menuitem');
      
      // Each menu item should be focusable
      menuItems.forEach(item => {
        item.focus();
        expect(document.activeElement).toBe(item);
      });
    });
  });

  describe('Desktop Navigation (Control Test)', () => {
    it('should not show mobile menu button on desktop navigation', () => {
      render(<HomePage />);
      
      // Mobile menu button should have md:hidden class
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      expect(mobileMenuButton).toHaveClass('md:hidden');
    });

    it('should show desktop navigation links', () => {
      render(<HomePage />);
      
      // Desktop navigation links should be present
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Gallery')).toBeInTheDocument();
      expect(screen.getByText('Availability')).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should meet WCAG button requirements', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      
      // Should have proper button semantics
      expect(mobileMenuButton).toBeInstanceOf(HTMLButtonElement);
      
      // Should have accessible name
      expect(mobileMenuButton).toHaveAccessibleName();
      
      // Should indicate its state
      expect(mobileMenuButton).toHaveAttribute('aria-expanded');
    });

    it('should have proper focus management', () => {
      render(<HomePage />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      
      // Button should be focusable
      expect(mobileMenuButton.tabIndex).not.toBe(-1);
      
      // Should maintain focus when clicked
      fireEvent.click(mobileMenuButton);
      mobileMenuButton.focus();
      expect(document.activeElement).toBe(mobileMenuButton);
    });
  });
});