'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Image from 'next/image';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  lazy?: boolean;
  responsive?: boolean;
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide' | 'tall';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  showLoadingPlaceholder?: boolean;
  showErrorFallback?: boolean;
  showProgressIndicator?: boolean;
  enableRetry?: boolean;
  hoverEffect?: 'none' | 'scale' | 'brightness' | 'opacity';
  generateSrcSet?: boolean;
  autoFormat?: boolean;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  className?: string;
  ariaLabel?: string;
  sizes?: string;
  quality?: number;
}

const ASPECT_RATIO_CLASSES = {
  auto: '',
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[16/10]',
  tall: 'aspect-[3/4]',
};

const OBJECT_FIT_CLASSES = {
  contain: 'object-contain',
  cover: 'object-cover',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

const HOVER_EFFECT_CLASSES = {
  none: '',
  scale: 'hover:scale-105 transition-transform duration-300',
  brightness: 'hover:brightness-110 transition-all duration-300',
  opacity: 'hover:opacity-90 transition-opacity duration-300',
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  lazy = false,
  responsive = true,
  aspectRatio = 'auto',
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  showLoadingPlaceholder = false,
  showErrorFallback = false,
  showProgressIndicator = false,
  enableRetry = false,
  hoverEffect = 'none',
  generateSrcSet = false,
  autoFormat = false,
  loadingComponent,
  errorComponent,
  className = '',
  ariaLabel,
  sizes,
  quality = 85,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(showLoadingPlaceholder);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, isVisible]);

  // Generate responsive sizes prop
  const getResponsiveSizes = () => {
    if (sizes) {
      return sizes;
    }
    if (!responsive) {
      return undefined;
    }
    
    return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle image load error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Retry loading image
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

  // Format detection for WebP/AVIF support
  const getOptimizedSrc = () => {
    if (!autoFormat) {
      return src;
    }
    
    // This would typically involve checking browser support
    // For now, let Next.js Image component handle format optimization
    return src;
  };

  // Container classes
  const containerClasses = [
    'relative overflow-hidden',
    ASPECT_RATIO_CLASSES[aspectRatio],
    fill ? 'relative' : '',
    className,
  ].filter(Boolean).join(' ');

  // Image classes
  const imageClasses = [
    OBJECT_FIT_CLASSES[objectFit],
    HOVER_EFFECT_CLASSES[hoverEffect],
    'transition-all duration-300',
  ].filter(Boolean).join(' ');

  // Loading Placeholder Component
  const LoadingPlaceholder = () => (
    <div 
      data-testid="image-placeholder"
      className="absolute inset-0 bg-gray-200 flex items-center justify-center"
    >
      {loadingComponent || (
        <div className="flex flex-col items-center space-y-2">
          <div 
            data-testid="loading-skeleton"
            className="animate-pulse bg-gray-300 rounded-lg w-16 h-16"
          />
          {showProgressIndicator && (
            <div data-testid="loading-progress" className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Error Fallback Component
  const ErrorFallback = () => (
    <div 
      data-testid="image-error-fallback"
      className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500 p-4"
    >
      {errorComponent || (
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm mb-2">Failed to load image</p>
          {enableRetry && (
            <button
              data-testid="retry-button"
              onClick={handleRetry}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div 
      ref={imgRef}
      data-testid="optimized-image-container"
      className={containerClasses}
    >
      {/* Show loading placeholder */}
      {isLoading && showLoadingPlaceholder && <LoadingPlaceholder />}
      
      {/* Show error fallback */}
      {hasError && showErrorFallback && <ErrorFallback />}
      
      {/* Image */}
      {isVisible && !hasError && (
        <Image
          data-testid="next-image"
          src={`${getOptimizedSrc()}?retry=${retryCount}`}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={getResponsiveSizes()}
          quality={quality}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          aria-label={ariaLabel}
          {...(generateSrcSet && {
            srcSet: `${src} 1x, ${src} 2x`,
          })}
        />
      )}
      
      {/* Lazy loading placeholder when not visible */}
      {lazy && !isVisible && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="animate-pulse bg-gray-300 rounded-lg w-16 h-16" />
        </div>
      )}
    </div>
  );
}