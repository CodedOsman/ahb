import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Global Fluid Cursor Component
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Lead dot with 0.1s lag trailing circle
 * - Magnetic hover states on interactive elements
 * - Mix-blend-mode: difference for visual impact
 * - Creates a premium, interactive feel
 */

export const Cursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;

    if (!cursor || !trail) return;

    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Update lead dot immediately
      gsap.to(cursor, {
        x: mouseX - 6,
        y: mouseY - 6,
        duration: 0,
      });

      // Update trailing circle with lag
      gsap.to(trail, {
        x: mouseX - 15,
        y: mouseY - 15,
        duration: 0.1,
        ease: 'power2.out',
      });
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest?.('button') || target.closest?.('a'))) {
        setIsHovering(true);
        gsap.to(trail, {
          scale: 3,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      gsap.to(trail, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    // Add hover listeners to all interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Lead Dot */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed w-3 h-3 rounded-full bg-beige z-[9999]"
        style={{
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(212, 185, 150, 0.6)',
        }}
      />

      {/* Trailing Circle */}
      <div
        ref={trailRef}
        className="pointer-events-none fixed w-8 h-8 rounded-full border-2 border-beige z-[9998]"
        style={{
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
          transition: 'scale 0.3s ease-out',
        }}
      />
    </>
  );
};

export default Cursor;
