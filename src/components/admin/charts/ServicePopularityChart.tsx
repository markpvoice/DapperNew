/**
 * @fileoverview Service Popularity Chart Component
 * 
 * Interactive pie chart component for displaying service popularity with:
 * - Color-coded service breakdown
 * - Interactive tooltips and legends
 * - Summary statistics display
 * - Responsive design with brand theming
 * - Accessibility compliance
 */

'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface ServiceDataPoint {
  service: string;
  count: number;
}

interface ServicePopularityChartProps {
  data: ServiceDataPoint[];
  title?: string;
  showLegend?: boolean;
  height?: number;
}

// Brand-focused color palette for services
const SERVICE_COLORS = [
  '#FFD700', // Brand gold
  '#2C2C2C', // Brand charcoal
  '#6B7280', // Gray-500
  '#F59E0B', // Amber-500
  '#8B5CF6', // Violet-500
  '#EF4444', // Red-500
  '#10B981', // Emerald-500
  '#3B82F6', // Blue-500
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          {data.value} bookings ({((data.value / data.payload.totalCount) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export function ServicePopularityChart({
  data,
  title = 'Service Popularity',
  showLegend = true,
  height = 300,
}: ServicePopularityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No service data available for this period</p>
        </div>
      </div>
    );
  }

  // Calculate total and add to each data point for percentage calculations
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map(item => ({
    ...item,
    totalCount,
  }));

  const mostPopularService = data[0];
  const mostPopularPercentage = ((mostPopularService.count / totalCount) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600" aria-label="Chart description">
          Pie chart showing service popularity distribution across {data.length} services
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                nameKey="service"
                fill="#FFD700"
              >
                {chartData.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            <p className="text-sm text-gray-600">Total Services</p>
          </div>
          
          <div className="text-center p-4 bg-brand-gold bg-opacity-10 rounded-lg border border-brand-gold border-opacity-30">
            <p className="text-lg font-semibold text-gray-900">{mostPopularService.service}</p>
            <p className="text-sm text-gray-600">Most Popular</p>
            <p className="text-sm font-medium text-brand-gold">{mostPopularPercentage}%</p>
          </div>

          {/* Top 3 Services List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Top Services</h4>
            {data.slice(0, 3).map((service, index) => (
              <div key={service.service} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: SERVICE_COLORS[index] }}
                  ></div>
                  <span className="text-gray-700">{service.service}</span>
                </div>
                <span className="font-medium text-gray-900">{service.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}