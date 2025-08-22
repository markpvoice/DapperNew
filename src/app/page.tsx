import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-charcoal to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-brand-gold to-yellow-400 bg-clip-text text-transparent">
            Dapper Squad Entertainment
          </h1>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Making every event legendary with professional DJ services, entertainment, and event planning.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="gold" size="lg">
              Book Your Event
            </Button>
            <Button variant="gold-outline" size="lg">
              View Services
            </Button>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-brand-gold">Professional DJ Services</h3>
            <p className="text-gray-300">State-of-the-art sound systems and extensive music libraries for any event.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-brand-gold">Event Planning</h3>
            <p className="text-gray-300">Complete event coordination to make your special day unforgettable.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-brand-gold">Entertainment</h3>
            <p className="text-gray-300">Interactive entertainment and activities to keep your guests engaged.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
