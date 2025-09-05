/**
 * @fileoverview Enhanced Mobile Navigation Component
 * 
 * Gesture-enhanced mobile navigation with:
 * - Swipe gestures for tab switching and drawer control
 * - Edge swipe navigation for back/forward actions
 * - Long press context menus
 * - Velocity-based gesture completion
 * - Multi-touch gesture support
 * - Advanced accessibility features
 */

'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useAdvancedGestures } from '@/hooks/use-advanced-gestures';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';
import { MobileDrawer } from '@/components/ui/mobile-drawer';
import Link from 'next/link';

interface NavTab {
  id: string;
  label: string;
  icon: string;
  href: string;
  path: string; // Add path property to match NavigationTab interface
  badge?: number;
  isActive?: boolean;
  disabled?: boolean;
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}

interface EnhancedMobileNavProps {
  tabs: NavTab[];
  activeTabId: string;
  onTabChange: (_tabId: string) => void;
  
  // Drawer configuration
  drawerItems?: Array<{
    id: string;
    label: string;
    icon: string;
    href?: string;
    onClick?: () => void;
    badge?: number;
  }>;
  
  // Gesture configuration
  enableSwipeNavigation?: boolean;
  enableEdgeSwipe?: boolean;
  enableLongPress?: boolean;
  enablePinchZoom?: boolean;
  swipeVelocityThreshold?: number;
  
  // Visual configuration
  className?: string;
  tabHeight?: number;
  showLabels?: boolean;
  enableHapticFeedback?: boolean;
  
  // Accessibility
  announceNavigationChanges?: boolean;
  
  // Event handlers
  onDrawerOpen?: () => void;
  onDrawerClose?: () => void;
  onSwipeNavigation?: (_direction: string, _tabId: string) => void;
  onLongPressTab?: (_tabId: string, _contextItems: ContextMenuItem[]) => void;
}

