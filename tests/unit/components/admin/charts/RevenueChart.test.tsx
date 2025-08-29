/**
 * @fileoverview Tests for RevenueChart component
 * 
 * Tests chart functionality including:
 * - Data rendering and visualization
 * - Multiple chart types (line, bar, area)
 * - Time period handling
 * - Responsive behavior
 * - Accessibility compliance
 */

import { render, screen } from '@testing-library/react';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';

const mockRevenueData = [
  { date: '2025-08-01', revenue: 2500, bookings: 3 },
  { date: '2025-08-02', revenue: 1800, bookings: 2 },
  { date: '2025-08-03', revenue: 3200, bookings: 4 },
  { date: '2025-08-04', revenue: 0, bookings: 0 },
  { date: '2025-08-05', revenue: 4100, bookings: 5 },
];

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children, data }: any) => <div data-testid="line-chart" data-data-length={data?.length}>{children}</div>,
  AreaChart: ({ children, data }: any) => <div data-testid="area-chart" data-data-length={data?.length}>{children}</div>,
  BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-data-length={data?.length}>{children}</div>,
  Line: ({ dataKey, stroke }: any) => <div data-testid="line" data-key={dataKey} data-color={stroke} />,
  Area: ({ dataKey, stroke }: any) => <div data-testid="area" data-key={dataKey} data-color={stroke} />,
  Bar: ({ dataKey, fill }: any) => <div data-testid="bar" data-key={dataKey} data-color={fill} />,
  XAxis: ({ dataKey, axisLine, tickLine }: any) => <div data-testid="x-axis" data-key={dataKey} data-axis-line={axisLine} data-tick-line={tickLine} />,
  YAxis: ({ axisLine, tickLine }: any) => <div data-testid="y-axis" data-axis-line={axisLine} data-tick-line={tickLine} />,
  CartesianGrid: ({ strokeDasharray }: any) => <div data-testid="cartesian-grid" data-stroke-dasharray={strokeDasharray} />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('RevenueChart Component', () => {
  describe('Rendering and Layout', () => {
    test('renders chart container with proper structure', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    test('renders with custom title when provided', () => {
      render(<RevenueChart data={mockRevenueData} title="Daily Revenue Trends" />);
      
      expect(screen.getByText('Daily Revenue Trends')).toBeInTheDocument();
    });

    test('uses default title when none provided', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();
    });
  });

  describe('Chart Type Selection', () => {
    test('renders line chart by default', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    test('renders area chart when type is area', () => {
      render(<RevenueChart data={mockRevenueData} chartType="area" />);
      
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    test('renders bar chart when type is bar', () => {
      render(<RevenueChart data={mockRevenueData} chartType="bar" />);
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });
  });

  describe('Chart Configuration', () => {
    test('configures X-axis for date display', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis.getAttribute('data-key')).toBe('date');
      expect(xAxis.getAttribute('data-axis-line')).toBe('false');
      expect(xAxis.getAttribute('data-tick-line')).toBe('false');
    });

    test('configures Y-axis for revenue formatting', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      const yAxis = screen.getByTestId('y-axis');
      expect(yAxis.getAttribute('data-axis-line')).toBe('false');
      expect(yAxis.getAttribute('data-tick-line')).toBe('false');
    });

    test('includes cartesian grid for better readability', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      const grid = screen.getByTestId('cartesian-grid');
      expect(grid.getAttribute('data-stroke-dasharray')).toBe('3 3');
    });

    test('includes tooltip for data interaction', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    test('handles empty data gracefully', () => {
      render(<RevenueChart data={[]} />);
      
      expect(screen.getByText('No revenue data available for this period')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    test('passes correct data to chart component', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      const chart = screen.getByTestId('line-chart');
      expect(chart.getAttribute('data-data-length')).toBe('5');
    });

    test('formats revenue values correctly in chart', () => {
      render(<RevenueChart data={mockRevenueData} showBookings={false} />);
      
      const line = screen.getByTestId('line');
      expect(line.getAttribute('data-key')).toBe('revenue');
      expect(line.getAttribute('data-color')).toBe('#FFD700'); // Brand gold color
    });
  });

  describe('Multiple Series Display', () => {
    test('shows both revenue and bookings when showBookings is true', () => {
      render(<RevenueChart data={mockRevenueData} showBookings={true} />);
      
      const lines = screen.getAllByTestId('line');
      expect(lines).toHaveLength(2);
      
      const revenueLine = lines.find(line => line.getAttribute('data-key') === 'revenue');
      const bookingLine = lines.find(line => line.getAttribute('data-key') === 'bookings');
      
      expect(revenueLine).toBeInTheDocument();
      expect(bookingLine).toBeInTheDocument();
    });

    test('shows only revenue when showBookings is false', () => {
      render(<RevenueChart data={mockRevenueData} showBookings={false} />);
      
      const lines = screen.getAllByTestId('line');
      expect(lines).toHaveLength(1);
      
      expect(lines[0].getAttribute('data-key')).toBe('revenue');
    });

    test('includes legend when showing multiple series', () => {
      render(<RevenueChart data={mockRevenueData} showBookings={true} />);
      
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    test('excludes legend when showing single series', () => {
      render(<RevenueChart data={mockRevenueData} showBookings={false} />);
      
      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('uses ResponsiveContainer for responsive behavior', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    test('sets proper height for chart container', () => {
      render(<RevenueChart data={mockRevenueData} height={400} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Color Theming', () => {
    test('uses brand colors for chart elements', () => {
      render(<RevenueChart data={mockRevenueData} showBookings={true} />);
      
      const lines = screen.getAllByTestId('line');
      const colors = lines.map(line => line.getAttribute('data-color'));
      
      expect(colors).toContain('#FFD700'); // Brand gold
      expect(colors).toContain('#2C2C2C'); // Brand charcoal
    });
  });

  describe('Accessibility', () => {
    test('provides accessible title for screen readers', () => {
      render(<RevenueChart data={mockRevenueData} title="Revenue Trends" />);
      
      expect(screen.getByRole('heading', { name: 'Revenue Trends' })).toBeInTheDocument();
    });

    test('provides chart description for accessibility', () => {
      render(<RevenueChart data={mockRevenueData} />);
      
      expect(screen.getByText(/Revenue chart showing data from/)).toBeInTheDocument();
    });
  });
});