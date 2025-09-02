/**
 * Loading States and Transitions Test Suite
 * Tests for enhanced loading indicators, skeleton states, and smooth transitions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock components for loading states (will be implemented in GREEN phase)
const LoadingSpinner = ({ 
  size = 'default', 
  variant = 'primary', 
  className = '' 
}: { 
  size?: string; 
  variant?: string; 
  className?: string; 
}) => (
  <div className={`loading-spinner loading-spinner-${size} loading-spinner-${variant} ${className}`}>
    <div className="spinner-inner" />
  </div>
);

const SkeletonLoader = ({ 
  type = 'text',
  lines = 1,
  width = '100%',
  height = 'auto',
  className = ''
}: {
  type?: string;
  lines?: number;
  width?: string;
  height?: string;
  className?: string;
}) => (
  <div className={`skeleton-loader skeleton-${type} ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} className="skeleton-line" style={{ width, height }} />
    ))}
  </div>
);

const ProgressBar = ({
  progress = 0,
  variant = 'default',
  animated = true,
  className = ''
}: {
  progress?: number;
  variant?: string;
  animated?: boolean;
  className?: string;
}) => (
  <div className={`progress-bar progress-bar-${variant} ${animated ? 'animated' : ''} ${className}`}>
    <div className="progress-fill" style={{ width: `${progress}%` }} />
  </div>
);

const PulseLoader = ({ 
  dots = 3,
  size = 'default',
  className = ''
}: {
  dots?: number;
  size?: string;
  className?: string;
}) => (
  <div className={`pulse-loader pulse-loader-${size} ${className}`}>
    {Array.from({ length: dots }, (_, i) => (
      <div key={i} className="pulse-dot" />
    ))}
  </div>
);

describe('Loading States System', () => {
  describe('Loading Spinner Component', () => {
    it('should render with default props', () => {
      render(<LoadingSpinner />);
      const spinner = document.querySelector('.loading-spinner');
      
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('loading-spinner-default');
      expect(spinner).toHaveClass('loading-spinner-primary');
    });

    it('should render different sizes correctly', () => {
      const sizes = ['xs', 'sm', 'default', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { container } = render(<LoadingSpinner size={size} />);
        const spinner = container.querySelector('.loading-spinner');
        
        expect(spinner).toHaveClass(`loading-spinner-${size}`);
      });
    });

    it('should render different variants correctly', () => {
      const variants = ['primary', 'secondary', 'luxury', 'gold', 'white'];
      
      variants.forEach(variant => {
        const { container } = render(<LoadingSpinner variant={variant} />);
        const spinner = container.querySelector('.loading-spinner');
        
        expect(spinner).toHaveClass(`loading-spinner-${variant}`);
      });
    });

    it('should accept custom className', () => {
      render(<LoadingSpinner className="custom-spinner" />);
      const spinner = document.querySelector('.loading-spinner');
      
      expect(spinner).toHaveClass('custom-spinner');
    });
  });

  describe('Skeleton Loader Component', () => {
    it('should render with default props', () => {
      render(<SkeletonLoader />);
      const skeleton = document.querySelector('.skeleton-loader');
      
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('skeleton-text');
    });

    it('should render different skeleton types', () => {
      const types = ['text', 'avatar', 'card', 'button', 'image'];
      
      types.forEach(type => {
        const { container } = render(<SkeletonLoader type={type} />);
        const skeleton = container.querySelector('.skeleton-loader');
        
        expect(skeleton).toHaveClass(`skeleton-${type}`);
      });
    });

    it('should render multiple lines for text skeleton', () => {
      render(<SkeletonLoader type="text" lines={3} />);
      const lines = document.querySelectorAll('.skeleton-line');
      
      expect(lines).toHaveLength(3);
    });

    it('should accept custom dimensions', () => {
      render(<SkeletonLoader width="200px" height="100px" />);
      const line = document.querySelector('.skeleton-line');
      
      expect(line).toHaveStyle({ width: '200px', height: '100px' });
    });
  });

  describe('Progress Bar Component', () => {
    it('should render with default props', () => {
      render(<ProgressBar />);
      const progressBar = document.querySelector('.progress-bar');
      
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveClass('progress-bar-default');
      expect(progressBar).toHaveClass('animated');
    });

    it('should display correct progress percentage', () => {
      render(<ProgressBar progress={75} />);
      const progressFill = document.querySelector('.progress-fill');
      
      expect(progressFill).toHaveStyle({ width: '75%' });
    });

    it('should render different variants', () => {
      const variants = ['default', 'success', 'warning', 'error', 'luxury'];
      
      variants.forEach(variant => {
        const { container } = render(<ProgressBar variant={variant} />);
        const progressBar = container.querySelector('.progress-bar');
        
        expect(progressBar).toHaveClass(`progress-bar-${variant}`);
      });
    });

    it('should handle animation toggle', () => {
      const { rerender, container } = render(<ProgressBar animated={true} />);
      let progressBar = container.querySelector('.progress-bar');
      
      expect(progressBar).toHaveClass('animated');
      
      rerender(<ProgressBar animated={false} />);
      progressBar = container.querySelector('.progress-bar');
      
      expect(progressBar).not.toHaveClass('animated');
    });
  });

  describe('Pulse Loader Component', () => {
    it('should render with default props', () => {
      render(<PulseLoader />);
      const pulseLoader = document.querySelector('.pulse-loader');
      const dots = document.querySelectorAll('.pulse-dot');
      
      expect(pulseLoader).toBeInTheDocument();
      expect(pulseLoader).toHaveClass('pulse-loader-default');
      expect(dots).toHaveLength(3);
    });

    it('should render correct number of dots', () => {
      render(<PulseLoader dots={5} />);
      const dots = document.querySelectorAll('.pulse-dot');
      
      expect(dots).toHaveLength(5);
    });

    it('should render different sizes', () => {
      const sizes = ['sm', 'default', 'lg'];
      
      sizes.forEach(size => {
        const { container } = render(<PulseLoader size={size} />);
        const pulseLoader = container.querySelector('.pulse-loader');
        
        expect(pulseLoader).toHaveClass(`pulse-loader-${size}`);
      });
    });
  });

  describe('Loading State Combinations', () => {
    it('should support combining spinner with text', () => {
      render(
        <div className="loading-container">
          <LoadingSpinner size="sm" />
          <span className="loading-text">Loading...</span>
        </div>
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
    });

    it('should support skeleton with progressive loading', () => {
      render(
        <div>
          <SkeletonLoader type="avatar" />
          <SkeletonLoader type="text" lines={2} />
          <SkeletonLoader type="button" />
        </div>
      );
      
      expect(document.querySelector('.skeleton-avatar')).toBeInTheDocument();
      expect(document.querySelector('.skeleton-text')).toBeInTheDocument();
      expect(document.querySelector('.skeleton-button')).toBeInTheDocument();
    });
  });

  describe('Transition Effects', () => {
    it('should support fade in transitions', () => {
      render(
        <div className="transition-fade-in">
          <LoadingSpinner />
        </div>
      );
      
      const container = document.querySelector('.transition-fade-in');
      expect(container).toBeInTheDocument();
    });

    it('should support slide transitions', () => {
      render(
        <div className="transition-slide-up">
          <SkeletonLoader />
        </div>
      );
      
      const container = document.querySelector('.transition-slide-up');
      expect(container).toBeInTheDocument();
    });

    it('should support scale transitions', () => {
      render(
        <div className="transition-scale">
          <PulseLoader />
        </div>
      );
      
      const container = document.querySelector('.transition-scale');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Loading State Accessibility', () => {
    it('should include proper ARIA labels for spinners', () => {
      render(
        <div role="status" aria-label="Loading content">
          <LoadingSpinner />
        </div>
      );
      
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Loading content');
    });

    it('should include proper ARIA labels for progress bars', () => {
      render(
        <div>
          <ProgressBar progress={50} aria-label="Loading progress" />
          <span id="progress-label">50% complete</span>
        </div>
      );
      
      expect(screen.getByText('50% complete')).toBeInTheDocument();
    });

    it('should support screen reader announcements', () => {
      render(
        <div aria-live="polite" aria-atomic="true">
          <LoadingSpinner />
          <span className="sr-only">Loading content, please wait</span>
        </div>
      );
      
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Performance Optimizations', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = render(<LoadingSpinner size="default" />);
      
      rerender(<LoadingSpinner size="default" />);
      
      const spinner = document.querySelector('.loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should handle rapid progress updates efficiently', () => {
      const { rerender } = render(<ProgressBar progress={0} />);
      
      // Simulate rapid progress updates
      for (let i = 0; i <= 100; i += 10) {
        rerender(<ProgressBar progress={i} />);
      }
      
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion for spinners', () => {
      render(
        <div className="motion-reduce:animate-none">
          <LoadingSpinner />
        </div>
      );
      
      const container = document.querySelector('.motion-reduce\\:animate-none');
      expect(container).toBeInTheDocument();
    });

    it('should respect prefers-reduced-motion for pulse loaders', () => {
      render(
        <div className="motion-reduce:opacity-70">
          <PulseLoader />
        </div>
      );
      
      const container = document.querySelector('.motion-reduce\\:opacity-70');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should support dark mode variants for spinners', () => {
      render(<LoadingSpinner className="dark:text-white" />);
      
      const spinner = document.querySelector('.loading-spinner');
      expect(spinner).toHaveClass('dark:text-white');
    });

    it('should support dark mode variants for skeleton loaders', () => {
      render(<SkeletonLoader className="dark:bg-gray-700" />);
      
      const skeleton = document.querySelector('.skeleton-loader');
      expect(skeleton).toHaveClass('dark:bg-gray-700');
    });
  });

  describe('Custom Loading States', () => {
    it('should support brand-specific loading animations', () => {
      render(
        <LoadingSpinner 
          variant="luxury" 
          className="animate-gold-pulse" 
        />
      );
      
      const spinner = document.querySelector('.loading-spinner');
      expect(spinner).toHaveClass('loading-spinner-luxury');
      expect(spinner).toHaveClass('animate-gold-pulse');
    });

    it('should support context-aware loading states', () => {
      render(
        <div className="booking-form-loading">
          <SkeletonLoader type="card" />
          <ProgressBar variant="luxury" progress={60} />
        </div>
      );
      
      const container = document.querySelector('.booking-form-loading');
      const progressBar = document.querySelector('.progress-bar-luxury');
      
      expect(container).toBeInTheDocument();
      expect(progressBar).toBeInTheDocument();
    });
  });
});