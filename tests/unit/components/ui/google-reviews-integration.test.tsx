import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoogleReviewsIntegration, ReviewStars, ReviewCard } from '@/components/ui/google-reviews-integration';

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

// Mock fetch for Google Reviews API
global.fetch = jest.fn();

// Mock OptimizedImage component
jest.mock('@/components/ui/optimized-image', () => ({
  OptimizedImage: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('GoogleReviewsIntegration', () => {
  const mockReviews = [
    {
      id: '1',
      author_name: 'Sarah Johnson',
      author_url: 'https://www.google.com/maps/contrib/123',
      profile_photo_url: '/images/reviews/sarah.jpg',
      rating: 5,
      relative_time_description: '2 weeks ago',
      text: 'Amazing DJ service for our wedding! Professional and kept everyone dancing all night.',
      time: 1640995200,
    },
    {
      id: '2',
      author_name: 'Mike Chen',
      author_url: 'https://www.google.com/maps/contrib/456',
      profile_photo_url: '/images/reviews/mike.jpg',
      rating: 5,
      relative_time_description: '1 month ago',
      text: 'Great karaoke setup for our corporate event. The team was very professional.',
      time: 1638316800,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        result: {
          reviews: mockReviews,
          rating: 4.8,
          user_ratings_total: 25,
        }
      }),
    });
  });

  it('renders Google Reviews integration with loading state initially', () => {
    render(<GoogleReviewsIntegration />);
    
    expect(screen.getByText('Loading reviews...')).toBeInTheDocument();
    expect(screen.getByTestId('reviews-skeleton')).toBeInTheDocument();
  });

  it('displays Google Reviews after loading', async () => {
    render(<GoogleReviewsIntegration />);

    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Mike Chen')).toBeInTheDocument();
      expect(screen.getByText('Amazing DJ service for our wedding! Professional and kept everyone dancing all night.')).toBeInTheDocument();
    });
  });

  it('displays overall rating and review count', async () => {
    render(<GoogleReviewsIntegration />);

    await waitFor(() => {
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('25 reviews')).toBeInTheDocument();
    });
  });

  it('shows "View on Google" link', async () => {
    render(<GoogleReviewsIntegration />);

    await waitFor(() => {
      const viewLink = screen.getByText('View all reviews on Google');
      expect(viewLink).toBeInTheDocument();
    });
  });

  it('opens Google Business profile when "View on Google" is clicked', async () => {
    const user = userEvent.setup();
    render(<GoogleReviewsIntegration />);

    await waitFor(() => {
      const viewLink = screen.getByText('View all reviews on Google');
      expect(viewLink).toBeInTheDocument();
    });

    const viewLink = screen.getByText('View all reviews on Google');
    await user.click(viewLink);

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('google.com/maps/place'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('handles API error gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<GoogleReviewsIntegration />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load reviews')).toBeInTheDocument();
    });
  });

  it('displays reviews in responsive grid layout', async () => {
    render(<GoogleReviewsIntegration columns={2} />);

    await waitFor(() => {
      const container = screen.getByTestId('reviews-grid');
      expect(container).toHaveClass('lg:grid-cols-2');
    });
  });

  it('limits number of reviews displayed', async () => {
    render(<GoogleReviewsIntegration maxReviews={1} />);

    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Mike Chen')).not.toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<GoogleReviewsIntegration />);

    await waitFor(() => {
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Google Reviews');
    });
  });
});

describe('ReviewStars', () => {
  it('renders correct number of filled stars', () => {
    render(<ReviewStars rating={4} />);
    
    const stars = screen.getAllByTestId(/star-icon/);
    expect(stars).toHaveLength(5);
    
    // Check filled stars (first 4 should be filled)
    expect(stars[0]).toHaveClass('text-yellow-400');
    expect(stars[1]).toHaveClass('text-yellow-400');
    expect(stars[2]).toHaveClass('text-yellow-400');
    expect(stars[3]).toHaveClass('text-yellow-400');
    expect(stars[4]).toHaveClass('text-gray-300');
  });

  it('renders all filled stars for perfect rating', () => {
    render(<ReviewStars rating={5} />);
    
    const stars = screen.getAllByTestId(/star-icon/);
    stars.forEach(star => {
      expect(star).toHaveClass('text-yellow-400');
    });
  });

  it('renders custom size when specified', () => {
    render(<ReviewStars rating={5} size="large" />);
    
    const stars = screen.getAllByTestId(/star-icon/);
    expect(stars[0]).toHaveClass('w-6 h-6');
  });
});

describe('ReviewCard', () => {
  const mockReview = {
    id: '1',
    author_name: 'Sarah Johnson',
    author_url: 'https://www.google.com/maps/contrib/123',
    profile_photo_url: '/images/reviews/sarah.jpg',
    rating: 5,
    relative_time_description: '2 weeks ago',
    text: 'Amazing DJ service for our wedding! Professional and kept everyone dancing all night.',
    time: 1640995200,
  };

  it('displays review information correctly', () => {
    render(<ReviewCard review={mockReview} />);
    
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('2 weeks ago')).toBeInTheDocument();
    expect(screen.getByText('Amazing DJ service for our wedding! Professional and kept everyone dancing all night.')).toBeInTheDocument();
  });

  it('shows reviewer profile photo', () => {
    render(<ReviewCard review={mockReview} />);
    
    const profilePhoto = screen.getByAltText('Sarah Johnson');
    expect(profilePhoto).toBeInTheDocument();
    expect(profilePhoto).toHaveAttribute('src', '/images/reviews/sarah.jpg');
  });

  it('displays star rating', () => {
    render(<ReviewCard review={mockReview} />);
    
    const stars = screen.getAllByTestId(/star-icon/);
    expect(stars).toHaveLength(5);
    stars.forEach(star => {
      expect(star).toHaveClass('text-yellow-400');
    });
  });

  it('opens reviewer profile when name is clicked', async () => {
    const user = userEvent.setup();
    render(<ReviewCard review={mockReview} />);
    
    const reviewerName = screen.getByRole('button', { name: /sarah johnson/i });
    await user.click(reviewerName);
    
    expect(window.open).toHaveBeenCalledWith(
      'https://www.google.com/maps/contrib/123',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('truncates long review text and shows expand button', () => {
    const longReview = {
      ...mockReview,
      text: 'This is a very long review that should be truncated because it exceeds the maximum length that we want to display initially. '.repeat(10),
    };
    
    render(<ReviewCard review={longReview} showFullText={false} />);
    
    expect(screen.getByText('Read more')).toBeInTheDocument();
  });

  it('shows full text when showFullText is true', () => {
    const longReview = {
      ...mockReview,
      text: 'This is a very long review that should be displayed in full when showFullText is enabled.',
    };
    
    render(<ReviewCard review={longReview} showFullText />);
    
    expect(screen.getByText(longReview.text)).toBeInTheDocument();
    expect(screen.queryByText('Read more')).not.toBeInTheDocument();
  });

  it('applies custom styling when provided', () => {
    render(<ReviewCard review={mockReview} className="custom-review-card" />);
    
    const card = screen.getByTestId('review-card');
    expect(card).toHaveClass('custom-review-card');
  });
});