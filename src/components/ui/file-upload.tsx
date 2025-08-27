'use client';

import React, { useCallback, useRef, useState, useId } from 'react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  onChange: (_files: File[]) => void;
  onError?: (_message: string) => void;
  files?: File[];
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
  error?: string;
  progress?: number;
  className?: string;
  id?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 B';
  }
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Format to 1 decimal place but remove .0 for whole numbers
  const value = bytes / Math.pow(k, i);
  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1);
  
  return `${formatted} ${sizes[i]}`;
};

const isFileTypeAllowed = (file: File, accept: string): boolean => {
  if (!accept) {
    return true;
  }
  
  const acceptedTypes = accept.split(',').map(type => type.trim());
  
  return acceptedTypes.some(type => {
    if (type === '*/*') {
      return true;
    }
    if (type.endsWith('/*')) {
      const baseType = type.replace('/*', '');
      return file.type.startsWith(baseType);
    }
    return file.type === type || file.name.endsWith(type.replace(/^\./, ''));
  });
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  onError,
  files = [],
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled = false,
  loading = false,
  required = false,
  label,
  description,
  error,
  progress,
  className,
  id: providedId,
}) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const hasError = Boolean(error);

  const validateFiles = useCallback((fileList: FileList | File[]): { valid: File[], errors: string[] } => {
    const filesArray = Array.from(fileList);
    const valid: File[] = [];
    const errors: string[] = [];

    // Check maximum number of files
    if (maxFiles && filesArray.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed.`);
      return { valid: [], errors };
    }

    filesArray.forEach(file => {
      // Check file size
      if (maxSize && file.size > maxSize) {
        const maxSizeFormatted = formatFileSize(maxSize);
        errors.push(`File "${file.name}" is too large. Maximum size is ${maxSizeFormatted}.`);
        return;
      }

      // Check file type
      if (accept && !isFileTypeAllowed(file, accept)) {
        errors.push(`File "${file.name}" type is not allowed.`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  }, [maxSize, maxFiles, accept]);

  const handleFileSelection = useCallback((selectedFiles: FileList | File[]) => {
    const { valid, errors } = validateFiles(selectedFiles);
    
    if (errors.length > 0) {
      onError?.(errors[0]); // Show first error
      return;
    }

    if (multiple) {
      // Add to existing files if multiple is enabled
      const newFiles = [...files, ...valid];
      onChange(newFiles);
    } else {
      // Replace existing files if single file mode
      onChange(valid);
    }
  }, [validateFiles, onError, multiple, files, onChange]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      handleFileSelection(selectedFiles);
    }
  }, [handleFileSelection]);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && !loading) {
      setIsDragOver(true);
    }
  }, [disabled, loading]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    // Keep drag over state
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled || loading) {
      return;
    }

    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelection(droppedFiles);
    }
  }, [disabled, loading, handleFileSelection]);

  const handleClick = useCallback(() => {
    if (!disabled && !loading && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled, loading]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  }, [files, onChange]);

  const isInteractive = !disabled && !loading;

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

      {description && (
        <p className={cn(
          "text-sm mb-3",
          hasError ? "text-red-600" : "text-brand-dark-gray",
          disabled && "text-gray-400"
        )}>
          {description}
        </p>
      )}

      <div className={cn("relative", className)}>
        {/* Upload Area */}
        <button
          type="button"
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={!isInteractive}
          className={cn(
            // Base styles
            "relative w-full border-2 border-dashed rounded-lg p-8",
            "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
            "flex flex-col items-center justify-center text-center",
            
            // Interactive states
            isInteractive && [
              "hover:border-brand-gold hover:bg-brand-light-gray/50",
              "focus:ring-brand-gold focus:border-brand-gold",
              "cursor-pointer"
            ],
            
            // Drag states
            isDragOver && "border-brand-gold bg-brand-light-gray/50",
            
            // Error state
            hasError && [
              "border-red-500 bg-red-50",
              "focus:ring-red-500 focus:border-red-500"
            ],
            
            // Disabled state
            disabled && [
              "opacity-50 cursor-not-allowed",
              "bg-gray-100 border-gray-300"
            ],
            
            // Loading state
            loading && "cursor-not-allowed",
            
            // Default state
            !hasError && !isDragOver && "border-gray-300"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            id={id}
            accept={accept}
            multiple={multiple}
            disabled={!isInteractive}
            required={required}
            onChange={handleInputChange}
            aria-required={required}
            aria-invalid={hasError}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          {/* Upload Icon */}
          <svg
            className={cn(
              "h-12 w-12 mb-4",
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {/* Upload Text */}
          <div className="space-y-2">
            <p className={cn(
              "text-lg font-medium",
              hasError ? "text-red-700" : "text-brand-charcoal",
              disabled && "text-gray-500"
            )}>
              {loading ? 'Uploading...' : 'Click to upload files'}
            </p>
            
            <p className={cn(
              "text-sm",
              hasError ? "text-red-600" : "text-brand-dark-gray",
              disabled && "text-gray-400"
            )}>
              or drag and drop
            </p>

            {(accept || maxSize) && (
              <p className={cn(
                "text-xs",
                hasError ? "text-red-500" : "text-gray-500",
                disabled && "text-gray-400"
              )}>
                {accept && `Accepted: ${accept}`}
                {accept && maxSize && ' • '}
                {maxSize && `Max size: ${formatFileSize(maxSize)}`}
              </p>
            )}
          </div>
        </button>

        {/* Progress Bar */}
        {typeof progress === 'number' && progress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-brand-charcoal">Upload Progress</span>
              <span className="text-brand-gold font-medium">{progress}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
            >
              <div
                className="h-full bg-brand-gold transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-brand-charcoal">
            Selected Files ({files.length})
          </p>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-brand-light-gray rounded-lg border"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* File Icon */}
                  <svg
                    className="h-5 w-5 text-brand-dark-gray flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  
                  {/* File Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-charcoal truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-brand-dark-gray">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                {/* Remove Button */}
                {!disabled && !loading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};