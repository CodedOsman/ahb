import React, { ReactNode } from 'react';
import { useLenis } from '@/hooks/useLenis';

/**
 * GlobalScroll Wrapper Component
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Wraps the entire application to enable smooth Lenis scrolling
 * - Ensures all scroll-based animations feel buttery and professional
 * - Integrates seamlessly with GSAP ScrollTrigger
 */
interface GlobalScrollProps {
  children: ReactNode;
}

export const GlobalScroll: React.FC<GlobalScrollProps> = ({ children }) => {
  useLenis();

  return <>{children}</>;
};

export default GlobalScroll;

