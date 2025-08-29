'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { createBooking, type CreateBookingData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Types
interface Service {
  id: string;
  name: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
}

interface BookingFormData {
  services: string[];
  eventDate?: string;
  eventTime?: string;
  eventEndTime?: string;
  eventType?: string;
  venue?: string;
  venueAddress?: string;
  guestCount?: number;
  specialRequests?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

interface BookingState {
  isSubmitting: boolean;
  isCompleted: boolean;
  bookingReference?: string;
  error?: string;
}

interface MultiStepBookingFormProps {
  onComplete: (_data: BookingFormData) => void;
  onCancel: () => void;
  initialData?: Partial<BookingFormData>;
}

const SERVICES: Service[] = [
  {
    id: 'dj',
    name: 'DJ Services',
    description: 'Professional DJ with premium sound system and lighting',
    priceRange: { min: 300, max: 800 }
  },
  {
    id: 'karaoke',
    name: 'Karaoke',
    description: 'Interactive karaoke system with thousands of songs',
    priceRange: { min: 200, max: 500 }
  },
  {
    id: 'photography',
    name: 'Photography',
    description: 'Professional event photography and videography',
    priceRange: { min: 300, max: 800 }
  }
];

const STEPS = [
  'Select Services',
  'Select Date & Time',
  'Event Details',
  'Contact Information',
  'Review & Confirm'
];

export function MultiStepBookingForm({ onComplete, onCancel, initialData }: MultiStepBookingFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BookingFormData>({
    services: [],
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingState, setBookingState] = useState<BookingState>({
    isSubmitting: false,
    isCompleted: false
  });
  const { toast } = useToast();
  
  // Auto-save form data to localStorage
  React.useEffect(() => {
    const savedData = localStorage.getItem('dapper-squad-booking-draft');
    if (savedData && !initialData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Only load if it's a valid object with expected properties
        if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
          setFormData(prev => ({ 
            ...prev, 
            ...parsedData,
            services: Array.isArray(parsedData.services) ? parsedData.services : []
          }));
        }
      } catch (error) {
        console.warn('Failed to load saved booking data:', error);
        // Clear corrupted data
        localStorage.removeItem('dapper-squad-booking-draft');
      }
    }
  }, [initialData]);

  // Save form data whenever it changes (but not when completed)
  React.useEffect(() => {
    if (!bookingState.isCompleted) {
      try {
        // Create a clean copy without any potential circular references
        const cleanFormData = {
          services: formData.services || [],
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          eventEndTime: formData.eventEndTime,
          eventType: formData.eventType,
          venue: formData.venue,
          venueAddress: formData.venueAddress,
          guestCount: formData.guestCount,
          specialRequests: formData.specialRequests,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
        };
        localStorage.setItem('dapper-squad-booking-draft', JSON.stringify(cleanFormData));
      } catch (error) {
        console.warn('Failed to save booking data to localStorage:', error);
      }
    } else {
      localStorage.removeItem('dapper-squad-booking-draft');
    }
  }, [formData, bookingState.isCompleted]);

