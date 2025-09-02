import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientLogosDisplay, LogoCarousel, ClientLogo } from '@/components/ui/client-logos-display';

// Mock OptimizedImage component
jest.mock('@/components/ui/optimized-image', () => ({
  OptimizedImage: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('ClientLogosDisplay', () => {
  const mockLogos = [
    {
      id: '1',
      name: 'Vantage Labs',
      logoUrl: '/images/clients/vantage-labs.png',
      websiteUrl: 'https://vantagelabs.com',
      category: 'Corporate',
      description: 'Tech startup corporate events',
    },
    {
      id: '2',
      name: 'North Shore Prep',
      logoUrl: '/images/clients/north-shore-prep.png',
      websiteUrl: 'https://northshoreprep.edu',
      category: 'Education',
      description: 'Private school events and fundraisers',
    },
    {
      id: '3',
      name: 'Chicago Marriott',
      logoUrl: '/images/clients/marriott.png',
      websiteUrl: 'https://marriott.com',
      category: 'Hospitality',
      description: 'Hotel conference and wedding events',
    },
    {
      id: '4',
      name: 'Northwestern Medicine',
      logoUrl: '/images/clients/northwestern-medicine.png',
      websiteUrl: 'https://nm.org',
      category: 'Healthcare',
      description: 'Medical center fundraising events',
    },
  ];

  it('renders client logos in grid layout', () => {
    render(<ClientLogosDisplay logos={mockLogos} />);
    
    expect(screen.getByRole('region', { name: 'Client logos' })).toBeInTheDocument();
    expect(screen.getByAltText('Vantage Labs logo')).toBeInTheDocument();
    expect(screen.getByAltText('North Shore Prep logo')).toBeInTheDocument();
  });

  it('displays client names and descriptions when showNames is enabled', () => {
    render(<ClientLogosDisplay logos={mockLogos} showNames />);
    
    expect(screen.getByText('Vantage Labs')).toBeInTheDocument();
    expect(screen.getByText('Tech startup corporate events')).toBeInTheDocument();
  });

  it('groups logos by category when enabled', () => {
    render(<ClientLogosDisplay logos={mockLogos} groupByCategory />);
    
    expect(screen.getByText('Corporate')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Hospitality')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
  });

  it('opens client website when logo is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock window.open
    Object.defineProperty(window, 'open', {
      writable: true,
      value: jest.fn(),
    });
    
    render(<ClientLogosDisplay logos={mockLogos} clickable />);
    
    const vantageLogo = screen.getByLabelText('Visit Vantage Labs website');
    await user.click(vantageLogo);
    
    expect(window.open).toHaveBeenCalledWith('https://vantagelabs.com', '_blank', 'noopener,noreferrer');
  });

  it('displays logos in carousel format when carousel prop is true', () => {
    render(<ClientLogosDisplay logos={mockLogos} carousel />);
    
    expect(screen.getByTestId('logo-carousel')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous logos')).toBeInTheDocument();
    expect(screen.getByLabelText('Next logos')).toBeInTheDocument();
  });

  it('applies grayscale filter when specified', () => {
    render(<ClientLogosDisplay logos={mockLogos} grayscale />);
    
    const logoImages = screen.getAllByRole('img');
    logoImages.forEach(img => {
      expect(img.parentElement).toHaveClass('grayscale');
    });
  });

  it('shows loading skeleton when loading', () => {
    render(<ClientLogosDisplay logos={[]} loading />);
    
    expect(screen.getByText('Loading client logos...')).toBeInTheDocument();
    expect(screen.getByTestId('logos-skeleton')).toBeInTheDocument();
  });

  it('displays empty state when no logos provided', () => {
    render(<ClientLogosDisplay logos={[]} />);
    
    expect(screen.getByText('No client logos to display')).toBeInTheDocument();
  });

  it('supports responsive grid columns', () => {
    render(<ClientLogosDisplay logos={mockLogos} columns={{ mobile: 2, tablet: 3, desktop: 4 }} />);
    
    const container = screen.getByTestId('logos-grid');
    expect(container).toHaveClass('grid-cols-2');
    expect(container).toHaveClass('md:grid-cols-3');
    expect(container).toHaveClass('lg:grid-cols-4');
  });

  it('has proper accessibility attributes', () => {
    render(<ClientLogosDisplay logos={mockLogos} />);
    
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Client logos');
    
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
  });

  it('filters logos by category', () => {
    render(<ClientLogosDisplay logos={mockLogos} filterByCategory="Corporate" />);
    
    expect(screen.getByAltText('Vantage Labs logo')).toBeInTheDocument();
    expect(screen.queryByAltText('North Shore Prep logo')).not.toBeInTheDocument();
  });

  it('limits number of logos displayed', () => {
    render(<ClientLogosDisplay logos={mockLogos} maxLogos={2} />);
    
    expect(screen.getByAltText('Vantage Labs logo')).toBeInTheDocument();
    expect(screen.getByAltText('North Shore Prep logo')).toBeInTheDocument();
    expect(screen.queryByAltText('Chicago Marriott logo')).not.toBeInTheDocument();
  });
});

describe('LogoCarousel', () => {
  const mockLogos = [
    {
      id: '1',
      name: 'Vantage Labs',
      logoUrl: '/images/clients/vantage-labs.png',
      websiteUrl: 'https://vantagelabs.com',
      category: 'Corporate',
      description: 'Tech startup corporate events',
    },
    {
      id: '2',
      name: 'North Shore Prep',
      logoUrl: '/images/clients/north-shore-prep.png',
      websiteUrl: 'https://northshoreprep.edu',
      category: 'Education',
      description: 'Private school events and fundraisers',
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders carousel navigation controls', () => {
    render(<LogoCarousel logos={mockLogos} />);
    
    expect(screen.getByLabelText('Previous logos')).toBeInTheDocument();
    expect(screen.getByLabelText('Next logos')).toBeInTheDocument();
  });

  it('navigates to next slide when next button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<LogoCarousel logos={mockLogos} itemsPerSlide={1} />);
    
    // Initially should show first logo
    expect(screen.getByAltText('Vantage Labs logo')).toBeVisible();
    
    const nextButton = screen.getByLabelText('Next logos');
    await user.click(nextButton);
    
    // Should show second logo
    expect(screen.getByAltText('North Shore Prep logo')).toBeVisible();
  });

  it('navigates to previous slide when previous button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<LogoCarousel logos={mockLogos} itemsPerSlide={1} />);
    
    // Go to second slide first
    const nextButton = screen.getByLabelText('Next logos');
    await user.click(nextButton);
    
    // Then go back
    const prevButton = screen.getByLabelText('Previous logos');
    await user.click(prevButton);
    
    expect(screen.getByAltText('Vantage Labs logo')).toBeVisible();
  });

  it('auto-plays when autoplay is enabled', () => {
    render(<LogoCarousel logos={mockLogos} autoplay autoplayInterval={1000} itemsPerSlide={1} />);
    
    // Initially shows first logo
    expect(screen.getByAltText('Vantage Labs logo')).toBeVisible();
    
    // Advance timer
    jest.advanceTimersByTime(1000);
    
    // Should auto-advance to next logo
    expect(screen.getByAltText('North Shore Prep logo')).toBeVisible();
  });

  it('pauses autoplay on hover', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<LogoCarousel logos={mockLogos} autoplay autoplayInterval={1000} itemsPerSlide={1} />);
    
    const carousel = screen.getByTestId('logo-carousel');
    
    // Hover to pause
    await user.hover(carousel);
    
    jest.advanceTimersByTime(1000);
    
    // Should not advance while hovered
    expect(screen.getByAltText('Vantage Labs logo')).toBeVisible();
    
    // Unhover to resume
    await user.unhover(carousel);
    
    jest.advanceTimersByTime(1000);
    
    // Should now advance
    expect(screen.getByAltText('North Shore Prep logo')).toBeVisible();
  });

  it('shows slide indicators', () => {
    render(<LogoCarousel logos={mockLogos} showIndicators itemsPerSlide={1} />);
    
    const indicators = screen.getAllByRole('button', { name: /go to slide/i });
    expect(indicators).toHaveLength(2);
  });

  it('supports infinite scroll', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<LogoCarousel logos={mockLogos} infinite itemsPerSlide={1} />);
    
    // Go to last slide
    const nextButton = screen.getByLabelText('Next logos');
    await user.click(nextButton);
    
    expect(screen.getByAltText('North Shore Prep logo')).toBeVisible();
    
    // Click next again - should loop back to first
    await user.click(nextButton);
    
    expect(screen.getByAltText('Vantage Labs logo')).toBeVisible();
  });
});

