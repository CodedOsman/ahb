import React, { useEffect, useState } from 'react';
import gsap from 'gsap';

/**
 * Preloader Component
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Multiple stylish hair strands forming an elegant bundle
 * - Draws in sequence, then splits apart with smooth fadesplit
 * - Logo fades in as strands split to reveal content
 * - Creates a luxury salon first impression
 */

export const Preloader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
        onComplete?.();
      },
    });

    // Stagger hair strand animations (0s - 1.2s)
    const strandCount = 5;
    for (let i = 0; i < strandCount; i++) {
      timeline.fromTo(
        `.hair-strand-${i}`,
        { strokeDashoffset: 400, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.8, ease: 'power2.inOut' },
        i * 0.12
      );
    }

    // Hold bundle state (1.2s - 1.8s)
    // (no animation, just pause)

    // Split strands apart (1.8s - 2.8s) with fadesplit effect
    for (let i = 0; i < strandCount; i++) {
      const isLeft = i < Math.ceil(strandCount / 2);
      const direction = isLeft ? -40 : 40;
      const delay = i * 0.08;
      
      timeline.to(
        `.hair-strand-${i}`,
        {
          x: direction,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        1.8 + delay
      );
    }

    // Logo fade in during split (1.8s - 2.8s)
    timeline.fromTo(
      '.logo-text',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
      1.8
    );

    // Overlay fade out (2.8s - 3.5s)
    timeline.to(
      '.preloader-overlay',
      {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        pointerEvents: 'none',
      },
      2.8
    );

    return () => {
      timeline.kill();
    };
  }, [onComplete]);

  if (!isVisible) return null;

  const hairStrands = [
    { d: 'M 100 20 Q 75 70, 85 140 Q 90 200, 95 280', offset: 0 },
    { d: 'M 100 20 Q 90 75, 95 145 Q 100 210, 105 280', offset: 1 },
    { d: 'M 100 20 Q 105 70, 110 140 Q 115 200, 120 280', offset: 2 },
    { d: 'M 100 20 Q 70 80, 80 150 Q 85 215, 90 285', offset: 3 },
    { d: 'M 100 20 Q 130 80, 120 150 Q 115 215, 110 285', offset: 4 },
  ];

  return (
    <>
      {/* Main Preloader Container */}
      <div className="preloader-container fixed inset-0 z-50 bg-charcoal flex items-center justify-center overflow-hidden">
        {/* Hair Bundle SVG Animation */}
        <svg
          width="300"
          height="350"
          viewBox="0 0 300 350"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <linearGradient id="hairGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#d4b996', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#e8dcc8', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#f5f5f0', stopOpacity: 0.3 }} />
            </linearGradient>
            <filter id="hairGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Hair strands */}
          {hairStrands.map((strand, i) => (
            <path
              key={i}
              className={`hair-strand-${i}`}
              d={strand.d}
              stroke="url(#hairGradient1)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="400"
              strokeDashoffset="400"
              filter="url(#hairGlow)"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(212, 185, 150, 0.4))',
              }}
            />
          ))}
        </svg>

        {/* Logo Text - Appears during split */}
        <div className="logo-text absolute opacity-0">
          <h1
            className="text-6xl font-black text-beige text-center"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.03em' }}
          >
            ASANTEY
          </h1>
          <p
            className="text-sm text-beige-light text-center mt-3 tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          >
            LUXURY SALON
          </p>
        </div>
      </div>

      {/* Fade overlay for smooth transition */}
      <div
        className="preloader-overlay fixed inset-0 z-40 bg-charcoal opacity-100"
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
};

export default Preloader;

