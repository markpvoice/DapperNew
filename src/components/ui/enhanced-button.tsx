/**
 * Enhanced Button Component
 * Advanced button with micro-interactions, animations, and premium styling
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const enhancedButtonVariants = cva(
  'enhanced-btn',
  {
    variants: {
      variant: {
        primary: 'enhanced-btn-primary',
        secondary: 'enhanced-btn-secondary',
        luxury: 'enhanced-btn-luxury',
        premium: 'enhanced-btn-premium',
        elegant: 'enhanced-btn-elegant',
        sophisticated: 'enhanced-btn-sophisticated',
        'ghost-gold': 'enhanced-btn-ghost-gold',
        glass: 'enhanced-btn-glass',
        neon: 'enhanced-btn-neon',
        gradient: 'enhanced-btn-gradient',
      },
      size: {
        xs: 'enhanced-btn-xs',
        sm: 'enhanced-btn-sm',
        default: 'enhanced-btn-default',
        lg: 'enhanced-btn-lg',
        xl: 'enhanced-btn-xl',
        '2xl': 'enhanced-btn-2xl',
        'icon-sm': 'enhanced-btn-icon-sm',
        'icon-md': 'enhanced-btn-icon-md',
        'icon-lg': 'enhanced-btn-icon-lg',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        float: 'animate-float',
        shake: 'animate-shake',
        'glow-pulse': 'animate-glow-pulse',
        'scale-hover': 'hover:animate-scale-hover',
        'slide-up': 'animate-slide-up',
        'fade-in': 'animate-fade-in',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rippleEffect?: boolean;
  glowEffect?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    rippleEffect = false,
    glowEffect = false,
    children,
    disabled,
    onClick,
    onKeyDown,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    
    // Handle keyboard events for accessibility
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Call original onKeyDown if provided
      onKeyDown?.(event);
      
      // If disabled, don't handle keyboard events
      if (isDisabled) {
        return;
      }
      
      // Trigger onClick for Enter and Space keys (standard accessibility pattern)
      if ((event.key === 'Enter' || event.key === ' ') && onClick) {
        event.preventDefault();
        onClick(event as any); // Cast to MouseEvent for onClick signature
      }
    }, [onClick, onKeyDown, isDisabled]);
    
    // Handle ripple effect on click
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        return;
      }
      
      // Create ripple effect if enabled
      if (rippleEffect) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          pointer-events: none;
          animation: ripple 0.6s linear;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
          if (button.contains(ripple)) {
            button.removeChild(ripple);
          }
        }, 600);
      }
      
      onClick?.(event);
    }, [onClick, rippleEffect, isDisabled]);
    
    // Apply micro-interaction classes
    const microInteractionClasses = cn(
      rippleEffect && 'ripple-effect',
      glowEffect && 'glow-effect'
    );
    
    // If asChild is true, pass through children directly without modification
    if (asChild) {
      return (
        <Comp 
          className={cn(
            enhancedButtonVariants({ variant, size, animation }),
            microInteractionClasses,
            className
          )} 
          ref={ref} 
          {...props}
        >
          {children}
        </Comp>
      );
    }
    
    return (
      <Comp 
        className={cn(
          enhancedButtonVariants({ variant, size, animation }),
          microInteractionClasses,
          className
        )}
        ref={ref} 
        type="button"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        tabIndex={isDisabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className={loading ? 'opacity-70' : ''}>
          {loading && loadingText ? loadingText : children}
        </span>
        {!loading && rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  }
);
EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, enhancedButtonVariants };