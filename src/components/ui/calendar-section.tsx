'use client';

import { Calendar } from '@/components/ui/calendar';

export function CalendarSection() {
  const handleDateSelect = (date: string) => {
    // Scroll to booking form and prefill the date
    const form = document.querySelector('#request');
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.value = date;
    }
    form?.scrollIntoView({ behavior: 'smooth' });
  };

  return <Calendar onDateSelect={handleDateSelect} />;
}