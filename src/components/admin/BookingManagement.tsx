/**
 * @fileoverview Booking Management Component
 * 
 * Comprehensive booking management interface for admin users.
 * Provides filtering, sorting, CRUD operations, and bulk actions.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useBookings } from '@/hooks/useBookings';

interface BookingManagementProps {
  className?: string;
}

export function BookingManagement({ className = '' }: BookingManagementProps) {
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  

  const {
    bookings,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    updateBookingStatus,
    deleteBooking,
    totalCount,
    page,
    setPage,
    pageSize,
    refetch
  } = useBookings();

  const handleStatusUpdate = useCallback(async (bookingId: string, status: string) => {
    const success = await updateBookingStatus(bookingId, status);
    if (success) {
      await refetch();
    }
  }, [updateBookingStatus, refetch]);

  const handleBulkStatusUpdate = useCallback(async (status: string) => {
    const results = await Promise.allSettled(
      selectedBookings.map(id => updateBookingStatus(id, status))
    );
    
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
    if (successCount > 0) {
      await refetch();
      setSelectedBookings([]);
    }
  }, [selectedBookings, updateBookingStatus, refetch]);

  const handleDelete = useCallback(async (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const success = await deleteBooking(bookingId);
      if (success) {
        await refetch();
      }
    }
  }, [deleteBooking, refetch]);

  const handleBulkDelete = useCallback(async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedBookings.length} bookings?`)) {
      const results = await Promise.allSettled(
        selectedBookings.map(id => deleteBooking(id))
      );
      
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
      if (successCount > 0) {
        await refetch();
        setSelectedBookings([]);
      }
    }
  }, [selectedBookings, deleteBooking, refetch]);

  const handleSelectAll = useCallback(() => {
    if (selectedBookings.length === bookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(booking => booking.id));
    }
  }, [selectedBookings, bookings]);

  const handleSelectBooking = useCallback((bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  }, []);

  // Local filter state for better UX - allows editing without immediate API calls
  const [localFilters, setLocalFilters] = useState(() => {
    // Set default date range: today to end of current month
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return {
      status: filters.status || '',
      eventType: filters.eventType || '',
      dateFrom: filters.dateFrom || today.toISOString().split('T')[0],
      dateTo: filters.dateTo || lastDayOfMonth.toISOString().split('T')[0],
    };
  });


  const handleSearch = useCallback(() => {
    
    // Apply both search term and current local filters
    const newFilters = { 
      status: localFilters.status && localFilters.status !== '' ? localFilters.status : undefined,
      eventType: localFilters.eventType && localFilters.eventType !== '' ? localFilters.eventType : undefined,  
      dateFrom: localFilters.dateFrom && localFilters.dateFrom !== '' ? localFilters.dateFrom : undefined,
      dateTo: localFilters.dateTo && localFilters.dateTo !== '' ? localFilters.dateTo : undefined,
      search: searchTerm && searchTerm !== '' ? searchTerm : undefined
    };
    
    setFilters(newFilters);
    setPage(1);
  }, [searchTerm, localFilters, setFilters, setPage]);

  const clearFilters = useCallback(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setFilters({});
    setSearchTerm('');
    setLocalFilters({ 
      status: '', 
      eventType: '', 
      dateFrom: today.toISOString().split('T')[0], 
      dateTo: lastDayOfMonth.toISOString().split('T')[0]
    });
    setPage(1);
  }, [setFilters, setPage, setLocalFilters]);

  // Sync local filters when actual filters change (e.g., from clear operation)
  useEffect(() => {
    // Only sync if filters are actually being cleared, preserve defaults otherwise
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setLocalFilters({
      status: filters.status || '',
      eventType: filters.eventType || '',
      dateFrom: filters.dateFrom || today.toISOString().split('T')[0],
      dateTo: filters.dateTo || lastDayOfMonth.toISOString().split('T')[0],
    });
  }, [filters]);

  const applyFilters = useCallback(() => {
    const newFilters = {
      status: localFilters.status && localFilters.status !== '' ? localFilters.status : undefined,
      eventType: localFilters.eventType && localFilters.eventType !== '' ? localFilters.eventType : undefined,  
      dateFrom: localFilters.dateFrom && localFilters.dateFrom !== '' ? localFilters.dateFrom : undefined,
      dateTo: localFilters.dateTo && localFilters.dateTo !== '' ? localFilters.dateTo : undefined,
      search: filters.search,
    };
    setFilters(newFilters);
    setPage(1);
  }, [localFilters, filters.search, setFilters, setPage]);

  const handleSortChange = useCallback((field: string) => {
    const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ field: field as any, direction });
  }, [sort, setSort]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`} data-testid="booking-management">
        <div className="text-center" data-testid="bookings-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`} data-testid="booking-management">
        <div className="bg-red-50 border border-red-200 rounded-md p-4" data-testid="bookings-error">
          <div className="text-sm text-red-800">{error}</div>
          <button
            onClick={refetch}
            data-testid="retry-btn"
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`} data-testid="booking-management">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Booking Management</h2>
            <p className="text-sm text-gray-600 mt-1">{totalCount} bookings</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-sm font-medium text-brand-charcoal bg-brand-gold rounded-md hover:bg-brand-dark-gold"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-brand-gold text-brand-charcoal rounded-md hover:bg-brand-dark-gold"
          >
            Search
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200" data-testid="booking-filters">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={localFilters.status}
                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                data-testid="status-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={localFilters.eventType}
                onChange={(e) => setLocalFilters({ ...localFilters, eventType: e.target.value })}
                data-testid="event-type-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="">All Types</option>
                <option value="wedding">Wedding Events</option>
                <option value="birthday">Birthday Parties</option>
                <option value="corporate">Corporate Events</option>
                <option value="anniversary">Anniversary Celebrations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) => {
                  setLocalFilters({ ...localFilters, dateFrom: e.target.value });
                  e.target.blur(); // Auto-close calendar picker
                }}
                data-testid="start-date-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={localFilters.dateTo}
                onChange={(e) => {
                  setLocalFilters({ ...localFilters, dateTo: e.target.value });
                  e.target.blur(); // Auto-close calendar picker
                }}
                data-testid="end-date-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-brand-gold text-brand-charcoal rounded-md hover:bg-brand-dark-gold font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-gray-200" data-testid="bulk-actions">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedBookings.length} booking(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('CONFIRMED')}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm Selected
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('CANCELLED')}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancel Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="overflow-x-auto" data-testid="booking-list">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedBookings.length === bookings.length && bookings.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSortChange('name')}
              >
                Client {sort.field === 'name' && (sort.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSortChange('date')}
              >
                Event Date {sort.field === 'date' && (sort.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSortChange('amount')}
              >
                Amount {sort.field === 'amount' && (sort.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.id)}
                    onChange={() => handleSelectBooking(booking.id)}
                    className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.clientName}</div>
                  <div className="text-sm text-gray-500">{booking.clientEmail}</div>
                  <div className="text-xs text-gray-400">{booking.bookingReference}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    {booking.eventDate ? (() => {
                      try {
                        // Extract date parts directly from ISO string to avoid timezone issues
                        const dateStr = booking.eventDate.includes('T') 
                          ? booking.eventDate.split('T')[0]
                          : booking.eventDate;
                        
                        // Parse date parts manually to avoid timezone conversion
                        const [year, month, day] = dateStr.split('-');
                        
                        return `${month}/${day}/${year}`;
                      } catch (error) {
                        console.error('Date parsing error for booking:', booking.id, error);
                        return booking.eventDate;
                      }
                    })() : 'No Date'}
                  </div>
                  <div className="text-xs text-gray-500">{booking.venueName}</div>
                  {booking.guestCount && <div className="text-xs text-gray-500">{booking.guestCount} guests</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  <div>{booking.eventType}</div>
                  <div className="text-xs text-gray-500">{booking.services.join(', ')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    data-testid={`status-badge-${booking.status}`}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.totalAmount ? `$${booking.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  
                  {/* Show appropriate action based on status */}
                  {booking.status === 'CONFIRMED' ? (
                    <button
                      onClick={() => {
                        if (window.confirm('Cancel this confirmed booking? This will mark it as cancelled but keep the record.')) {
                          handleStatusUpdate(booking.id, 'CANCELLED');
                        }
                      }}
                      className="text-orange-600 hover:text-orange-800 text-xs px-2 py-1 border border-orange-200 rounded hover:bg-orange-50"
                      title="Cancel booking (keeps record)"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                      title="Permanently delete booking"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="text-center py-12" data-testid="empty-state">
          <div className="text-gray-500">
            <p className="text-lg font-medium">No bookings found</p>
            <p className="mt-1">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between" data-testid="pagination">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} bookings
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-brand-gold text-brand-charcoal rounded">
              {page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * pageSize >= totalCount}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}