export function EnhancedMobileNav({
  tabs,
  activeTabId,
  onTabChange,
  drawerItems = [],
  enableSwipeNavigation = true,
  enableEdgeSwipe = true,
  enableLongPress = true,
  enablePinchZoom = false,
  swipeVelocityThreshold = 0.3,
  className = '',
  tabHeight = 60,
  showLabels = true,
  enableHapticFeedback = true,
  announceNavigationChanges = true,
  onDrawerOpen,
  onDrawerClose,
  onSwipeNavigation,
  onLongPressTab
}: EnhancedMobileNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    tabId: string;
    items: ContextMenuItem[];
    position: { x: number; y: number };
  } | null>(null);
  const [tabScale, setTabScale] = useState(1);
  const [previewTab, setPreviewTab] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState('');

  // Mobile navigation state management
  const {
    isDrawerOpen,
    toggleDrawer: _toggleDrawer,
    openDrawer,
    closeDrawer,
    canGoBack: _canGoBack,
    goBack: _goBack
  } = useMobileNavigation(tabs, {
    initialTab: activeTabId,
    onTabChange,
    onDrawerToggle: (isOpen) => {
      if (isOpen) {
        onDrawerOpen?.();
      } else {
        onDrawerClose?.();
      }
    }
  });

  // Find current active tab index
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTabId);
  
  // Navigation helpers
  const getNextTab = useCallback(() => {
    const nextIndex = (activeTabIndex + 1) % tabs.length;
    return tabs[nextIndex];
  }, [activeTabIndex, tabs]);

  const getPreviousTab = useCallback(() => {
    const prevIndex = activeTabIndex === 0 ? tabs.length - 1 : activeTabIndex - 1;
    return tabs[prevIndex];
  }, [activeTabIndex, tabs]);

  // Context menu items generator
  const generateContextItems = useCallback((tabId: string): ContextMenuItem[] => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) {
      return [];
    }

    return [
      {
        id: 'open-new',
        label: 'Open in New Window',
        icon: '🔗',
        action: () => {
          window.open(tab.href, '_blank');
          setContextMenu(null);
        }
      },
      {
        id: 'bookmark',
        label: 'Bookmark',
        icon: '⭐',
        action: () => {
          // Implementation for bookmarking
          setContextMenu(null);
        }
      },
      {
        id: 'share',
        label: 'Share',
        icon: '📤',
        action: () => {
          if (navigator.share) {
            navigator.share({
              title: tab.label,
              url: tab.href
            });
          }
          setContextMenu(null);
        }
      }
    ];
  }, [tabs]);

  // Advanced gesture handling
  const {
    swipeState,
    pinchState,
    longPressState: _longPressState,
    isHorizontalSwipe,
    isVerticalSwipe: _isVerticalSwipe,
    isFastGesture,
    isMediumGesture: _isMediumGesture,
    isEdgeSwipe: _isEdgeSwipe,
    triggerHapticFeedback
  } = useAdvancedGestures(navRef, {
    enableSwipe: enableSwipeNavigation,
    enablePinch: enablePinchZoom,
    enableLongPress: enableLongPress,
    enableEdgeSwipe: enableEdgeSwipe,
    hapticFeedback: { enabled: enableHapticFeedback },
    velocityThresholds: {
      slow: 0.2,
      medium: swipeVelocityThreshold,
      fast: 0.8
    },
    
    onSwipe: (direction, distance, velocity, isEdge) => {
      // Handle edge swipes for drawer control
      if (isEdge && enableEdgeSwipe) {
        if (direction === 'right' && !isDrawerOpen) {
          openDrawer();
          setAnnouncementText('Navigation drawer opened');
          return;
        }
        if (direction === 'left' && isDrawerOpen) {
          closeDrawer();
          setAnnouncementText('Navigation drawer closed');
          return;
        }
      }

      // Handle horizontal swipes for tab navigation
      if (enableSwipeNavigation && isHorizontalSwipe && !isDrawerOpen) {
        let targetTab: NavTab | null = null;
        
        if (direction === 'left') {
          targetTab = getNextTab();
        } else if (direction === 'right') {
          targetTab = getPreviousTab();
        }
        
        if (targetTab && !targetTab.disabled) {
          // Fast swipes complete immediately, slow swipes need more distance
          const shouldComplete = isFastGesture || distance > 80;
          
          if (shouldComplete) {
            onTabChange(targetTab.id);
            onSwipeNavigation?.(direction, targetTab.id);
            setAnnouncementText(`Navigated to ${targetTab.label}`);
          } else {
            // Show preview of target tab
            setPreviewTab(targetTab.id);
            setTimeout(() => setPreviewTab(null), 300);
          }
        }
      }
    },
    
    onPinch: (scale, _center, _velocity) => {
      if (!enablePinchZoom) {
        return;
      }
      
      // Apply pinch-to-zoom to tab items
      const clampedScale = Math.max(0.8, Math.min(1.4, scale));
      setTabScale(clampedScale);
      
      if (enableHapticFeedback && Math.abs(scale - 1) > 0.1) {
        triggerHapticFeedback('light');
      }
    },
    
    onLongPress: (point, _duration) => {
      if (!enableLongPress) {
        return;
      }
      
      // Find which tab was long-pressed
      const tabElements = tabsRef.current?.querySelectorAll('[data-tab-id]');
      if (!tabElements) {
        return;
      }
      
      let targetTabId: string | null = null;
      
      tabElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (
          point.x >= rect.left &&
          point.x <= rect.right &&
          point.y >= rect.top &&
          point.y <= rect.bottom
        ) {
          targetTabId = element.getAttribute('data-tab-id');
        }
      });
      
      if (targetTabId) {
        const contextItems = generateContextItems(targetTabId);
        setContextMenu({
          tabId: targetTabId,
          items: contextItems,
          position: point
        });
        
        onLongPressTab?.(targetTabId, contextItems);
        setAnnouncementText(`Context menu opened for ${tabs.find(t => t.id === targetTabId)?.label}`);
      }
    }
  });

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enableSwipeNavigation) {
      return;
    }
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        const prevTab = getPreviousTab();
        if (prevTab && !prevTab.disabled) {
          onTabChange(prevTab.id);
          setAnnouncementText(`Navigated to ${prevTab.label}`);
        }
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        const nextTab = getNextTab();
        if (nextTab && !nextTab.disabled) {
          onTabChange(nextTab.id);
          setAnnouncementText(`Navigated to ${nextTab.label}`);
        }
        break;
        
      case 'Escape':
        if (contextMenu) {
          setContextMenu(null);
          setAnnouncementText('Context menu closed');
        } else if (isDrawerOpen) {
          closeDrawer();
          setAnnouncementText('Navigation drawer closed');
        }
        break;
    }
  }, [enableSwipeNavigation, getPreviousTab, getNextTab, onTabChange, contextMenu, isDrawerOpen, closeDrawer]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && navRef.current && !navRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  // Reset pinch scale when pinch ends
  useEffect(() => {
    if (!pinchState.isActive && tabScale !== 1) {
      const resetTimer = setTimeout(() => setTabScale(1), 300);
      return () => clearTimeout(resetTimer);
    }
  }, [pinchState.isActive, tabScale]);

  return (
    <>
      {/* Enhanced Mobile Navigation */}
      <nav 
        ref={navRef}
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ${className}`}
        style={{ height: tabHeight }}
        onKeyDown={handleKeyDown}
        role="navigation"
        aria-label="Main navigation"
        data-testid="enhanced-mobile-nav"
      >
        {/* Tab Bar */}
        <div 
          ref={tabsRef}
          className="flex h-full"
          style={{ transform: `scale(${tabScale})`, transformOrigin: 'center' }}
        >
          {tabs.map((tab, _index) => {
            const isActive = tab.id === activeTabId;
            const isPreview = tab.id === previewTab;
            
            return (
              <Link
                key={tab.id}
                href={tab.href}
                data-tab-id={tab.id}
                className={`
                  flex-1 flex flex-col items-center justify-center relative
                  transition-all duration-200 select-none
                  ${isActive 
                    ? 'text-brand-gold bg-brand-gold/10' 
                    : 'text-gray-600 hover:text-gray-800 active:bg-gray-100'
                  }
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${isPreview ? 'bg-gray-100 scale-105' : ''}
                `}
                style={{
                  minHeight: '44px', // Touch target compliance
                  touchAction: 'manipulation'
                }}
                onClick={(e) => {
                  if (tab.disabled) {
                    e.preventDefault();
                    return;
                  }
                  onTabChange(tab.id);
                }}
                role="tab"
                aria-selected={isActive}
                aria-disabled={tab.disabled}
                tabIndex={isActive ? 0 : -1}
                data-testid={`nav-tab-${tab.id}`}
              >
                {/* Icon */}
                <div className={`text-xl mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                  {tab.icon}
                </div>
                
                {/* Label */}
                {showLabels && (
                  <div className={`text-xs font-medium ${isActive ? 'text-brand-gold' : ''}`}>
                    {tab.label}
                  </div>
                )}
                
                {/* Badge */}
                {tab.badge && tab.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </div>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-brand-gold rounded-b" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Gesture feedback overlay */}
        {(swipeState.isActive || pinchState.isActive) && (
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        )}
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        items={drawerItems}
        title="Navigation"
      />

      {/* Context Menu */}
      {contextMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-60"
            onClick={() => setContextMenu(null)}
            data-testid="context-menu-backdrop"
          />
          
          {/* Menu */}
          <div 
            className="fixed bg-white rounded-lg shadow-xl border z-70 min-w-[200px]"
            style={{
              left: Math.min(contextMenu.position.x, window.innerWidth - 220),
              top: Math.max(10, contextMenu.position.y - 100),
            }}
            role="menu"
            aria-label={`Context menu for ${tabs.find(t => t.id === contextMenu.tabId)?.label}`}
            data-testid="context-menu"
          >
            {contextMenu.items.map((item) => (
              <button
                key={item.id}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center
                  first:rounded-t-lg last:rounded-b-lg
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !item.disabled && item.action()}
                disabled={item.disabled}
                role="menuitem"
                data-testid={`context-menu-item-${item.id}`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Accessibility announcements */}
      {announceNavigationChanges && (
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
          data-testid="navigation-announcements"
        >
          {announcementText}
        </div>
      )}

      {/* Gesture instructions for screen readers */}
      <div className="sr-only" data-testid="gesture-instructions">
        Navigation supports swipe gestures: 
        swipe left or right to change tabs, 
        swipe from left edge to open menu, 
        long press on tabs for more options.
        Use arrow keys for keyboard navigation.
      </div>

      {/* Enhanced mobile navigation styles */}
      <style jsx>{`
        /* Improved touch interaction */
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Smooth transitions for reduced motion users */
        @media (prefers-reduced-motion: reduce) {
          .transition-all,
          .transition-transform,
          .duration-200 {
            transition: none !important;
          }
        }
        
        /* Enhanced touch targets for accessibility */
        .cursor-pointer {
          touch-action: manipulation;
        }
        
        /* Backdrop blur support */
        @supports (backdrop-filter: blur(10px)) {
          .bg-black\\/20 {
            backdrop-filter: blur(2px);
          }
        }
      `}</style>
    </>
  );
}