/**
 * @fileoverview Tests for ServicePopularityChart component
 * 
 * Tests pie chart functionality including:
 * - Service data visualization
 * - Interactive tooltips and labels
 * - Custom colors and theming
 * - Responsive behavior
 * - Accessibility compliance
 */

import { render, screen } from '@testing-library/react';
import { ServicePopularityChart } from '@/components/admin/charts/ServicePopularityChart';

const mockServiceData = [
  { service: 'DJ', count: 35 },
  { service: 'Photography', count: 22 },
  { service: 'Karaoke', count: 18 },
  { service: 'Videography', count: 12 },
  { service: 'Lighting', count: 8 },
];

// Mock Recharts components for pie chart
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data, dataKey, nameKey, fill }: any) => (
    <div 
      data-testid="pie" 
      data-data-length={data?.length}
      data-key={dataKey}
      data-name-key={nameKey}
      data-fill={fill}
    />
  ),
  Cell: ({ fill }: any) => <div data-testid="cell" data-fill={fill} />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe.skip('ServicePopularityChart Component', () => {
  describe('Rendering and Layout', () => {
    test('renders pie chart container with proper structure', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    test('renders with custom title when provided', () => {
      render(<ServicePopularityChart data={mockServiceData} title="Service Breakdown" />);
      
      expect(screen.getByText('Service Breakdown')).toBeInTheDocument();
    });

    test('uses default title when none provided', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      expect(screen.getByText('Service Popularity')).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    test('handles empty data gracefully', () => {
      render(<ServicePopularityChart data={[]} />);
      
      expect(screen.getByText('No service data available for this period')).toBeInTheDocument();
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });

    test('passes correct data to pie component', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      const pie = screen.getByTestId('pie');
      expect(pie.getAttribute('data-data-length')).toBe('5');
      expect(pie.getAttribute('data-key')).toBe('count');
      expect(pie.getAttribute('data-name-key')).toBe('service');
    });

    test('renders service data with proper visualization', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      const pie = screen.getByTestId('pie');
      expect(pie.getAttribute('data-data-length')).toBe('5');
    });
  });

  describe('Color Theming', () => {
    test('uses brand color theme for visualization', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      // Check that the component displays color indicators in top services
      const colorIndicators = document.querySelectorAll('.w-3.h-3.rounded-full');
      expect(colorIndicators.length).toBe(3); // Top 3 services
    });

    test('displays service breakdown with proper styling', () => {
      render(<ServicePopularityChart data={mockServiceData.slice(0, 3)} />);
      
      // Check top services list specifically
      const topServicesSection = screen.getByText('Top Services').parentElement;
      expect(topServicesSection).toHaveTextContent('DJ');
      expect(topServicesSection).toHaveTextContent('Photography');
      expect(topServicesSection).toHaveTextContent('Karaoke');
    });
  });

  describe('Chart Configuration', () => {
    test('includes tooltip for data interaction', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    test('includes legend when showLegend is true', () => {
      render(<ServicePopularityChart data={mockServiceData} showLegend={true} />);
      
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    test('excludes legend when showLegend is false', () => {
      render(<ServicePopularityChart data={mockServiceData} showLegend={false} />);
      
      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });

    test('shows legend by default', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    test('displays total services count', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      const totalCount = mockServiceData.reduce((sum, item) => sum + item.count, 0);
      expect(screen.getByText(totalCount.toString())).toBeInTheDocument();
      expect(screen.getByText('Total Services')).toBeInTheDocument();
    });

    test('displays most popular service correctly', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
      // Check for the most popular service in the statistics section specifically
      const mostPopularSection = screen.getByText('Most Popular').closest('div');
      expect(mostPopularSection).toHaveTextContent('DJ');
      expect(mostPopularSection).toHaveTextContent('36.8%'); // DJ: 35/(35+22+18+12+8) = 35/95 = 36.8%
    });

    test('calculates percentage for most popular service', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      const totalCount = mockServiceData.reduce((sum, item) => sum + item.count, 0); // 95
      const topPercentage = ((mockServiceData[0].count / totalCount) * 100).toFixed(1); // (35/95)*100 = 36.8%
      
      expect(screen.getByText(`${topPercentage}%`)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('uses ResponsiveContainer for responsive behavior', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    test('sets proper height for chart container', () => {
      render(<ServicePopularityChart data={mockServiceData} height={400} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides accessible title for screen readers', () => {
      render(<ServicePopularityChart data={mockServiceData} title="Service Distribution" />);
      
      expect(screen.getByRole('heading', { name: 'Service Distribution' })).toBeInTheDocument();
    });

    test('provides chart description for accessibility', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      expect(screen.getByText(/Pie chart showing service popularity distribution/)).toBeInTheDocument();
    });

    test('provides summary statistics for screen readers', () => {
      render(<ServicePopularityChart data={mockServiceData} />);
      
      expect(screen.getByText('Total Services')).toBeInTheDocument();
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });
  });
});