import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceSelector } from '@/components/ui/service-selector';

// Mock service data
const mockServices = [
  {
    id: 'dj',
    name: 'DJ Services',
    description: 'Professional DJ with premium sound system and lighting',
    features: ['Premium Sound System', '4-Hour Set', 'Lighting Package', 'Music Requests'],
    priceRange: { min: 300, max: 800 },
    duration: '4-8 hours',
    category: 'entertainment',
    image: '/images/dj-service.jpg',
    popular: true
  },
  {
    id: 'karaoke',
    name: 'Karaoke',
    description: 'Interactive karaoke system with thousands of songs',
    features: ['10,000+ Songs', 'Professional Microphones', '2-Screen Setup', 'Song Requests'],
    priceRange: { min: 200, max: 500 },
    duration: '3-6 hours',
    category: 'entertainment',
    image: '/images/karaoke-service.jpg',
    popular: false
  },
  {
    id: 'photography',
    name: 'Photography',
    description: 'Professional event photography and videography',
    features: ['Professional Photographer', '200+ Digital Photos', 'Online Gallery', 'Print Package'],
    priceRange: { min: 400, max: 1000 },
    duration: '2-6 hours',
    category: 'media',
    image: '/images/photography-service.jpg',
    popular: true
  }
];

describe('ServiceSelector', () => {
  const mockOnChange = jest.fn();
  const mockOnSelectionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all services with proper information', () => {
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('DJ Services')).toBeInTheDocument();
    expect(screen.getByText('Karaoke')).toBeInTheDocument();
    expect(screen.getByText('Photography')).toBeInTheDocument();
    
    // Check descriptions
    expect(screen.getByText('Professional DJ with premium sound system and lighting')).toBeInTheDocument();
    
    // Check price ranges
    expect(screen.getByText('$300 - $800')).toBeInTheDocument();
    expect(screen.getByText('$200 - $500')).toBeInTheDocument();
    expect(screen.getByText('$400 - $1000')).toBeInTheDocument();
  });

  it('displays popular badge for popular services', () => {
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
      />
    );

    const popularBadges = screen.getAllByText('Popular');
    expect(popularBadges).toHaveLength(2); // DJ and Photography are popular
  });

  it('shows service features when expanded', async () => {
    const user = userEvent.setup();
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
      />
    );

    // Click to expand DJ service
    const djCard = screen.getByText('DJ Services').closest('[data-testid="service-card"]');
    const expandButton = djCard?.querySelector('[aria-label*="expand"]') || djCard?.querySelector('button');
    
    if (expandButton) {
      await user.click(expandButton);
      
      await waitFor(() => {
        expect(screen.getByText('Premium Sound System')).toBeInTheDocument();
        expect(screen.getByText('4-Hour Set')).toBeInTheDocument();
        expect(screen.getByText('Lighting Package')).toBeInTheDocument();
        expect(screen.getByText('Music Requests')).toBeInTheDocument();
      });
    }
  });

  it('handles service selection and deselection', async () => {
    const user = userEvent.setup();
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
      />
    );

    // Select DJ service
    const djCheckbox = screen.getByLabelText(/dj services/i);
    await user.click(djCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(['dj']);
  });

  it('shows selected services correctly', () => {
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={['dj', 'photography']}
        onChange={mockOnChange}
      />
    );

    const djCheckbox = screen.getByLabelText(/dj services/i) as HTMLInputElement;
    const photographyCheckbox = screen.getByLabelText(/photography/i) as HTMLInputElement;
    const karaokeCheckbox = screen.getByLabelText(/karaoke/i) as HTMLInputElement;

    expect(djCheckbox.checked).toBe(true);
    expect(photographyCheckbox.checked).toBe(true);
    expect(karaokeCheckbox.checked).toBe(false);
  });

  it('calculates and displays total pricing', () => {
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={['dj', 'photography']}
        onChange={mockOnChange}
        showTotal={true}
      />
    );

    // Total should be DJ (300-800) + Photography (400-1000) = 700-1800
    expect(screen.getByText(/Total Estimated:/)).toBeInTheDocument();
    expect(screen.getByText(/\$700 - \$1,800/)).toBeInTheDocument();
  });

  it('supports different layout modes', () => {
    const { rerender } = render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
        layout="grid"
      />
    );

    // Check grid layout
    const container = screen.getByTestId('service-selector');
    expect(container).toHaveClass('grid');

    // Switch to list layout
    rerender(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
        layout="list"
      />
    );

    expect(container).toHaveClass('space-y-4');
  });

  it('handles category filtering', () => {
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
        categories={['entertainment']}
      />
    );

    // Should show DJ and Karaoke (entertainment), but not Photography (media)
    expect(screen.getByText('DJ Services')).toBeInTheDocument();
    expect(screen.getByText('Karaoke')).toBeInTheDocument();
    expect(screen.queryByText('Photography')).not.toBeInTheDocument();
  });

  it('shows duration information', () => {
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
        showDuration={true}
      />
    );

    expect(screen.getByText('4-8 hours')).toBeInTheDocument();
    expect(screen.getByText('3-6 hours')).toBeInTheDocument();
    expect(screen.getByText('2-6 hours')).toBeInTheDocument();
  });

  it('supports maximum selection limit', async () => {
    const user = userEvent.setup();
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={['dj', 'photography']}
        onChange={mockOnChange}
        maxSelection={2}
        onSelectionError={mockOnSelectionChange}
      />
    );

    // Try to select third service (Karaoke)
    const karaokeCheckbox = screen.getByLabelText(/karaoke/i);
    await user.click(karaokeCheckbox);

    expect(mockOnSelectionChange).toHaveBeenCalledWith('Maximum 2 services can be selected.');
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('displays custom pricing when provided', () => {
    const customServices = [
      {
        ...mockServices[0],
        customPrice: 599
      }
    ];

    render(
      <ServiceSelector 
        services={customServices}
        selectedServices={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('$599')).toBeInTheDocument();
    expect(screen.queryByText('$300 - $800')).not.toBeInTheDocument();
  });

  it('shows discount information when available', () => {
    const discountedServices = [
      {
        ...mockServices[0],
        discount: {
          percentage: 20,
          validUntil: '2024-12-31',
          description: 'Holiday Special'
        }
      }
    ];

    render(
      <ServiceSelector 
        services={discountedServices}
        selectedServices={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('20% OFF')).toBeInTheDocument();
    expect(screen.getByText('Holiday Special')).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
      />
    );

    const djCheckbox = screen.getByLabelText(/dj services/i);
    djCheckbox.focus();

    await user.keyboard(' '); // Space to select
    expect(mockOnChange).toHaveBeenCalledWith(['dj']);

    await user.keyboard('{Tab}'); // Tab to next service
    const karaokeCheckbox = screen.getByLabelText(/karaoke/i);
    expect(karaokeCheckbox).toHaveFocus();
  });

  it('displays service unavailable state', () => {
    const unavailableServices = [
      {
        ...mockServices[0],
        available: false,
        unavailableReason: 'Booked until Jan 2025'
      }
    ];

    render(
      <ServiceSelector 
        services={unavailableServices}
        selectedServices={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Booked until Jan 2025')).toBeInTheDocument();
    
    const djCheckbox = screen.getByLabelText(/dj services/i);
    expect(djCheckbox).toBeDisabled();
  });

  it('supports custom service recommendations', () => {
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={['dj']}
        onChange={mockOnChange}
        recommendations={['photography']}
      />
    );

    expect(screen.getByText(/Recommended/)).toBeInTheDocument();
  });

  it('shows package deals when multiple services are selected', () => {
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={['dj', 'photography']}
        onChange={mockOnChange}
        packageDeals={[
          {
            services: ['dj', 'photography'],
            discount: 15,
            name: 'Entertainment Package'
          }
        ]}
      />
    );

    expect(screen.getByText('Entertainment Package')).toBeInTheDocument();
    expect(screen.getByText('15% off')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={[]}
        onChange={mockOnChange}
        label="Select Event Services"
        required={true}
      />
    );

    const fieldset = screen.getByRole('group');
    expect(fieldset).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('Select Event Services')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('aria-describedby');
    });
  });

  it('supports external price calculation', () => {
    const mockCalculatePrice = jest.fn().mockReturnValue({ min: 500, max: 900 });
    
    render(
      <ServiceSelector 
        services={mockServices}
        selectedServices={['dj']}
        onChange={mockOnChange}
        calculatePrice={mockCalculatePrice}
      />
    );

    expect(mockCalculatePrice).toHaveBeenCalledWith(['dj'], mockServices);
  });
});