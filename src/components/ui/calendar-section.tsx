'use client';

import { Calendar } from '@/components/ui/calendar';

interface CalendarSectionProps {
  onDateSelect?: (_date: string) => void;
}

export function CalendarSection({ onDateSelect }: CalendarSectionProps) {
  const handleDateSelect = (date: string) => {
    if (onDateSelect) {
      // Use the parent's date select handler (opens booking form with pre-filled date)
      onDateSelect(date);
    } else {
      // Fallback: Scroll to booking form section
      const form = document.querySelector('#request');
      form?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return <Calendar onDateSelect={handleDateSelect} />;
}