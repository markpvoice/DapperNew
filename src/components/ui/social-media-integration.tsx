'use client';

import React, { useState, useEffect } from 'react';
import { OptimizedImage } from './optimized-image';

// Types
export type SocialPlatform = 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'youtube';
export type ButtonStyle = 'default' | 'minimal' | 'filled' | 'outlined';

export interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  platforms?: SocialPlatform[];
  buttonStyle?: ButtonStyle;
  showLabels?: boolean;
  className?: string;
}

export interface InstagramPost {
  id: string;
  media_url: string;
  caption: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramFeedProps {
  accessToken?: string;
  maxPosts?: number;
  columns?: number;
  showStats?: boolean;
  className?: string;
}

export interface SocialStats {
  followers: number;
  posts: number;
  avgLikes: number;
  testimonials: number;
}

export interface SocialProofProps {
  stats: SocialStats;
  platforms?: SocialPlatform[];
  animated?: boolean;
  className?: string;
}

export interface SocialMediaIntegrationProps {
  showShareButtons?: boolean;
  showInstagramFeed?: boolean;
  showSocialProof?: boolean;
  showFollowButtons?: boolean;
  shareConfig?: Partial<SocialShareButtonsProps>;
  instagramConfig?: Partial<InstagramFeedProps>;
  socialProofConfig?: Partial<SocialProofProps>;
  socialHandles?: Partial<Record<SocialPlatform, string>>;
  className?: string;
}

// Social platform configurations
const SOCIAL_PLATFORMS = {
  facebook: {
    name: 'Facebook',
    shareUrl: (url: string, _title: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: 'bg-blue-600 hover:bg-blue-700',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  twitter: {
    name: 'Twitter',
    shareUrl: (url: string, title: string) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: 'bg-blue-400 hover:bg-blue-500',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
  },
  linkedin: {
    name: 'LinkedIn',
    shareUrl: (url: string, _title: string) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    color: 'bg-blue-700 hover:bg-blue-800',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  instagram: {
    name: 'Instagram',
    shareUrl: (_url: string) => `https://www.instagram.com/`,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C8.396 0 7.977.013 6.756.06 5.54.106 4.719.26 3.998.487c-.738.283-1.363.66-1.985 1.282C1.391 2.391 1.014 3.016.731 3.754.504 4.475.35 5.296.304 6.512.257 7.733.244 8.152.244 11.773s.013 4.04.06 5.261c.046 1.216.2 2.037.427 2.758.283.738.66 1.363 1.282 1.985.622.622 1.247.999 1.985 1.282.721.227 1.542.381 2.758.427 1.221.047 1.64.06 5.261.06s4.04-.013 5.261-.06c1.216-.046 2.037-.2 2.758-.427.738-.283 1.363-.66 1.985-1.282.622-.622.999-1.247 1.282-1.985.227-.721.381-1.542.427-2.758.047-1.221.06-1.64.06-5.261s-.013-4.04-.06-5.261c-.046-1.216-.2-2.037-.427-2.758C22.26 4.016 21.883 3.391 21.261 2.769c-.622-.622-1.247-.999-1.985-1.282C18.555.26 17.734.106 16.518.06 15.297.013 14.878 0 11.257 0h.76zm10.44 11.988c0 3.264-.013 3.654-.057 4.835-.043 1.143-.194 1.764-.322 2.177-.17.56-.374.96-.7 1.286-.327.327-.727.531-1.287.701-.413.128-1.034.279-2.177.322-1.181.044-1.571.057-4.835.057s-3.654-.013-4.835-.057c-1.143-.043-1.764-.194-2.177-.322a3.452 3.452 0 01-1.286-.701 3.452 3.452 0 01-.701-1.286c-.128-.413-.279-1.034-.322-2.177-.044-1.181-.057-1.571-.057-4.835s.013-3.654.057-4.835c.043-1.143.194-1.764.322-2.177.17-.56.374-.96.701-1.286a3.452 3.452 0 011.286-.701c.413-.128 1.034-.279 2.177-.322C7.603 5.013 7.993 5 11.257 5s3.654.013 4.835.057c1.143.043 1.764.194 2.177.322.56.17.96.374 1.286.701.327.327.531.727.701 1.286.128.413.279 1.034.322 2.177.044 1.181.057 1.571.057 4.835zm-6.44-6.44c-2.096 0-3.795 1.699-3.795 3.795S9.924 13.138 12.017 13.138s3.795-1.699 3.795-3.795-1.699-3.795-3.795-3.795zM12.017 15.548c-3.314 0-6.005-2.691-6.005-6.005S8.703.538 12.017.538s6.005 2.691 6.005 6.005-2.691 6.005-6.005 6.005zm9.624-12.914c0 .775-.629 1.404-1.404 1.404s-1.404-.629-1.404-1.404.629-1.404 1.404-1.404 1.404.629 1.404 1.404z"/>
      </svg>
    ),
  },
  tiktok: {
    name: 'TikTok',
    shareUrl: (_url: string) => `https://www.tiktok.com/`,
    color: 'bg-black hover:bg-gray-800',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
  youtube: {
    name: 'YouTube',
    shareUrl: (_url: string) => `https://www.youtube.com/`,
    color: 'bg-red-600 hover:bg-red-700',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
};

// Utility functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Social Share Buttons Component
export function SocialShareButtons({
  url,
  title,
  description: _description = '',
  platforms = ['facebook', 'twitter', 'linkedin', 'instagram'],
  buttonStyle = 'default',
  showLabels = false,
  className = '',
}: SocialShareButtonsProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = (platform: SocialPlatform) => {
    const config = SOCIAL_PLATFORMS[platform];
    if (config && config.shareUrl) {
      const shareUrl = config.shareUrl(url, title);
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const getButtonClasses = (platform: SocialPlatform) => {
    const config = SOCIAL_PLATFORMS[platform];
    const baseClasses = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (buttonStyle) {
      case 'minimal':
        return `${baseClasses} text-gray-600 hover:text-gray-800 hover:bg-gray-100`;
      case 'filled':
        return `${baseClasses} text-white ${config.color}`;
      case 'outlined':
        return `${baseClasses} border border-gray-300 text-gray-700 hover:bg-gray-50`;
      default:
        return `${baseClasses} text-white ${config.color}`;
    }
  };

  return (
    <div 
      role="group" 
      aria-label="Social media share buttons"
      className={`flex flex-wrap items-center gap-3 ${className}`}
    >
      {platforms.map((platform) => {
        const config = SOCIAL_PLATFORMS[platform];
        if (!config) {
          return null;
        }

        return (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            className={getButtonClasses(platform)}
            aria-label={`Share on ${config.name}`}
            data-testid={`${platform}-share-button`}
          >
            {config.icon}
            {showLabels && <span>{config.name}</span>}
          </button>
        );
      })}
      
      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-gray-600 hover:bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        aria-label="Copy link"
        data-testid="copy-link-button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {copiedLink && <span className="text-green-300">Link copied!</span>}
      </button>
    </div>
  );
}

// Instagram Feed Component
export function InstagramFeed({
  maxPosts = 6,
  columns = 3,
  showStats = false,
  className = '',
}: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call with fetch
        const response = await fetch('/api/instagram/posts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch Instagram posts');
        }
        
        const data = await response.json();
        setPosts(data.data.slice(0, maxPosts));
      } catch (err) {
        setError('Unable to load Instagram posts');
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, [maxPosts]);

  const handlePostClick = (permalink: string) => {
    window.open(permalink, '_blank', 'noopener,noreferrer');
  };

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

  if (loading) {
    return (
      <div className={className}>
        <div className="text-center text-gray-500 mb-6">Loading Instagram posts...</div>
        <div 
          data-testid="instagram-skeleton"
          className={`grid grid-cols-1 md:grid-cols-2 ${getGridColsClass(columns)} gap-4`}
        >
          {Array.from({ length: maxPosts }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
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

  return (
    <div className={className}>
      <div 
        data-testid="instagram-grid"
        className={`grid grid-cols-1 md:grid-cols-2 ${getGridColsClass(columns)} gap-4`}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="group cursor-pointer rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-300"
            onClick={() => handlePostClick(post.permalink)}
            aria-label={`View Instagram post: ${post.caption}`}
          >
            <div className="aspect-square relative">
              <OptimizedImage
                src={post.media_url}
                alt={post.caption}
                fill
                objectFit="cover"
                className="group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
                  {showStats && post.like_count !== undefined && (
                    <div className="flex items-center justify-center space-x-4 mb-2">
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/>
                        </svg>
                        <span>{post.like_count}</span>
                      </div>
                      {post.comments_count !== undefined && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.5 19h-4A2.5 2.5 0 0 1 2 16.5v-9A2.5 2.5 0 0 1 4.5 5h15A2.5 2.5 0 0 1 22 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9.793l-3.207 3.5z"/>
                          </svg>
                          <span>{post.comments_count}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-sm line-clamp-2">{post.caption}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Social Proof Component
export function SocialProof({
  stats,
  platforms = ['instagram', 'facebook'],
  animated = false,
  className = '',
}: SocialProofProps) {
  return (
    <div 
      data-testid="social-proof"
      className={`bg-white rounded-2xl p-6 border border-gray-200 ${className}`}
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Social Proof</h3>
        <div className="flex justify-center space-x-4 mb-4">
          {platforms.map((platform) => {
            const config = SOCIAL_PLATFORMS[platform];
            if (!config) {
              return null;
            }
            
            return (
              <div
                key={platform}
                data-testid={`${platform}-icon`}
                className="w-8 h-8 text-gray-600"
              >
                {config.icon}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="space-y-1">
          <div 
            data-testid={animated ? "animated-counter" : undefined}
            className="text-2xl font-bold text-brand-gold"
          >
            {formatNumber(stats.followers)}
          </div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-brand-gold">
            {stats.posts}
          </div>
          <div className="text-sm text-gray-600">Posts</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-brand-gold">
            {stats.avgLikes}
          </div>
          <div className="text-sm text-gray-600">Avg Likes</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-brand-gold">
            {stats.testimonials}+
          </div>
          <div className="text-sm text-gray-600">Reviews</div>
        </div>
      </div>
    </div>
  );
}

// Main Social Media Integration Component
export function SocialMediaIntegration({
  showShareButtons = false,
  showInstagramFeed = false,
  showSocialProof = false,
  showFollowButtons = false,
  shareConfig = {},
  instagramConfig = {},
  socialProofConfig = {},
  socialHandles = {},
  className = '',
}: SocialMediaIntegrationProps) {
  const defaultShareConfig: SocialShareButtonsProps = {
    url: 'https://dappersquad.com',
    title: 'Check out Dapper Squad Entertainment!',
    description: 'Professional DJ, Karaoke, and Photography services',
    ...shareConfig,
  };

  const defaultSocialStats: SocialStats = {
    followers: 1250,
    posts: 89,
    avgLikes: 45,
    testimonials: 120,
  };

  const handleFollowClick = (platform: SocialPlatform) => {
    const handle = socialHandles[platform];
    if (!handle) {
      return;
    }

    const urls = {
      instagram: `https://instagram.com/${handle.replace('@', '')}`,
      facebook: `https://facebook.com/${handle}`,
      twitter: `https://twitter.com/${handle.replace('@', '')}`,
      tiktok: `https://tiktok.com/@${handle.replace('@', '')}`,
      youtube: `https://youtube.com/c/${handle}`,
      linkedin: `https://linkedin.com/company/${handle}`,
    };

    const url = urls[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={className}>
      {/* Share Buttons */}
      {showShareButtons && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Share This Page</h3>
          <SocialShareButtons {...defaultShareConfig} />
        </div>
      )}

      {/* Follow Buttons */}
      {showFollowButtons && Object.keys(socialHandles).length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(socialHandles).map(([platform, handle]) => {
              const config = SOCIAL_PLATFORMS[platform as SocialPlatform];
              if (!config || !handle) {
                return null;
              }

              return (
                <button
                  key={platform}
                  onClick={() => handleFollowClick(platform as SocialPlatform)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 ${config.color}`}
                  aria-label={`Follow on ${config.name}`}
                >
                  {config.icon}
                  <span>Follow on {config.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Instagram Feed */}
      {showInstagramFeed && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Latest from Instagram</h3>
          <InstagramFeed {...instagramConfig} />
        </div>
      )}

      {/* Social Proof */}
      {showSocialProof && (
        <div>
          <SocialProof 
            stats={defaultSocialStats} 
            {...socialProofConfig} 
          />
        </div>
      )}
    </div>
  );
}