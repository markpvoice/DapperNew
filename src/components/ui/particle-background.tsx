/**
 * @fileoverview Particle Background Component
 * 
 * Subtle particle system for hero section background with:
 * - Interactive golden sparkles
 * - Mouse movement response
 * - Performance optimizations
 * - Accessibility compliance
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  className?: string;
}

export function ParticleBackground({ 
  particleCount = 30, 
  className = '' 
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Create particle
  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.max(0.5, Math.random() * 3 + 1),
      opacity: Math.random() * 0.5 + 0.2,
      life: 0,
      maxLife: Math.random() * 300 + 200
    };
  }, []);

  // Initialize particles
  const initParticles = useCallback((canvas: HTMLCanvasElement) => {
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle(canvas));
    }
  }, [particleCount, createParticle]);

  // Update particle position and properties
  const updateParticle = useCallback((particle: Particle, canvas: HTMLCanvasElement) => {
    const EPS = 1e-3;
    // Mouse interaction
    const dx = mouseRef.current.x - particle.x;
    const dy = mouseRef.current.y - particle.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance > EPS && distance < 100) {
      const force = (100 - distance) / 100;
      const nx = dx / distance;
      const ny = dy / distance;
      particle.vx += nx * force * 0.01;
      particle.vy += ny * force * 0.01;
    }

    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Update life
    particle.life++;
    
    // Fade in/out based on life
    if (particle.life < 50) {
      particle.opacity = (particle.life / 50) * 0.7;
    } else if (particle.life > particle.maxLife - 50) {
      particle.opacity = ((particle.maxLife - particle.life) / 50) * 0.7;
    }

    // Boundary collision
    if (particle.x < 0 || particle.x > canvas.width) {
      particle.vx *= -0.8;
      particle.x = Math.max(0, Math.min(canvas.width, particle.x));
    }
    if (particle.y < 0 || particle.y > canvas.height) {
      particle.vy *= -0.8;
      particle.y = Math.max(0, Math.min(canvas.height, particle.y));
    }

    // Damping
    particle.vx *= 0.995;
    particle.vy *= 0.995;

    // Reset particle if life expired
    if (particle.life >= particle.maxLife) {
      const newParticle = createParticle(canvas);
      Object.assign(particle, newParticle);
    }

    // Sanitize non-finite values
    if (
      !Number.isFinite(particle.x) ||
      !Number.isFinite(particle.y) ||
      !Number.isFinite(particle.vx) ||
      !Number.isFinite(particle.vy) ||
      !Number.isFinite(particle.size) ||
      particle.size <= 0 ||
      !Number.isFinite(particle.opacity)
    ) {
      const newParticle = createParticle(canvas);
      Object.assign(particle, newParticle);
    }
  }, [createParticle]);

  // Render particle
  const renderParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    if (
      !Number.isFinite(particle.x) ||
      !Number.isFinite(particle.y) ||
      !Number.isFinite(particle.size) ||
      particle.size <= 0
    ) {
      return;
    }
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    
    // Create gradient for sparkle effect
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size
    );
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FFA500');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add sparkle cross effect
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.globalAlpha = particle.opacity * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(particle.x - particle.size, particle.y);
    ctx.lineTo(particle.x + particle.size, particle.y);
    ctx.moveTo(particle.x, particle.y - particle.size);
    ctx.lineTo(particle.x, particle.y + particle.size);
    ctx.stroke();
    
    ctx.restore();
  };

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible || prefersReducedMotion || canvas.width <= 0 || canvas.height <= 0) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and render particles
    particlesRef.current.forEach(particle => {
      updateParticle(particle, canvas);
      renderParticle(ctx, particle);
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isVisible, prefersReducedMotion, updateParticle]);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    mouseRef.current = { x, y };
    setMousePosition({ x, y });
  }, []);

  // Handle window resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const parent = canvas.parentElement;
    if (parent) {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width <= 0 || height <= 0) {
        return;
      }
      canvas.width = width;
      canvas.height = height;
      initParticles(canvas);
    }
  }, [initParticles]);

  // Initialize canvas and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) {
      return;
    }

    // Set canvas size
    handleResize();

    // Initialize particles
    initParticles(canvas);

    // Start animation
    animate();

    // Event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleCount, prefersReducedMotion, animate, handleResize, handleMouseMove, initParticles]);

  // Intersection observer for performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (!entry.isIntersecting && animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        } else if (entry.isIntersecting && !prefersReducedMotion) {
          animate();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);

    return () => observer.disconnect();
  }, [animate, prefersReducedMotion]);

  // Don't render anything for reduced motion
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      data-testid="particle-canvas"
      data-particle-count={particleCount}
      data-mouse-x={mousePosition.x}
      data-mouse-y={mousePosition.y}
      data-animation-paused={!isVisible}
      data-reduced-motion={prefersReducedMotion}
      style={{ 
        background: 'transparent',
        zIndex: 1
      }}
    />
  );
}
