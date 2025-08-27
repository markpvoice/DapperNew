'use client';

import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: string;
  onChange: (_value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  id?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({
    value,
    onChange,
    placeholder = 'Select date',
    label,
    error,
    required = false,
    disabled = false,
    minDate,
    maxDate,
    className,
    id: providedId,
    ...props
  }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const hasError = Boolean(error);

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
          <input
            ref={ref}
            type="date"
            id={id}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={minDate}
            max={maxDate}
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
              
              // Custom className
              className
            )}
            {...props}
          />
          
          {/* Custom calendar icon overlay */}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';