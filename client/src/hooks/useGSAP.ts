import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook for safe GSAP animation setup and cleanup
 * Prevents memory leaks by properly killing animations on unmount
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Ensures all GSAP instances are properly cleaned up
 * - Provides a safe context for animation setup
 * - Integrates with ScrollTrigger for scroll-based animations
 */
export const useGSAP = (
  callback: () => void | (() => void),
  dependencies?: React.DependencyList
) => {
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // Create a GSAP context to manage animations
    contextRef.current = gsap.context(() => {
      const cleanup = callback();
      return cleanup;
    });

    return () => {
      // Revert all animations and kill context on unmount
      if (contextRef.current) {
        contextRef.current.revert();
      }
    };
  }, dependencies);
};

export { ScrollTrigger };

