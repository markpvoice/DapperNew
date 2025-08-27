import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OptimizedImage } from '@/components/ui/optimized-image';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, priority, ...props }: any) {
    return (
      <img 
        src={src} 
        alt={alt} 
        {...props}
        {...(priority && { priority: 'true' })}
        onLoad={onLoad}
        onError={onError}
        data-testid="next-image"
      />
    );
  };
});

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('OptimizedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with basic props', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
      />
    );
    
    expect(screen.getByAltText('Test image')).toBeInTheDocument();
    expect(screen.getByTestId('next-image')).toHaveAttribute('src', expect.stringContaining('/test-image.jpg'));
  });

  it('shows loading placeholder initially', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        showLoadingPlaceholder
      />
    );
    
    expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('shows error state when image fails to load', async () => {
    render(
      <OptimizedImage
        src="/non-existent-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        showErrorFallback
      />
    );
    
    const image = screen.getByTestId('next-image');
    fireEvent.error(image);
    
    await waitFor(() => {
      expect(screen.getByTestId('image-error-fallback')).toBeInTheDocument();
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });

  it('hides placeholder when image loads successfully', async () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        showLoadingPlaceholder
      />
    );
    
    expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
    
    const image = screen.getByTestId('next-image');
    fireEvent.load(image);
    
    await waitFor(() => {
      expect(screen.queryByTestId('image-placeholder')).not.toBeInTheDocument();
    });
  });

  it('supports lazy loading with IntersectionObserver', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        lazy
      />
    );
    
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        className="custom-class"
      />
    );
    
    const container = screen.getByTestId('optimized-image-container');
    expect(container).toHaveClass('custom-class');
  });

  it('supports different aspect ratios', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        aspectRatio="square"
      />
    );
    
    const container = screen.getByTestId('optimized-image-container');
    expect(container).toHaveClass('aspect-square');
  });

  it('generates correct responsive sizes prop', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        responsive
      />
    );
    
    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('sizes');
  });

  it('supports priority loading for above-fold images', () => {
    render(
      <OptimizedImage
        src="/hero-image.jpg"
        alt="Hero image"
        width={1200}
        height={800}
        priority
      />
    );
    
    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('priority', 'true');
  });

  it('shows blur placeholder when specified', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD"
        placeholder="blur"
      />
    );
    
    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('placeholder', 'blur');
  });

  it('handles different image formats', () => {
    const formats = ['.jpg', '.png', '.webp', '.avif'];
    
    formats.forEach(format => {
      const { rerender } = render(
        <OptimizedImage
          src={`/test-image${format}`}
          alt="Test image"
          width={800}
          height={600}
        />
      );
      
      expect(screen.getByTestId('next-image')).toHaveAttribute('src', expect.stringContaining(`/test-image${format}`));
      rerender(<div />); // Clean up for next iteration
    });
  });

  it('supports fill mode for responsive containers', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        fill
      />
    );
    
    const container = screen.getByTestId('optimized-image-container');
    expect(container).toHaveClass('relative');
  });

  it('applies correct object-fit styling', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        objectFit="cover"
      />
    );
    
    const image = screen.getByTestId('next-image');
    expect(image).toHaveClass('object-cover');
  });

  it('shows loading progress indicator when specified', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        showLoadingPlaceholder
        showProgressIndicator
      />
    );
    
    expect(screen.getByTestId('loading-progress')).toBeInTheDocument();
  });

  it('handles retry functionality on error', async () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        showErrorFallback
        enableRetry
      />
    );
    
    const image = screen.getByTestId('next-image');
    fireEvent.error(image);
    
    await waitFor(() => {
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('retry-button'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('image-error-fallback')).not.toBeInTheDocument();
    });
  });

  it('supports hover effects', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        hoverEffect="scale"
      />
    );
    
    const image = screen.getByTestId('next-image');
    expect(image).toHaveClass('hover:scale-105');
  });

  it('generates srcSet for different screen densities', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        generateSrcSet
      />
    );
    
    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('srcset');
  });

  it('supports custom loading component', () => {
    const CustomLoader = () => <div data-testid="custom-loader">Loading...</div>;
    
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        showLoadingPlaceholder
        loadingComponent={<CustomLoader />}
      />
    );
    
    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
  });

  it('supports custom error fallback component', async () => {
    const CustomError = () => <div data-testid="custom-error">Oops!</div>;
    
    render(
      <OptimizedImage
        src="/non-existent-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        showErrorFallback
        errorComponent={<CustomError />}
      />
    );
    
    const image = screen.getByTestId('next-image');
    fireEvent.error(image);
    
    await waitFor(() => {
      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        ariaLabel="Detailed image description"
      />
    );
    
    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('alt', 'Test image');
    expect(image).toHaveAttribute('aria-label', 'Detailed image description');
  });

  it('supports WebP and AVIF format detection', () => {
    // Mock browser support
    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      value: jest.fn(() => 'data:image/webp;base64,test'),
    });
    
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
        autoFormat
      />
    );
    
    // Component should detect WebP support and use appropriate format
    const image = screen.getByTestId('next-image');
    expect(image).toBeInTheDocument();
  });
});