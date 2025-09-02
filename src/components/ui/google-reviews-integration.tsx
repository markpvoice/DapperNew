'use client';

import React, { useState, useEffect } from 'react';
import { OptimizedImage } from './optimized-image';

// Types
export interface GoogleReview {
  id: string;
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface GoogleReviewsData {
  reviews: GoogleReview[];
  rating: number;
  user_ratings_total: number;
}

export interface GoogleReviewsIntegrationProps {
  placeId?: string;
  maxReviews?: number;
  columns?: number;
  showRating?: boolean;
  showReviewCount?: boolean;
  className?: string;
}

export interface ReviewStarsProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export interface ReviewCardProps {
  review: GoogleReview;
  showFullText?: boolean;
  className?: string;
}

// Mock data for development (in production, this would be replaced with actual Google Places API data)
const MOCK_REVIEWS_DATA: GoogleReviewsData = {
  reviews: [
    {
      id: '1',
      author_name: 'Sarah Johnson',
      author_url: 'https://www.google.com/maps/contrib/123456789',
      profile_photo_url: '/images/reviews/sarah.jpg',
      rating: 5,
      relative_time_description: '2 weeks ago',
      text: 'Amazing DJ service for our wedding! Professional setup, perfect sound quality, and they kept everyone dancing all night. The team was incredibly responsive and accommodating to all our music requests.',
      time: 1640995200,
    },
    {
      id: '2',
      author_name: 'Mike Chen',
      author_url: 'https://www.google.com/maps/contrib/987654321',
      profile_photo_url: '/images/reviews/mike.jpg',
      rating: 5,
      relative_time_description: '1 month ago',
      text: 'Great karaoke setup for our corporate event. The team was very professional and helped make our team building event a huge success. Everyone had a blast!',
      time: 1638316800,
    },
    {
      id: '3',
      author_name: 'Lisa Martinez',
      author_url: 'https://www.google.com/maps/contrib/456789123',
      profile_photo_url: '/images/reviews/lisa.jpg',
      rating: 5,
      relative_time_description: '3 weeks ago',
      text: 'Excellent photography service! They captured every special moment of our anniversary party. Professional, creative, and delivered photos quickly.',
      time: 1639766400,
    },
    {
      id: '4',
      author_name: 'David Thompson',
      author_url: 'https://www.google.com/maps/contrib/789123456',
      profile_photo_url: '/images/reviews/david.jpg',
      rating: 4,
      relative_time_description: '1 week ago',
      text: 'Good service for our birthday party. DJ played exactly what we requested and kept the energy high. Would recommend for parties.',
      time: 1641254400,
    },
    {
      id: '5',
      author_name: 'Jennifer Wu',
      author_url: 'https://www.google.com/maps/contrib/321654987',
      profile_photo_url: '/images/reviews/jennifer.jpg',
      rating: 5,
      relative_time_description: '5 days ago',
      text: 'Outstanding service from start to finish! They handled our wedding DJ services and photography perfectly. Great communication and exceeded our expectations.',
      time: 1641513600,
    },
  ],
  rating: 4.8,
  user_ratings_total: 25,
};

// Utility function to get grid columns class
const getGridColsClass = (cols: number) => {
  switch (cols) {
    case 1: return 'lg:grid-cols-1';
    case 2: return 'lg:grid-cols-2';
    case 4: return 'lg:grid-cols-4';
    default: return 'lg:grid-cols-3';
  }
};

// Review Stars Component
export function ReviewStars({ rating, size = 'medium', className = '' }: ReviewStarsProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          data-testid={`star-icon-${i}`}
          className={`${sizeClasses[size]} ${
            i < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Review Card Component
export function ReviewCard({ review, showFullText = false, className = '' }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullText);
  const maxLength = 150;
  const shouldTruncate = review.text.length > maxLength && !showFullText;

  const handleAuthorClick = () => {
    if (review.author_url) {
      window.open(review.author_url, '_blank', 'noopener,noreferrer');
    }
  };

  const displayText = shouldTruncate && !isExpanded 
    ? review.text.slice(0, maxLength) + '...' 
    : review.text;

  return (
    <div 
      data-testid="review-card"
      className={`bg-white rounded-2xl p-6 border border-gray-200 hover:border-brand-gold hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Reviewer Info */}
      <div className="flex items-center mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {review.profile_photo_url ? (
            <OptimizedImage
              src={review.profile_photo_url}
              alt={review.author_name}
              fill
              objectFit="cover"
              className="rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-brand-gold flex items-center justify-center text-brand-charcoal font-bold text-sm">
              {review.author_name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <button
            onClick={handleAuthorClick}
            className="font-semibold text-gray-900 hover:text-brand-gold transition-colors text-left"
          >
            {review.author_name}
          </button>
          <div className="flex items-center justify-between mt-1">
            <ReviewStars rating={review.rating} size="small" />
            <span className="text-sm text-gray-500">{review.relative_time_description}</span>
          </div>
        </div>
      </div>

      {/* Review Text */}
      <div className="text-gray-700 leading-relaxed">
        <p>{displayText}</p>
        {shouldTruncate && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-brand-gold hover:text-brand-dark-gold mt-2 text-sm font-medium"
          >
            Read more
          </button>
        )}
      </div>
    </div>
  );
}

