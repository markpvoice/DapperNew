'use client';

import React, { forwardRef, useId, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface TimePickerProps {
  value?: string;
  onChange: (_value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minTime?: string;
  maxTime?: string;
  step?: number; // Minutes
  format?: '12h' | '24h';
  className?: string;
  id?: string;
}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({
    value,
    onChange,
    placeholder = 'Select time',
    label,
    error,
    required = false,
    disabled = false,
    minTime,
    maxTime,
    step = 30,
    format = '24h',
    className,
    id: providedId,
    ...props
  }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const hasError = Boolean(error);

    // Convert step from minutes to seconds for HTML input
    const stepInSeconds = step * 60;

    const displayValue = useMemo(() => {
      // Format time for display
      const formatTimeForDisplay = (timeString: string): string => {
        if (!timeString) {
          return '';
        }
        
        if (format === '12h') {
          const [hours, minutes] = timeString.split(':');
          const hour = parseInt(hours, 10);
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
          return `${displayHour}:${minutes} ${period}`;
        }
        
        return timeString;
      };

      if (format === '12h' && value) {
        return formatTimeForDisplay(value);
      }
      return value || '';
    }, [value, format]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id}
            className={cn(
              "block text-sm font-medium mb-2",
              hasError ? "text-red-700" : "text-brand-charcoal",
              disabled && "text-gray-400"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {format === '12h' ? (
            // Custom 12-hour display with hidden time input
            <div className="relative">
              <input
                ref={ref}
                type="time"
                id={id}
                value={value || ''}
                onChange={handleChange}
                required={required}
                disabled={disabled}
                min={minTime}
                max={maxTime}
                step={stepInSeconds}
                aria-required={required}
                aria-invalid={hasError}
                aria-describedby={error ? `${id}-error` : undefined}
                className="sr-only" // Screen reader only
                {...props}
              />
              
              <div 
                className={cn(
                  // Base styles
                  "w-full px-3 py-2 border rounded-md text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  "transition-colors duration-200 cursor-pointer",
                  
                  // Default state
                  "border-gray-300 bg-white text-brand-charcoal",
                  "focus:ring-brand-gold focus:border-brand-gold",
                  "hover:border-gray-400",
                  
                  // Error state
                  hasError && [
                    "border-red-500 bg-red-50",
                    "focus:ring-red-500 focus:border-red-500"
                  ],
                  
                  // Disabled state
                  disabled && [
                    "opacity-50 cursor-not-allowed",
                    "bg-gray-100 text-gray-500",
                    "border-gray-200"
                  ],
                  
                  className
                )}
                onClick={() => !disabled && ref && 'current' in ref && ref.current?.showPicker?.()}
              >
                {displayValue || (
                  <span className="text-gray-500">{placeholder}</span>
                )}
              </div>
            </div>
          ) : (
            // Standard 24-hour time input
            <input
              ref={ref}
              type="time"
              id={id}
              value={value || ''}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              min={minTime}
              max={maxTime}
              step={stepInSeconds}
              aria-required={required}
              aria-invalid={hasError}
              aria-describedby={error ? `${id}-error` : undefined}
              className={cn(
                // Base styles
                "w-full px-3 py-2 border rounded-md text-sm",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "transition-colors duration-200",
                
                // Default state
                "border-gray-300 bg-white text-brand-charcoal",
                "focus:ring-brand-gold focus:border-brand-gold",
                "hover:border-gray-400",
                
                // Error state
                hasError && [
                  "border-red-500 bg-red-50",
                  "focus:ring-red-500 focus:border-red-500"
                ],
                
                // Disabled state
                disabled && [
                  "opacity-50 cursor-not-allowed",
                  "bg-gray-100 text-gray-500",
                  "border-gray-200"
                ],
                
                className
              )}
              {...props}
            />
          )}
          
          {/* Custom clock icon overlay */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className={cn(
                "h-5 w-5",
                hasError ? "text-red-400" : "text-gray-400",
                disabled && "text-gray-300"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p 
            id={`${id}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {/* Display formatted time for 12h format */}
        {format === '12h' && value && (
          <div className="mt-1 text-xs text-gray-600">
            24h format: {value}
          </div>
        )}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';