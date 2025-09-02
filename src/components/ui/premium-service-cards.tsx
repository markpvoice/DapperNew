'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ServiceFeature {
  id: string;
  name: string;
  description: string;
  features: string[];
  priceRange: string;
  duration: string;
  popular: boolean;
  gradient: string;
  iconType: 'music' | 'microphone' | 'camera';
}

interface PremiumServiceCardsProps {
  onServiceSelect: (_serviceId: string) => void;
  selectedServices: string[];
  className?: string;
  services?: ServiceFeature[];
}

// Default service data
const defaultServices: ServiceFeature[] = [
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

// Custom SVG Icons
const ServiceIcon: React.FC<{ type: 'music' | 'microphone' | 'camera'; className?: string }> = ({ type, className = '' }) => {
  const baseClasses = `w-8 h-8 ${className}`;
  
  switch (type) {
    case 'music':
      return (
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className={baseClasses}
          data-testid="service-icon-dj"
        >
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      );
    case 'microphone':
      return (
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className={baseClasses}
          data-testid="service-icon-karaoke"
        >
          <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6.7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-1.9 1.9c.03.15.05.3.05.46v.44c0 2.8-2.2 5.07-5 5.07S6 15.28 6 12.5v-.44c0-.16.02-.31.05-.46L4.16 9.66c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L7.5 10.2c.15-.1.3-.18.46-.24L12 7l4.04 2.96c.16.06.31.14.46.24l1.94-1.94z"/>
        </svg>
      );
    case 'camera':
      return (
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className={baseClasses}
          data-testid="service-icon-photography"
        >
          <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-1.8c1.77 0 3.2-1.43 3.2-3.2s-1.43-3.2-3.2-3.2S8.8 10.23 8.8 12s1.43 3.2 3.2 3.2z"/>
        </svg>
      );
    default:
      return null;
  }
};

const PremiumServiceCard: React.FC<{
  service: ServiceFeature;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ service, isSelected, onSelect }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentCardRef = cardRef.current;
    if (currentCardRef) {
      observer.observe(currentCardRef);
    }

    return () => {
      if (currentCardRef) {
        observer.unobserve(currentCardRef);
      }
    };
  }, []);

  const handleClick = () => {
    try {
      onSelect();
    } catch (error) {
      console.error('Error in card selection:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const handleMouseEnter = () => {
    setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    setIsFlipped(false);
  };

  return (
    <div
      ref={cardRef}
      className={`
        relative min-h-[20rem] p-6 sm:p-8 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl
        bg-gradient-to-br ${service.gradient}
        transition-all duration-300 ease-in-out transform-gpu
        hover:scale-105 hover:-translate-y-2
        cursor-pointer group
        focus:outline-none focus:ring-4 focus:ring-brand-gold focus:ring-opacity-50
        ${isSelected ? 'ring-4 ring-brand-gold ring-opacity-60' : ''}
        ${isVisible ? 'animate-fade-in' : 'opacity-0'}
      `}
      data-testid={`service-card-${service.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${service.name} - ${service.description} - ${service.priceRange}`}
      aria-describedby={`service-description-${service.id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Popular Badge */}
      {service.popular && (
        <div className="absolute top-4 right-4 bg-brand-gold text-brand-charcoal px-3 py-1 rounded-full text-sm font-bold z-10">
          Popular
        </div>
      )}

      {/* Selected Checkmark */}
      {isSelected && (
        <div 
          className="absolute top-4 left-4 w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center z-10"
          data-testid={`selected-checkmark-${service.id}`}
        >
          <svg className="w-4 h-4 text-brand-charcoal" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Card Content Container */}
      <div className="relative h-full flex flex-col">
        {/* Front Side */}
        <div className={`absolute inset-0 transition-all duration-300 ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
          <div className="h-full flex flex-col text-white">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ServiceIcon type={service.iconType} className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4">
              {service.name}
            </h3>
            
            <p 
              id={`service-description-${service.id}`}
              className="text-sm sm:text-base leading-relaxed text-center text-white text-opacity-90 flex-grow"
            >
              {service.description}
            </p>
          </div>
        </div>

        {/* Back Side - Pricing Details */}
        <div className={`absolute inset-0 transition-all duration-300 ${isFlipped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="h-full flex flex-col justify-center text-white">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold mb-2">{service.priceRange}</div>
              <div className="text-sm opacity-80">{service.duration}</div>
            </div>
            
            <div className="space-y-2">
              {service.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PremiumServiceCards: React.FC<PremiumServiceCardsProps> = ({
  onServiceSelect,
  selectedServices,
  className = '',
  services = defaultServices
}) => {
  const handleServiceSelect = (serviceId: string) => {
    try {
      onServiceSelect(serviceId);
    } catch (error) {
      console.error('Error selecting service:', error);
    }
  };

  // Graceful handling of missing services
  const safeServices = services || defaultServices;

  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${className}`}
      data-testid="premium-service-cards"
    >
      {safeServices.map((service) => (
        <PremiumServiceCard
          key={service.id}
          service={service}
          isSelected={selectedServices.includes(service.id)}
          onSelect={() => handleServiceSelect(service.id)}
        />
      ))}
    </div>
  );
};