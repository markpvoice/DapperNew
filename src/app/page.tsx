import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <>
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-brand-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-brand-gold">
              Dapper Squad
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-white hover:text-brand-gold transition-colors">Home</a>
              <a href="#services" className="text-white hover:text-brand-gold transition-colors">Services</a>
              <a href="#about" className="text-white hover:text-brand-gold transition-colors">About</a>
              <a href="#contact" className="text-white hover:text-brand-gold transition-colors">Contact</a>
            </div>
            <Button variant="gold" size="sm">Get Quote</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-brand-charcoal to-gray-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-brand-gold/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-brand-gold/5 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-brand-gold/5 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Hero Content */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
                <span className="bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold bg-clip-text text-transparent">
                  Dapper Squad
                </span>
                <br />
                <span className="text-white text-4xl md:text-6xl font-light">
                  Entertainment
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                Making every event <span className="text-brand-gold font-semibold">legendary</span> with professional DJ services, 
                photography, and unforgettable entertainment experiences across Chicago & Milwaukee.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-fade-in">
              <Button variant="gold" size="xl" className="text-lg px-8 py-4 shadow-2xl hover:shadow-brand-gold/25 transition-all duration-300">
                🎉 Book Your Event
              </Button>
              <Button variant="gold-outline" size="xl" className="text-lg px-8 py-4 hover:shadow-lg transition-all duration-300">
                View Our Work
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in">
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-gold mb-2">500+</div>
                <div className="text-gray-300">Events Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-gold mb-2">5★</div>
                <div className="text-gray-300">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-gold mb-2">10+</div>
                <div className="text-gray-300">Years Experience</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-brand-gold rounded-full flex justify-center">
            <div className="w-1 h-3 bg-brand-gold rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our <span className="text-brand-gold">Services</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From intimate gatherings to grand celebrations, we bring the perfect soundtrack to your special moments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* DJ Services */}
            <div className="group bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-brand-gold/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-5xl mb-6">🎵</div>
              <h3 className="text-2xl font-bold text-brand-gold mb-4">Professional DJ Services</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                State-of-the-art sound systems, extensive music libraries, and seamless mixing for weddings, 
                corporate events, and private parties.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Premium sound equipment</li>
                <li>• Unlimited music requests</li>
                <li>• Professional lighting</li>
                <li>• MC services included</li>
              </ul>
            </div>

            {/* Photography */}
            <div className="group bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-brand-gold/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-5xl mb-6">📸</div>
              <h3 className="text-2xl font-bold text-brand-gold mb-4">Event Photography</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Capture every precious moment with our professional photography services. 
                High-quality images delivered within 48 hours.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Professional equipment</li>
                <li>• Same-day preview gallery</li>
                <li>• Unlimited digital downloads</li>
                <li>• Photo booth options</li>
              </ul>
            </div>

            {/* Karaoke */}
            <div className="group bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-brand-gold/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-5xl mb-6">🎤</div>
              <h3 className="text-2xl font-bold text-brand-gold mb-4">Karaoke & Entertainment</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Interactive karaoke sessions with our extensive song library. 
                Perfect for breaking the ice and getting everyone involved.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• 10,000+ song library</li>
                <li>• Professional microphones</li>
                <li>• Large display screens</li>
                <li>• Interactive games</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-r from-brand-charcoal to-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose <span className="text-brand-gold">Dapper Squad?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                With over a decade of experience in the entertainment industry, we've perfected the art of creating 
                unforgettable experiences. Our team of professionals is dedicated to making your event seamless and spectacular.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-black font-bold text-sm">✓</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Flat Rate Pricing</h4>
                    <p className="text-gray-400">No hidden fees or surprise charges. What you see is what you pay.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-black font-bold text-sm">✓</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Fast Booking</h4>
                    <p className="text-gray-400">Quick response times and easy online booking process.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-black font-bold text-sm">✓</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">5-Star Reviews</h4>
                    <p className="text-gray-400">Consistently rated 5 stars across all platforms by our satisfied clients.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-brand-gold/10 rounded-2xl p-8 backdrop-blur-sm border border-brand-gold/20">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-brand-gold mb-4">Award Winning Service</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Recognized as the top entertainment provider in the Chicago-Milwaukee area. 
                    Our commitment to excellence shows in every event we produce.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make Your Event <span className="text-brand-gold">Legendary?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Let's discuss your vision and create an unforgettable experience for you and your guests.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button variant="gold" size="xl" className="text-lg px-12 py-4">
              📞 Call (555) 123-4567
            </Button>
            <Button variant="gold-outline" size="xl" className="text-lg px-12 py-4">
              📧 Get Free Quote
            </Button>
          </div>

          <div className="text-gray-400">
            <p>📍 Serving Chicago, Milwaukee & Surrounding Areas</p>
            <p className="mt-2">✉️ info@dappersquad.com | 🌐 www.dappersquad.com</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-charcoal py-8 border-t border-brand-gold/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-brand-gold font-bold text-xl mb-4 md:mb-0">
              Dapper Squad Entertainment
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Dapper Squad Entertainment. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
