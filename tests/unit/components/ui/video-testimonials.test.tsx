import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoTestimonials } from '@/components/ui/video-testimonials';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('VideoTestimonials', () => {
  const mockTestimonials = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      eventType: 'Wedding',
      videoUrl: '/videos/testimonial-1.mp4',
      thumbnailUrl: '/images/testimonial-1-thumb.jpg',
      quote: 'Dapper Squad made our wedding absolutely perfect!',
      rating: 5,
      eventDate: '2024-06-15',
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      eventType: 'Corporate Event',
      videoUrl: '/videos/testimonial-2.mp4',
      thumbnailUrl: '/images/testimonial-2-thumb.jpg',
      quote: 'Professional service that exceeded all expectations.',
      rating: 5,
      eventDate: '2024-05-20',
    },
    {
      id: '3',
      clientName: 'Lisa Martinez',
      eventType: 'Birthday Party',
      videoUrl: '/videos/testimonial-3.mp4',
      thumbnailUrl: '/images/testimonial-3-thumb.jpg',
      quote: 'The karaoke setup was incredible! Everyone had a blast.',
      rating: 5,
      eventDate: '2024-07-08',
    },
  ];

  beforeEach(() => {
    // Mock HTMLVideoElement methods
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      writable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      writable: true,
      value: jest.fn(),
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'load', {
      writable: true,
      value: jest.fn(),
    });
  });

  it('renders testimonial thumbnails in grid layout', () => {
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    expect(screen.getByRole('region', { name: 'Video testimonials' })).toBeInTheDocument();
    
    // Check thumbnails are displayed
    expect(screen.getByAltText('Sarah Johnson testimonial thumbnail')).toBeInTheDocument();
    expect(screen.getByAltText('Mike Chen testimonial thumbnail')).toBeInTheDocument();
    expect(screen.getByAltText('Lisa Martinez testimonial thumbnail')).toBeInTheDocument();
  });

  it('displays client information and quotes', () => {
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Wedding')).toBeInTheDocument();
    expect(screen.getByText('Dapper Squad made our wedding absolutely perfect!')).toBeInTheDocument();
    
    expect(screen.getByText('Mike Chen')).toBeInTheDocument();
    expect(screen.getByText('Corporate Event')).toBeInTheDocument();
    expect(screen.getByText('Professional service that exceeded all expectations.')).toBeInTheDocument();
  });

  it('opens video modal when thumbnail is clicked', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('video-modal')).toBeInTheDocument();
      expect(screen.getByTestId('testimonial-video')).toBeInTheDocument();
    });
  });

  it('displays video with proper attributes in modal', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-1.mp4');
      expect(video).toHaveAttribute('controls');
      expect(video).toHaveAttribute('preload', 'metadata');
    });
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Open modal
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('video-modal')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByLabelText('Close video');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('video-modal')).not.toBeInTheDocument();
    });
  });

  it('closes modal when overlay is clicked', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Open modal
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('video-modal')).toBeInTheDocument();
    });
    
    // Click overlay
    const overlay = screen.getByTestId('video-modal-overlay');
    await user.click(overlay);
    
    await waitFor(() => {
      expect(screen.queryByTestId('video-modal')).not.toBeInTheDocument();
    });
  });

  it('closes modal with Escape key', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Open modal
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('video-modal')).toBeInTheDocument();
    });
    
    // Press Escape
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByTestId('video-modal')).not.toBeInTheDocument();
    });
  });

  it('navigates to next video with next button', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Open first video
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-1.mp4');
    });
    
    // Click next button
    const nextButton = screen.getByLabelText('Next video');
    await user.click(nextButton);
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-2.mp4');
      const modal = screen.getByTestId('video-modal');
      expect(within(modal).getByText('Mike Chen')).toBeInTheDocument();
    });
  });

  it('navigates to previous video with previous button', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Open second video
    const secondThumbnail = screen.getByAltText('Mike Chen testimonial thumbnail');
    await user.click(secondThumbnail);
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-2.mp4');
    });
    
    // Click previous button
    const prevButton = screen.getByLabelText('Previous video');
    await user.click(prevButton);
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-1.mp4');
      const modal = screen.getByTestId('video-modal');
      expect(within(modal).getByText('Sarah Johnson')).toBeInTheDocument();
    });
  });

  it('loops navigation at boundaries', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Open first video
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-1.mp4');
    });
    
    // Go to previous (should wrap to last)
    const prevButton = screen.getByLabelText('Previous video');
    await user.click(prevButton);
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-3.mp4');
    });
    
    // Go to next (should wrap to first)
    const nextButton = screen.getByLabelText('Next video');
    await user.click(nextButton);
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-1.mp4');
    });
  });

  it('navigates with keyboard arrows in modal', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Open modal
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-1.mp4');
    });
    
    // Navigate with arrow keys
    await user.keyboard('{ArrowRight}');
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-2.mp4');
    });
    
    await user.keyboard('{ArrowLeft}');
    
    await waitFor(() => {
      const video = screen.getByTestId('testimonial-video') as HTMLVideoElement;
      expect(video.src).toContain('testimonial-1.mp4');
    });
  });

  it('displays star ratings', () => {
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Should show 5-star ratings for all testimonials
    const starIcons = screen.getAllByTestId(/star-icon/);
    expect(starIcons.length).toBe(15); // 5 stars × 3 testimonials
  });

  it('handles empty testimonials array', () => {
    render(<VideoTestimonials testimonials={[]} />);
    
    expect(screen.getByText('No testimonials available')).toBeInTheDocument();
  });

  it('shows loading state when specified', () => {
    render(<VideoTestimonials testimonials={mockTestimonials} loading />);
    
    expect(screen.getByText('Loading testimonials...')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials-skeleton')).toBeInTheDocument();
  });

  it('pauses video when modal is closed', async () => {
    const user = userEvent.setup();
    const pauseMock = jest.fn();
    
    // Mock the video element pause method
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      writable: true,
      value: pauseMock,
    });
    
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Open modal
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('video-modal')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByLabelText('Close video');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('video-modal')).not.toBeInTheDocument();
    });
  });

  it('prevents body scroll when modal is open', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    // Open modal
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      expect(screen.getByTestId('video-modal')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByLabelText('Close video');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('video-modal')).not.toBeInTheDocument();
    });
  });

  it('supports custom grid columns', () => {
    render(<VideoTestimonials testimonials={mockTestimonials} columns={2} />);
    
    const container = screen.getByRole('region');
    expect(container).toHaveClass('lg:grid-cols-2');
  });

  it('has proper accessibility attributes', async () => {
    const user = userEvent.setup();
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Video testimonials');
    
    const thumbnailButtons = screen.getAllByRole('button');
    thumbnailButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
    
    // Open modal and check accessibility
    const firstThumbnail = screen.getByAltText('Sarah Johnson testimonial thumbnail');
    await user.click(firstThumbnail);
    
    await waitFor(() => {
      const modal = screen.getByTestId('video-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });
  });

  it('displays formatted event dates', () => {
    render(<VideoTestimonials testimonials={mockTestimonials} />);
    
    expect(screen.getByText('June 2024')).toBeInTheDocument();
    expect(screen.getByText('May 2024')).toBeInTheDocument();
    expect(screen.getByText('July 2024')).toBeInTheDocument();
  });
});