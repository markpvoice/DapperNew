export default function HomePage() {
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
            <button className="bg-brand-gold text-brand-charcoal px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark-gold transition-colors mr-2">
              Check Availability
            </button>
            <button className="bg-brand-charcoal text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Request Your Date
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button className="md:hidden text-brand-charcoal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-charcoal via-purple-900 to-brand-gold min-h-[60vh] flex items-center justify-center text-white mt-20">
        <div className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-sm mb-4 opacity-90 font-medium tracking-wide uppercase">
              Premium Party Pros
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Dapper Squad<br />
              Entertainment
            </h1>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Full-service DJ, karaoke, and event photography for Chicago–Milwaukee events. Flat pricing, fast booking, great vibes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="bg-white text-brand-charcoal px-8 py-4 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Request Your Date
              </button>
              <button className="bg-transparent text-white border-2 border-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-white hover:text-brand-charcoal transition-colors">
                Check Availability
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">300+</div>
                <div className="text-sm opacity-80 leading-tight">Events<br />Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">5★</div>
                <div className="text-sm opacity-80 leading-tight">Rated<br />Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-sm opacity-80 leading-tight">Requests<br />Fast booking</div>
              </div>
            </div>
          </div>

          {/* Next Step Box */}
          <div className="bg-white rounded-2xl p-8 text-brand-charcoal shadow-xl">
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

          {/* Photo Gallery Placeholder */}
          <div className="bg-brand-charcoal rounded-2xl h-96 flex items-center justify-center text-white relative overflow-hidden">
            <div className="text-center">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-semibold mb-2">Event Photo Gallery</h3>
              <p className="opacity-80">Professional photos from recent events</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
            Services
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Pick one—or bundle for best value.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

          {/* Calendar */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">August 2025</h3>
              <div className="flex gap-4">
                <button className="bg-gray-100 border-none p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  ◀
                </button>
                <button className="bg-gray-100 border-none p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  ▶
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-bold p-4 text-gray-600">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                const status = day === 22 || day === 29 ? 'booked' : day === 25 ? 'pending' : 'open';
                const bgClass = status === 'booked' ? 'bg-red-100 text-red-700' : 
                               status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                               'bg-green-100 text-green-700';
                const cursorClass = status === 'open' ? 'cursor-pointer hover:bg-green-200' : 'cursor-default';
                
                return (
                  <div key={day} className={`p-4 rounded-lg font-bold transition-colors ${bgClass} ${cursorClass}`}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section id="request" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
            Request Your Date
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            No payment due with request. We confirm availability and reply via email.
          </p>

          <div className="bg-brand-light-gray rounded-2xl p-12 max-w-2xl">
            <form className="space-y-6">
              <div>
                <label className="block font-bold mb-2">Full name</label>
                <input
                  type="text"
                  placeholder="Taylor Jordan"
                  className="w-full p-4 rounded-lg border border-gray-300 text-base focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Email</label>
                <input
                  type="email"
                  placeholder="taylor@example.com"
                  className="w-full p-4 rounded-lg border border-gray-300 text-base focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Phone (numbers only)</label>
                <input
                  type="tel"
                  placeholder="3125551234"
                  className="w-full p-4 rounded-lg border border-gray-300 text-base focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Numbers only, 10–15 digits.
                </p>
              </div>

              <div>
                <label className="block font-bold mb-2">Event date</label>
                <input
                  type="date"
                  className="w-full p-4 rounded-lg border border-gray-300 text-base focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Future dates only.
                </p>
              </div>

              <div>
                <label className="block font-bold mb-2">Event type</label>
                <select className="w-full p-4 rounded-lg border border-gray-300 text-base focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all">
                  <option>Select...</option>
                  <option>Wedding</option>
                  <option>Corporate Event</option>
                  <option>Birthday Party</option>
                  <option>Anniversary</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">City / Venue</label>
                <input
                  type="text"
                  placeholder="Mount Prospect — Rob Roy GC"
                  className="w-full p-4 rounded-lg border border-gray-300 text-base focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Services needed</label>
                <select className="w-full p-4 rounded-lg border border-gray-300 text-base focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all">
                  <option>Select...</option>
                  <option>DJ Services</option>
                  <option>Karaoke</option>
                  <option>Event Photography</option>
                  <option>DJ + Karaoke</option>
                  <option>Full Package</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Notes</label>
                <textarea
                  rows={4}
                  placeholder="Vibe, timing, special songs, power limits, etc."
                  className="w-full p-4 rounded-lg border border-gray-300 text-base resize-y focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                />
              </div>

              <p className="text-sm text-gray-600">
                We'll only use your info to reply about your event. No spam, ever.
              </p>

              <button className="bg-brand-gold text-brand-charcoal w-full py-4 text-lg font-bold rounded-lg hover:bg-brand-dark-gold transition-colors">
                Submit request — No payment due
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-brand-light-gray">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4 text-brand-charcoal">
            Testimonials
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Context helps you compare apples to apples.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <div className="text-yellow-500 text-xl mb-4">
                ★★★★★
              </div>
              <h4 className="font-bold mb-2">
                Maya & Andre • Wedding • Milwaukee • Jun 2025
              </h4>
              <p className="text-gray-600 italic">
                "They nailed the timeline and kept the floor full."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <div className="text-yellow-500 text-xl mb-4">
                ★★★★★
              </div>
              <h4 className="font-bold mb-2">
                Vantage Labs • Corporate • Chicago • Mar 2025
              </h4>
              <p className="text-gray-600 italic">
                "Our team actually sang karaoke—effortless."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <div className="text-yellow-500 text-xl mb-4">
                ★★★★★
              </div>
              <h4 className="font-bold mb-2">
                North Shore Prep • School • Evanston • Sep 2024
              </h4>
              <p className="text-gray-600 italic">
                "Professional, responsive, photos in days."
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
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
    </div>
  );
}