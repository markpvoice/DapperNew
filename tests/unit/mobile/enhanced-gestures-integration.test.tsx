/**
 * @fileoverview Enhanced Gestures Integration Test Suite
 * 
 * Simple integration tests to verify our GREEN phase TDD implementation
 * works correctly without complex mocking or environment issues.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import our implemented components
import { useAdvancedGestures } from '@/hooks/useAdvancedGestures';
import { PullToRefresh } from '@/components/mobile/pull-to-refresh';
import { EnhancedMobileNav } from '@/components/mobile/enhanced-mobile-nav';

// Mock DOM APIs
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', { value: mockVibrate, writable: true });
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(() => ({ matches: false }))
});

describe('Enhanced Mobile Gesture Components - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 812, writable: true });
  });

  describe('useAdvancedGestures Hook', () => {
    it('should initialize successfully with default state', () => {
      const elementRef = { current: document.createElement('div') };
      
      const { result } = renderHook(() => 
        useAdvancedGestures(elementRef)
      );

      // Verify hook initializes without errors
      expect(result.current).toBeDefined();
      expect(result.current.swipeState).toBeDefined();
      expect(result.current.pinchState).toBeDefined();
      expect(result.current.longPressState).toBeDefined();
      expect(result.current.touchState).toBeDefined();
      
      // Verify default state values
      expect(result.current.swipeState.isActive).toBe(false);
      expect(result.current.swipeState.direction).toBe(null);
      expect(result.current.swipeState.velocity).toBe(0);
      expect(result.current.pinchState.isActive).toBe(false);
      expect(result.current.pinchState.scale).toBe(1);
      expect(result.current.longPressState.isActive).toBe(false);
      expect(result.current.touchState.touchCount).toBe(0);
    });

    it('should provide utility methods', () => {
      const elementRef = { current: document.createElement('div') };
      
      const { result } = renderHook(() => 
        useAdvancedGestures(elementRef)
      );

      // Verify utility methods are available
      expect(typeof result.current.resetGestures).toBe('function');
      expect(typeof result.current.triggerHapticFeedback).toBe('function');
      
      // Verify helper properties
      expect(typeof result.current.isGestureActive).toBe('boolean');
      expect(typeof result.current.isDualTouch).toBe('boolean');
      expect(typeof result.current.isMultiTouch).toBe('boolean');
    });

    it('should accept custom options', () => {
      const elementRef = { current: document.createElement('div') };
      const onSwipe = jest.fn();
      
      const { result } = renderHook(() => 
        useAdvancedGestures(elementRef, {
          enableSwipe: false,
          onSwipe,
          swipeThreshold: 100
        })
      );

      expect(result.current).toBeDefined();
      // Options are internal, but hook should initialize successfully
    });
  });

  describe('PullToRefresh Component', () => {
    it('should render successfully with children', () => {
      const onRefresh = jest.fn();
      
      render(
        <PullToRefresh onRefresh={onRefresh}>
          <div data-testid="child-content">Test Content</div>
        </PullToRefresh>
      );

      expect(screen.getByTestId('pull-to-refresh-container')).toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should display pull indicator', () => {
      const onRefresh = jest.fn();
      
      render(
        <PullToRefresh onRefresh={onRefresh}>
          <div>Content</div>
        </PullToRefresh>
      );

      expect(screen.getByTestId('pull-indicator')).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      const onRefresh = jest.fn();
      
      render(
        <PullToRefresh onRefresh={onRefresh} disabled>
          <div>Content</div>
        </PullToRefresh>
      );

      expect(screen.getByTestId('pull-to-refresh-container')).toBeInTheDocument();
    });

    it('should show refreshing state', () => {
      const onRefresh = jest.fn();
      
      render(
        <PullToRefresh onRefresh={onRefresh} isRefreshing>
          <div>Content</div>
        </PullToRefresh>
      );

      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });

    it('should provide accessibility announcements', () => {
      const onRefresh = jest.fn();
      
      render(
        <PullToRefresh onRefresh={onRefresh}>
          <div>Content</div>
        </PullToRefresh>
      );

      expect(screen.getByTestId('pull-status-announcement')).toBeInTheDocument();
      expect(screen.getByTestId('pull-status-announcement')).toHaveAttribute('role', 'status');
      expect(screen.getByTestId('pull-status-announcement')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('EnhancedMobileNav Component', () => {
    const mockTabs = [
      { id: 'home', label: 'Home', icon: '🏠', href: '/' },
      { id: 'search', label: 'Search', icon: '🔍', href: '/search' },
      { id: 'profile', label: 'Profile', icon: '👤', href: '/profile' }
    ];

    it('should render successfully with tabs', () => {
      const onTabChange = jest.fn();
      
      render(
        <EnhancedMobileNav 
          tabs={mockTabs}
          activeTabId="home"
          onTabChange={onTabChange}
        />
      );

      expect(screen.getByTestId('enhanced-mobile-nav')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('nav-tab-home')).toBeInTheDocument();
      expect(screen.getByTestId('nav-tab-search')).toBeInTheDocument();
      expect(screen.getByTestId('nav-tab-profile')).toBeInTheDocument();
    });

    it('should display tab labels and icons', () => {
      const onTabChange = jest.fn();
      
      render(
        <EnhancedMobileNav 
          tabs={mockTabs}
          activeTabId="home"
          onTabChange={onTabChange}
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('🏠')).toBeInTheDocument();
      expect(screen.getByText('🔍')).toBeInTheDocument();
      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('should handle active tab state', () => {
      const onTabChange = jest.fn();
      
      render(
        <EnhancedMobileNav 
          tabs={mockTabs}
          activeTabId="search"
          onTabChange={onTabChange}
        />
      );

      const searchTab = screen.getByTestId('nav-tab-search');
      expect(searchTab).toHaveAttribute('aria-selected', 'true');
      expect(searchTab).toHaveAttribute('tabIndex', '0');
      
      const homeTab = screen.getByTestId('nav-tab-home');
      expect(homeTab).toHaveAttribute('aria-selected', 'false');
      expect(homeTab).toHaveAttribute('tabIndex', '-1');
    });

    it('should provide accessibility features', () => {
      const onTabChange = jest.fn();
      
      render(
        <EnhancedMobileNav 
          tabs={mockTabs}
          activeTabId="home"
          onTabChange={onTabChange}
        />
      );

      // Navigation landmarks
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
      
      // Tab roles
      expect(screen.getByTestId('nav-tab-home')).toHaveAttribute('role', 'tab');
      
      // Gesture instructions for screen readers
      expect(screen.getByTestId('gesture-instructions')).toBeInTheDocument();
      expect(screen.getByTestId('gesture-instructions')).toHaveClass('sr-only');
      
      // Announcements region
      expect(screen.getByTestId('navigation-announcements')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-announcements')).toHaveAttribute('aria-live', 'polite');
    });

    it('should handle tab badges', () => {
      const tabsWithBadge = [
        ...mockTabs,
        { id: 'notifications', label: 'Notifications', icon: '🔔', href: '/notifications', badge: 3 }
      ];
      const onTabChange = jest.fn();
      
      render(
        <EnhancedMobileNav 
          tabs={tabsWithBadge}
          activeTabId="home"
          onTabChange={onTabChange}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should handle disabled tabs', () => {
      const tabsWithDisabled = [
        ...mockTabs,
        { id: 'disabled', label: 'Disabled', icon: '🚫', href: '/disabled', disabled: true }
      ];
      const onTabChange = jest.fn();
      
      render(
        <EnhancedMobileNav 
          tabs={tabsWithDisabled}
          activeTabId="home"
          onTabChange={onTabChange}
        />
      );

      const disabledTab = screen.getByTestId('nav-tab-disabled');
      expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
      expect(disabledTab).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Integration Tests', () => {
    it('should work together without conflicts', () => {
      const onRefresh = jest.fn();
      const onTabChange = jest.fn();
      const tabs = [
        { id: 'home', label: 'Home', icon: '🏠', href: '/' }
      ];
      
      render(
        <div>
          <PullToRefresh onRefresh={onRefresh}>
            <div>Content with gestures</div>
          </PullToRefresh>
          <EnhancedMobileNav 
            tabs={tabs}
            activeTabId="home"
            onTabChange={onTabChange}
          />
        </div>
      );

      expect(screen.getByTestId('pull-to-refresh-container')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-mobile-nav')).toBeInTheDocument();
      expect(screen.getByText('Content with gestures')).toBeInTheDocument();
    });

    it('should maintain performance with multiple gesture components', () => {
      const startTime = performance.now();
      const onRefresh = jest.fn();
      const onTabChange = jest.fn();
      const tabs = [
        { id: 'home', label: 'Home', icon: '🏠', href: '/' },
        { id: 'search', label: 'Search', icon: '🔍', href: '/search' }
      ];
      
      render(
        <div>
          <PullToRefresh onRefresh={onRefresh}>
            <div>Performance test content</div>
          </PullToRefresh>
          <EnhancedMobileNav 
            tabs={tabs}
            activeTabId="home"
            onTabChange={onTabChange}
          />
        </div>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Components should render quickly (under 100ms in test environment)
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('pull-to-refresh-container')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-mobile-nav')).toBeInTheDocument();
    });
  });

  describe('TypeScript Integration', () => {
    it('should have proper TypeScript interfaces', () => {
      // Verify hooks can be imported and used with TypeScript
      const elementRef = { current: document.createElement('div') };
      
      const { result } = renderHook(() => 
        useAdvancedGestures(elementRef, {
          enableSwipe: true,
          enablePinch: true,
          enableLongPress: true,
          hapticFeedback: { enabled: true },
          onSwipe: (direction, distance, velocity, isEdgeSwipe) => {
            // TypeScript should validate these parameters
            expect(typeof direction).toBe('string');
            expect(typeof distance).toBe('number');
            expect(typeof velocity).toBe('number');
            expect(typeof isEdgeSwipe).toBe('boolean');
          }
        })
      );

      expect(result.current).toBeDefined();
    });
  });
});