// Main Google Reviews Integration Component
export function GoogleReviewsIntegration({
  placeId: _placeId,
  maxReviews = 6,
  columns = 3,
  showRating = true,
  showReviewCount = true,
  className = '',
}: GoogleReviewsIntegrationProps) {
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In production, this would be a real API call to Google Places API
        // For now, we'll simulate with mock data and a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock API call
        const response = await fetch('/api/google-reviews');
        
        if (!response.ok) {
          // Fallback to mock data if API fails
          setReviewsData(MOCK_REVIEWS_DATA);
        } else {
          const data = await response.json();
          setReviewsData(data.result);
        }
      } catch (err) {
        // Use mock data if API fails
        console.warn('Using mock reviews data:', err);
        setReviewsData(MOCK_REVIEWS_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleViewAllReviews = () => {
    // In production, this would link to the actual Google Business profile
    const googleBusinessUrl = 'https://www.google.com/maps/place/Dapper+Squad+Entertainment/@41.8781,-87.6298,15z/data=!4m5!3m4!1s0x0:0x123456789!8m2!3d41.8781!4d-87.6298';
    window.open(googleBusinessUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="text-center text-gray-500 mb-6">Loading reviews...</div>
        <div 
          data-testid="reviews-skeleton"
          className={`grid grid-cols-1 md:grid-cols-2 ${getGridColsClass(columns)} gap-6`}
        >
          {Array.from({ length: maxReviews }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">{error}</div>
      </div>
    );
  }

  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">Unable to load reviews</div>
      </div>
    );
  }

  const displayedReviews = reviewsData.reviews.slice(0, maxReviews);

  return (
    <div 
      role="region"
      aria-label="Google Reviews"
      className={className}
    >
      {/* Header with Rating Summary */}
      {(showRating || showReviewCount) && (
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {showRating && (
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-brand-gold">{reviewsData.rating}</span>
                <ReviewStars rating={Math.floor(reviewsData.rating)} size="large" />
              </div>
            )}
            {showReviewCount && (
              <span className="text-lg text-gray-600">{reviewsData.user_ratings_total} reviews</span>
            )}
          </div>
          
          <button
            onClick={handleViewAllReviews}
            className="text-brand-gold hover:text-brand-dark-gold font-medium transition-colors"
          >
            View all reviews on Google →
          </button>
        </div>
      )}

      {/* Reviews Grid */}
      <div 
        data-testid="reviews-grid"
        className={`grid grid-cols-1 md:grid-cols-2 ${getGridColsClass(columns)} gap-6`}
      >
        {displayedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
          />
        ))}
      </div>
    </div>
  );
}