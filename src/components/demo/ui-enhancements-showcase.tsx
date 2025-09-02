/**
 * UI Enhancements Showcase Component
 * Demonstrates all the new typography, colors, buttons, and loading states
 */

import React from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';

export function UIEnhancementsShowcase() {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});

  const handleButtonClick = (variant: string) => {
    setLoadingStates(prev => ({ ...prev, [variant]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [variant]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-elegant p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Typography Showcase */}
        <section className="space-y-8">
          <h1 className="text-display-large text-brand-heading text-center mb-8">
            Enhanced Typography System
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-headline-large text-gradient-gold">Display & Headlines</h2>
              <p className="text-display-small">Display Small</p>
              <p className="text-headline-medium">Headline Medium</p>
              <p className="text-title-large">Title Large</p>
              <p className="text-body-large">Body Large - Perfect for main content</p>
              <p className="text-label-large">Label Large - For form labels</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-headline-large text-gradient-premium">Responsive & Luxury</h2>
              <p className="text-headline-responsive">Responsive headline that scales</p>
              <p className="text-body-responsive">Responsive body text</p>
              <p className="text-luxury">Luxury typography with elegance</p>
              <p className="text-accessible-body">High contrast accessible text</p>
              <p className="text-brand-heading">Brand gold heading style</p>
            </div>
          </div>
        </section>

        {/* Color Gradients Showcase */}
        <section className="space-y-8">
          <h2 className="text-headline-large text-gradient-brand text-center">
            Enhanced Color Palette & Gradients
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-luxury p-6 rounded-lg text-white text-center">
              <h3 className="text-title-large mb-2">Luxury Gradient</h3>
              <p className="text-body-medium">Premium gold blend</p>
            </div>
            
            <div className="bg-gradient-sophisticated p-6 rounded-lg text-brand-gold text-center">
              <h3 className="text-title-large mb-2">Sophisticated</h3>
              <p className="text-body-medium">Professional charcoal</p>
            </div>
            
            <div className="bg-gradient-warm p-6 rounded-lg text-white text-center">
              <h3 className="text-title-large mb-2">Warm Tones</h3>
              <p className="text-body-medium">Inviting coral blend</p>
            </div>
            
            <div className="bg-gradient-cool p-6 rounded-lg text-white text-center">
              <h3 className="text-title-large mb-2">Cool Tones</h3>
              <p className="text-body-medium">Refreshing blue-green</p>
            </div>
            
            <div className="bg-gradient-sunset p-6 rounded-lg text-white text-center">
              <h3 className="text-title-large mb-2">Sunset</h3>
              <p className="text-body-medium">Vibrant evening colors</p>
            </div>
            
            <div className="bg-gradient-dawn p-6 rounded-lg text-brand-charcoal text-center">
              <h3 className="text-title-large mb-2">Dawn</h3>
              <p className="text-body-medium">Gentle morning light</p>
            </div>
          </div>
          
          {/* Text Gradients */}
          <div className="text-center space-y-4">
            <h3 className="text-headline-large text-gradient-luxury">Luxury Text Gradient</h3>
            <h3 className="text-headline-medium text-gradient-gold">Gold Text Gradient</h3>
            <h3 className="text-headline-medium text-gradient-accent">Accent Text Gradient</h3>
          </div>
        </section>

        {/* Enhanced Buttons Showcase */}
        <section className="space-y-8">
          <h2 className="text-headline-large text-gradient-premium text-center">
            Enhanced Button System
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Button Variants */}
            <div className="space-y-4">
              <h3 className="text-title-large text-brand-gold text-center">Variants</h3>
              
              <EnhancedButton 
                variant="primary"
                onClick={() => handleButtonClick('primary')}
                loading={loadingStates.primary}
                className="w-full"
              >
                Primary
              </EnhancedButton>
              
              <EnhancedButton 
                variant="luxury"
                onClick={() => handleButtonClick('luxury')}
                loading={loadingStates.luxury}
                className="w-full"
              >
                Luxury
              </EnhancedButton>
              
              <EnhancedButton 
                variant="premium"
                onClick={() => handleButtonClick('premium')}
                loading={loadingStates.premium}
                className="w-full"
              >
                Premium
              </EnhancedButton>
              
              <EnhancedButton 
                variant="elegant"
                onClick={() => handleButtonClick('elegant')}
                loading={loadingStates.elegant}
                className="w-full"
              >
                Elegant
              </EnhancedButton>
            </div>
            
            {/* Button Effects */}
            <div className="space-y-4">
              <h3 className="text-title-large text-brand-gold text-center">Effects</h3>
              
              <EnhancedButton 
                variant="neon"
                glowEffect={true}
                className="w-full"
                onClick={() => handleButtonClick('neon')}
                loading={loadingStates.neon}
              >
                Neon Glow
              </EnhancedButton>
              
              <EnhancedButton 
                variant="glass"
                className="w-full bg-white/10"
                onClick={() => handleButtonClick('glass')}
                loading={loadingStates.glass}
              >
                Glass Effect
              </EnhancedButton>
              
              <EnhancedButton 
                variant="gradient"
                className="w-full"
                onClick={() => handleButtonClick('gradient')}
                loading={loadingStates.gradient}
              >
                Gradient
              </EnhancedButton>
              
              <EnhancedButton 
                variant="secondary"
                rippleEffect={true}
                className="w-full"
                onClick={() => handleButtonClick('ripple')}
                loading={loadingStates.ripple}
              >
                Ripple Effect
              </EnhancedButton>
            </div>
            
            {/* Button Animations */}
            <div className="space-y-4">
              <h3 className="text-title-large text-brand-gold text-center">Animations</h3>
              
              <EnhancedButton 
                variant="luxury"
                animation="glow-pulse"
                className="w-full"
              >
                Glow Pulse
              </EnhancedButton>
              
              <EnhancedButton 
                variant="premium"
                animation="float"
                className="w-full"
              >
                Float
              </EnhancedButton>
              
              <EnhancedButton 
                variant="elegant"
                animation="scale-hover"
                className="w-full"
              >
                Scale Hover
              </EnhancedButton>
              
              <EnhancedButton 
                variant="sophisticated"
                animation="bounce"
                className="w-full"
              >
                Bounce
              </EnhancedButton>
            </div>
            
            {/* Button Sizes */}
            <div className="space-y-4">
              <h3 className="text-title-large text-brand-gold text-center">Sizes</h3>
              
              <EnhancedButton variant="primary" size="xs" className="w-full">
                Extra Small
              </EnhancedButton>
              
              <EnhancedButton variant="primary" size="sm" className="w-full">
                Small
              </EnhancedButton>
              
              <EnhancedButton variant="primary" size="default" className="w-full">
                Default
              </EnhancedButton>
              
              <EnhancedButton variant="primary" size="lg" className="w-full">
                Large
              </EnhancedButton>
              
              <EnhancedButton variant="primary" size="xl" className="w-full">
                Extra Large
              </EnhancedButton>
            </div>
          </div>
        </section>

        {/* Loading States Showcase */}
        <section className="space-y-8">
          <h2 className="text-headline-large text-gradient-gold text-center">
            Loading States & Transitions
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Loading Spinners */}
            <div className="space-y-4 text-center">
              <h3 className="text-title-large text-brand-gold">Spinners</h3>
              <div className="flex justify-center items-center space-x-4">
                <div className="loading-spinner loading-spinner-sm loading-spinner-gold"></div>
                <div className="loading-spinner loading-spinner-default loading-spinner-luxury"></div>
                <div className="loading-spinner loading-spinner-lg loading-spinner-primary"></div>
              </div>
            </div>
            
            {/* Skeleton Loaders */}
            <div className="space-y-4">
              <h3 className="text-title-large text-brand-gold text-center">Skeletons</h3>
              <div className="skeleton-loader skeleton-text">
                <div className="skeleton-line"></div>
                <div className="skeleton-line" style={{ width: '80%' }}></div>
                <div className="skeleton-line" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-4">
              <h3 className="text-title-large text-brand-gold text-center">Progress</h3>
              <div className="progress-bar progress-bar-default animated">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
              <div className="progress-bar progress-bar-luxury animated">
                <div className="progress-fill" style={{ width: '60%' }}></div>
              </div>
              <div className="progress-bar progress-bar-success">
                <div className="progress-fill" style={{ width: '90%' }}></div>
              </div>
            </div>
            
            {/* Pulse Loaders */}
            <div className="space-y-4 text-center">
              <h3 className="text-title-large text-brand-gold">Pulse</h3>
              <div className="pulse-loader pulse-loader-default justify-center">
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
              </div>
              <div className="pulse-loader pulse-loader-lg justify-center">
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Colors Showcase */}
        <section className="space-y-8">
          <h2 className="text-headline-large text-gradient-brand text-center">
            Extended Brand Color Palette
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-brand-gold p-4 rounded-lg text-center">
              <div className="w-full h-16 rounded mb-2"></div>
              <p className="text-brand-charcoal text-label-medium">Gold</p>
            </div>
            <div className="bg-brand-platinum p-4 rounded-lg text-center">
              <div className="w-full h-16 rounded mb-2"></div>
              <p className="text-brand-charcoal text-label-medium">Platinum</p>
            </div>
            <div className="bg-brand-champagne p-4 rounded-lg text-center">
              <div className="w-full h-16 rounded mb-2"></div>
              <p className="text-brand-charcoal text-label-medium">Champagne</p>
            </div>
            <div className="bg-brand-bronze p-4 rounded-lg text-center">
              <div className="w-full h-16 rounded mb-2"></div>
              <p className="text-white text-label-medium">Bronze</p>
            </div>
            <div className="bg-accent-emerald p-4 rounded-lg text-center">
              <div className="w-full h-16 rounded mb-2"></div>
              <p className="text-white text-label-medium">Emerald</p>
            </div>
            <div className="bg-accent-sapphire p-4 rounded-lg text-center">
              <div className="w-full h-16 rounded mb-2"></div>
              <p className="text-white text-label-medium">Sapphire</p>
            </div>
            <div className="bg-accent-coral p-4 rounded-lg text-center">
              <div className="w-full h-16 rounded mb-2"></div>
              <p className="text-white text-label-medium">Coral</p>
            </div>
            <div className="bg-brand-charcoal p-4 rounded-lg text-center">
              <div className="w-full h-16 rounded mb-2"></div>
              <p className="text-brand-gold text-label-medium">Charcoal</p>
            </div>
          </div>
        </section>

        {/* Performance Stats */}
        <section className="bg-gradient-sophisticated p-8 rounded-2xl text-center">
          <h2 className="text-headline-large text-gradient-gold mb-6">
            Enhancement Impact
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 text-white">
            <div>
              <p className="text-display-small font-weight-bold">50+</p>
              <p className="text-body-large">New Typography Classes</p>
            </div>
            <div>
              <p className="text-display-small font-weight-bold">25+</p>
              <p className="text-body-large">Color Variants</p>
            </div>
            <div>
              <p className="text-display-small font-weight-bold">15+</p>
              <p className="text-body-large">Button Animations</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}