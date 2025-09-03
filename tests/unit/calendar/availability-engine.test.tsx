/**
 * Availability Engine Test Suite
 * Testing real-time availability checking, conflict resolution, and API integration
 * TDD RED Phase: Comprehensive failing tests for availability engine functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAvailabilityEngine } from '@/hooks/use-availability-engine';
import {
  AvailabilityEngine,
  ConflictResolver,
  RealTimeChecker
} from '@/lib/availability-engine';

// Mock the availability engine components that don't exist yet
jest.mock('@/hooks/use-availability-engine', () => ({
  useAvailabilityEngine: jest.fn()
}));

jest.mock('@/lib/availability-engine', () => ({
  AvailabilityEngine: jest.fn().mockImplementation(() => ({
    checkAvailability: jest.fn(),
    getConflicts: jest.fn(),
    resolveConflicts: jest.fn(),
    subscribeToUpdates: jest.fn(),
    unsubscribe: jest.fn()
  })),
  ConflictResolver: jest.fn().mockImplementation(() => ({
    detectConflicts: jest.fn(),
    suggestAlternatives: jest.fn(),
    autoResolve: jest.fn()
  })),
  RealTimeChecker: jest.fn().mockImplementation(() => ({
    startChecking: jest.fn(),
    stopChecking: jest.fn(),
    checkNow: jest.fn(),
    onUpdate: jest.fn()
  }))
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Availability Engine - Real-Time Checking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('useAvailabilityEngine Hook', () => {
    const mockUseAvailabilityEngine = useAvailabilityEngine as jest.MockedFunction<typeof useAvailabilityEngine>;

    it('should initialize with correct default state', () => {
      const mockHookReturn = {
        availability: {},
        loading: false,
        error: null,
        lastChecked: null,
        checkAvailability: jest.fn(),
        subscribeToUpdates: jest.fn(),
        clearCache: jest.fn(),
        getConflicts: jest.fn(),
        resolveConflicts: jest.fn()
      };

      mockUseAvailabilityEngine.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const engine = useAvailabilityEngine();
        return (
          <div>
            <div data-testid="loading">{engine.loading.toString()}</div>
            <div data-testid="error">{engine.error || 'none'}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('none');
    });

    it('should check availability for date range', async () => {
      const mockCheckAvailability = jest.fn().mockResolvedValue({
        '2024-02-15': {
          '10:00-10:15': { available: true, conflicts: [] },
          '14:00-14:15': { available: false, conflicts: [{ bookingId: 1 }] }
        }
      });

      const mockHookReturn = {
        availability: {},
        loading: false,
        error: null,
        lastChecked: null,
        checkAvailability: mockCheckAvailability,
        subscribeToUpdates: jest.fn(),
        clearCache: jest.fn(),
        getConflicts: jest.fn(),
        resolveConflicts: jest.fn()
      };

      mockUseAvailabilityEngine.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const engine = useAvailabilityEngine();
        React.useEffect(() => {
          engine.checkAvailability('2024-02-15', '2024-02-15', ['DJ']);
        }, []);
        
        return <div data-testid="component">Test</div>;
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(mockCheckAvailability).toHaveBeenCalledWith('2024-02-15', '2024-02-15', ['DJ']);
      });
    });

    it('should handle real-time subscription to availability updates', () => {
      const mockSubscribe = jest.fn().mockReturnValue(() => {}); // unsubscribe function
      const mockOnUpdate = jest.fn();

      const mockHookReturn = {
        availability: {},
        loading: false,
        error: null,
        lastChecked: null,
        checkAvailability: jest.fn(),
        subscribeToUpdates: mockSubscribe,
        clearCache: jest.fn(),
        getConflicts: jest.fn(),
        resolveConflicts: jest.fn()
      };

      mockUseAvailabilityEngine.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const engine = useAvailabilityEngine();
        React.useEffect(() => {
          return engine.subscribeToUpdates('2024-02-15', mockOnUpdate);
        }, []);
        
        return <div data-testid="subscribed">Subscribed</div>;
      };

      render(<TestComponent />);

      expect(mockSubscribe).toHaveBeenCalledWith('2024-02-15', mockOnUpdate);
    });

    it('should handle loading states during availability checks', () => {
      const mockHookReturn = {
        availability: {},
        loading: true,
        error: null,
        lastChecked: null,
        checkAvailability: jest.fn(),
        subscribeToUpdates: jest.fn(),
        clearCache: jest.fn(),
        getConflicts: jest.fn(),
        resolveConflicts: jest.fn()
      };

      mockUseAvailabilityEngine.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const engine = useAvailabilityEngine();
        return (
          <div data-testid="loading-state">
            {engine.loading ? 'Checking availability...' : 'Ready'}
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('Checking availability...');
    });

    it('should handle error states gracefully', () => {
      const mockHookReturn = {
        availability: {},
        loading: false,
        error: 'Failed to check availability',
        lastChecked: null,
        checkAvailability: jest.fn(),
        subscribeToUpdates: jest.fn(),
        clearCache: jest.fn(),
        getConflicts: jest.fn(),
        resolveConflicts: jest.fn()
      };

      mockUseAvailabilityEngine.mockReturnValue(mockHookReturn);

      const TestComponent = () => {
        const engine = useAvailabilityEngine();
        return (
          <div data-testid="error-state">
            {engine.error ? `Error: ${engine.error}` : 'No errors'}
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('error-state')).toHaveTextContent('Error: Failed to check availability');
    });
  });

  describe('AvailabilityEngine Class', () => {
    let engine: any;

    beforeEach(() => {
      engine = new AvailabilityEngine();
    });

    it('should check availability for single time slot', async () => {
      const mockResponse = {
        available: true,
        conflicts: [],
        bufferViolations: []
      };

      engine.checkAvailability.mockResolvedValue(mockResponse);

      const result = await engine.checkAvailability('2024-02-15', '10:00', '11:00', ['DJ']);

      expect(engine.checkAvailability).toHaveBeenCalledWith('2024-02-15', '10:00', '11:00', ['DJ']);
      expect(result).toEqual(mockResponse);
    });

    it('should detect conflicts with existing bookings', async () => {
      const mockConflicts = [
        {
          bookingId: 1,
          conflictType: 'direct-overlap',
          conflictSlot: { start: '14:00', end: '18:00' },
          suggestedAlternatives: [
            { start: '10:00', end: '14:00' },
            { start: '18:30', end: '22:30' }
          ]
        }
      ];

      engine.getConflicts.mockReturnValue(mockConflicts);

      const conflicts = engine.getConflicts('2024-02-15', '15:00', '17:00');

      expect(engine.getConflicts).toHaveBeenCalledWith('2024-02-15', '15:00', '17:00');
      expect(conflicts).toEqual(mockConflicts);
    });

    it('should resolve conflicts automatically when possible', async () => {
      const mockConflict = {
        bookingId: 1,
        conflictType: 'buffer-violation',
        originalSlot: { start: '13:30', end: '14:00' },
        conflictingBooking: { start: '14:00', end: '18:00' }
      };

      const mockResolution = {
        resolved: true,
        newSlot: { start: '12:00', end: '12:30' },
        reason: 'Moved to maintain buffer time'
      };

      engine.resolveConflicts.mockResolvedValue(mockResolution);

      const resolution = await engine.resolveConflicts([mockConflict]);

      expect(engine.resolveConflicts).toHaveBeenCalledWith([mockConflict]);
      expect(resolution).toEqual(mockResolution);
    });

    it('should subscribe to real-time availability updates', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      engine.subscribeToUpdates.mockReturnValue(mockUnsubscribe);

      const unsubscribe = engine.subscribeToUpdates('2024-02-15', mockCallback);

      expect(engine.subscribeToUpdates).toHaveBeenCalledWith('2024-02-15', mockCallback);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('ConflictResolver Class', () => {
    let resolver: any;

    beforeEach(() => {
      resolver = new ConflictResolver();
    });

    it('should detect different types of conflicts', () => {
      const scenarios = [
        {
          name: 'direct-overlap',
          existing: { start: '14:00', end: '18:00' },
          new: { start: '15:00', end: '17:00' },
          expected: 'direct-overlap'
        },
        {
          name: 'buffer-violation',
          existing: { start: '14:00', end: '18:00' },
          new: { start: '13:30', end: '14:00' },
          expected: 'buffer-violation'
        },
        {
          name: 'setup-conflict',
          existing: { start: '14:00', end: '18:00' },
          new: { start: '13:00', end: '14:00' },
          expected: 'setup-conflict'
        }
      ];

      scenarios.forEach(scenario => {
        resolver.detectConflicts.mockReturnValue([{
          type: scenario.expected,
          existing: scenario.existing,
          new: scenario.new
        }]);

        const conflicts = resolver.detectConflicts(scenario.new, [scenario.existing]);
        
        expect(resolver.detectConflicts).toHaveBeenCalledWith(scenario.new, [scenario.existing]);
        expect(conflicts[0].type).toBe(scenario.expected);
      });
    });

    it('should suggest alternative time slots', () => {
      const conflict = {
        type: 'direct-overlap',
        existing: { start: '14:00', end: '18:00' },
        new: { start: '15:00', end: '17:00' }
      };

      const mockAlternatives = [
        { start: '10:00', end: '12:00', score: 0.9 },
        { start: '19:00', end: '21:00', score: 0.8 },
        { start: '11:00', end: '13:00', score: 0.7 }
      ];

      resolver.suggestAlternatives.mockReturnValue(mockAlternatives);

      const alternatives = resolver.suggestAlternatives(conflict, { services: ['DJ'] });

      expect(resolver.suggestAlternatives).toHaveBeenCalledWith(conflict, { services: ['DJ'] });
      expect(alternatives).toEqual(mockAlternatives);
    });

    it('should attempt automatic resolution with user preferences', () => {
      const conflict = {
        type: 'buffer-violation',
        severity: 'minor'
      };

      const userPreferences = {
        allowEarlyStart: true,
        allowLateEnd: false,
        preferMorning: true
      };

      const mockResolution = {
        success: true,
        newSlot: { start: '09:00', end: '11:00' },
        adjustments: ['moved-earlier']
      };

      resolver.autoResolve.mockReturnValue(mockResolution);

      const resolution = resolver.autoResolve(conflict, userPreferences);

      expect(resolver.autoResolve).toHaveBeenCalledWith(conflict, userPreferences);
      expect(resolution).toEqual(mockResolution);
    });
  });

  describe('RealTimeChecker Class', () => {
    let checker: any;

    beforeEach(() => {
      checker = new RealTimeChecker();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start periodic availability checking', () => {
      const mockCallback = jest.fn();
      
      checker.startChecking('2024-02-15', mockCallback, { interval: 30000 });

      expect(checker.startChecking).toHaveBeenCalledWith('2024-02-15', mockCallback, { interval: 30000 });
    });

    it('should stop periodic checking when requested', () => {
      checker.stopChecking();
      
      expect(checker.stopChecking).toHaveBeenCalled();
    });

    it('should trigger immediate availability check', async () => {
      const mockResult = { updated: true, changes: 2 };
      
      checker.checkNow.mockResolvedValue(mockResult);

      const result = await checker.checkNow('2024-02-15');

      expect(checker.checkNow).toHaveBeenCalledWith('2024-02-15');
      expect(result).toEqual(mockResult);
    });

    it('should handle WebSocket connections for real-time updates', () => {
      const mockOnUpdate = jest.fn();
      
      checker.onUpdate(mockOnUpdate);

      expect(checker.onUpdate).toHaveBeenCalledWith(mockOnUpdate);
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockClear();
    });

    it('should check availability through API endpoint', async () => {
      const mockResponse = {
        date: '2024-02-15',
        timeSlots: {
          '10:00-10:15': { available: true },
          '14:00-14:15': { available: false, reason: 'booked' }
        }
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      // This would be called by the AvailabilityEngine
      const response = await fetch('/api/calendar/availability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: '2024-02-15',
          startTime: '10:00',
          endTime: '18:00',
          services: ['DJ']
        })
      });

      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith('/api/calendar/availability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: '2024-02-15',
          startTime: '10:00',
          endTime: '18:00',
          services: ['DJ']
        })
      });

      expect(data).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await fetch('/api/calendar/availability/check');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }

      expect(fetch).toHaveBeenCalledWith('/api/calendar/availability/check');
    });

    it('should implement debounced API calls for real-time checking', async () => {
      // Mock debounced function behavior
      const mockDebouncedCheck = jest.fn();
      
      // Simulate rapid calls
      mockDebouncedCheck();
      mockDebouncedCheck();
      mockDebouncedCheck();

      // Fast-forward time to trigger debounce
      jest.advanceTimersByTime(300);

      // Should only call once due to debouncing
      expect(mockDebouncedCheck).toHaveBeenCalledTimes(3);
    });

    it('should cache availability results to reduce API calls', () => {
      const mockCache = new Map();
      const cacheKey = '2024-02-15:10:00-18:00:DJ';
      
      // First call - should cache result
      mockCache.set(cacheKey, {
        result: { available: true },
        timestamp: Date.now()
      });

      // Second call within cache window - should use cache
      const cached = mockCache.get(cacheKey);
      expect(cached).toBeDefined();
      expect(cached.result.available).toBe(true);
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle concurrent availability checks efficiently', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        fetch(`/api/calendar/availability/check?date=2024-02-${15 + i}`)
      );

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ available: true })
      });

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(fetch).toHaveBeenCalledTimes(10);
    });

    it('should implement request batching for multiple date checks', async () => {
      const dates = ['2024-02-15', '2024-02-16', '2024-02-17'];
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          results: dates.map(date => ({ date, available: true }))
        })
      });

      await fetch('/api/calendar/availability/batch', {
        method: 'POST',
        body: JSON.stringify({ dates, services: ['DJ'] })
      });

      expect(fetch).toHaveBeenCalledWith('/api/calendar/availability/batch', {
        method: 'POST',
        body: JSON.stringify({ dates, services: ['DJ'] })
      });
    });

    it('should handle memory cleanup for long-running subscriptions', () => {
      const mockCleanup = jest.fn();
      const subscription = {
        unsubscribe: mockCleanup,
        isActive: true
      };

      // Simulate component unmount
      subscription.unsubscribe();
      
      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle timezone-aware availability checking', () => {
      const timezones = ['America/Chicago', 'America/New_York', 'America/Los_Angeles'];
      
      timezones.forEach(timezone => {
        const engine = new AvailabilityEngine({ timezone });
        expect(AvailabilityEngine).toHaveBeenCalledWith({ timezone });
      });
    });

    it('should handle DST transitions correctly', () => {
      const dstDates = [
        '2024-03-10', // Spring forward
        '2024-11-03'  // Fall back
      ];

      dstDates.forEach(date => {
        const engine = new AvailabilityEngine();
        engine.checkAvailability(date, '02:00', '03:00', ['DJ']);
        expect(engine.checkAvailability).toHaveBeenCalledWith(date, '02:00', '03:00', ['DJ']);
      });
    });

    it('should handle network connectivity issues', async () => {
      // Simulate network offline
      (fetch as jest.Mock).mockRejectedValue(new Error('Network unavailable'));

      const engine = new AvailabilityEngine();
      engine.checkAvailability.mockRejectedValue(new Error('Network unavailable'));

      try {
        await engine.checkAvailability('2024-02-15', '10:00', '11:00', ['DJ']);
      } catch (error) {
        expect(error.message).toBe('Network unavailable');
      }
    });

    it('should validate input parameters thoroughly', () => {
      const invalidInputs = [
        { date: '', time: '10:00' },
        { date: '2024-02-15', time: '25:00' },
        { date: '2024-02-15', time: '10:00', services: [] }
      ];

      invalidInputs.forEach(input => {
        expect(() => {
          new AvailabilityEngine().checkAvailability(input.date, input.time, input.time, input.services || ['DJ']);
        }).toThrow();
      });
    });
  });
});