  const updateFormData = useCallback((updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Service selection
        if (formData.services.length === 0) {
          newErrors.services = 'Please select at least one service';
        }
        break;
      case 1: // Date & Time
        if (!formData.eventDate) {
          newErrors.eventDate = 'Please select an event date';
        }
        if (!formData.eventTime) {
          newErrors.eventTime = 'Please select an event time';
        }
        break;
      case 2: // Event Details
        if (!formData.eventType) {
          newErrors.eventType = 'Please specify the event type';
        }
        if (!formData.venue) {
          newErrors.venue = 'Please provide venue information';
        }
        break;
      case 3: // Contact Information
        if (!formData.clientName) {
          newErrors.clientName = 'Please provide your name';
        }
        if (!formData.clientEmail) {
          newErrors.clientEmail = 'Please provide your email';
        }
        if (!formData.clientPhone) {
          newErrors.clientPhone = 'Please provide your phone number';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  }, []);

  const handleServiceToggle = useCallback((serviceId: string) => {
    const currentServices = formData.services;
    const updatedServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    updateFormData({ services: updatedServices });
    setErrors(prev => ({ ...prev, services: '' })); // Clear service selection error
  }, [formData.services, updateFormData]);

  const calculateTotalPrice = useCallback(() => {
    const selectedServices = SERVICES.filter(service => formData.services.includes(service.id));
    const minTotal = selectedServices.reduce((sum, service) => sum + service.priceRange.min, 0);
    const maxTotal = selectedServices.reduce((sum, service) => sum + service.priceRange.max, 0);
    return { min: minTotal, max: maxTotal };
  }, [formData.services]);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setBookingState(prev => ({ ...prev, isSubmitting: true, error: undefined }));
    setErrors({});

    try {
      // Transform form data to API format with clean data
      const bookingData: CreateBookingData = {
        clientName: String(formData.clientName || '').trim(),
        clientEmail: String(formData.clientEmail || '').trim(),
        clientPhone: String(formData.clientPhone || '').trim(),
        eventDate: String(formData.eventDate || ''),
        eventTime: formData.eventTime ? String(formData.eventTime) : undefined,
        eventEndTime: formData.eventEndTime ? String(formData.eventEndTime) : undefined,
        eventType: String(formData.eventType || ''),
        services: Array.isArray(formData.services) ? [...formData.services] : [],
        venue: String(formData.venue || '').trim(),
        venueAddress: formData.venueAddress ? String(formData.venueAddress).trim() : undefined,
        guestCount: formData.guestCount ? Number(formData.guestCount) : undefined,
        specialRequests: formData.specialRequests ? String(formData.specialRequests).trim() : undefined
      };

      // Call the API
      const result = await createBooking(bookingData);

      if (result.success) {
        setBookingState({
          isSubmitting: false,
          isCompleted: true,
          bookingReference: result.bookingId
        });

        toast({
          title: "Booking Request Submitted!",
          description: "We'll contact you within 24-48 hours to confirm your booking.",
          duration: 5000,
        });

        // Call parent completion handler
        await onComplete(formData);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit booking. Please try again.';
      
      setBookingState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage
      }));

      setErrors({ submit: errorMessage });