describe('ClientLogo', () => {
  const mockLogo = {
    id: '1',
    name: 'Vantage Labs',
    logoUrl: '/images/clients/vantage-labs.png',
    websiteUrl: 'https://vantagelabs.com',
    category: 'Corporate',
    description: 'Tech startup corporate events',
  };

  it('renders logo image with correct alt text', () => {
    render(<ClientLogo logo={mockLogo} />);
    
    const image = screen.getByAltText('Vantage Labs logo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/clients/vantage-labs.png');
  });

  it('shows client name when showName is enabled', () => {
    render(<ClientLogo logo={mockLogo} showName />);
    
    expect(screen.getByText('Vantage Labs')).toBeInTheDocument();
  });

  it('shows description when showDescription is enabled', () => {
    render(<ClientLogo logo={mockLogo} showDescription />);
    
    expect(screen.getByText('Tech startup corporate events')).toBeInTheDocument();
  });

  it('makes logo clickable when clickable prop is true', async () => {
    const user = userEvent.setup();
    
    // Mock window.open
    Object.defineProperty(window, 'open', {
      writable: true,
      value: jest.fn(),
    });
    
    render(<ClientLogo logo={mockLogo} clickable />);
    
    const logoButton = screen.getByLabelText('Visit Vantage Labs website');
    await user.click(logoButton);
    
    expect(window.open).toHaveBeenCalledWith('https://vantagelabs.com', '_blank', 'noopener,noreferrer');
  });

  it('applies grayscale filter when specified', () => {
    render(<ClientLogo logo={mockLogo} grayscale />);
    
    const logoContainer = screen.getByTestId('client-logo');
    expect(logoContainer).toHaveClass('grayscale');
  });

  it('supports hover effects', () => {
    render(<ClientLogo logo={mockLogo} hoverEffect="lift" />);
    
    const logoContainer = screen.getByTestId('client-logo');
    expect(logoContainer).toHaveClass('hover:-translate-y-1');
  });

  it('handles missing logo gracefully', () => {
    const logoWithoutImage = {
      ...mockLogo,
      logoUrl: '',
    };
    
    render(<ClientLogo logo={logoWithoutImage} />);
    
    // Should show placeholder or initials
    expect(screen.getByText('VL')).toBeInTheDocument();
  });

  it('applies custom size classes', () => {
    render(<ClientLogo logo={mockLogo} size="large" />);
    
    const logoContainer = screen.getByTestId('client-logo');
    expect(logoContainer).toHaveClass('h-24');
  });
});