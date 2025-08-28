/**
 * @fileoverview Admin Calendar Management Page
 * 
 * Admin interface for managing calendar availability and bookings.
 */

import { CalendarManagement } from '@/components/admin/CalendarManagement';

export default function AdminCalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <CalendarManagement />
      </div>
    </div>
  );
}