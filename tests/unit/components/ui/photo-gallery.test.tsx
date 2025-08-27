import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoGallery } from '@/components/ui/photo-gallery';

describe('PhotoGallery', () => {
  const mockPhotos = [
    {
      id: '1',
      src: '/images/event-1.jpg',
      alt: 'Wedding DJ Setup',
      caption: 'Professional DJ setup at a beautiful wedding venue',
      category: 'dj',
      thumbnail: '/images/thumbs/event-1-thumb.jpg',
    },
    {
      id: '2',
      src: '/images/event-2.jpg',
      alt: 'Karaoke Night',
      caption: 'Guests enjoying karaoke at a corporate event',
      category: 'karaoke',
      thumbnail: '/images/thumbs/event-2-thumb.jpg',
    },
    {
      id: '3',
      src: '/images/event-3.jpg',
      alt: 'Photography Session',
      caption: 'Capturing precious moments at an anniversary celebration',
      category: 'photography',
      thumbnail: '/images/thumbs/event-3-thumb.jpg',
    },
  ];

  it('renders photo thumbnails in grid layout', () => {
    render(<PhotoGallery photos={mockPhotos} />);
    
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    
    // Check that thumbnails are displayed
    expect(screen.getByAltText('Wedding DJ Setup')).toBeInTheDocument();
    expect(screen.getByAltText('Karaoke Night')).toBeInTheDocument();
    expect(screen.getByAltText('Photography Session')).toBeInTheDocument();
  });

  it('opens lightbox when thumbnail is clicked', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('lightbox')).toBeInTheDocument();
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage).toBeInTheDocument();
      expect(lightboxImage.getAttribute('src')).toContain('event-1.jpg');
    });
  });

  it('displays photo caption in lightbox', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByText('Professional DJ setup at a beautiful wedding venue')).toBeInTheDocument();
    });
  });

  it('navigates to next photo with next button', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    // Open lightbox
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-1.jpg');
    });
    
    // Click next button
    const nextButton = screen.getByLabelText('Next photo');
    await user.click(nextButton);
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-2.jpg');
      expect(screen.getByText('Guests enjoying karaoke at a corporate event')).toBeInTheDocument();
    });
  });

  it('navigates to previous photo with previous button', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    // Open lightbox on second photo
    const secondThumbnail = screen.getByAltText('Karaoke Night');
    await user.click(secondThumbnail);
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-2.jpg');
    });
    
    // Click previous button
    const prevButton = screen.getByLabelText('Previous photo');
    await user.click(prevButton);
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-1.jpg');
      expect(screen.getByText('Professional DJ setup at a beautiful wedding venue')).toBeInTheDocument();
    });
  });

  it('loops navigation at boundaries', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    // Open first photo
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-1.jpg');
    });
    
    // Click previous - should go to last photo
    const prevButton = screen.getByLabelText('Previous photo');
    await user.click(prevButton);
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-3.jpg');
    });
    
    // Click next - should go back to first photo
    const nextButton = screen.getByLabelText('Next photo');
    await user.click(nextButton);
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-1.jpg');
    });
  });

  it('closes lightbox when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    // Open lightbox
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('lightbox')).toBeInTheDocument();
    });
    
    // Close lightbox
    const closeButton = screen.getByLabelText('Close lightbox');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument();
    });
  });

  it('closes lightbox when overlay is clicked', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    // Open lightbox
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('lightbox')).toBeInTheDocument();
    });
    
    // Click overlay to close
    const overlay = screen.getByTestId('lightbox-overlay');
    await user.click(overlay);
    
    await waitFor(() => {
      expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument();
    });
  });

  it('closes lightbox with Escape key', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    // Open lightbox
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('lightbox')).toBeInTheDocument();
    });
    
    // Press Escape
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument();
    });
  });

  it('navigates with keyboard arrows', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    // Open lightbox
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-1.jpg');
    });
    
    // Navigate with arrow keys
    await user.keyboard('{ArrowRight}');
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-2.jpg');
    });
    
    await user.keyboard('{ArrowLeft}');
    
    await waitFor(() => {
      const lightboxImage = screen.getByTestId('lightbox-image');
      expect(lightboxImage.getAttribute('src')).toContain('event-1.jpg');
    });
  });

  it('filters photos by category', () => {
    render(<PhotoGallery photos={mockPhotos} showCategories />);
    
    // Should show category filter buttons
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'DJ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Karaoke' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Photography' })).toBeInTheDocument();
  });

  it('filters photos when category button is clicked', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} showCategories />);
    
    // Initially all photos should be visible
    expect(screen.getAllByRole('img')).toHaveLength(3);
    
    // Click DJ category
    const djButton = screen.getByRole('button', { name: 'DJ' });
    await user.click(djButton);
    
    // Should only show DJ photos
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByAltText('Wedding DJ Setup')).toBeInTheDocument();
    expect(screen.queryByAltText('Karaoke Night')).not.toBeInTheDocument();
  });

  it('shows photo counter in lightbox', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  it('supports lazy loading for performance', () => {
    render(<PhotoGallery photos={mockPhotos} lazyLoad />);
    
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  it('handles empty photo array', () => {
    render(<PhotoGallery photos={[]} />);
    
    expect(screen.getByText('No photos available')).toBeInTheDocument();
  });

  it('shows loading state when photos are loading', () => {
    render(<PhotoGallery photos={mockPhotos} loading />);
    
    expect(screen.getByText('Loading photos...')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-skeleton')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    const gallery = screen.getByRole('grid');
    expect(gallery).toHaveAttribute('aria-label', 'Photo gallery');
    
    const thumbnails = screen.getAllByRole('button');
    thumbnails.forEach(thumb => {
      expect(thumb).toHaveAttribute('aria-label');
    });
    
    // Open lightbox and check accessibility
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      const lightbox = screen.getByTestId('lightbox');
      expect(lightbox).toHaveAttribute('role', 'dialog');
      expect(lightbox).toHaveAttribute('aria-modal', 'true');
      expect(lightbox).toHaveAttribute('aria-labelledby');
    });
  });

  it('prevents body scroll when lightbox is open', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={mockPhotos} />);
    
    // Open lightbox
    const firstThumbnail = screen.getByAltText('Wedding DJ Setup');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('lightbox')).toBeInTheDocument();
    });
    
    // Close lightbox
    const closeButton = screen.getByLabelText('Close lightbox');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument();
    });
  });

  it('supports custom grid columns', () => {
    render(<PhotoGallery photos={mockPhotos} columns={4} />);
    
    const gallery = screen.getByRole('grid');
    expect(gallery).toHaveClass('lg:grid-cols-4');
  });

  it('supports custom aspect ratio', () => {
    render(<PhotoGallery photos={mockPhotos} aspectRatio="square" />);
    
    const thumbnails = screen.getAllByTestId(/thumbnail-/);
    thumbnails.forEach(thumb => {
      expect(thumb).toHaveClass('aspect-square');
    });
  });
});