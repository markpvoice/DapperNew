/**
 * @fileoverview Service Preview Modal Component
 * 
 * Modal that displays detailed service information:
 * - Photo gallery with lightbox functionality
 * - Video content with thumbnails and player
 * - Customer testimonials and ratings
 * - Equipment details and setup requirements
 * - Service selection and custom quote options
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

interface ServicePreviewModalProps {
  isOpen: boolean;
  serviceId: string;
  serviceName?: string;
  onClose: () => void;
  onSelect?: (_serviceId: string) => void;
  loading?: boolean;
  helpDataError?: boolean;
}

// Mock service data - in real app this would come from API/CMS
const SERVICE_DATA = {
  dj: {
    name: 'DJ Services',
    priceRange: '$300 - $800',
    tagline: 'Turn your event into an unforgettable celebration',
    highlights: ['15,000+ song library', 'Professional lighting', 'Wireless microphones', 'Custom playlists'],
    photos: [
      { id: 0, src: '/images/dj-setup-1.jpg', alt: 'Professional DJ setup with premium equipment at wedding venue', fallback: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop' },
      { id: 1, src: '/images/dj-mixing-1.jpg', alt: 'DJ mixing tracks live at corporate event', fallback: 'https://images.unsplash.com/photo-1571266028243-ae4b4726c96e?w=800&h=600&fit=crop' },
      { id: 2, src: '/images/dj-lights-1.jpg', alt: 'DJ performing with LED lighting display', fallback: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop' },
      { id: 3, src: '/images/dj-crowd-1.jpg', alt: 'Packed dance floor at wedding reception', fallback: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop' },
      { id: 4, src: '/images/dj-equipment-1.jpg', alt: 'Professional DJ mixing console and equipment', fallback: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=600&fit=crop' },
      { id: 5, src: '/images/dj-booth-1.jpg', alt: 'DJ booth setup at outdoor wedding celebration', fallback: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop' }
    ],
    videos: [
      { id: 0, title: 'DJ Setup Process', duration: '2:15', thumbnail: '/images/video-thumb-1.jpg', src: '/videos/dj-setup.mp4' },
      { id: 1, title: 'Wedding Reception Mix', duration: '3:45', thumbnail: '/images/video-thumb-2.jpg', src: '/videos/wedding-mix.mp4' },
      { id: 2, title: 'Corporate Event Highlights', duration: '1:30', thumbnail: '/images/video-thumb-3.jpg', src: '/videos/corporate-event.mp4' }
    ],
    testimonials: [
      { id: 0, name: 'Sarah & Mike Johnson', text: 'Absolutely incredible DJ service! Our wedding dance floor was packed all night.', rating: 5, eventType: 'Wedding', photo: '/images/client-1.jpg' },
      { id: 1, name: 'Corporate Events LLC', text: 'Professional, punctual, and perfectly matched our corporate event needs.', rating: 5, eventType: 'Corporate', photo: '/images/client-2.jpg' },
      { id: 2, name: 'Lisa Martinez', text: 'Made my birthday party unforgettable. Great music selection and energy!', rating: 5, eventType: 'Birthday', photo: '/images/client-3.jpg' }
    ],
    equipment: [
      { id: 'speakers', name: 'Professional Sound System', description: 'High-quality speakers with crystal clear audio' },
      { id: 'lights', name: 'LED Lighting Package', description: 'Color-changing lights to match your event mood' },
      { id: 'mixer', name: 'DJ Mixing Console', description: 'Professional-grade mixing equipment' },
      { id: 'microphone', name: 'Wireless Microphones', description: 'For announcements and speeches' }
    ],
    setup: {
      time: '2 hours',
      space: '8x8 feet',
      power: '2 standard outlets'
    },
    variations: [
      { id: 'basic', name: 'Basic Package', price: '$300-500', description: '4-hour service with sound system' },
      { id: 'premium', name: 'Premium Package', price: '$600-800', description: '6-hour service with lights and extended music library' }
    ],
    faq: [
      { id: 0, question: 'How many songs are in your library?', answer: 'Over 10,000 songs across all genres and decades' },
      { id: 1, question: 'Can you take song requests?', answer: 'Absolutely! We encourage song requests and can prepare specific playlists' },
      { id: 2, question: 'Do you provide microphones?', answer: 'Yes, wireless microphones are included for announcements' },
      { id: 3, question: 'How early do you arrive?', answer: 'We typically arrive 2 hours before your event to set up' }
    ]
  },
  karaoke: {
    name: 'Karaoke',
    priceRange: '$200 - $500',
    tagline: 'Get the party singing with interactive entertainment',
    highlights: ['5,000+ karaoke tracks', 'Scoring system', 'Multi-language songs', 'Wireless microphones'],
    photos: [
      { id: 0, src: '/images/karaoke-1.jpg', alt: 'Professional karaoke setup at party venue', fallback: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop' },
      { id: 1, src: '/images/karaoke-2.jpg', alt: 'Group of friends enjoying karaoke night', fallback: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop' },
      { id: 2, src: '/images/karaoke-3.jpg', alt: 'Professional karaoke equipment and screen', fallback: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=600&fit=crop' }
    ],
    videos: [
      { id: 0, title: 'Karaoke Party Fun', duration: '2:30', thumbnail: '/images/karaoke-thumb-1.jpg', src: '/videos/karaoke-fun.mp4' }
    ],
    testimonials: [
      { id: 0, name: 'Party Hosts Inc', text: 'Everyone loved the karaoke! Great song selection.', rating: 5, eventType: 'Corporate', photo: '/images/client-4.jpg' }
    ],
    equipment: [
      { id: 'karaoke-system', name: 'Karaoke Machine', description: 'Professional karaoke system with scoring' },
      { id: 'songs', name: 'Song Library', description: '5,000+ karaoke tracks' }
    ],
    setup: {
      time: '1 hour',
      space: '6x6 feet',
      power: '1 standard outlet'
    },
    variations: [
      { id: 'basic', name: 'Basic Package', price: '$200-350', description: '3-hour karaoke with standard library' },
      { id: 'premium', name: 'Premium Package', price: '$400-500', description: '5-hour karaoke with extended library and games' }
    ],
    faq: [
      { id: 0, question: 'How many songs are available?', answer: 'Over 5,000 karaoke tracks in multiple languages' }
    ]
  },
  photography: {
    name: 'Photography',
    priceRange: '$300 - $800',
    tagline: 'Capture every precious moment of your special day',
    highlights: ['Professional equipment', 'Digital gallery', 'Same-day highlights', 'Print packages'],
    photos: [
      { id: 0, src: '/images/photo-1.jpg', alt: 'Professional event photographer capturing wedding moments', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop' },
      { id: 1, src: '/images/photo-2.jpg', alt: 'Beautiful wedding photography composition', fallback: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop' },
      { id: 2, src: '/images/photo-3.jpg', alt: 'Corporate event professional photography', fallback: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop' }
    ],
    videos: [
      { id: 0, title: 'Photography Highlights', duration: '1:45', thumbnail: '/images/photo-thumb-1.jpg', src: '/videos/photography.mp4' }
    ],
    testimonials: [
      { id: 0, name: 'Happy Couple', text: 'Beautiful photos that captured our special day perfectly!', rating: 5, eventType: 'Wedding', photo: '/images/client-5.jpg' }
    ],
    equipment: [
      { id: 'camera', name: 'Professional Cameras', description: 'High-end DSLR cameras with multiple lenses' },
      { id: 'lighting', name: 'Studio Lighting', description: 'Portable lighting equipment for any venue' }
    ],
    setup: {
      time: '30 minutes',
      space: 'Minimal space needed',
      power: 'Battery powered'
    },
    variations: [
      { id: 'basic', name: 'Basic Package', price: '$300-500', description: '4-hour photography with digital gallery' },
      { id: 'premium', name: 'Premium Package', price: '$600-800', description: '6-hour photography with prints and album' }
    ],
    faq: [
      { id: 0, question: 'When will I receive my photos?', answer: 'Digital gallery available within 48 hours' }
    ]
  }
};

export function ServicePreviewModal({
  isOpen,
  serviceId,
  serviceName,
  onClose,
  onSelect,
  loading = false,
  helpDataError = false
}: ServicePreviewModalProps) {
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [testimonialSlide, setTestimonialSlide] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const serviceData = SERVICE_DATA[serviceId as keyof typeof SERVICE_DATA];

  // Focus management
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'Tab':
          // Focus trap logic would go here
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const openLightbox = useCallback((imageId: number) => {
    setLightboxImage(imageId);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxImage(null);
  }, []);

  const playVideo = useCallback((videoId: number) => {
    setCurrentVideoId(videoId);
  }, []);

  const handleServiceSelect = useCallback(() => {
    if (onSelect) {
      onSelect(serviceId);
    }
    onClose();
  }, [onSelect, serviceId, onClose]);

  const nextTestimonial = useCallback(() => {
    if (serviceData?.testimonials) {
      setTestimonialSlide((prev) => (prev + 1) % serviceData.testimonials.length);
    }
  }, [serviceData?.testimonials]);

  const prevTestimonial = useCallback(() => {
    if (serviceData?.testimonials) {
      setTestimonialSlide((prev) => (prev - 1 + serviceData.testimonials.length) % serviceData.testimonials.length);
    }
  }, [serviceData?.testimonials]);

  if (!isOpen) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="modal-backdrop">
        <div className="bg-white rounded-lg p-6" data-testid="service-preview-modal">
          <div data-testid="content-loading">
            <div data-testid="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (helpDataError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="modal-backdrop">
        <div className="bg-white rounded-lg p-6" data-testid="service-preview-modal">
          <div className="text-center">
            <h2 className="text-xl font-bold text-brand-charcoal mb-4">Service Information Unavailable</h2>
            <p className="text-brand-dark-gray mb-4">For assistance, please call us at (555) 123-4567</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-brand-gold text-white rounded hover:bg-brand-dark-gold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return null;
  }

  return (
    <>
      {/* Modal backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        data-testid="modal-backdrop"
      >
        {/* Modal content */}
        <div 
          ref={modalRef}
          className="bg-white rounded-lg max-w-full mx-4 sm:max-w-4xl sm:mx-auto max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
          data-testid="service-preview-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 id="modal-title" className="text-2xl font-bold text-brand-charcoal" data-testid="modal-title">
              {serviceName || serviceData.name}
            </h2>
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
              aria-label="Close modal"
              data-testid="close-button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Service tagline and highlights */}
            <div className="text-center space-y-4">
              <div className="text-lg text-brand-dark-gray italic" data-testid="service-tagline">
                {serviceData.tagline}
              </div>
              
              {/* Service highlights */}
              <div className="flex flex-wrap justify-center gap-3" data-testid="service-highlights">
                {serviceData.highlights?.map((highlight, index) => (
                  <div key={index} className="bg-brand-gold bg-opacity-10 text-brand-charcoal px-3 py-1 rounded-full text-sm font-medium">
                    ✨ {highlight}
                  </div>
                ))}
              </div>
              
              {/* Price range badge */}
              <div className="inline-block bg-green-50 text-green-700 px-4 py-2 rounded-lg font-semibold border border-green-200">
                {serviceData.priceRange}
              </div>
            </div>

            {/* Hero image with fallback */}
            <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={serviceData.photos[0]?.fallback || serviceData.photos[0]?.src || '/images/placeholder.jpg'}
                alt={serviceData.photos[0]?.alt || 'Service preview'}
                className="w-full h-full object-cover"
                loading="eager"
                data-testid="hero-image"
                onError={(e) => {
                  // Try fallback image if primary fails
                  if (serviceData.photos[0]?.fallback && e.currentTarget.src !== serviceData.photos[0].fallback) {
                    e.currentTarget.src = serviceData.photos[0].fallback;
                  }
                }}
              />
            </div>

            {/* Photo Gallery */}
            <section role="region" aria-labelledby="photo-gallery-title">
              <h3 id="photo-gallery-title" className="text-xl font-semibold text-brand-charcoal mb-4" data-testid="photo-gallery-title">
                Photo Gallery
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" data-testid="photo-gallery">
                {serviceData.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => openLightbox(photo.id)}
                    className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                    data-testid={`photo-${index}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(photo.id);
                      }
                    }}
                  >
                    <img
                      src={photo.fallback || photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Try fallback image if primary fails
                        if (photo.fallback && e.currentTarget.src !== photo.fallback) {
                          e.currentTarget.src = photo.fallback;
                        } else {
                          console.warn(`Failed to load image: ${photo.src}`);
                        }
                      }}
                    />
                    {/* Fallback for broken images */}
                    <div className="hidden" data-testid={`photo-fallback-${index}`}>
                      Image unavailable
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Video Section */}
            <section role="region" aria-labelledby="video-section-title">
              <h3 id="video-section-title" className="text-xl font-semibold text-brand-charcoal mb-4" data-testid="video-section-title">
                See Us in Action
              </h3>
              <div data-testid="video-section">
                {currentVideoId !== null ? (
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full"
                      data-testid="video-player"
                      data-fullscreen="false"
                      data-preload="none"
                      onError={() => {
                        console.warn('Video loading error');
                      }}
                    >
                      <source src={serviceData.videos.find(v => v.id === currentVideoId)?.src} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <button
                      className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded"
                      data-testid="fullscreen-button"
                      onClick={() => {
                        const video = document.querySelector('[data-testid="video-player"]') as HTMLVideoElement;
                        if (video) {
                          video.setAttribute('data-fullscreen', 'true');
                        }
                      }}
                    >
                      ⛶
                    </button>
                    <div className="hidden text-red-600" data-testid="video-error-message">
                      Video temporarily unavailable
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {serviceData.videos.map((video, index) => (
                      <button
                        key={video.id}
                        onClick={() => playVideo(video.id)}
                        className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                        data-testid={`video-thumbnail-${index}`}
                      >
                        <img
                          src={video.thumbnail}
                          alt={`${video.title} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 rounded-full p-3" data-testid="play-button">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded" data-testid="video-duration">
                          {video.duration}
                        </div>
                        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded" data-testid="video-title">
                          {video.title}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Testimonials */}
            <section role="region" aria-labelledby="testimonials-title">
              <h3 id="testimonials-title" className="text-xl font-semibold text-brand-charcoal mb-4" data-testid="testimonials-title">
                What Clients Say
              </h3>
              <div data-testid="testimonials-section">
                <div className="relative" data-testid="testimonials-carousel" data-current-slide={testimonialSlide}>
                  {serviceData.testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className={`${index === testimonialSlide ? 'block' : 'hidden'} bg-gray-50 p-6 rounded-lg`}
                      data-testid={`testimonial-${index}`}
                    >
                      <div className="flex items-start space-x-4">
                        {testimonial.photo && (
                          <img
                            src={testimonial.photo}
                            alt={`Client ${testimonial.name}`}
                            className="w-12 h-12 rounded-full object-cover"
                            data-testid="client-photo"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400" data-testid="star-rating">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-brand-dark-gray" data-testid="event-type">
                              {testimonial.eventType}
                            </span>
                          </div>
                          <p className="text-brand-charcoal mb-2" data-testid="testimonial-text">
                            "{testimonial.text}"
                          </p>
                          <p className="text-sm text-brand-dark-gray" data-testid="client-name">
                            — {testimonial.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Navigation buttons */}
                {serviceData.testimonials.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    <button
                      onClick={prevTestimonial}
                      className="p-2 text-brand-charcoal hover:text-brand-gold"
                      data-testid="testimonials-prev"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="p-2 text-brand-charcoal hover:text-brand-gold"
                      data-testid="testimonials-next"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Equipment & Setup */}
            <section role="region" aria-labelledby="equipment-title">
              <h3 id="equipment-title" className="text-xl font-semibold text-brand-charcoal mb-4" data-testid="equipment-title">
                Equipment & Setup
              </h3>
              <div data-testid="equipment-section">
                {/* Equipment list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" data-testid="equipment-list">
                  {serviceData.equipment.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg" data-testid={`equipment-item-${item.id}`}>
                      <h4 className="font-medium text-brand-charcoal">{item.name}</h4>
                      <p className="text-sm text-brand-dark-gray">{item.description}</p>
                    </div>
                  ))}
                </div>

                {/* Setup requirements */}
                <div className="bg-blue-50 p-4 rounded-lg" data-testid="setup-requirements">
                  <h4 className="font-medium text-brand-charcoal mb-2">Setup Requirements</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-brand-dark-gray">
                    <div data-testid="setup-time">
                      <strong>Setup Time:</strong> {serviceData.setup.time}
                    </div>
                    <div data-testid="space-needed">
                      <strong>Space Needed:</strong> {serviceData.setup.space}
                    </div>
                    <div data-testid="power-requirements">
                      <strong>Power:</strong> {serviceData.setup.power}
                    </div>
                  </div>
                </div>

                {/* Service variations */}
                <div className="mt-6" data-testid="service-variations">
                  <h4 className="font-medium text-brand-charcoal mb-3">Available Packages</h4>
                  <div className="space-y-3">
                    {serviceData.variations.map((variation) => (
                      <div key={variation.id} className="border border-gray-200 p-4 rounded-lg" data-testid={`variation-${variation.id}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-brand-charcoal">{variation.name}</h5>
                          <span className="text-brand-gold font-medium">{variation.price}</span>
                        </div>
                        <p className="text-sm text-brand-dark-gray">{variation.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section role="region" aria-labelledby="faq-title">
              <h3 id="faq-title" className="text-xl font-semibold text-brand-charcoal mb-4">Frequently Asked Questions</h3>
              <div data-testid="faq-section">
                {serviceData.faq.map((item) => (
                  <div key={item.id} className="border-b border-gray-200 pb-4 mb-4" data-testid={`faq-item-${item.id}`}>
                    <h4 className="font-medium text-brand-charcoal mb-2">{item.question}</h4>
                    <p className="text-brand-dark-gray">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleServiceSelect}
                className="flex-1 bg-brand-gold hover:bg-brand-dark-gold text-white px-6 py-3 rounded-lg font-medium transition-colors min-h-[44px] touch-manipulation"
                data-testid="select-service-button"
              >
                Select {serviceData.name}
                <span className="ml-2 text-sm" data-testid="price-range">
                  {serviceData.priceRange}
                </span>
              </button>
              <button
                className="px-6 py-3 border border-brand-gold text-brand-gold hover:bg-brand-light-gray rounded-lg font-medium transition-colors min-h-[44px] touch-manipulation"
                data-testid="custom-quote-button"
              >
                Get Custom Quote
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
          onClick={closeLightbox}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeLightbox();
            }
          }}
          data-testid="photo-lightbox"
        >
          <img
            src={serviceData.photos.find(p => p.id === lightboxImage)?.src}
            alt={serviceData.photos.find(p => p.id === lightboxImage)?.alt}
            className="max-w-full max-h-full object-contain"
            data-testid="lightbox-image"
          />
        </div>
      )}
    </>
  );
}