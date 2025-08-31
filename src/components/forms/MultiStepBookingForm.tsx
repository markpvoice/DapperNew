'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { createBooking, type CreateBookingData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { AnimatedProgressBar } from '@/components/ui/animated-progress-bar';
import { ServiceCard } from '@/components/ui/service-card';
import { CelebrationService } from '@/components/ui/celebration-service';

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
  eventStartTime?: string;
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
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
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

  // Helper function to generate calendar event data
  const generateCalendarEvent = () => {
    const eventDate = new Date(formData.eventDate || '');
    const startTime = formData.eventStartTime ? `T${formData.eventStartTime}:00` : 'T18:00:00';
    const endTime = formData.eventEndTime ? `T${formData.eventEndTime}:00` : 'T22:00:00';
    
    const startDateTime = eventDate.toISOString().split('T')[0] + startTime;
    const endDateTime = eventDate.toISOString().split('T')[0] + endTime;
    
    const services = formData.services.map(serviceId => {
      const service = SERVICES.find(s => s.id === serviceId);
      return service?.name;
    }).filter(Boolean).join(', ');

    const description = `Services: ${services}\\nVenue: ${formData.venue || 'TBD'}\\nContact: ${formData.clientPhone || 'N/A'}`;
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Dapper Squad Entertainment//EN
BEGIN:VEVENT
UID:${bookingState.bookingReference}-${Date.now()}@dappersquad.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDateTime.replace(/[-:]/g, '')}
DTEND:${endDateTime.replace(/[-:]/g, '')}
SUMMARY:${formData.eventType || 'Event'} - Dapper Squad Entertainment
DESCRIPTION:${description}
LOCATION:${formData.venue || ''}, ${formData.venueAddress || ''}
END:VEVENT
END:VCALENDAR`;
  };
  
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
          eventStartTime: formData.eventStartTime,
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
        if (!formData.eventStartTime) {
          newErrors.eventStartTime = 'Please select an event time';
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
      // Mark current step as completed and trigger celebration
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
        
        // Dispatch step completion event for celebrations
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('step-completed', {
            detail: { 
              step: currentStep, 
              stepName: STEPS[currentStep], 
              totalSteps: STEPS.length 
            }
          }));
        }
      }
      
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [currentStep, validateStep, completedSteps]);

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
        eventStartTime: formData.eventStartTime ? String(formData.eventStartTime) : undefined,
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

        // Dispatch booking completion celebration
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('booking-completed', {
            detail: {
              bookingReference: result.bookingId,
              clientName: formData.clientName,
              services: formData.services,
              eventDate: formData.eventDate
            }
          }));
        }

        toast({
          title: "Booking Request Submitted!",
          description: "We'll contact you within 24-48 hours to confirm your booking.",
          duration: 5000,
        });

        // Don't immediately call onComplete - let user see success screen first
        // The success screen will have a "Close" or "Done" button that calls onComplete
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
  }, [currentStep, formData, validateStep, toast]);

  const renderStep = () => {
    // Show success screen if booking is completed
    if (bookingState.isCompleted && bookingState.bookingReference) {
      return (
        <div className="text-center space-y-6" data-testid="booking-success">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-charcoal mb-2">Booking Request Submitted!</h2>
            <p className="text-brand-dark-gray">
              Thank you for choosing Dapper Squad Entertainment. We'll contact you within 24-48 hours to confirm your booking.
            </p>
          </div>

          <div className="bg-brand-light-gray p-6 rounded-lg">
            <h3 className="font-semibold text-brand-charcoal mb-2">Your Booking Reference</h3>
            <p className="text-2xl font-mono font-bold text-brand-gold" data-testid="booking-reference">
              {bookingState.bookingReference}
            </p>
            <p className="text-sm text-brand-dark-gray mt-2">
              Please save this reference number for your records
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div data-testid="confirmed-services">
              <h4 className="font-semibold text-brand-charcoal mb-2">Services</h4>
              <ul className="text-brand-dark-gray text-sm space-y-1">
                {formData.services.map((serviceId) => {
                  const service = SERVICES.find(s => s.id === serviceId);
                  return service && (
                    <li key={serviceId}>• {service.name}</li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-brand-charcoal mb-2">Event Details</h4>
              <div className="text-brand-dark-gray text-sm space-y-1">
                <p data-testid="confirmed-name">Client: {formData.clientName}</p>
                <p data-testid="confirmed-date">Date: {formData.eventDate}</p>
                <p>Type: {formData.eventType}</p>
                <p>Venue: {formData.venue}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4" data-testid="next-steps">
            <h4 className="font-semibold text-brand-charcoal">Next Steps</h4>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <ul className="text-sm text-brand-dark-gray space-y-2">
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-2">1.</span>
                  <span>We'll review your booking request and contact you within 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-2">2.</span>
                  <span>A $200 deposit will be required to secure your date</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-2">3.</span>
                  <span>Final details and payment arrangements will be confirmed</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3" data-testid="payment-info">
            <h4 className="font-semibold text-brand-charcoal">Payment Information</h4>
            <div className="bg-yellow-50 p-4 rounded-lg text-left">
              <p className="text-sm text-brand-dark-gray">
                <strong>Deposit:</strong> $200 required to secure your booking<br />
                <strong>Payment Methods:</strong> Cash, Check, Venmo, Zelle<br />
                <strong>Final Payment:</strong> Due on the day of your event
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => window.open(`data:text/calendar;charset=utf8,${encodeURIComponent(generateCalendarEvent())}`)}
              className="inline-flex items-center px-4 py-2 bg-brand-gold hover:bg-brand-dark-gold text-white rounded-lg text-sm font-medium transition-colors"
              data-testid="add-to-calendar"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Add to Calendar
            </button>
            
            <button
              onClick={() => onComplete(formData)}
              className="ml-4 inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-charcoal rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal">Select Services</h2>
            <p className="text-brand-dark-gray">Choose the services you need for your event</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {SERVICES.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  description={service.description}
                  priceRange={`$${service.priceRange.min} - $${service.priceRange.max}`}
                  isSelected={formData.services.includes(service.id)}
                  isPopular={index === 0} // Mark first service as popular for demo
                  onSelect={handleServiceToggle}
                  className="h-full"
                />
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
                  data-testid="event-date"
                  value={formData.eventDate || ''}
                  onChange={(e) => updateFormData({ eventDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
                  aria-invalid={errors.eventDate ? 'true' : 'false'}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold text-base sm:text-sm"
                />
                {errors.eventDate && (
                  <p id="eventDate-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">{errors.eventDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="eventStartTime" className="block text-sm font-medium text-brand-charcoal mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="eventStartTime"
                  value={formData.eventStartTime || ''}
                  onChange={(e) => updateFormData({ eventStartTime: e.target.value })}
                  aria-describedby={errors.eventStartTime ? 'eventStartTime-error' : undefined}
                  aria-invalid={errors.eventStartTime ? 'true' : 'false'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
                />
                {errors.eventStartTime && (
                  <p id="eventStartTime-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">{errors.eventStartTime}</p>
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
                data-testid="event-type"
                value={formData.eventType || ''}
                onChange={(e) => updateFormData({ eventType: e.target.value })}
                aria-describedby={errors.eventType ? 'eventType-error' : undefined}
                aria-invalid={errors.eventType ? 'true' : 'false'}
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
                <p id="eventType-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">{errors.eventType}</p>
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
                autoComplete="organization"
                aria-describedby={errors.venue ? 'venue-error' : undefined}
                aria-invalid={errors.venue ? 'true' : 'false'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
              {errors.venue && (
                <p id="venue-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">{errors.venue}</p>
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
                autoComplete="street-address"
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
                inputMode="numeric"
                min="1"
                max="10000"
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
                data-testid="client-name"
                value={formData.clientName || ''}
                onChange={(e) => updateFormData({ clientName: e.target.value })}
                placeholder="Your full name"
                autoComplete="name"
                aria-describedby={errors.clientName ? 'clientName-error' : undefined}
                aria-invalid={errors.clientName ? 'true' : 'false'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
              {errors.clientName && (
                <p id="clientName-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">{errors.clientName}</p>
              )}
            </div>

            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium text-brand-charcoal mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="clientEmail"
                data-testid="client-email"
                value={formData.clientEmail || ''}
                onChange={(e) => updateFormData({ clientEmail: e.target.value })}
                placeholder="your.email@example.com"
                autoComplete="email"
                inputMode="email"
                aria-describedby={errors.clientEmail ? 'clientEmail-error' : undefined}
                aria-invalid={errors.clientEmail ? 'true' : 'false'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
              {errors.clientEmail && (
                <p id="clientEmail-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">{errors.clientEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="clientPhone" className="block text-sm font-medium text-brand-charcoal mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="clientPhone"
                data-testid="client-phone"
                value={formData.clientPhone || ''}
                onChange={(e) => updateFormData({ clientPhone: e.target.value })}
                placeholder="(555) 123-4567"
                autoComplete="tel"
                inputMode="tel"
                aria-describedby={errors.clientPhone ? 'clientPhone-error' : undefined}
                aria-invalid={errors.clientPhone ? 'true' : 'false'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-4 focus:ring-brand-gold focus:ring-opacity-30 focus:border-brand-gold"
              />
              {errors.clientPhone && (
                <p id="clientPhone-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">{errors.clientPhone}</p>
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
                <p className="text-brand-dark-gray">Time: {formData.eventStartTime} {formData.eventEndTime && `- ${formData.eventEndTime}`}</p>
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
      {/* Enhanced Progress Indicator - Hidden when booking is completed */}
      {!bookingState.isCompleted && (
        <div className="mb-6 sm:mb-8">
          <AnimatedProgressBar
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            className=""
          />
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons - Hidden when booking is completed */}
      {!bookingState.isCompleted && (
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
                data-testid="submit-booking"
              >
                {bookingState.isSubmitting ? 'Submitting...' : 'Submit Booking'}
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Celebration Service for animations */}
      <CelebrationService />
    </div>
  );
}