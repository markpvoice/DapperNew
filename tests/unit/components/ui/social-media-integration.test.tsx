import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialMediaIntegration, SocialShareButtons, InstagramFeed, SocialProof } from '@/components/ui/social-media-integration';

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

// Mock fetch for Instagram API
global.fetch = jest.fn();

describe('SocialShareButtons', () => {
  const mockUrl = 'https://dappersquad.com/services';
  const mockTitle = 'Check out Dapper Squad Entertainment!';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all social share buttons', () => {
    render(
      <SocialShareButtons 
        url={mockUrl}
        title={mockTitle}
      />
    );

    expect(screen.getByLabelText('Share on Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy link')).toBeInTheDocument();
  });

  it('opens Facebook share dialog when clicked', async () => {
    const user = userEvent.setup();
    render(
      <SocialShareButtons 
        url={mockUrl}
        title={mockTitle}
      />
    );

    await user.click(screen.getByLabelText('Share on Facebook'));
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer/sharer.php'),
      '_blank',
      expect.any(String)
    );
  });

  it('opens Twitter share dialog when clicked', async () => {
    const user = userEvent.setup();
    render(
      <SocialShareButtons 
        url={mockUrl}
        title={mockTitle}
      />
    );

    await user.click(screen.getByLabelText('Share on Twitter'));
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      expect.any(String)
    );
  });

  it('copies link to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });

    render(
      <SocialShareButtons 
        url={mockUrl}
        title={mockTitle}
      />
    );

    await user.click(screen.getByLabelText('Copy link'));
    
    expect(mockWriteText).toHaveBeenCalledWith(mockUrl);
    expect(screen.getByText('Link copied!')).toBeInTheDocument();
  });

  it('shows custom platforms when specified', () => {
    render(
      <SocialShareButtons 
        url={mockUrl}
        title={mockTitle}
        platforms={['facebook', 'twitter']}
      />
    );

    expect(screen.getByLabelText('Share on Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on Twitter')).toBeInTheDocument();
    expect(screen.queryByLabelText('Share on LinkedIn')).not.toBeInTheDocument();
  });

  it('applies custom styling', () => {
    render(
      <SocialShareButtons 
        url={mockUrl}
        title={mockTitle}
        className="custom-class"
        buttonStyle="minimal"
      />
    );

    const container = screen.getByRole('group');
    expect(container).toHaveClass('custom-class');
  });
});

describe('InstagramFeed', () => {
  const mockPosts = [
    {
      id: '1',
      media_url: '/images/instagram/post-1.jpg',
      caption: 'Amazing wedding setup! #DapperSquad #Wedding',
      permalink: 'https://instagram.com/p/abc123',
      timestamp: '2024-01-15T10:00:00+0000',
      like_count: 45,
      comments_count: 8,
    },
    {
      id: '2',
      media_url: '/images/instagram/post-2.jpg',
      caption: 'Corporate karaoke night was a blast! #Corporate #Karaoke',
      permalink: 'https://instagram.com/p/def456',
      timestamp: '2024-01-14T15:30:00+0000',
      like_count: 32,
      comments_count: 5,
    },
  ];

  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockPosts }),
    });
  });

  it('renders Instagram posts', async () => {
    render(<InstagramFeed />);

    await waitFor(() => {
      expect(screen.getByText('Amazing wedding setup! #DapperSquad #Wedding')).toBeInTheDocument();
      expect(screen.getByText('Corporate karaoke night was a blast! #Corporate #Karaoke')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<InstagramFeed />);
    
    expect(screen.getByText('Loading Instagram posts...')).toBeInTheDocument();
    expect(screen.getByTestId('instagram-skeleton')).toBeInTheDocument();
  });

  it('handles error state when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<InstagramFeed />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load Instagram posts')).toBeInTheDocument();
    });
  });

  it('opens Instagram post when clicked', async () => {
    const user = userEvent.setup();
    render(<InstagramFeed />);

    await waitFor(() => {
      expect(screen.getByText('Amazing wedding setup! #DapperSquad #Wedding')).toBeInTheDocument();
    });

    const firstPost = screen.getByLabelText('View Instagram post: Amazing wedding setup! #DapperSquad #Wedding');
    await user.click(firstPost);

    expect(window.open).toHaveBeenCalledWith(
      'https://instagram.com/p/abc123',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('displays like and comment counts', async () => {
    render(<InstagramFeed showStats />);

    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument(); // likes
      expect(screen.getByText('8')).toBeInTheDocument(); // comments
    });
  });

  it('supports custom grid layout', async () => {
    render(<InstagramFeed columns={2} />);

    await waitFor(() => {
      const container = screen.getByTestId('instagram-grid');
      expect(container).toHaveClass('lg:grid-cols-2');
    });
  });

  it('limits posts when maxPosts is specified', async () => {
    render(<InstagramFeed maxPosts={1} />);

    await waitFor(() => {
      expect(screen.getByText('Amazing wedding setup! #DapperSquad #Wedding')).toBeInTheDocument();
      expect(screen.queryByText('Corporate karaoke night was a blast! #Corporate #Karaoke')).not.toBeInTheDocument();
    });
  });
});

