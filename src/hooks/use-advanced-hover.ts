import { useState, useCallback, useRef, useEffect } from 'react';

interface AdvancedHoverOptions {
  // Transform options
  scale?: number;
  rotateX?: number;
  rotateY?: number;
  
  // Effect toggles
  enableScale?: boolean;
  enableTilt?: boolean;
  enableGlow?: boolean;
  enableMagnetic?: boolean;
  
  // Visual options
  glowColor?: string;
  magneticStrength?: number;
  
  // Performance options
  throttleMs?: number;
  duration?: number;
  easing?: string;
  
  // Element reference for optimization
  element?: HTMLElement | null;
}

interface MousePosition {
  x: number;
  y: number;
}

interface HoverHandlers {
  onMouseEnter: (_event?: MouseEvent) => void;
  onMouseLeave: () => void;
  onMouseMove: (_event: MouseEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
}

interface UseAdvancedHoverReturn {
  isHovered: boolean;
  mousePosition: MousePosition;
  transformStyle: string;
  transitionStyle: string;
  glowStyle: string;
  hoverHandlers: HoverHandlers;
}

/**
 * Advanced hover effects hook with performance optimization
 * Features:
 * - GPU-accelerated transforms
 * - Magnetic mouse following effects
 * - Tilt and glow effects
 * - Performance throttling
 * - Accessibility compliance
 * - Memory management
 */
export function useAdvancedHover(
  options: AdvancedHoverOptions = {}
): UseAdvancedHoverReturn {
  const {
    scale = 1.05,
    rotateX = 5,
    rotateY = 5,
    enableScale = false,
    enableTilt = false,
    enableGlow = false,
    enableMagnetic = false,
    glowColor = '#FFD700',
    magneticStrength = 0.2,
    throttleMs = 16,
    duration = 300,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    element = null,
  } = options;

  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [transforms, setTransforms] = useState<{
    scale: number;
    rotateX: number;
    rotateY: number;
    translateX: number;
    translateY: number;
  }>({
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    translateX: 0,
    translateY: 0,
  });

  const throttleRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();
  const elementRef = useRef<HTMLElement | null>(element);

  // Update element ref when element prop changes
  useEffect(() => {
    elementRef.current = element;
  }, [element]);

  // Check for reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  }, []);

  // Calculate transforms based on mouse position and element bounds
  const calculateTransforms = useCallback((
    mouseX: number,
    mouseY: number,
    rect: DOMRect | null,
    hoverState: boolean = isHovered
  ) => {
    if (!rect || prefersReducedMotion()) {
      return {
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        translateX: 0,
        translateY: 0,
      };
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    // Normalize to -1 to 1 range
    const normalizedX = (deltaX / (rect.width / 2));
    const normalizedY = (deltaY / (rect.height / 2));

    return {
      scale: enableScale && hoverState ? scale : 1,
      rotateX: enableTilt && hoverState ? -normalizedY * rotateX : 0,
      rotateY: enableTilt && hoverState ? normalizedX * rotateY : 0,
      translateX: enableMagnetic && hoverState ? normalizedX * magneticStrength * 10 : 0,
      translateY: enableMagnetic && hoverState ? normalizedY * magneticStrength * 10 : 0,
    };
  }, [
    enableScale,
    enableTilt,
    enableMagnetic,
    scale,
    rotateX,
    rotateY,
    magneticStrength,
    isHovered,
    prefersReducedMotion,
  ]);

  // Throttled mouse move handler for performance
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!event.target || !(event.target as Element).getBoundingClientRect) {
      return;
    }

    const now = Date.now();
    if (throttleRef.current && now - throttleRef.current < throttleMs) {
      return;
    }
    throttleRef.current = now;

    const rect = (event.target as Element).getBoundingClientRect();
    const mouseX = event.clientX || 0;
    const mouseY = event.clientY || 0;

    // Update mouse position
    setMousePosition({ x: mouseX, y: mouseY });

    // Calculate and apply transforms
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const newTransforms = calculateTransforms(mouseX, mouseY, rect, isHovered);
      setTransforms(newTransforms);
    });
  }, [calculateTransforms, throttleMs, isHovered]);

  // Mouse enter handler
  const handleMouseEnter = useCallback((event?: MouseEvent) => {
    setIsHovered(true);

    // Apply will-change for GPU acceleration
    if (elementRef.current && !prefersReducedMotion()) {
      elementRef.current.style.willChange = 'transform, filter';
    }

    if (event) {
      const rect = (event.target as Element)?.getBoundingClientRect();
      const mouseX = event.clientX || 0;
      const mouseY = event.clientY || 0;

      setMousePosition({ x: mouseX, y: mouseY });
      
      const newTransforms = calculateTransforms(mouseX, mouseY, rect || null, true);
      setTransforms(newTransforms);
    }
  }, [calculateTransforms, prefersReducedMotion]);

  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    
    // Reset transforms
    setTransforms({
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      translateX: 0,
      translateY: 0,
    });

    // Remove will-change for performance
    if (elementRef.current) {
      elementRef.current.style.willChange = 'auto';
    }
  }, []);

  // Focus handler for accessibility
  const handleFocus = useCallback(() => {
    setIsHovered(true);
    
    if (elementRef.current && !prefersReducedMotion()) {
      elementRef.current.style.willChange = 'transform, filter';
    }
    
    // Apply basic scale transform on focus
    if (enableScale) {
      setTransforms(prev => ({ ...prev, scale }));
    }
  }, [enableScale, scale, prefersReducedMotion]);

  // Blur handler for accessibility
  const handleBlur = useCallback(() => {
    setIsHovered(false);
    
    setTransforms({
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      translateX: 0,
      translateY: 0,
    });

    if (elementRef.current) {
      elementRef.current.style.willChange = 'auto';
    }
  }, []);

  // Generate transform style string
  const transformStyle = prefersReducedMotion() ? '' : 
    (!isHovered && transforms.scale === 1 && transforms.rotateX === 0 && 
     transforms.rotateY === 0 && transforms.translateX === 0 && transforms.translateY === 0) ? '' :
    `translate3d(${transforms.translateX}px, ${transforms.translateY}px, 0) ` +
    `scale(${transforms.scale}) ` +
    `rotateX(${transforms.rotateX}deg) ` +
    `rotateY(${transforms.rotateY}deg)`;

  // Generate transition style
  const transitionStyle = prefersReducedMotion() ? '' :
    isHovered ? `transform ${duration}ms ${easing}, filter ${duration}ms ${easing}` : '';

  // Generate glow style
  const glowStyle = (enableGlow && isHovered && !prefersReducedMotion()) 
    ? `drop-shadow(0 0 20px ${glowColor}40) drop-shadow(0 0 40px ${glowColor}20)`
    : '';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (elementRef.current) {
        elementRef.current.style.willChange = '';
      }
    };
  }, []);

  return {
    isHovered,
    mousePosition,
    transformStyle,
    transitionStyle,
    glowStyle,
    hoverHandlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseMove: handleMouseMove,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}