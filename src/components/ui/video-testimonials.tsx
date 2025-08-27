'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

export interface VideoTestimonial {
  id: string;
  clientName: string;
  eventType: string;
  videoUrl: string;
  thumbnailUrl: string;
  quote: string;
  rating: number;
  eventDate: string;
}

interface VideoTestimonialsProps {
  testimonials: VideoTestimonial[];
  columns?: number;
  loading?: boolean;
  className?: string;
}

// Map columns to proper classes
const getGridColsClass = (cols: number) => {
  switch (cols) {
    case 1: return 'lg:grid-cols-1';
    case 2: return 'lg:grid-cols-2';
    case 4: return 'lg:grid-cols-4';
    case 5: return 'lg:grid-cols-5';
    case 6: return 'lg:grid-cols-6';
    default: return 'lg:grid-cols-3';
  }
};

export function VideoTestimonials({
  testimonials,
  columns = 3,
  loading = false,
  className = '',
}: VideoTestimonialsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Open video modal
  const openModal = (videoIndex: number) => {
    setCurrentVideoIndex(videoIndex);
    setModalOpen(true);
    document.body.classList.add('overflow-hidden');
  };

  // Close video modal
  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.body.classList.remove('overflow-hidden');
    // Pause video when modal closes
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Navigate to next video
  const goToNext = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  // Navigate to previous video
  const goToPrevious = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!modalOpen) {
      return;
    }

    switch (e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
    }
  }, [modalOpen, closeModal, goToNext, goToPrevious]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [handleKeyDown]);

  // Format date for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Render star rating
  const renderStars = (rating: number, testimonialId: string) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        data-testid={`star-icon-${testimonialId}-${i}`}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center text-gray-500 text-lg">Loading testimonials...</div>
        <div 
          data-testid="testimonials-skeleton"
          className={`grid grid-cols-1 md:grid-cols-2 ${getGridColsClass(columns)} gap-6`}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (testimonials.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 text-lg">No testimonials available</div>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentVideoIndex];

  return (
    <div className={className}>
      <div
        role="region"
        aria-label="Video testimonials"
        className={`grid grid-cols-1 md:grid-cols-2 ${getGridColsClass(columns)} gap-6`}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-brand-gold hover:shadow-lg transition-all duration-300"
          >
            {/* Video Thumbnail */}
            <div className="relative mb-4 group">
              <button
                onClick={() => openModal(index)}
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
                aria-label={`Play testimonial video from ${testimonial.clientName}`}
              >
                <Image
                  src={testimonial.thumbnailUrl}
                  alt={`${testimonial.clientName} testimonial thumbnail`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            {/* Client Info */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {testimonial.clientName}
                </h3>
                <div className="flex items-center space-x-1">
                  {renderStars(testimonial.rating, testimonial.id)}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">{testimonial.eventType}</span>
                <span>{formatEventDate(testimonial.eventDate)}</span>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-gray-700 italic leading-relaxed">
              {testimonial.quote}
            </blockquote>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {modalOpen && currentTestimonial && (
        <div
          data-testid="video-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        >
          {/* Overlay - click to close */}
          <div
            data-testid="video-modal-overlay"
            className="absolute inset-0"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative max-w-4xl max-h-full flex flex-col lg:flex-row gap-6 z-10">
            {/* Video Container */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <video
                ref={videoRef}
                data-testid="testimonial-video"
                src={currentTestimonial.videoUrl}
                controls
                preload="metadata"
                className="max-w-full max-h-[70vh] w-auto h-auto rounded-lg"
                poster={currentTestimonial.thumbnailUrl}
              />
            </div>

            {/* Info Panel */}
            <div className="lg:w-80 bg-white rounded-lg p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 id="video-modal-title" className="text-lg font-bold text-gray-900">
                  {currentTestimonial.clientName}
                </h3>
                <button
                  onClick={closeModal}
                  aria-label="Close video"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">{currentTestimonial.eventType}</span>
                  <span>{formatEventDate(currentTestimonial.eventDate)}</span>
                </div>
                <div className="flex items-center space-x-1 mb-3">
                  {renderStars(currentTestimonial.rating, currentTestimonial.id)}
                </div>
                <blockquote className="text-gray-700 italic leading-relaxed">
                  {currentTestimonial.quote}
                </blockquote>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-auto">
                <button
                  onClick={goToPrevious}
                  aria-label="Previous video"
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-sm text-gray-500">
                  {currentVideoIndex + 1} / {testimonials.length}
                </span>

                <button
                  onClick={goToNext}
                  aria-label="Next video"
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}