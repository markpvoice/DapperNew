/**
 * @fileoverview Service Preview Modal Tests - TDD Implementation
 * 
 * Tests for service preview modal component:
 * - Modal display with photos, videos, and testimonials
 * - Equipment and setup information
 * - Accessibility and keyboard navigation
 * - Mobile responsiveness and touch interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServicePreviewModal } from '@/components/ui/service-preview-modal';

describe('ServicePreviewModal', () => {
  const defaultProps = {
    isOpen: true,
    serviceId: 'dj',
    serviceName: 'DJ Services',
    onClose: jest.fn(),
    onSelect: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock IntersectionObserver for lazy loading
    global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: []
    }));
  });

  describe('Modal Display and Content', () => {
    test('renders modal when isOpen is true', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      expect(screen.getByTestId('service-preview-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(<ServicePreviewModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('service-preview-modal')).not.toBeInTheDocument();
    });

    test('displays service name in modal header', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      expect(screen.getByTestId('modal-title')).toHaveTextContent('DJ Services');
    });

    test('shows close button', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      expect(screen.getByTestId('close-button')).toBeInTheDocument();
      expect(screen.getByTestId('close-button')).toHaveAttribute('aria-label', 'Close modal');
    });

    test('calls onClose when close button is clicked', async () => {
      const onClose = jest.fn();
      render(<ServicePreviewModal {...defaultProps} onClose={onClose} />);
      
      await userEvent.click(screen.getByTestId('close-button'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when backdrop is clicked', async () => {
      const onClose = jest.fn();
      render(<ServicePreviewModal {...defaultProps} onClose={onClose} />);
      
      await userEvent.click(screen.getByTestId('modal-backdrop'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Photo Gallery', () => {
    test('displays service photos', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
      expect(screen.getByTestId('photo-gallery-title')).toHaveTextContent('Photo Gallery');
    });

    test('shows multiple photos for DJ service', () => {
      render(<ServicePreviewModal {...defaultProps} serviceId="dj" />);
      
      const photos = screen.getAllByTestId(/photo-\d+/);
      expect(photos).toHaveLength(6);
      
      expect(photos[0]).toHaveAttribute('alt', 'DJ setup at wedding venue');
      expect(photos[1]).toHaveAttribute('alt', 'Professional DJ mixing at corporate event');
    });

    test('opens lightbox when photo is clicked', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const firstPhoto = screen.getByTestId('photo-0');
      await userEvent.click(firstPhoto);
      
      expect(screen.getByTestId('photo-lightbox')).toBeInTheDocument();
      expect(screen.getByTestId('lightbox-image')).toHaveAttribute('src', expect.stringContaining('dj'));
    });

    test('supports keyboard navigation in photo gallery', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const firstPhoto = screen.getByTestId('photo-0');
      firstPhoto.focus();
      
      fireEvent.keyDown(firstPhoto, { key: 'Enter' });
      expect(screen.getByTestId('photo-lightbox')).toBeInTheDocument();
      
      fireEvent.keyDown(screen.getByTestId('photo-lightbox'), { key: 'Escape' });
      expect(screen.queryByTestId('photo-lightbox')).not.toBeInTheDocument();
    });

    test('lazy loads images for performance', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const photos = screen.getAllByTestId(/photo-\d+/);
      photos.forEach(photo => {
        expect(photo).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('Video Content', () => {
    test('displays service videos', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      expect(screen.getByTestId('video-section')).toBeInTheDocument();
      expect(screen.getByTestId('video-section-title')).toHaveTextContent('See Us in Action');
    });

    test('shows video thumbnails with play buttons', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const videoThumbnails = screen.getAllByTestId(/video-thumbnail-\d+/);
      expect(videoThumbnails.length).toBeGreaterThan(0);
      
      videoThumbnails.forEach(thumbnail => {
        expect(within(thumbnail).getByTestId('play-button')).toBeInTheDocument();
      });
    });

    test('opens video player when thumbnail is clicked', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const firstVideo = screen.getByTestId('video-thumbnail-0');
      await userEvent.click(firstVideo);
      
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
      expect(screen.getByTestId('video-player')).toHaveAttribute('controls');
    });

    test('displays video duration and title', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const firstVideo = screen.getByTestId('video-thumbnail-0');
      expect(within(firstVideo).getByTestId('video-duration')).toHaveTextContent('2:15');
      expect(within(firstVideo).getByTestId('video-title')).toHaveTextContent('DJ Setup Process');
    });

    test('supports fullscreen video playback', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      await userEvent.click(screen.getByTestId('video-thumbnail-0'));
      
      const fullscreenButton = screen.getByTestId('fullscreen-button');
      expect(fullscreenButton).toBeInTheDocument();
      
      await userEvent.click(fullscreenButton);
      expect(screen.getByTestId('video-player')).toHaveAttribute('data-fullscreen', 'true');
    });
  });

  describe('Customer Testimonials', () => {
    test('displays service-specific testimonials', () => {
      render(<ServicePreviewModal {...defaultProps} serviceId="dj" />);
      
      expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
      expect(screen.getByTestId('testimonials-title')).toHaveTextContent('What Clients Say');
    });

    test('shows multiple testimonials with ratings', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const testimonials = screen.getAllByTestId(/testimonial-\d+/);
      expect(testimonials.length).toBeGreaterThanOrEqual(3);
      
      testimonials.forEach(testimonial => {
        expect(within(testimonial).getByTestId('star-rating')).toBeInTheDocument();
        expect(within(testimonial).getByTestId('client-name')).toBeInTheDocument();
        expect(within(testimonial).getByTestId('testimonial-text')).toBeInTheDocument();
      });
    });

    test('displays client photos with testimonials', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const testimonials = screen.getAllByTestId(/testimonial-\d+/);
      testimonials.forEach(testimonial => {
        const clientPhoto = within(testimonial).queryByTestId('client-photo');
        if (clientPhoto) {
          expect(clientPhoto).toHaveAttribute('alt', expect.stringContaining('Client'));
        }
      });
    });

    test('shows event type for each testimonial', () => {
      render(<ServicePreviewModal {...defaultProps} serviceId="dj" />);
      
      const firstTestimonial = screen.getByTestId('testimonial-0');
      expect(within(firstTestimonial).getByTestId('event-type')).toHaveTextContent('Wedding');
    });

    test('supports testimonial carousel navigation', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const nextButton = screen.getByTestId('testimonials-next');
      const prevButton = screen.getByTestId('testimonials-prev');
      
      expect(nextButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
      
      await userEvent.click(nextButton);
      expect(screen.getByTestId('testimonials-carousel')).toHaveAttribute('data-current-slide', '1');
    });
  });

  describe('Equipment and Setup Information', () => {
    test('displays equipment details', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      expect(screen.getByTestId('equipment-section')).toBeInTheDocument();
      expect(screen.getByTestId('equipment-title')).toHaveTextContent('Equipment & Setup');
    });

    test('shows service-specific equipment lists', () => {
      render(<ServicePreviewModal {...defaultProps} serviceId="dj" />);
      
      expect(screen.getByTestId('equipment-list')).toBeInTheDocument();
      expect(screen.getByTestId('equipment-item-speakers')).toHaveTextContent('Professional Sound System');
      expect(screen.getByTestId('equipment-item-lights')).toHaveTextContent('LED Lighting Package');
      expect(screen.getByTestId('equipment-item-mixer')).toHaveTextContent('DJ Mixing Console');
    });

    test('displays setup time and space requirements', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      expect(screen.getByTestId('setup-requirements')).toBeInTheDocument();
      expect(screen.getByTestId('setup-time')).toHaveTextContent('Setup Time: 2 hours');
      expect(screen.getByTestId('space-needed')).toHaveTextContent('Space Needed: 8x8 feet');
      expect(screen.getByTestId('power-requirements')).toHaveTextContent('Power: 2 standard outlets');
    });

    test('shows service variations and add-ons', () => {
      render(<ServicePreviewModal {...defaultProps} serviceId="dj" />);
      
      expect(screen.getByTestId('service-variations')).toBeInTheDocument();
      expect(screen.getByTestId('variation-basic')).toHaveTextContent('Basic Package: $300-500');
      expect(screen.getByTestId('variation-premium')).toHaveTextContent('Premium Package: $600-800');
    });

    test('displays frequently asked questions', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      expect(screen.getByTestId('faq-section')).toBeInTheDocument();
      const faqItems = screen.getAllByTestId(/faq-item-\d+/);
      expect(faqItems.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Service Selection', () => {
    test('shows select service button', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const selectButton = screen.getByTestId('select-service-button');
      expect(selectButton).toBeInTheDocument();
      expect(selectButton).toHaveTextContent('Select DJ Services');
    });

    test('calls onSelect when select button is clicked', async () => {
      const onSelect = jest.fn();
      render(<ServicePreviewModal {...defaultProps} onSelect={onSelect} />);
      
      await userEvent.click(screen.getByTestId('select-service-button'));
      expect(onSelect).toHaveBeenCalledWith('dj');
    });

    test('shows pricing information on select button', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const selectButton = screen.getByTestId('select-service-button');
      expect(within(selectButton).getByTestId('price-range')).toHaveTextContent('$300 - $800');
    });

    test('shows contact for custom quote option', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const customQuoteButton = screen.getByTestId('custom-quote-button');
      expect(customQuoteButton).toBeInTheDocument();
      expect(customQuoteButton).toHaveTextContent('Get Custom Quote');
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const modal = screen.getByTestId('service-preview-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    test('manages focus properly when opened', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const closeButton = screen.getByTestId('close-button');
      expect(document.activeElement).toBe(closeButton);
    });

    test('traps focus within modal', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const modal = screen.getByTestId('service-preview-modal');
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Tab through elements
      for (let i = 0; i < focusableElements.length; i++) {
        fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      }
      
      // Should cycle back to first element
      expect(document.activeElement).toBe(focusableElements[0]);
    });

    test('closes modal with Escape key', async () => {
      const onClose = jest.fn();
      render(<ServicePreviewModal {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(screen.getByTestId('service-preview-modal'), { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('provides alt text for all images', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    test('supports screen reader navigation', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const sections = screen.getAllByRole('region');
      sections.forEach(section => {
        expect(section).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<ServicePreviewModal {...defaultProps} />);
      
      const modal = screen.getByTestId('service-preview-modal');
      expect(modal).toHaveClass('max-w-full', 'mx-4', 'sm:max-w-4xl', 'sm:mx-auto');
    });

    test('uses touch-friendly button sizes', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minHeight = parseInt(styles.minHeight);
        expect(minHeight).toBeGreaterThanOrEqual(44); // iOS/Android touch target minimum
      });
    });

    test('supports touch gestures for photo gallery', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const photoGallery = screen.getByTestId('photo-gallery');
      
      // Simulate swipe gesture
      fireEvent.touchStart(photoGallery, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchMove(photoGallery, { touches: [{ clientX: 50, clientY: 100 }] });
      fireEvent.touchEnd(photoGallery);
      
      expect(photoGallery).toHaveAttribute('data-swiped', 'left');
    });

    test('optimizes video loading for mobile data', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const videoThumbnails = screen.getAllByTestId(/video-thumbnail-\d+/);
      videoThumbnails.forEach(thumbnail => {
        expect(thumbnail).toHaveAttribute('data-preload', 'none');
      });
    });
  });

  describe('Performance', () => {
    test('lazy loads content sections', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      // Initially only header should be loaded
      expect(screen.getByTestId('modal-title')).toBeInTheDocument();
      
      // Content sections load as they come into view
      await waitFor(() => {
        expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
      });
    });

    test('preloads critical images', () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const heroImage = screen.getByTestId('hero-image');
      expect(heroImage).toHaveAttribute('loading', 'eager');
    });

    test('debounces expensive operations', async () => {
      const onSelect = jest.fn();
      render(<ServicePreviewModal {...defaultProps} onSelect={onSelect} />);
      
      const selectButton = screen.getByTestId('select-service-button');
      
      // Rapid clicks should be debounced
      await userEvent.click(selectButton);
      await userEvent.click(selectButton);
      await userEvent.click(selectButton);
      
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('shows fallback content when images fail to load', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const firstPhoto = screen.getByTestId('photo-0');
      fireEvent.error(firstPhoto);
      
      expect(screen.getByTestId('photo-fallback-0')).toBeInTheDocument();
      expect(screen.getByTestId('photo-fallback-0')).toHaveTextContent('Image unavailable');
    });

    test('handles video loading errors gracefully', async () => {
      render(<ServicePreviewModal {...defaultProps} />);
      
      const videoPlayer = screen.getByTestId('video-player');
      fireEvent.error(videoPlayer);
      
      expect(screen.getByTestId('video-error-message')).toBeInTheDocument();
      expect(screen.getByTestId('video-error-message')).toHaveTextContent('Video temporarily unavailable');
    });

    test('shows loading states during content fetch', () => {
      render(<ServicePreviewModal {...defaultProps} loading={true} />);
      
      expect(screen.getByTestId('content-loading')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});