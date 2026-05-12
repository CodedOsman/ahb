import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Custom hook to initialize and manage Lenis smooth scrolling
 * Integrates with GSAP ScrollTrigger for cinematic scroll animations
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Smooth, buttery scroll feel that complements GSAP animations
 * - Integrates seamlessly with ScrollTrigger for horizontal scroll effects
 */
export const useLenis = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 0.4,
      easing: (t) => t,
      smoothWheel: true,
      smoothTouch: true,
      touchMultiplier: 1,
      wheelMultiplier: 1,
    });

    let rafId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
};

