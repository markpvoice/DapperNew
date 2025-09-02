'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OptimizedImage } from './optimized-image';

// Types
export interface ClientLogoData {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  category: string;
  description?: string;
}

export interface ClientLogosDisplayProps {
  logos: ClientLogoData[];
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showNames?: boolean;
  groupByCategory?: boolean;
  clickable?: boolean;
  grayscale?: boolean;
  carousel?: boolean;
  loading?: boolean;
  maxLogos?: number;
  filterByCategory?: string;
  className?: string;
}

export interface LogoCarouselProps {
  logos: ClientLogoData[];
  itemsPerSlide?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  showIndicators?: boolean;
  infinite?: boolean;
  className?: string;
}

export interface ClientLogoProps {
  logo: ClientLogoData;
  showName?: boolean;
  showDescription?: boolean;
  clickable?: boolean;
  grayscale?: boolean;
  size?: 'small' | 'medium' | 'large';
  hoverEffect?: 'none' | 'lift' | 'scale' | 'glow';
  className?: string;
}

// Mock client logos data
const MOCK_CLIENT_LOGOS: ClientLogoData[] = [
  {
    id: '1',
    name: 'Vantage Labs',
    logoUrl: '/images/clients/vantage-labs.png',
    websiteUrl: 'https://vantagelabs.com',
    category: 'Corporate',
    description: 'Tech startup corporate events and team building',
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
  {
    id: '5',
    name: 'United Center',
    logoUrl: '/images/clients/united-center.png',
    websiteUrl: 'https://unitedcenter.com',
    category: 'Entertainment',
    description: 'Arena corporate events and VIP experiences',
  },
  {
    id: '6',
    name: 'Loyola University',
    logoUrl: '/images/clients/loyola.png',
    websiteUrl: 'https://luc.edu',
    category: 'Education',
    description: 'University events and commencement ceremonies',
  },
  {
    id: '7',
    name: 'Chicago Cubs',
    logoUrl: '/images/clients/cubs.png',
    websiteUrl: 'https://cubs.com',
    category: 'Sports',
    description: 'Stadium events and corporate hospitality',
  },
  {
    id: '8',
    name: 'Accenture',
    logoUrl: '/images/clients/accenture.png',
    websiteUrl: 'https://accenture.com',
    category: 'Corporate',
    description: 'Global consulting firm corporate events',
  },
];

// Utility functions
const getGridColsClasses = (columns: { mobile: number; tablet: number; desktop: number }) => {
  const mobileClass = `grid-cols-${columns.mobile}`;
  const tabletClass = `md:grid-cols-${columns.tablet}`;
  const desktopClass = `lg:grid-cols-${columns.desktop}`;
  return `${mobileClass} ${tabletClass} ${desktopClass}`;
};

const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return 'h-12 w-auto max-w-24';
    case 'large':
      return 'h-24 w-auto max-w-48';
    default:
      return 'h-16 w-auto max-w-32';
  }
};

const getHoverEffectClasses = (effect: string) => {
  switch (effect) {
    case 'lift':
      return 'hover:-translate-y-1 hover:shadow-lg';
    case 'scale':
      return 'hover:scale-110';
    case 'glow':
      return 'hover:shadow-xl hover:shadow-brand-gold/20';
    default:
      return '';
  }
};

