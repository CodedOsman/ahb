import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@/hooks/useGSAP';

/**
 * Editorial Hero Section
 *
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Split-screen layout with geometric divider
 * - GSAP stagger mask-up effect for typography
 * - Single hero image with luxury scale animation
 * - Full-bleed cinematic presentation
 */

export const Hero: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    // Only run animations after preloader completes
    if (isLoading) return;

    // Stagger mask-up effect for headline
    const headlineChars = gsap.utils.toArray('.headline-char') as HTMLElement[];

    gsap.fromTo(
      headlineChars,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power3.out',
        delay: 0.3,
      }
    );

    // Subtitle fade-in
    gsap.fromTo(
      '.hero-subtitle',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.8,
      }
    );

    // Brand tagline entrance
    gsap.fromTo(
      '.hero-tagline',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.5,
      }
    );
  }, [isLoading]);

  // Initial image animation
  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { scale: 1.1, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          delay: 0.1,
        }
      );
    }
  }, []);

  // Split headline text into characters for stagger animation
  const headlineText = 'The Art of Elegance';
  const headlineChars = headlineText.split('').map((char, i) => (
    <span key={i} className="headline-char inline-block" style={{ overflow: 'hidden' }}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen bg-charcoal overflow-hidden pt-20"
    >
      {/* Split Screen Layout */}
      <div className="absolute inset-0 flex">
        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 z-10">
          <div className="max-w-lg">
            <h1
              className="text-6xl md:text-7xl font-black text-cream mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {headlineChars}
            </h1>

            <p
              className="hero-subtitle text-lg text-beige-light mb-8"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                lineHeight: 1.8,
              }}
            >
              Experience luxury hair transformation with our award-winning stylists. From intricate braiding to vibrant color, we craft your perfect look.
            </p>

            <button
              className="hero-cta px-8 py-3 bg-beige text-charcoal font-semibold hover:bg-beige-light transition-colors duration-300"
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.1em',
              }}
            >
              BOOK CONSULTATION
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          <img
            ref={imageRef}
            src="/images/hero-1.webp"
            alt="Luxury salon braided hairstyle"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'brightness(0.85) contrast(1.1)',
            }}
          />

          {/* Gradient overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-l from-charcoal via-charcoal/50 to-transparent pointer-events-none" />

          {/* Geometric Divider */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 bg-beige"
            style={{
              clipPath: 'polygon(0 0, 100% 10%, 100% 90%, 0 100%)',
            }}
          />
        </div>
      </div>

      {/* Middle Bottom Tagline */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 text-center">
        <div className="hero-tagline">
          <h2
            className="text-4xl md:text-5xl font-bold text-cream mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '-0.02em',
            }}
          >
            Asantey
          </h2>
          <p
            className="text-lg md:text-xl font-light text-beige-light tracking-widest uppercase"
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.15em',
            }}
          >
            Luxury Salon
          </p>
        </div>
      </div>

      {/* Vignette Effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(26, 26, 26, 0.3) 100%)',
        }}
      />
    </section>
  );
};

export default Hero;
