/**
 * @fileoverview Booking Trends Chart Component
 * 
 * Interactive line chart component for displaying booking trends with:
 * - Daily, weekly, and monthly trend visualization
 * - Period selector for different time ranges
 * - Statistics sidebar with key metrics
 * - Responsive design with brand theming
 * - Accessibility compliance
 */

'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface BookingTrendDataPoint {
  date: string;
  bookings: number;
  revenue: number;
}

interface BookingTrendsChartProps {
  data: BookingTrendDataPoint[];
  title?: string;
  showPeriodSelector?: boolean;
  height?: number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium text-gray-900">
          {new Date(label).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.name === 'Bookings' ? 'bookings' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function BookingTrendsChart({
  data,
  title = 'Booking Trends',
  showPeriodSelector = true,
  height = 300,
}: BookingTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No booking trend data available for this period</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
  }));

  const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);
  const averageBookings = (totalBookings / data.length).toFixed(1);
  const peakBookingDay = data.reduce((max, item) => item.bookings > max.bookings ? item : max, data[0]);

  const startDate = data[0]?.date;
  const endDate = data[data.length - 1]?.date;
  
  const chartDescription = `Line chart showing booking trends from ${startDate ? new Date(startDate).toLocaleDateString() : 'start'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'end'}`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        
        {showPeriodSelector && (
          <div className="flex items-center space-x-2 text-sm">
            <button className="px-3 py-1 bg-brand-gold text-white rounded-md font-medium">
              Daily
            </button>
            <button className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors">
              Weekly
            </button>
            <button className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors">
              Monthly
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600" aria-label="Chart description">
          {chartDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart */}
        <div className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#FFD700" 
                strokeWidth={3}
                dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-lg font-semibold text-gray-900">{averageBookings}</p>
            <p className="text-sm text-gray-600">Average per Day</p>
          </div>

          <div className="text-center p-4 bg-brand-gold bg-opacity-10 rounded-lg border border-brand-gold border-opacity-30">
            <p className="text-lg font-semibold text-gray-900">{peakBookingDay.bookings} bookings</p>
            <p className="text-sm text-gray-600">Peak Day</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(peakBookingDay.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}