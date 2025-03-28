import React, { useState, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode;
  rippleColor?: string;
  hoverScale?: boolean;
  hoverGlow?: boolean;
}

export function AnimatedButton({
  children,
  className,
  rippleColor = 'rgba(255, 255, 255, 0.4)',
  hoverScale = true,
  hoverGlow = true,
  ...props
}: AnimatedButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleId = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: rippleId.current,
      x,
      y,
    };
    
    rippleId.current += 1;
    setRipples([...ripples, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
  };

  const baseClassName = hoverScale 
    ? 'transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]' 
    : '';
    
  const glowClassName = hoverGlow 
    ? 'relative after:absolute after:inset-0 after:rounded-md after:opacity-0 after:transition-opacity hover:after:opacity-100 after:shadow-[0_0_15px_rgba(59,130,246,0.5)] after:pointer-events-none' 
    : '';

  return (
    <Button
      ref={buttonRef}
      className={cn(
        'overflow-hidden relative',
        baseClassName,
        glowClassName,
        className
      )}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      {children}
    </Button>
  );
}