'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface Photo {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category?: string;
  thumbnail?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  columns?: number;
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide';
  showCategories?: boolean;
  lazyLoad?: boolean;
  loading?: boolean;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  dj: 'DJ',
  karaoke: 'Karaoke',
  photography: 'Photography',
  wedding: 'Wedding',
  corporate: 'Corporate',
  party: 'Party',
};

const ASPECT_RATIO_CLASSES = {
  auto: 'aspect-auto',
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[16/10]',
};

export function PhotoGallery({
  photos,
  columns = 3,
  aspectRatio = 'auto',
  showCategories = false,
  lazyLoad = false,
  loading = false,
  className = '',
}: PhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Filter photos by category
  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);

  // Get unique categories
  const categories = Array.from(new Set(photos.map(photo => photo.category).filter((cat): cat is string => Boolean(cat))));

  // Handle lightbox navigation
  const openLightbox = (photoIndex: number) => {
    const globalIndex = photos.findIndex(photo => photo.id === filteredPhotos[photoIndex].id);
    setCurrentPhotoIndex(globalIndex);
    setLightboxOpen(true);
    document.body.classList.add('overflow-hidden');
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.classList.remove('overflow-hidden');
  };

  const goToNext = useCallback(() => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goToPrevious = useCallback(() => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) {
      return;
    }

    switch (e.key) {
      case 'Escape':
        closeLightbox();
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
  }, [lightboxOpen, goToNext, goToPrevious]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [handleKeyDown]);

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center text-gray-500">Loading photos...</div>
        <div 
          data-testid="gallery-skeleton"
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i}
              className={`bg-gray-200 rounded-lg animate-pulse ${ASPECT_RATIO_CLASSES[aspectRatio]}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (photos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 text-lg">No photos available</div>
      </div>
    );
  }

  const currentPhoto = photos[currentPhotoIndex];
  const gridColsClass = `grid-cols-${columns}`;

  return (
    <div className={className}>
      {/* Category Filter */}
      {showCategories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-brand-gold text-brand-charcoal'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-brand-gold text-brand-charcoal'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {CATEGORY_LABELS[category] || category}
            </button>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      <div
        role="grid"
        aria-label="Photo gallery"
        className={`grid grid-cols-1 md:grid-cols-2 lg:${gridColsClass} gap-4`}
      >
        {filteredPhotos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="group relative overflow-hidden rounded-lg bg-gray-200 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
            aria-label={`View ${photo.alt} in lightbox`}
          >
            <div 
              data-testid={`thumbnail-${photo.id}`}
              className={`relative ${ASPECT_RATIO_CLASSES[aspectRatio]} overflow-hidden`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnail || photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading={lazyLoad ? 'lazy' : 'eager'}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentPhoto && (
        <div
          data-testid="lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        >
          {/* Overlay - click to close */}
          <div
            data-testid="lightbox-overlay"
            className="absolute inset-0"
            onClick={closeLightbox}
          />

          {/* Content */}
          <div className="relative max-w-7xl max-h-full flex flex-col lg:flex-row gap-6 z-10">
            {/* Image */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <div className="relative max-w-full max-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-testid="lightbox-image"
                  src={currentPhoto.src}
                  alt={currentPhoto.alt}
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                />
              </div>
            </div>

            {/* Info Panel */}
            <div className="lg:w-80 bg-white rounded-lg p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 id="lightbox-title" className="text-lg font-bold text-gray-900">
                  {currentPhoto.alt}
                </h3>
                <button
                  onClick={closeLightbox}
                  aria-label="Close lightbox"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {currentPhoto.caption && (
                <p className="text-gray-600 mb-4 flex-1">{currentPhoto.caption}</p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPrevious}
                  aria-label="Previous photo"
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-sm text-gray-500">
                  {currentPhotoIndex + 1} / {photos.length}
                </span>

                <button
                  onClick={goToNext}
                  aria-label="Next photo"
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