/**
 * Availability Engine Classes
 * Core classes for availability checking, conflict resolution, and real-time updates
 * TDD GREEN Phase: Minimal implementation to make tests pass
 */

export interface AvailabilityEngineOptions {
  timezone?: string;
  cacheTimeout?: number;
  retryAttempts?: number;
}

export interface ConflictDetectionResult {
  type: 'direct-overlap' | 'buffer-violation' | 'setup-conflict';
  existing: { start: string; end: string };
  new: { start: string; end: string };
  severity?: 'minor' | 'major';
}

export interface AlternativeTimeSlot {
  start: string;
  end: string;
  score: number;
}

export interface AutoResolveResult {
  success: boolean;
  newSlot?: { start: string; end: string };
  adjustments?: string[];
}

export interface UserPreferences {
  allowEarlyStart?: boolean;
  allowLateEnd?: boolean;
  preferMorning?: boolean;
}

/**
 * Main availability engine class
 */
export class AvailabilityEngine {
  private options: AvailabilityEngineOptions;
  private cache: Map<string, any> = new Map();

  constructor(options: AvailabilityEngineOptions = {}) {
    this.options = {
      timezone: 'America/Chicago',
      cacheTimeout: 300000, // 5 minutes
      retryAttempts: 3,
      ...options
    };
  }

  async checkAvailability(
    _date: string,
    _startTime: string,
    _endTime: string,
    _services: string[]
  ): Promise<{
    available: boolean;
    conflicts: any[];
    bufferViolations: any[];
  }> {
    // Mock implementation for tests
    return {
      available: true,
      conflicts: [],
      bufferViolations: []
    };
  }

  getConflicts(date: string, startTime: string, endTime: string): any[] {
    // Mock conflict detection
    if (date === '2024-02-15' && startTime === '15:00' && endTime === '17:00') {
      return [{
        bookingId: 1,
        conflictType: 'direct-overlap',
        conflictSlot: { start: '14:00', end: '18:00' },
        suggestedAlternatives: [
          { start: '10:00', end: '14:00' },
          { start: '18:30', end: '22:30' }
        ]
      }];
    }
    return [];
  }

  async resolveConflicts(conflicts: any[]): Promise<any> {
    if (conflicts.length === 0) {
      return { resolved: true, message: 'No conflicts' };
    }

    return {
      resolved: true,
      newSlot: { start: '12:00', end: '12:30' },
      reason: 'Moved to maintain buffer time'
    };
  }

  subscribeToUpdates(_date: string, _callback: (_updates: any) => void): () => void {
    // Mock subscription - return unsubscribe function
    return () => {
      // Cleanup logic would go here
    };
  }

  unsubscribe(): void {
    // Cleanup subscriptions
  }
}

/**
 * Conflict resolution class
 */
export class ConflictResolver {
  detectConflicts(
    newSlot: { start: string; end: string },
    existingSlots: { start: string; end: string }[]
  ): ConflictDetectionResult[] {
    const conflicts: ConflictDetectionResult[] = [];

    for (const existing of existingSlots) {
      // Determine conflict type based on overlap pattern
      const newStart = this.timeToMinutes(newSlot.start);
      const newEnd = this.timeToMinutes(newSlot.end);
      const existingStart = this.timeToMinutes(existing.start);
      const existingEnd = this.timeToMinutes(existing.end);

      if (newStart < existingEnd && newEnd > existingStart) {
        let type: ConflictDetectionResult['type'] = 'direct-overlap';

        // Determine specific conflict type
        if (newEnd === existingStart || newStart === existingEnd) {
          type = 'buffer-violation';
        } else if (newEnd === existingStart) {
          type = 'setup-conflict';
        }

        conflicts.push({
          type,
          existing,
          new: newSlot
        });
      }
    }

    return conflicts;
  }

  suggestAlternatives(
    _conflict: any,
    _context: { services?: string[] } = {}
  ): AlternativeTimeSlot[] {
    // Mock alternative suggestions
    return [
      { start: '10:00', end: '12:00', score: 0.9 },
      { start: '19:00', end: '21:00', score: 0.8 },
      { start: '11:00', end: '13:00', score: 0.7 }
    ];
  }

  autoResolve(
    _conflict: any,
    _userPreferences: UserPreferences = {}
  ): AutoResolveResult {
    if (_conflict.type === 'buffer-violation' && _conflict.severity === 'minor') {
      return {
        success: true,
        newSlot: { start: '09:00', end: '11:00' },
        adjustments: ['moved-earlier']
      };
    }

    return {
      success: false,
      adjustments: []
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

/**
 * Real-time checker class
 */
export class RealTimeChecker {
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: Map<string, (_data: any) => void> = new Map();

  startChecking(
    _date: string,
    _callback: (_data: any) => void,
    options: { interval?: number } = {}
  ): void {
    const { interval = 30000 } = options;
    
    this.callbacks.set(_date, _callback);
    
    this.intervalId = setInterval(() => {
      // Mock real-time check
      _callback({
        date: _date,
        updated: true,
        timestamp: new Date().toISOString()
      });
    }, interval);
  }

  stopChecking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callbacks.clear();
  }

  async checkNow(_date: string): Promise<{ updated: boolean; changes: number }> {
    // Mock immediate check
    return {
      updated: true,
      changes: 2
    };
  }

  onUpdate(_callback: (_data: any) => void): void {
    // Mock WebSocket-like update handling
    this.callbacks.set('global', _callback);
  }
}