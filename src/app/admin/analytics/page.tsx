/**
 * @fileoverview Admin Analytics Page
 * 
 * Comprehensive analytics dashboard with charts and detailed metrics.
 */

import { AdminAnalytics } from '@/components/admin/AdminAnalytics';

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <AdminAnalytics />
      </div>
    </div>
  );
}