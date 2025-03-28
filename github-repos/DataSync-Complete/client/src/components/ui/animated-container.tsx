import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

type AnimationType = 
  | "fade-in" 
  | "slide-up" 
  | "slide-right" 
  | "bounce" 
  | "pulse" 
  | "scale-in" 
  | "wiggle";

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  onAnimationComplete?: () => void;
  triggerOnScroll?: boolean;
  repeat?: boolean;
}

export function AnimatedContainer({
  children,
  animation = "fade-in",
  delay = 0,
  duration = 500,
  className = "",
  onAnimationComplete,
  triggerOnScroll = false,
  repeat = false
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = useState(!triggerOnScroll);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation class map
  const animationClasses: Record<AnimationType, string> = {
    "fade-in": "opacity-0 animate-fadeIn",
    "slide-up": "opacity-0 translate-y-8 animate-slideUp",
    "slide-right": "opacity-0 -translate-x-8 animate-slideRight",
    "bounce": "animate-bounce",
    "pulse": "animate-pulse",
    "scale-in": "opacity-0 scale-95 animate-scaleIn",
    "wiggle": "animate-wiggle"
  };

  // CSS variable for animation timing
  const style = {
    '--animation-delay': `${delay}ms`,
    '--animation-duration': `${duration}ms`,
  } as React.CSSProperties;

  useEffect(() => {
    if (triggerOnScroll) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && (!hasAnimated || repeat)) {
            setIsVisible(true);
            setHasAnimated(true);
          } else if (!entry.isIntersecting && repeat) {
            setIsVisible(false);
          }
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.1
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        if (containerRef.current) {
          observer.unobserve(containerRef.current);
        }
      };
    }
  }, [triggerOnScroll, hasAnimated, repeat]);

  useEffect(() => {
    if (isVisible && onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, delay + duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay, duration, onAnimationComplete]);

  return (
    <div
      ref={containerRef}
      className={cn(
        isVisible ? animationClasses[animation] : 'opacity-0',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}