describe('SocialProof', () => {
  const mockStats = {
    followers: 1250,
    posts: 89,
    avgLikes: 45,
    testimonials: 120,
  };

  it('displays social proof statistics', () => {
    render(<SocialProof stats={mockStats} />);

    expect(screen.getByText('1.3K')).toBeInTheDocument(); // Formatted followers
    expect(screen.getByText('89')).toBeInTheDocument(); // Posts
    expect(screen.getByText('45')).toBeInTheDocument(); // Avg likes
    expect(screen.getByText('120+')).toBeInTheDocument(); // Testimonials
  });

  it('shows platform icons', () => {
    render(<SocialProof stats={mockStats} platforms={['instagram', 'facebook']} />);

    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
  });

  it('animates counters on scroll', () => {
    render(<SocialProof stats={mockStats} animated />);
    
    // Should show animated numbers when visible
    expect(screen.getByTestId('animated-counter')).toBeInTheDocument();
  });
});

describe('SocialMediaIntegration', () => {
  it('renders all social media components', () => {
    render(
      <SocialMediaIntegration 
        showShareButtons
        showInstagramFeed
        showSocialProof
      />
    );

    expect(screen.getByRole('group')).toBeInTheDocument(); // Share buttons
    expect(screen.getByText('Loading Instagram posts...')).toBeInTheDocument();
    expect(screen.getByTestId('social-proof')).toBeInTheDocument();
  });

  it('conditionally renders components based on props', () => {
    render(
      <SocialMediaIntegration 
        showShareButtons={false}
        showInstagramFeed
        showSocialProof={false}
      />
    );

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(screen.getByText('Loading Instagram posts...')).toBeInTheDocument();
    expect(screen.queryByTestId('social-proof')).not.toBeInTheDocument();
  });

  it('applies custom configuration to child components', () => {
    render(
      <SocialMediaIntegration 
        showInstagramFeed
        instagramConfig={{ columns: 2, maxPosts: 4 }}
      />
    );

    // Instagram feed should be rendered with custom config
    expect(screen.getByText('Loading Instagram posts...')).toBeInTheDocument();
  });

  it('handles social media errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));
    
    render(
      <SocialMediaIntegration 
        showInstagramFeed
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to load Instagram posts')).toBeInTheDocument();
    });
  });

  it('provides follow buttons for social platforms', () => {
    render(
      <SocialMediaIntegration 
        showFollowButtons
        socialHandles={{
          instagram: '@dappersquad',
          facebook: 'dappersquadentertainment',
        }}
      />
    );

    expect(screen.getByLabelText('Follow on Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow on Facebook')).toBeInTheDocument();
  });
});