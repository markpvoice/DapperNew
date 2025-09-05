/**
 * @fileoverview Mobile Navigation Hook
 * 
 * Custom React hook for mobile admin navigation:
 * - Tab navigation with history tracking
 * - Mobile drawer state management
 * - Back navigation support
 * - Touch-optimized navigation patterns
 */

import { useState, useCallback, useEffect } from 'react';

interface NavigationTab {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

interface MobileNavigationState {
  activeTab: string;
  isDrawerOpen: boolean;
  navigationHistory: string[];
  canGoBack: boolean;
}

interface UseMobileNavigationOptions {
  initialTab?: string;
  onTabChange?: (_tabId: string) => void;
  onDrawerToggle?: (_isOpen: boolean) => void;
  persistHistory?: boolean;
}

const NAVIGATION_HISTORY_KEY = 'dapper-admin-nav-history';

export function useMobileNavigation(
  tabs: NavigationTab[] = [],
  options: UseMobileNavigationOptions = {}
) {
  const {
    initialTab = 'overview',
    onTabChange,
    onDrawerToggle,
    persistHistory = true
  } = options;

  // Load initial state from localStorage if persistence is enabled
  const loadInitialState = useCallback((): MobileNavigationState => {
    if (persistHistory && typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem(NAVIGATION_HISTORY_KEY);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          return {
            activeTab: parsed.activeTab || initialTab,
            isDrawerOpen: false, // Always start with drawer closed
            navigationHistory: Array.isArray(parsed.navigationHistory) 
              ? parsed.navigationHistory 
              : [initialTab],
            canGoBack: (parsed.navigationHistory || []).length > 1
          };
        } catch (error) {
          console.warn('Failed to load navigation history:', error);
        }
      }
    }
    
    return {
      activeTab: initialTab,
      isDrawerOpen: false,
      navigationHistory: [initialTab],
      canGoBack: false
    };
  }, [initialTab, persistHistory]);

  const [state, setState] = useState<MobileNavigationState>(loadInitialState);

  // Persist navigation history
  const persistNavigationState = useCallback((newState: MobileNavigationState) => {
    if (persistHistory && typeof window !== 'undefined') {
      try {
        localStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify({
          activeTab: newState.activeTab,
          navigationHistory: newState.navigationHistory
        }));
      } catch (error) {
        console.warn('Failed to persist navigation history:', error);
      }
    }
  }, [persistHistory]);

  // Navigate to a specific tab
  const navigateToTab = useCallback((tabId: string) => {
    // Validate tab exists
    const tabExists = tabs.some(tab => tab.id === tabId);
    if (!tabExists && tabs.length > 0) {
      console.warn(`Tab "${tabId}" does not exist in provided tabs`);
      return;
    }

    setState(prevState => {
      const newHistory = [...prevState.navigationHistory];
      
      // Don't add to history if it's the same as current tab
      if (tabId !== prevState.activeTab) {
        newHistory.push(tabId);
      }

      // Limit history to prevent memory issues
      const MAX_HISTORY_LENGTH = 50;
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.splice(0, newHistory.length - MAX_HISTORY_LENGTH);
      }

      const newState = {
        ...prevState,
        activeTab: tabId,
        navigationHistory: newHistory,
        canGoBack: newHistory.length > 1,
        isDrawerOpen: false // Close drawer when navigating
      };

      persistNavigationState(newState);
      return newState;
    });

    onTabChange?.(tabId);
  }, [tabs, onTabChange, persistNavigationState]);

  // Toggle drawer open/closed
  const toggleDrawer = useCallback(() => {
    setState(prevState => {
      const newIsOpen = !prevState.isDrawerOpen;
      const newState = {
        ...prevState,
        isDrawerOpen: newIsOpen
      };

      onDrawerToggle?.(newIsOpen);
      return newState;
    });
  }, [onDrawerToggle]);

  // Open drawer
  const openDrawer = useCallback(() => {
    setState(prevState => {
      if (!prevState.isDrawerOpen) {
        const newState = {
          ...prevState,
          isDrawerOpen: true
        };
        onDrawerToggle?.(true);
        return newState;
      }
      return prevState;
    });
  }, [onDrawerToggle]);

  // Close drawer
  const closeDrawer = useCallback(() => {
    setState(prevState => {
      if (prevState.isDrawerOpen) {
        const newState = {
          ...prevState,
          isDrawerOpen: false
        };
        onDrawerToggle?.(false);
        return newState;
      }
      return prevState;
    });
  }, [onDrawerToggle]);

  // Navigate back in history
  const goBack = useCallback(() => {
    setState(prevState => {
      if (prevState.navigationHistory.length <= 1) {
        return prevState; // Can't go back further
      }

      const newHistory = [...prevState.navigationHistory];
      newHistory.pop(); // Remove current tab
      const previousTab = newHistory[newHistory.length - 1];

      const newState = {
        ...prevState,
        activeTab: previousTab,
        navigationHistory: newHistory,
        canGoBack: newHistory.length > 1
      };

      persistNavigationState(newState);
      onTabChange?.(previousTab);
      return newState;
    });
  }, [onTabChange, persistNavigationState]);

  // Get current tab object
  const getCurrentTab = useCallback(() => {
    return tabs.find(tab => tab.id === state.activeTab) || null;
  }, [tabs, state.activeTab]);

  // Check if a tab is active
  const isTabActive = useCallback((tabId: string) => {
    return state.activeTab === tabId;
  }, [state.activeTab]);

  // Get navigation breadcrumbs
  const getBreadcrumbs = useCallback(() => {
    return state.navigationHistory
      .map(tabId => tabs.find(tab => tab.id === tabId))
      .filter(Boolean) as NavigationTab[];
  }, [state.navigationHistory, tabs]);

  // Clear navigation history
  const clearHistory = useCallback(() => {
    setState(prevState => {
      const newState = {
        ...prevState,
        navigationHistory: [prevState.activeTab],
        canGoBack: false
      };

      persistNavigationState(newState);
      return newState;
    });
  }, [persistNavigationState]);

  // Handle browser back button (for PWA behavior)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handlePopState = (event: PopStateEvent) => {
      if (state.canGoBack) {
        event.preventDefault();
        goBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [state.canGoBack, goBack]);

  // Handle escape key to close drawer
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.isDrawerOpen) {
        closeDrawer();
      }
    };

    if (state.isDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [state.isDrawerOpen, closeDrawer]);

  return {
    // State
    activeTab: state.activeTab,
    isDrawerOpen: state.isDrawerOpen,
    navigationHistory: state.navigationHistory,
    canGoBack: state.canGoBack,

    // Actions
    navigateToTab,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    goBack,
    clearHistory,

    // Utilities
    getCurrentTab,
    isTabActive,
    getBreadcrumbs
  };
}