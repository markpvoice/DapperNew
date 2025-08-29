'use client';

import { useState } from 'react';
import { CalendarSection } from '@/components/ui/calendar-section';
// Components for sections
import { PhotoGallery } from '@/components/ui/photo-gallery';
// import { VideoTestimonials } from '@/components/ui/video-testimonials';
// import { SocialMediaIntegration } from '@/components/ui/social-media-integration';
import { HeroButtons } from '@/components/ui/hero-buttons';
import { MultiStepBookingForm } from '@/components/forms/MultiStepBookingForm';

// Gallery photos using actual uploaded images
const galleryPhotos = [
  {
    id: '1',
    src: '/images/image1.jpeg',
    alt: 'Professional DJ setup at wedding reception',
    caption: 'Premium sound system and lighting setup at an elegant wedding reception in Chicago',
    category: 'dj',
  },
  {
    id: '2',
    src: '/images/image2.jpeg', 
    alt: 'Corporate team enjoying karaoke night',
    caption: 'Interactive karaoke session bringing together corporate teams for team building',
    category: 'karaoke',
  },
  {
    id: '3',
    src: '/images/image3.jpeg',
    alt: 'Candid photography at anniversary celebration',
    caption: 'Capturing precious moments and genuine emotions at a golden anniversary party',
    category: 'photography',
  },
  {
    id: '4',
    src: '/images/image4.jpeg',
    alt: 'Outdoor DJ setup for summer party',
    caption: 'Weather-resistant professional setup for outdoor summer celebration',
    category: 'dj',
  },
  {
    id: '5',
    src: '/images/image5.jpeg',
    alt: 'Birthday party karaoke fun',
    caption: 'Birthday celebration with friends enjoying our extensive song library',
    category: 'karaoke',
  },
  {
    id: '6',
    src: '/images/image6.jpeg',
    alt: 'Professional wedding photography',
    caption: 'Elegant wedding photography capturing the perfect moments of your special day',
    category: 'photography',
  },
];

// Sample video testimonials (placeholder for future use)
// eslint-disable-next-line no-unused-vars
const _sampleVideoTestimonials = [
  {
    id: '1',
    clientName: 'Maya & Andre',
    eventType: 'Wedding',
    videoUrl: '/videos/maya-andre-testimonial.mp4',
    thumbnailUrl: '/images/testimonial-maya-andre-thumb.jpg',
    quote: 'They nailed the timeline and kept the floor full. Our wedding day was absolutely perfect thanks to Dapper Squad!',
    rating: 5,
    eventDate: '2024-06-15',
  },
  {
    id: '2',
    clientName: 'Vantage Labs',
    eventType: 'Corporate Event',
    videoUrl: '/videos/vantage-labs-testimonial.mp4',
    thumbnailUrl: '/images/testimonial-vantage-labs-thumb.jpg',
    quote: 'Our team actually sang karaoke—effortless. Professional service that brought our whole company together.',
    rating: 5,
    eventDate: '2024-03-20',
  },
  {
    id: '3',
    clientName: 'North Shore Prep',
    eventType: 'School Event',
    videoUrl: '/videos/north-shore-prep-testimonial.mp4',
    thumbnailUrl: '/images/testimonial-north-shore-prep-thumb.jpg',
    quote: 'Professional, responsive, photos in days. Made our school event memorable for all the students.',
    rating: 5,
    eventDate: '2024-09-10',
  },
];