// Individual Client Logo Component
export function ClientLogo({
  logo,
  showName = false,
  showDescription = false,
  clickable = false,
  grayscale = false,
  size = 'medium',
  hoverEffect = 'none',
  className = '',
}: ClientLogoProps) {
  const handleClick = () => {
    if (clickable && logo.websiteUrl) {
      window.open(logo.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const logoInitials = logo.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();

  const Component = clickable ? 'button' : 'div';

  return (
    <Component
      data-testid="client-logo"
      onClick={clickable ? handleClick : undefined}
      aria-label={clickable ? `Visit ${logo.name} website` : undefined}
      className={`
        group flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300
        ${grayscale ? 'grayscale hover:grayscale-0' : ''}
        ${getHoverEffectClasses(hoverEffect)}
        ${clickable ? 'cursor-pointer hover:bg-gray-50' : ''}
        ${className}
      `}
    >
      {/* Logo Image */}
      <div className={`relative flex items-center justify-center ${getSizeClasses(size)}`}>
        {logo.logoUrl ? (
          <OptimizedImage
            src={logo.logoUrl}
            alt={`${logo.name} logo`}
            width={128}
            height={64}
            objectFit="contain"
            className="transition-all duration-300"
          />
        ) : (
          // Fallback to initials if no logo
          <div className="bg-brand-gold text-brand-charcoal rounded-lg flex items-center justify-center font-bold text-lg h-16 w-16">
            {logoInitials}
          </div>
        )}
      </div>

      {/* Client Name */}
      {showName && (
        <h3 className="mt-3 text-sm font-semibold text-gray-900 text-center group-hover:text-brand-gold transition-colors">
          {logo.name}
        </h3>
      )}

      {/* Description */}
      {showDescription && logo.description && (
        <p className="mt-1 text-xs text-gray-500 text-center line-clamp-2">
          {logo.description}
        </p>
      )}
    </Component>
  );
}

// Logo Carousel Component
export function LogoCarousel({
  logos,
  itemsPerSlide = 4,
  autoplay = false,
  autoplayInterval = 3000,
  showIndicators = false,
  infinite = true,
  className = '',
}: LogoCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalSlides = Math.ceil(logos.length / itemsPerSlide);

  const nextSlide = useCallback(() => {
    if (infinite) {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    } else {
      setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
    }
  }, [totalSlides, infinite]);

  const prevSlide = useCallback(() => {
    if (infinite) {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    } else {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }
  }, [totalSlides, infinite]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || isHovered) {
      return;
    }

    const interval = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, isHovered, nextSlide]);

  const getCurrentSlideLogos = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return logos.slice(startIndex, startIndex + itemsPerSlide);
  };

  return (
    <div
      data-testid="logo-carousel"
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logos */}
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-500 ease-in-out">
          {getCurrentSlideLogos().map((logo) => (
            <div key={logo.id} className="flex-shrink-0 w-1/4">
              <ClientLogo
                logo={logo}
                clickable
                grayscale
                hoverEffect="lift"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous logos"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next logos"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      {showIndicators && totalSlides > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentSlide 
                  ? 'bg-brand-gold' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Main Client Logos Display Component
export function ClientLogosDisplay({
  logos = MOCK_CLIENT_LOGOS,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  showNames = false,
  groupByCategory = false,
  clickable = true,
  grayscale = true,
  carousel = false,
  loading = false,
  maxLogos,
  filterByCategory,
  className = '',
}: ClientLogosDisplayProps) {
  // Filter and limit logos
  let displayedLogos = logos;
  
  if (filterByCategory) {
    displayedLogos = displayedLogos.filter(logo => logo.category === filterByCategory);
  }
  
  if (maxLogos) {
    displayedLogos = displayedLogos.slice(0, maxLogos);
  }

  // Group by category if needed
  const groupedLogos = groupByCategory
    ? displayedLogos.reduce((groups, logo) => {
        const category = logo.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(logo);
        return groups;
      }, {} as Record<string, ClientLogoData[]>)
    : null;

  if (loading) {
    return (
      <div className={className}>
        <div className="text-center text-gray-500 mb-6">Loading client logos...</div>
        <div 
          data-testid="logos-skeleton"
          className={`grid ${getGridColsClasses(columns)} gap-6`}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (displayedLogos.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">No client logos to display</div>
      </div>
    );
  }

  if (carousel) {
    return (
      <div className={className}>
        <LogoCarousel 
          logos={displayedLogos}
          autoplay
          showIndicators
          infinite
        />
      </div>
    );
  }

  return (
    <div 
      role="region"
      aria-label="Client logos"
      className={className}
    >
      {groupByCategory && groupedLogos ? (
        // Grouped display
        <div className="space-y-12">
          {Object.entries(groupedLogos).map(([category, categoryLogos]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                {category}
              </h3>
              <div 
                data-testid="logos-grid"
                className={`grid ${getGridColsClasses(columns)} gap-6`}
              >
                {categoryLogos.map((logo) => (
                  <ClientLogo
                    key={logo.id}
                    logo={logo}
                    showName={showNames}
                    clickable={clickable}
                    grayscale={grayscale}
                    hoverEffect="lift"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Standard grid display
        <div 
          data-testid="logos-grid"
          className={`grid ${getGridColsClasses(columns)} gap-6`}
        >
          {displayedLogos.map((logo) => (
            <ClientLogo
              key={logo.id}
              logo={logo}
              showName={showNames}
              clickable={clickable}
              grayscale={grayscale}
              hoverEffect="lift"
            />
          ))}
        </div>
      )}
    </div>
  );
}