      toast({
        title: "Booking Submission Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [currentStep, formData, onComplete, validateStep, toast]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal">Select Services</h2>
            <p className="text-brand-dark-gray">Choose the services you need for your event</p>
            
            <div className="space-y-3 sm:space-y-4">
              {SERVICES.map((service) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="mt-1 h-6 w-6 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand-charcoal">{service.name}</h3>
                      <p className="text-brand-dark-gray text-sm mt-1">{service.description}</p>
                      <p className="text-brand-gold font-medium mt-2">
                        ${service.priceRange.min} - ${service.priceRange.max}
                      </p>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {formData.services.length > 0 && (
              <div className="bg-brand-light-gray p-4 rounded-lg">
                <h4 className="font-semibold text-brand-charcoal">Pricing Summary</h4>
                {(() => {
                  const { min, max } = calculateTotalPrice();
                  return (
                    <p className="text-brand-gold font-medium">
                      Total Estimated: ${min} - ${max}
                    </p>
                  );
                })()}
              </div>
            )}

            {errors.services && (
              <p className="text-red-600 text-sm">{errors.services}</p>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal">Select Date & Time</h2>
            <p className="text-brand-dark-gray">When is your event taking place?</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-brand-charcoal mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="eventDate"
                  value={formData.eventDate || ''}
                  onChange={(e) => updateFormData({ eventDate: e.target.value })}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold text-base sm:text-sm"
                />
                {errors.eventDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.eventDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="eventTime" className="block text-sm font-medium text-brand-charcoal mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="eventTime"
                  value={formData.eventTime || ''}
                  onChange={(e) => updateFormData({ eventTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
                />
                {errors.eventTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.eventTime}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="eventEndTime" className="block text-sm font-medium text-brand-charcoal mb-2">
                End Time (Optional)
              </label>
              <input
                type="time"
                id="eventEndTime"
                value={formData.eventEndTime || ''}
                onChange={(e) => updateFormData({ eventEndTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold max-w-xs"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-charcoal">Event Details</h2>
            <p className="text-brand-dark-gray">Tell us more about your event</p>
            
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-brand-charcoal mb-2">
                Event Type *
              </label>
              <select
                id="eventType"
                value={formData.eventType || ''}
                onChange={(e) => updateFormData({ eventType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              >
                <option value="">Select event type</option>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday Party</option>
                <option value="corporate">Corporate Event</option>
                <option value="anniversary">Anniversary</option>
                <option value="graduation">Graduation</option>
                <option value="other">Other</option>
              </select>
              {errors.eventType && (
                <p className="text-red-600 text-sm mt-1">{errors.eventType}</p>
              )}
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-brand-charcoal mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                id="venue"
                value={formData.venue || ''}
                onChange={(e) => updateFormData({ venue: e.target.value })}
                placeholder="e.g., The Grand Ballroom"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
              {errors.venue && (
                <p className="text-red-600 text-sm mt-1">{errors.venue}</p>
              )}
            </div>

            <div>
              <label htmlFor="venueAddress" className="block text-sm font-medium text-brand-charcoal mb-2">
                Venue Address
              </label>
              <textarea
                id="venueAddress"
                value={formData.venueAddress || ''}
                onChange={(e) => updateFormData({ venueAddress: e.target.value })}
                placeholder="Full venue address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
            </div>

            <div>
              <label htmlFor="guestCount" className="block text-sm font-medium text-brand-charcoal mb-2">
                Expected Guest Count
              </label>
              <input
                type="number"
                id="guestCount"
                value={formData.guestCount || ''}
                onChange={(e) => updateFormData({ guestCount: parseInt(e.target.value) || undefined })}
                placeholder="e.g., 50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold max-w-xs"
              />
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-brand-charcoal mb-2">
                Special Requests or Notes
              </label>
              <textarea
                id="specialRequests"
                value={formData.specialRequests || ''}
                onChange={(e) => updateFormData({ specialRequests: e.target.value })}
                placeholder="Any specific songs, equipment needs, or special requirements..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-charcoal">Contact Information</h2>
            <p className="text-brand-dark-gray">How can we reach you?</p>
            
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-brand-charcoal mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="clientName"
                value={formData.clientName || ''}
                onChange={(e) => updateFormData({ clientName: e.target.value })}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
              {errors.clientName && (
                <p className="text-red-600 text-sm mt-1">{errors.clientName}</p>
              )}
            </div>

            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium text-brand-charcoal mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="clientEmail"
                value={formData.clientEmail || ''}
                onChange={(e) => updateFormData({ clientEmail: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
              {errors.clientEmail && (
                <p className="text-red-600 text-sm mt-1">{errors.clientEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="clientPhone" className="block text-sm font-medium text-brand-charcoal mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="clientPhone"
                value={formData.clientPhone || ''}
                onChange={(e) => updateFormData({ clientPhone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
              {errors.clientPhone && (
                <p className="text-red-600 text-sm mt-1">{errors.clientPhone}</p>
              )}
            </div>
          </div>
        );

      case 4:
        const selectedServices = SERVICES.filter(service => formData.services.includes(service.id));
        const { min, max } = calculateTotalPrice();

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-charcoal">Review & Confirm</h2>
            <p className="text-brand-dark-gray">Please review your booking details</p>
            
            <div className="bg-brand-light-gray p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-brand-charcoal mb-2">Services</h3>
                <ul className="space-y-1">
                  {selectedServices.map(service => (
                    <li key={service.id} className="text-brand-dark-gray">
                      • {service.name} (${service.priceRange.min} - ${service.priceRange.max})
                    </li>
                  ))}
                </ul>
                <p className="text-brand-gold font-semibold mt-2">
                  Total Estimated: ${min} - ${max}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-charcoal mb-2">Event Details</h3>
                <p className="text-brand-dark-gray">Date: {formData.eventDate}</p>
                <p className="text-brand-dark-gray">Time: {formData.eventTime} {formData.eventEndTime && `- ${formData.eventEndTime}`}</p>
                <p className="text-brand-dark-gray">Event Type: {formData.eventType}</p>
                <p className="text-brand-dark-gray">Venue: {formData.venue}</p>
                {formData.guestCount && (
                  <p className="text-brand-dark-gray">Guest Count: {formData.guestCount}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-brand-charcoal mb-2">Contact Information</h3>
                <p className="text-brand-dark-gray">Name: {formData.clientName}</p>
                <p className="text-brand-dark-gray">Email: {formData.clientEmail}</p>
                <p className="text-brand-dark-gray">Phone: {formData.clientPhone}</p>
              </div>
            </div>

            {errors.submit && (
              <p className="text-red-600 text-sm">{errors.submit}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Progress Indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                data-testid={`step-${index + 1}`}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-brand-gold text-white active'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                  index < currentStep ? 'bg-brand-gold' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          {STEPS.map((step, index) => (
            <div key={step} className="flex-1 text-center">
              <p className={`text-xs sm:text-sm ${
                index <= currentStep ? 'text-brand-charcoal font-medium' : 'text-gray-500'
              }`}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm"
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm"
          >
            Cancel
          </Button>
        </div>

        <div className="w-full sm:w-auto">
          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-brand-gold hover:bg-brand-dark-gold text-white w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-brand-gold hover:bg-brand-dark-gold text-white w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm"
              disabled={bookingState.isSubmitting}
            >
              {bookingState.isSubmitting ? 'Submitting...' : 'Submit Booking'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}