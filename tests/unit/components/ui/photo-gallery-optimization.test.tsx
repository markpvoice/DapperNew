/**
 * @fileoverview Tests for Photo Gallery Next.js Image Optimization
 * 
 * Tests the Phase 2 enhancement of replacing regular img elements
 * with Next.js Image components for better performance and optimization.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoGallery, Photo } from '@/components/ui/photo-gallery';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, className, sizes, priority, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        data-testid="next-image"
        data-fill={fill}
        data-sizes={sizes}
        data-priority={priority}
        {...props}
      />
    );
  };
});

const mockPhotos: Photo[] = [
  {
    id: '1',
    src: '/images/test1.jpg',
    alt: 'Test photo 1',
    caption: 'Test caption 1',
    category: 'dj',
    thumbnail: '/images/test1-thumb.jpg'
  },
  {
    id: '2',
    src: '/images/test2.jpg',
    alt: 'Test photo 2',
    caption: 'Test caption 2',
    category: 'photography'
  }
];

describe('PhotoGallery - Image Optimization', () => {
  describe('Next.js Image Implementation', () => {
    it('should use Next.js Image components instead of regular img elements', () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      // Should use Next.js Image components for thumbnails
      const nextImages = screen.getAllByTestId('next-image');
      expect(nextImages).toHaveLength(2); // One for each photo thumbnail
      
      // Should not have regular img elements (except in lightbox when closed)
      const regularImages = screen.queryAllByRole('img').filter(
        img => !img.hasAttribute('data-testid')
      );
      expect(regularImages).toHaveLength(0);
    });

    it('should have proper sizes attribute for responsive loading', () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      const thumbnailImages = screen.getAllByTestId('next-image');
      thumbnailImages.forEach(img => {
        expect(img).toHaveAttribute(
          'data-sizes', 
          '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
        );
      });
    });

    it('should use fill prop for thumbnail images', () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      const thumbnailImages = screen.getAllByTestId('next-image');
      thumbnailImages.forEach(img => {
        expect(img).toHaveAttribute('data-fill', 'true');
      });
    });

    it('should prioritize loading when lazyLoad is false', () => {
      render(<PhotoGallery photos={mockPhotos} lazyLoad={false} />);
      
      const thumbnailImages = screen.getAllByTestId('next-image');
      thumbnailImages.forEach(img => {
        expect(img).toHaveAttribute('data-priority', 'true');
      });
    });

    it('should not prioritize loading when lazyLoad is true', () => {
      render(<PhotoGallery photos={mockPhotos} lazyLoad={true} />);
      
      const thumbnailImages = screen.getAllByTestId('next-image');
      thumbnailImages.forEach(img => {
        expect(img).toHaveAttribute('data-priority', 'false');
      });
    });

    it('should use thumbnail src when available, fallback to main src', () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      const images = screen.getAllByTestId('next-image');
      
      // First photo has thumbnail
      expect(images[0]).toHaveAttribute('src', '/images/test1-thumb.jpg');
      
      // Second photo doesn't have thumbnail, should use main src
      expect(images[1]).toHaveAttribute('src', '/images/test2.jpg');
    });
  });

  describe('Lightbox Image Optimization', () => {
    it('should use Next.js Image in lightbox with priority loading', async () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      // Open lightbox
      const firstThumbnail = screen.getAllByRole('button')[0];
      fireEvent.click(firstThumbnail);
      
      await waitFor(() => {
        const lightboxImage = screen.getByTestId('lightbox-image');
        expect(lightboxImage).toHaveAttribute('data-testid', 'next-image');
        expect(lightboxImage).toHaveAttribute('data-priority', 'true');
      });
    });

    it('should have proper dimensions for lightbox images', async () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      // Open lightbox
      const firstThumbnail = screen.getAllByRole('button')[0];
      fireEvent.click(firstThumbnail);
      
      await waitFor(() => {
        const lightboxImage = screen.getByTestId('lightbox-image');
        expect(lightboxImage).toHaveAttribute('width', '800');
        expect(lightboxImage).toHaveAttribute('height', '600');
      });
    });

    it('should have responsive sizes for lightbox images', async () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      // Open lightbox
      const firstThumbnail = screen.getAllByRole('button')[0];
      fireEvent.click(firstThumbnail);
      
      await waitFor(() => {
        const lightboxImage = screen.getByTestId('lightbox-image');
        expect(lightboxImage).toHaveAttribute(
          'data-sizes',
          '(max-width: 768px) 95vw, 80vw'
        );
      });
    });

    it('should use main src for lightbox images, not thumbnail', async () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      // Open lightbox for first photo (has thumbnail)
      const firstThumbnail = screen.getAllByRole('button')[0];
      fireEvent.click(firstThumbnail);
      
      await waitFor(() => {
        const lightboxImage = screen.getByTestId('lightbox-image');
        expect(lightboxImage).toHaveAttribute('src', '/images/test1.jpg'); // Main src, not thumbnail
      });
    });
  });

  describe('Performance Optimization', () => {
    it('should maintain existing hover and transition effects', () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      const thumbnailImages = screen.getAllByTestId('next-image');
      thumbnailImages.forEach(img => {
        expect(img).toHaveClass('group-hover:scale-105');
        expect(img).toHaveClass('transition-transform');
        expect(img).toHaveClass('duration-300');
      });
    });

    it('should preserve object-cover class for proper image scaling', () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      const thumbnailImages = screen.getAllByTestId('next-image');
      thumbnailImages.forEach(img => {
        expect(img).toHaveClass('object-cover');
      });
    });

    it('should maintain proper alt text for accessibility', () => {
      render(<PhotoGallery photos={mockPhotos} />);
      
      const thumbnailImages = screen.getAllByTestId('next-image');
      expect(thumbnailImages[0]).toHaveAttribute('alt', 'Test photo 1');
      expect(thumbnailImages[1]).toHaveAttribute('alt', 'Test photo 2');
    });
  });

  describe('Aspect Ratio Support', () => {
    it('should work with different aspect ratios', () => {
      render(<PhotoGallery photos={mockPhotos} aspectRatio="square" />);
      
      // Container should have aspect-square class
      const thumbnailContainers = screen.getAllByTestId(/thumbnail-/);
      thumbnailContainers.forEach(container => {
        expect(container).toHaveClass('aspect-square');
      });
    });

    it('should maintain responsive grid layout', () => {
      render(<PhotoGallery photos={mockPhotos} columns={4} />);
      
      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing thumbnail gracefully', () => {
      const photosWithoutThumbnail: Photo[] = [
        {
          id: '1',
          src: '/images/test.jpg',
          alt: 'Test photo',
          // No thumbnail property
        }
      ];

      render(<PhotoGallery photos={photosWithoutThumbnail} />);
      
      const thumbnailImage = screen.getByTestId('next-image');
      expect(thumbnailImage).toHaveAttribute('src', '/images/test.jpg');
    });

    it('should handle empty photo array', () => {
      render(<PhotoGallery photos={[]} />);
      
      expect(screen.getByText('No photos available')).toBeInTheDocument();
      expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    });
  });
});