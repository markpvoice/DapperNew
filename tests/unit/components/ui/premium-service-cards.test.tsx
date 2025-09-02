/**
 * Premium Service Cards Test Suite
 * Comprehensive TDD tests for enhanced service cards that will drive conversion improvements
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PremiumServiceCards } from '@/components/ui/premium-service-cards';

// Mock IntersectionObserver for animation tests
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver for responsive tests
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const mockOnServiceSelect = jest.fn();

const defaultProps = {
  onServiceSelect: mockOnServiceSelect,
  selectedServices: [],
  className: '',
};

// Sample service data matching production requirements
const mockServiceData = [
  {
    id: 'dj',
    name: 'DJ Services',
    description: 'Curated mixes across decades & genres. Pro audio, clean transitions, and crowd-reading pros who keep the floor jumping.',
    features: ['Professional Sound System', 'Wireless Microphones', 'Dance Floor Lighting', 'MC Services'],
    priceRange: '$800 - $1,500',
    duration: '4-8 hours',
    popular: true,
    gradient: 'from-yellow-400 via-orange-500 to-red-600',
    iconType: 'music'
  },
  {
    id: 'karaoke',
    name: 'Karaoke',
    description: 'Thousands of tracks, wireless mics, and live hype. From shy solos to full-blown duets—everyone\'s a star.',
    features: ['10,000+ Song Library', 'Wireless Microphones', 'Lyrics Display', 'Live Host'],
    priceRange: '$400 - $800',
    duration: '3-6 hours',
    popular: false,
    gradient: 'from-green-400 via-blue-500 to-purple-600',
    iconType: 'microphone'
  },
  {
    id: 'photography',
    name: 'Event Photography',
    description: 'Sharp, share-ready shots and candid moments. Optional backdrop & instant gallery delivery.',
    features: ['Professional Equipment', 'Instant Gallery', 'Photo Backdrop', 'High-Res Delivery'],
    priceRange: '$600 - $1,200',
    duration: '2-6 hours',
    popular: false,
    gradient: 'from-purple-400 via-pink-500 to-red-600',
    iconType: 'camera'
  }
];

describe('PremiumServiceCards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Layout', () => {
    test('renders all service cards with proper structure', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      expect(screen.getByTestId('premium-service-cards')).toBeInTheDocument();
      expect(screen.getByText('DJ Services')).toBeInTheDocument();
      expect(screen.getByText('Karaoke')).toBeInTheDocument();
      expect(screen.getByText('Event Photography')).toBeInTheDocument();
    });

    test('displays service descriptions correctly', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      expect(screen.getByText(/Curated mixes across decades/)).toBeInTheDocument();
      expect(screen.getByText(/Thousands of tracks, wireless mics/)).toBeInTheDocument();
      expect(screen.getByText(/Sharp, share-ready shots/)).toBeInTheDocument();
    });

    test('applies responsive grid layout classes', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const container = screen.getByTestId('premium-service-cards');
      expect(container).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6', 'sm:gap-8');
    });
  });

  describe('Premium Visual Design', () => {
    test('applies gradient backgrounds to each service card', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      const karaokeCard = screen.getByTestId('service-card-karaoke');
      const photographyCard = screen.getByTestId('service-card-photography');

      // Each card should have gradient background classes
      expect(djCard).toHaveClass('bg-gradient-to-br', 'from-yellow-400', 'via-orange-500', 'to-red-600');
      expect(karaokeCard).toHaveClass('bg-gradient-to-br', 'from-green-400', 'via-blue-500', 'to-purple-600');
      expect(photographyCard).toHaveClass('bg-gradient-to-br', 'from-purple-400', 'via-pink-500', 'to-red-600');
    });

    test('displays custom SVG icons instead of emojis', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djIcon = screen.getByTestId('service-icon-dj');
      const karaokeIcon = screen.getByTestId('service-icon-karaoke');
      const photographyIcon = screen.getByTestId('service-icon-photography');

      expect(djIcon).toBeInTheDocument();
      expect(karaokeIcon).toBeInTheDocument();
      expect(photographyIcon).toBeInTheDocument();

      // Should be SVG elements, not emoji text
      expect(djIcon.tagName).toBe('svg');
      expect(karaokeIcon.tagName).toBe('svg');
      expect(photographyIcon.tagName).toBe('svg');
    });

    test('shows premium card styling with proper borders and shadows', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const cards = screen.getAllByTestId(/service-card-/);
      
      cards.forEach(card => {
        expect(card).toHaveClass('rounded-2xl', 'overflow-hidden', 'shadow-xl', 'hover:shadow-2xl');
      });
    });
  });

  describe('Popular Badge Display', () => {
    test('displays Popular badge only on DJ service (marked as popular)', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const popularBadges = screen.getAllByText('Popular');
      expect(popularBadges).toHaveLength(1);
      
      const djCard = screen.getByTestId('service-card-dj');
      expect(djCard).toContainElement(screen.getByText('Popular'));
    });

    test('popular badge has correct styling and positioning', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const popularBadge = screen.getByText('Popular');
      expect(popularBadge).toHaveClass('absolute', 'top-4', 'right-4', 'bg-brand-gold', 'text-brand-charcoal', 'px-3', 'py-1', 'rounded-full', 'text-sm', 'font-bold');
    });

    test('non-popular services do not show badge', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const karaokeCard = screen.getByTestId('service-card-karaoke');
      const photographyCard = screen.getByTestId('service-card-photography');
      
      expect(karaokeCard).not.toContainElement(screen.queryByText('Popular'));
      expect(photographyCard).not.toContainElement(screen.queryByText('Popular'));
    });
  });

  describe('Card Flip Animation and Pricing Details', () => {
    test('initially shows front side with service description', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      expect(screen.getByText(/Curated mixes across decades/)).toBeInTheDocument();
      expect(screen.queryByText('$800 - $1,500')).not.toBeInTheDocument();
    });

    test('flips to back side showing pricing on hover', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      
      await user.hover(djCard);
      
      await waitFor(() => {
        expect(screen.getByText('$800 - $1,500')).toBeInTheDocument();
        expect(screen.getByText('4-8 hours')).toBeInTheDocument();
      });
    });

    test('flips to back side showing features list on hover', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      
      await user.hover(djCard);
      
      await waitFor(() => {
        expect(screen.getByText('Professional Sound System')).toBeInTheDocument();
        expect(screen.getByText('Wireless Microphones')).toBeInTheDocument();
        expect(screen.getByText('Dance Floor Lighting')).toBeInTheDocument();
        expect(screen.getByText('MC Services')).toBeInTheDocument();
      });
    });

    test('flips back to front side when hover ends', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      
      await user.hover(djCard);
      await waitFor(() => {
        expect(screen.getByText('$800 - $1,500')).toBeInTheDocument();
      });
      
      await user.unhover(djCard);
      await waitFor(() => {
        expect(screen.queryByText('$800 - $1,500')).not.toBeInTheDocument();
        expect(screen.getByText(/Curated mixes across decades/)).toBeInTheDocument();
      });
    });

    test('supports click-based flip for mobile devices', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      
      await user.click(djCard);
      
      await waitFor(() => {
        expect(screen.getByText('$800 - $1,500')).toBeInTheDocument();
      });
    });
  });

  describe('Hover States and Micro-interactions', () => {
    test('applies hover transform and scale effects', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      
      await user.hover(djCard);
      
      expect(djCard).toHaveClass('hover:scale-105', 'hover:-translate-y-2');
    });

    test('applies smooth transition classes for animations', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const cards = screen.getAllByTestId(/service-card-/);
      
      cards.forEach(card => {
        expect(card).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
      });
    });

    test('shows enhanced shadow on hover', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      
      await user.hover(djCard);
      
      expect(djCard).toHaveClass('hover:shadow-2xl');
    });
  });

  describe('Service Selection Integration', () => {
    test('calls onServiceSelect when card is clicked', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      
      await user.click(djCard);
      
      expect(mockOnServiceSelect).toHaveBeenCalledWith('dj');
    });

    test('shows selected state styling for selected services', () => {
      render(<PremiumServiceCards {...defaultProps} selectedServices={['dj', 'karaoke']} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      const karaokeCard = screen.getByTestId('service-card-karaoke');
      const photographyCard = screen.getByTestId('service-card-photography');
      
      expect(djCard).toHaveClass('ring-4', 'ring-brand-gold', 'ring-opacity-60');
      expect(karaokeCard).toHaveClass('ring-4', 'ring-brand-gold', 'ring-opacity-60');
      expect(photographyCard).not.toHaveClass('ring-4');
    });

    test('displays selected checkmark for selected services', () => {
      render(<PremiumServiceCards {...defaultProps} selectedServices={['photography']} />);
      
      const checkmark = screen.getByTestId('selected-checkmark-photography');
      expect(checkmark).toBeInTheDocument();
      expect(checkmark).toHaveClass('absolute', 'top-4', 'left-4', 'w-6', 'h-6', 'bg-brand-gold', 'rounded-full');
    });
  });

  describe('Responsive Design', () => {
    test('applies mobile-first responsive classes', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const container = screen.getByTestId('premium-service-cards');
      expect(container).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    test('has proper touch targets for mobile (min 44px)', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const cards = screen.getAllByTestId(/service-card-/);
      
      cards.forEach(card => {
        expect(card).toHaveClass('min-h-[20rem]', 'p-6', 'sm:p-8');
      });
    });

    test('scales text appropriately for different screen sizes', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const titles = screen.getAllByRole('heading', { level: 3 });
      
      titles.forEach(title => {
        expect(title).toHaveClass('text-xl', 'sm:text-2xl', 'font-bold');
      });
    });
  });

  describe('Accessibility Compliance', () => {
    test('has proper ARIA labels and roles', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const cards = screen.getAllByTestId(/service-card-/);
      
      cards.forEach(card => {
        expect(card).toHaveAttribute('role', 'button');
        expect(card).toHaveAttribute('aria-label');
        expect(card).toHaveAttribute('tabIndex', '0');
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      
      djCard.focus();
      expect(djCard).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnServiceSelect).toHaveBeenCalledWith('dj');
    });

    test('supports space bar activation', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const karaokeCard = screen.getByTestId('service-card-karaoke');
      
      karaokeCard.focus();
      await user.keyboard(' ');
      
      expect(mockOnServiceSelect).toHaveBeenCalledWith('karaoke');
    });

    test('has proper focus indicators', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const cards = screen.getAllByTestId(/service-card-/);
      
      cards.forEach(card => {
        expect(card).toHaveClass('focus:outline-none', 'focus:ring-4', 'focus:ring-brand-gold', 'focus:ring-opacity-50');
      });
    });

    test('provides screen reader friendly descriptions', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      expect(djCard).toHaveAttribute('aria-label', expect.stringContaining('DJ Services'));
      expect(djCard).toHaveAttribute('aria-describedby');
    });
  });

  describe('Performance Optimizations', () => {
    test('uses CSS transforms for animations (not layout changes)', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      const cards = screen.getAllByTestId(/service-card-/);
      
      cards.forEach(card => {
        expect(card).toHaveClass('transform-gpu'); // Triggers GPU acceleration
      });
    });

    test('lazy loads non-critical animations', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      // Check that animations are enabled via IntersectionObserver
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('handles missing service data gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<PremiumServiceCards {...defaultProps} services={undefined} />);
      
      expect(screen.getByTestId('premium-service-cards')).toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
      
      consoleError.mockRestore();
    });

    test('handles onServiceSelect callback errors gracefully', async () => {
      const faultyCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      
      render(<PremiumServiceCards {...defaultProps} onServiceSelect={faultyCallback} />);
      
      const djCard = screen.getByTestId('service-card-dj');
      await user.click(djCard);
      
      // Component should still function despite callback error
      expect(djCard).toBeInTheDocument();
      
      consoleError.mockRestore();
    });
  });

  describe('Integration with Booking Flow', () => {
    test('maintains existing data-testid attributes for E2E tests', () => {
      render(<PremiumServiceCards {...defaultProps} />);
      
      expect(screen.getByTestId('service-card-dj')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-karaoke')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-photography')).toBeInTheDocument();
    });

    test('provides service data in expected format for booking form', async () => {
      const user = userEvent.setup();
      render(<PremiumServiceCards {...defaultProps} />);
      
      const photographyCard = screen.getByTestId('service-card-photography');
      await user.click(photographyCard);
      
      expect(mockOnServiceSelect).toHaveBeenCalledWith('photography');
    });
  });
});