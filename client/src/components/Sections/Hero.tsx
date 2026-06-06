import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@/hooks/useGSAP';
import { Link } from 'wouter';
import { useSettings } from '@/hooks/useSettings';

export const Hero: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { settings } = useSettings();

  useGSAP(() => {
    if (isLoading) return;

    // Stagger mask-up effect for headline chars
    const headlineChars = gsap.utils.toArray('.headline-char') as HTMLElement[];

    gsap.fromTo(
      headlineChars,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.04,
        ease: 'power3.out',
        delay: 0.2,
      }
    );

    // Subtitle fade-in
    gsap.fromTo(
      '.hero-subtitle',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.8,
      }
    );

    // CTA buttons fade-in
    gsap.fromTo(
      '.hero-ctas',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1.0,
      }
    );

    // Fade in image cards container removed

    // Continuous slow zoom (Ken Burns effect) for the background image
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { scale: 1.15 },
        {
          scale: 1,
          duration: 2,
          ease: 'power2.out',
        }
      );
      
      gsap.to(imageRef.current, {
        scale: 1.05,
        duration: 20,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 2
      });
    }

    // Removed orbiting rotation and breathing effects for cards
  }, [isLoading]);

  const headlineText = settings.hero_title || 'The Art of Elegance';
  const headlineChars = headlineText.split('').map((char, i) => (
    <span key={i} className="headline-char inline-block" style={{ overflow: 'hidden' }}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  const heroSubtitle = settings.hero_subtitle || 'Experience luxury hair transformation with our award-winning stylists. From intricate braiding to vibrant color, we craft your perfect look.';

  // Images removed

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-black pt-20 pb-10 px-6 lg:px-12"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          ref={imageRef}
          alt="Luxury Salon Interior"
          className="w-full h-full object-cover opacity-60"
          src="https://lh3.googleusercontent.com/aida/ADBb0uipSoXkhetoJ8N3sqfc48MZLn2o_4UEbFV7sjGWrue_QtqZuzsnhjbUMeTU22JOzfQbz7hy2ZCzlxekmDLhClLkxFtP8xQZBq6xtZX7X3W9tDj7PNeHyDEf7jkTpwPkzx5t2CPnpzMTzDrh_kCiXIwIwNL-iPOezSSDr6VTQxpvotVOj0-nlwCFi2pbAwwdmC_Y5Ybc3Wf7yYp7iJJ_BMZfRvBxDwJkch2Nce5OXsv9DzLGL1Y_GiP_zj8"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/hero-1.webp";
          }}
        />
        {/* Overlay: Fades the background slightly to ensure text legibility */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center justify-center">
        {/* Text Content */}
        <div className="text-white flex flex-col items-center z-20 w-full">
          <h1 className="font-display-lg text-[clamp(1.2rem,7.5vw,4.5rem)] whitespace-nowrap leading-tight mb-6 font-normal">
            {headlineChars}
          </h1>
          <p className="hero-subtitle font-body-lg text-body-lg mb-10 max-w-2xl opacity-90 text-white text-center">
            {heroSubtitle}
          </p>
          <div className="hero-ctas flex flex-col sm:flex-row gap-4">
            <a href="https://asanteyhair.as.me/" target="_blank" rel="noopener noreferrer">
              <button className="w-full sm:w-auto font-label-caps text-label-caps bg-primary text-on-primary px-10 py-5 border border-primary hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer">
                BOOK APPOINTMENT
              </button>
            </a>
            <Link href="/shop">
              <button className="w-full sm:w-auto font-label-caps text-label-caps bg-transparent text-white px-10 py-5 border border-white hover:bg-white hover:text-black transition-all cursor-pointer">
                BUY HAIR
              </button>
            </Link>
          </div>
        </div>


      </div>

      {/* Editorial subtle vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] z-30" />
    </section>
  );
};

export default Hero;
