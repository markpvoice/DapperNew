/**
 * @fileoverview Revenue Chart Component
 * 
 * Interactive chart component for displaying revenue analytics with:
 * - Multiple chart types (line, area, bar)
 * - Dual-axis support for revenue and booking count
 * - Responsive design with brand theming
 * - Accessibility compliance
 */

'use client';

import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  BarChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
  chartType?: 'line' | 'area' | 'bar';
  showBookings?: boolean;
  height?: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

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
            {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart({ 
  data, 
  title = 'Revenue Analytics',
  chartType = 'line',
  showBookings = true,
  height = 300
}: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No revenue data available for this period</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
  }));

  const startDate = data[0]?.date;
  const endDate = data[data.length - 1]?.date;
  
  const chartDescription = `Revenue chart showing data from ${startDate ? new Date(startDate).toLocaleDateString() : 'start'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'end'}`;

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const chartElements = (
      <>
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
          tickFormatter={formatCurrency}
        />
        <Tooltip content={<CustomTooltip />} />
        {showBookings && <Legend />}
        
        {chartType === 'line' && (
          <>
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#FFD700" 
              strokeWidth={3}
              dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }}
              name="Revenue"
            />
            {showBookings && (
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#2C2C2C" 
                strokeWidth={2}
                dot={{ fill: '#2C2C2C', strokeWidth: 2, r: 3 }}
                name="Bookings"
              />
            )}
          </>
        )}
        
        {chartType === 'area' && (
          <>
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#FFD700" 
              fill="rgba(255, 215, 0, 0.3)"
              strokeWidth={2}
              name="Revenue"
            />
            {showBookings && (
              <Area 
                type="monotone" 
                dataKey="bookings" 
                stroke="#2C2C2C" 
                fill="rgba(44, 44, 44, 0.1)"
                strokeWidth={2}
                name="Bookings"
              />
            )}
          </>
        )}
        
        {chartType === 'bar' && (
          <>
            <Bar dataKey="revenue" fill="#FFD700" name="Revenue" />
            {showBookings && (
              <Bar dataKey="bookings" fill="#2C2C2C" name="Bookings" />
            )}
          </>
        )}
      </>
    );

    if (chartType === 'area') {
      return <AreaChart {...commonProps}>{chartElements}</AreaChart>;
    }
    
    if (chartType === 'bar') {
      return <BarChart {...commonProps}>{chartElements}</BarChart>;
    }
    
    return <LineChart {...commonProps}>{chartElements}</LineChart>;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600" aria-label="Chart description">
          {chartDescription}
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}