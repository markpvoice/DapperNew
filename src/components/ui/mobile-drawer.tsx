/**
 * @fileoverview Mobile Drawer Component
 * 
 * Touch-optimized mobile navigation drawer:
 * - Swipe to open/close functionality
 * - Backdrop tap to close
 * - Smooth animations and transitions
 * - Touch-friendly navigation items
 * - Accessibility support
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useMobileOptimizations } from '@/hooks/use-mobile-optimizations';
import Link from 'next/link';

interface DrawerItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
  isActive?: boolean;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: DrawerItem[];
  title?: string;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export function MobileDrawer({
  isOpen,
  onClose,
  items,
  title = 'Navigation',
  footer,
  className = '',
  overlayClassName = ''
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const { 
    deviceInfo, 
    touchCapabilities, 
    getDrawerWidth,
    getTouchTargetSize,
    supportsHapticFeedback 
  } = useMobileOptimizations();
  
  // Suppress unused variable warnings
  void deviceInfo;
  void touchCapabilities;

  const drawerWidth = getDrawerWidth();
  const touchTargetSize = getTouchTargetSize('medium');

  // Haptic feedback
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' = 'light') => {
    if (supportsHapticFeedback() && 'vibrate' in navigator) {
      const patterns = { light: [5], medium: [10] };
      navigator.vibrate(patterns[type]);
    }
  }, [supportsHapticFeedback]);

  // Handle drawer swipe gestures
  const { isSwipping, swipeDirection, swipeDistance } = useTouchGestures(drawerRef, {
    onSwipe: (direction, distance, velocity) => {
      if (direction === 'left' && distance > 100 && velocity > 0.3) {
        triggerHapticFeedback('medium');
        onClose();
      }
    },
    onTouchStart: () => {
      setIsDragging(true);
    },
    onTouchMove: () => {
      if (isSwipping && swipeDirection === 'left') {
        const offset = Math.min(0, -swipeDistance * 0.8);
        setDragOffset(offset);
      }
    },
    onTouchEnd: () => {
      setIsDragging(false);
      setDragOffset(0);
      
      // Auto-close if dragged far enough
      if (Math.abs(dragOffset) > drawerWidth * 0.3) {
        onClose();
      }
    },
    swipeThreshold: 50,
    enableSwipe: true,
    preventDefaultScroll: true
  });

  // Handle backdrop tap
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      triggerHapticFeedback('light');
      onClose();
    }
  }, [onClose, triggerHapticFeedback]);

  // Handle item selection
  const handleItemClick = useCallback((item: DrawerItem) => {
    triggerHapticFeedback('light');
    
    if (item.onClick) {
      item.onClick();
    }
    
    // Close drawer after selection
    setTimeout(() => onClose(), 150);
  }, [onClose, triggerHapticFeedback]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      // Focus first focusable element
      const firstFocusable = drawerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
      }
    }
  }, [isOpen]);

  if (!isOpen && dragOffset === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`
          fixed inset-0 bg-black transition-opacity duration-300 z-40
          ${isOpen ? 'opacity-50' : 'opacity-0'}
          ${overlayClassName}
        `}
        onClick={handleBackdropClick}
        data-testid="mobile-drawer-backdrop"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 left-0 h-full bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDragging ? 'transition-none' : ''}
          ${className}
        `}
        style={{
          width: `${drawerWidth}px`,
          transform: `translateX(${isOpen ? dragOffset : -drawerWidth}px)`
        }}
        data-testid="mobile-drawer"
        data-open={isOpen}
        role="dialog"
        aria-label={title}
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
            style={{
              width: `${touchTargetSize}px`,
              height: `${touchTargetSize}px`,
              minWidth: `${touchTargetSize}px`,
              minHeight: `${touchTargetSize}px`
            }}
            data-testid="drawer-close-button"
            aria-label="Close navigation"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            {items.map((item) => (
              <div key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-3 py-3 rounded-lg text-left w-full
                      transition-colors duration-200
                      ${item.isActive 
                        ? 'bg-brand-gold/20 text-brand-charcoal font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    style={{
                      minHeight: `${touchTargetSize}px`
                    }}
                    onClick={() => handleItemClick(item)}
                    data-testid={`drawer-item-${item.id}`}
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`
                      flex items-center px-3 py-3 rounded-lg text-left w-full
                      transition-colors duration-200
                      ${item.isActive 
                        ? 'bg-brand-gold/20 text-brand-charcoal font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    style={{
                      minHeight: `${touchTargetSize}px`
                    }}
                    data-testid={`drawer-item-${item.id}`}
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 p-4">
            {footer}
          </div>
        )}

        {/* Swipe indicator */}
        {isDragging && Math.abs(dragOffset) > 20 && (
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Custom CSS for mobile optimizations */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .transition-transform,
          .transition-colors,
          .transition-opacity {
            transition: none !important;
          }
        }

        /* Improve touch scrolling on iOS */
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
        }

        /* Ensure proper z-index stacking */
        @supports (backdrop-filter: blur(10px)) {
          .bg-black {
            backdrop-filter: blur(2px);
            background-color: rgba(0, 0, 0, 0.4);
          }
        }
      `}</style>
    </>
  );
}