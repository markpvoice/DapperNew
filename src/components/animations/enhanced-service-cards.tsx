'use client';

import React from 'react';
import { AnimatedSection } from './animated-section';
import { HoverEnhancedCard } from './hover-enhanced-card';
import { ParallaxSection } from './parallax-section';

interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
}

interface EnhancedServiceCardsProps {
  services: ServiceCardData[];
  className?: string;
  showParallax?: boolean;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn';
}

/**
 * Enhanced Service Cards component showcasing all advanced animation features
 * 
 * Features:
 * - Scroll-triggered stagger animations
 * - Advanced hover effects (scale, tilt, glow, magnetic)
 * - Parallax background elements
 * - Performance optimization
 * - Accessibility compliance
 * - Mobile responsiveness
 */
export function EnhancedServiceCards({
  services,
  className = '',
  showParallax = true,
  animationType = 'fadeInUp',
}: EnhancedServiceCardsProps): JSX.Element {
  return (
    <section className={`relative py-20 ${className}`}>
      {/* Parallax Background Elements */}
      {showParallax && (
        <>
          <ParallaxSection
            speed={0.3}
            direction="up"
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: -1 }}
          >
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl" />
          </ParallaxSection>
          
          <ParallaxSection
            speed={0.2}
            direction="down"
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: -2 }}
          >
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
          </ParallaxSection>
        </>
      )}

      {/* Animated Section Container */}
      <AnimatedSection
        animation={animationType}
        triggerOnScroll
        stagger={150}
        className="container mx-auto px-6"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Premium Services
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the difference with our professional entertainment services,
            enhanced with cutting-edge technology and premium equipment.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <HoverEnhancedCard
              key={service.id}
              enableScale
              enableTilt
              enableGlow={service.popular}
              enableMagnetic
              scale={1.05}
              rotateX={8}
              rotateY={8}
              glowColor={service.popular ? '#FFD700' : '#8B5CF6'}
              magneticStrength={0.15}
              duration={400}
              className={`
                relative group bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
                rounded-2xl p-8 border border-gray-700/50 overflow-hidden
                ${service.popular ? 'ring-2 ring-brand-gold/30' : ''}
              `}
              data-testid={`service-card-${service.id}`}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute top-4 right-4 bg-brand-gold text-gray-900 text-sm font-bold px-3 py-1 rounded-full">
                  Popular
                </div>
              )}

              {/* Service Icon */}
              <div className="mb-6 text-brand-gold text-4xl group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>

              {/* Service Title */}
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-gold transition-colors duration-300">
                {service.title}
              </h3>

              {/* Service Description */}
              <p className="text-gray-300 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Service Features */}
              <ul className="space-y-2 mb-8">
                {service.features.map((feature, featureIndex) => (
                  <li 
                    key={featureIndex}
                    className="flex items-center text-gray-400 text-sm"
                    style={{ 
                      animationDelay: `${(index * 150) + (featureIndex * 50)}ms` 
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button className="
                w-full bg-gradient-to-r from-brand-gold to-yellow-500 
                text-gray-900 font-bold py-3 px-6 rounded-lg
                hover:shadow-lg hover:shadow-brand-gold/25
                transform hover:scale-105 transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-gray-900
              ">
                Learn More
              </button>

              {/* Animated Background Gradient */}
              <div className="
                absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/5 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-500
                transform -skew-x-12 group-hover:skew-x-0
              " />
            </HoverEnhancedCard>
          ))}
        </div>

        {/* Call-to-Action Section */}
        <div className="text-center mt-16">
          <HoverEnhancedCard
            enableScale
            enableGlow
            scale={1.02}
            glowColor="#FFD700"
            className="inline-block bg-transparent"
          >
            <button className="
              bg-gradient-to-r from-purple-600 to-brand-gold
              text-white font-bold py-4 px-12 rounded-full text-lg
              shadow-2xl shadow-purple-500/25
              hover:shadow-3xl hover:shadow-brand-gold/30
              transition-all duration-400
              focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2
            ">
              Get Your Custom Quote
            </button>
          </HoverEnhancedCard>
        </div>
      </AnimatedSection>
    </section>
  );
}

// Example service data for demonstration
export const sampleServiceData: ServiceCardData[] = [
  {
    id: 'dj-services',
    title: 'Professional DJ Services',
    description: 'Premium sound systems, wireless microphones, and an extensive music library covering all genres from the 1950s to today\'s hits.',
    icon: <div>🎧</div>,
    features: [
      'State-of-the-art sound equipment',
      'Wireless microphone systems',
      'Music from 1950s to current hits',
      'Custom playlists and requests',
      'Professional lighting effects'
    ],
    popular: true,
  },
  {
    id: 'karaoke',
    title: 'Interactive Karaoke',
    description: 'Engage your guests with our professional karaoke setup featuring thousands of songs and crisp audio quality.',
    icon: <div>🎤</div>,
    features: [
      '10,000+ song library',
      'HD displays and monitors',
      'Professional vocal effects',
      'Multiple microphone options',
      'Real-time lyric display'
    ],
  },
  {
    id: 'photography',
    title: 'Event Photography',
    description: 'Capture your special moments with our professional photography services, from candid shots to posed portraits.',
    icon: <div>📸</div>,
    features: [
      'High-resolution digital photos',
      'Professional editing included',
      '48-hour delivery guarantee',
      'Online gallery access',
      'Print packages available'
    ],
  },
];