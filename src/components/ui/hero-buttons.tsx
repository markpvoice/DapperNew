'use client';

interface HeroButtonsProps {
  onRequestDate?: () => void;
}

export function HeroButtons({ onRequestDate }: HeroButtonsProps) {
  const handleCheckAvailability = () => {
    const calendar = document.querySelector('#availability');
    calendar?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRequestDate = () => {
    if (onRequestDate) {
      onRequestDate();
    } else {
      const form = document.querySelector('#request');
      form?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <button 
        onClick={handleRequestDate}
        className="bg-white text-brand-charcoal px-8 py-4 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors"
      >
        Request Your Date
      </button>
      <button 
        onClick={handleCheckAvailability}
        className="bg-transparent text-white border-2 border-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-white hover:text-brand-charcoal transition-colors"
      >
        Check Availability
      </button>
    </div>
  );
}