export default function HomePage() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<Partial<any>>({});

  const handleBookingComplete = async (_formData: any) => {
    // Form submission is now handled within the MultiStepBookingForm
    // This will be called after successful API submission
    setTimeout(() => {
      setShowBookingForm(false);
      setBookingInitialData({});
    }, 3000); // Keep form open for 3 seconds to show success message
  };

  const handleShowBookingForm = (initialData?: any) => {
    if (initialData) {
      setBookingInitialData(initialData);
    }
    setShowBookingForm(true);
  };

  const handleCalendarDateSelect = (date: string) => {
    // Pre-fill the form with the selected date and open it
    handleShowBookingForm({ eventDate: date });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-brand-charcoal font-bold">
              DS
            </div>
            <div className="text-xl font-bold text-brand-charcoal">
              Dapper Squad Entertainment
            </div>
          </div>
          <div className="hidden md:flex gap-8 items-center text-sm">
            <a href="#services" className="text-brand-charcoal hover:text-brand-gold transition-colors font-medium">Services</a>
            <a href="#gallery" className="text-brand-charcoal hover:text-brand-gold transition-colors font-medium">Gallery</a>
            <a href="#availability" className="text-brand-charcoal hover:text-brand-gold transition-colors font-medium">Availability</a>
            <a href="#testimonials" className="text-brand-charcoal hover:text-brand-gold transition-colors font-medium">Testimonials</a>
            <a href="#faq" className="text-brand-charcoal hover:text-brand-gold transition-colors font-medium">FAQ</a>
            <a href="#contact" className="text-brand-charcoal hover:text-brand-gold transition-colors font-medium">Contact</a>
            <button 
              onClick={() => document.querySelector('#availability')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-brand-gold text-brand-charcoal px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark-gold transition-colors mr-2"
            >
              Check Availability
            </button>
            <button 
              onClick={handleShowBookingForm}
              className="bg-brand-charcoal text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Request Your Date
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-brand-charcoal p-3 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className="block text-brand-charcoal hover:text-brand-gold transition-colors py-3" onClick={() => setMobileMenuOpen(false)}>
                Services
              </a>
              <a href="#gallery" className="block text-brand-charcoal hover:text-brand-gold transition-colors py-3" onClick={() => setMobileMenuOpen(false)}>
                Gallery
              </a>
              <a href="#availability" className="block text-brand-charcoal hover:text-brand-gold transition-colors py-3" onClick={() => setMobileMenuOpen(false)}>
                Availability
              </a>
              <a href="#pricing" className="block text-brand-charcoal hover:text-brand-gold transition-colors py-3" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </a>
              <a href="#contact" className="block text-brand-charcoal hover:text-brand-gold transition-colors py-3" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </a>
              <button
                onClick={() => {
                  handleShowBookingForm();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-brand-gold text-brand-charcoal px-4 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-center mt-4"
              >
                Get a Quote
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-charcoal via-purple-900 to-brand-gold min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center text-white mt-16 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="text-xs sm:text-sm mb-3 sm:mb-4 opacity-90 font-medium tracking-wide uppercase">
              Premium Party Pros
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Dapper Squad<br />
              Entertainment
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Full-service DJ, karaoke, and event photography for Chicago–Milwaukee events. Flat pricing, fast booking, great vibes.
            </p>
            <HeroButtons onRequestDate={handleShowBookingForm} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">300+</div>
                <div className="text-xs sm:text-sm opacity-80 leading-tight">Events<br />Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">5★</div>
                <div className="text-xs sm:text-sm opacity-80 leading-tight">Rated<br />Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">24/7</div>
                <div className="text-xs sm:text-sm opacity-80 leading-tight">Requests<br />Fast booking</div>
              </div>
            </div>
          </div>

          {/* Next Step Box */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-brand-charcoal shadow-xl mx-4 sm:mx-0">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center text-brand-charcoal text-sm font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">
                Next Step: Pick a date & tell us your vibe.
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              No payment due on request. We confirm within 24–48 hours.
            </p>

            <div className="mb-6">
              <h4 className="font-bold mb-4">Popular add-ons</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Dance floor lighting</li>
                <li>• Wireless mics</li>
                <li>• Photo backdrop</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Service areas</h4>
              <p className="text-gray-600">
                <strong>Milwaukee • Chicago • Suburbs</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Highlights */}
      <section id="gallery" className="py-20 bg-brand-light-gray">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
            Event Highlights
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            A quick peek at the fun we bring to every party.
          </p>

          {/* Professional Photo Gallery with Lightbox */}
          <PhotoGallery 
            photos={galleryPhotos}
            columns={3}
            aspectRatio="video"
            showCategories={true}
            lazyLoad={true}
          />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-brand-charcoal text-center">
            Services
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12 text-center max-w-2xl mx-auto">
            Pick one—or bundle for best value.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* DJ Services */}
            <div className="p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-15 h-15 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                🎵
              </div>
              <h3 className="text-2xl font-bold mb-4 text-brand-charcoal">DJ Services</h3>
              <p className="text-gray-600 leading-relaxed">
                Curated mixes across decades & genres. Pro audio, clean transitions, and crowd-reading pros who keep the floor jumping.
              </p>
            </div>

            {/* Karaoke */}
            <div className="p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-15 h-15 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                🎤
              </div>
              <h3 className="text-2xl font-bold mb-4 text-brand-charcoal">Karaoke</h3>
              <p className="text-gray-600 leading-relaxed">
                Thousands of tracks, wireless mics, and live hype. From shy solos to full-blown duets—everyone's a star.
              </p>
            </div>

            {/* Event Photography */}
            <div className="p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-15 h-15 bg-brand-charcoal rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                📸
              </div>
              <h3 className="text-2xl font-bold mb-4 text-brand-charcoal">Event Photography</h3>
              <p className="text-gray-600 leading-relaxed">
                Sharp, share-ready shots and candid moments. Optional backdrop & instant gallery delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Calendar */}
      <section id="availability" className="py-20 bg-brand-light-gray">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
            Availability
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Tap an open date to prefill the form.
          </p>

          {/* Calendar Legend */}
          <div className="flex flex-wrap gap-8 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Open — Tap to request</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Pending — Awaiting confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Booked — Unavailable</span>
            </div>
          </div>

          {/* Functional Calendar */}
          <CalendarSection onDateSelect={handleCalendarDateSelect} />
        </div>
      </section>

      {/* Request Form */}
      <section id="request" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
            Request Your Date
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            No payment due with request. We confirm availability and reply via email.
          </p>

          <button 
            onClick={handleShowBookingForm}
            className="bg-brand-gold text-brand-charcoal px-12 py-6 text-xl font-bold rounded-lg hover:bg-brand-dark-gold transition-colors"
          >
            Start Your Booking Request
          </button>

          <p className="text-sm text-gray-600 mt-6">
            Our step-by-step form makes it easy to tell us about your event
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-brand-light-gray">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
            Video Testimonials
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Hear directly from our clients about their experiences with Dapper Squad Entertainment.
          </p>

          {/* Video Testimonials - Temporarily disabled */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
                  MA
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Maya & Andre</h4>
                  <p className="text-sm text-gray-600">Wedding Reception</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The Dapper Squad made our wedding reception absolutely magical! Professional service and incredible energy."
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
                  VL
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Vantage Labs</h4>
                  <p className="text-sm text-gray-600">Corporate Event</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Outstanding karaoke setup for our team building event. Everyone had a blast!"
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold mb-4">
              5.0 ★★★★★ Avg. Rating
            </div>
            <a href="#" className="text-brand-gold hover:text-brand-dark-gold transition-colors">
              Read our Google reviews →
            </a>
          </div>
        </div>
      </section>

      {/* Pricing & FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
            Pricing & FAQ
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12">
            {/* Pricing */}
            <div>
              <h3 className="text-2xl font-bold mb-8">
                Typical price ranges
              </h3>
              
              <div className="mb-8">
                <h4 className="font-bold mb-2">Weddings:</h4>
                <p className="text-gray-600">
                  Most couples invest $1,400–$2,200 depending on hours and add-ons.
                </p>
              </div>

              <div className="mb-8">
                <h4 className="font-bold mb-2">Corporate/Private:</h4>
                <p className="text-gray-600">
                  Typically $900–$1,800 based on scope and run-of-show.
                </p>
              </div>

              <div className="mb-8">
                <h4 className="font-bold mb-2">Add-ons:</h4>
                <p className="text-gray-600">
                  Karaoke, extra speakers, uplighting from $150.
                </p>
              </div>

              <p className="italic text-gray-600">
                Tell us your date and run-time for an exact quote.
              </p>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-2xl font-bold mb-8">
                Top questions
              </h3>

              <div className="mb-8">
                <h4 className="font-bold mb-2">
                  1. Do you carry insurance?
                </h4>
                <p className="text-gray-600">
                  Yes—$1M liability; COI available for venues within 24 hours.
                </p>
              </div>

              <div className="mb-8">
                <h4 className="font-bold mb-2">
                  2. What do you provide?
                </h4>
                <p className="text-gray-600">
                  Pro sound, wireless mics, curated playlists, MC services, and a clean setup.
                </p>
              </div>

              <div className="mb-8">
                <h4 className="font-bold mb-2">
                  3. Setup & power?
                </h4>
                <p className="text-gray-600">
                  We arrive ~90 minutes early. Standard 120V outlet(s); we'll confirm amperage with your venue.
                </p>
              </div>

              <div className="mb-8">
                <h4 className="font-bold mb-2">
                  4. Clean/explicit music?
                </h4>
                <p className="text-gray-600">
                  Default is clean edits; we'll align with your preferences for any explicit tracks.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-2">
                  5. Reschedule/cancellation?
                </h4>
                <p className="text-gray-600">
                  Full refund within 7 days of booking. After that, deposits are transferable to a new date within 12 months (subject to availability).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Integration */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
              Connect With Us
            </h2>
            <p className="text-lg text-gray-600">
              Follow our work, share your experience, and stay connected with the Dapper Squad community.
            </p>
          </div>

          {/* Social Media Integration - Temporarily disabled */}
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4 text-brand-charcoal">Follow Us</h3>
            <div className="flex justify-center space-x-4">
              <a href="https://instagram.com/dappersquad" className="text-brand-gold hover:text-brand-dark-gold">
                Instagram @dappersquad
              </a>
              <a href="https://facebook.com/dappersquadentertainment" className="text-brand-gold hover:text-brand-dark-gold">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-brand-light-gray">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
            Contact
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Questions before you book? We're happy to help.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold mb-8">
                Get in touch
              </h3>
              
              <div className="mb-6">
                <strong>Email:</strong> dappersquadentertainment414@gmail.com
              </div>
              
              <div className="mb-6">
                <strong>Facebook:</strong> Dapper Squad Entertainment
              </div>

              <p className="text-gray-600">
                We typically reply within 24–48 hours.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-8">
                What happens after you submit?
              </h3>
              
              <ol className="list-decimal list-inside space-y-4 text-gray-600">
                <li>We confirm the date & details.</li>
                <li>We hold your date for 7 days and send a simple e-sign contract.</li>
                <li>Deposit secures your booking.</li>
              </ol>

              <p className="text-gray-500 text-sm italic mt-8">
                Demo note: This site stores requests locally in your browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white py-8 text-center">
        <div className="max-w-7xl mx-auto px-8">
          <p className="m-0">
            © 2025 Dapper Squad Entertainment • Built for demo — single-file, responsive, accessibility-minded.
          </p>
        </div>
      </footer>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-charcoal">Book Your Event</h2>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <MultiStepBookingForm
                onComplete={handleBookingComplete}
                onCancel={() => setShowBookingForm(false)}
                initialData={bookingInitialData}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}