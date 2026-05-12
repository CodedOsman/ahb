import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP, ScrollTrigger } from '@/hooks/useGSAP';

/**
 * Services Section with Horizontal Scroll
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Vertical scroll triggers horizontal translation
 * - Multi-card track with parallax movement on internal images
 * - Cinematic card reveals with staggered animation
 */

const services = [
  {
    id: 1,
    title: 'Braiding',
    description: 'Intricate, artistic braiding styles that celebrate cultural heritage and modern aesthetics.',
    thumbnail: '/images/hero-2.jpeg',
  },
  {
    id: 2,
    title: 'Color',
    description: 'Vibrant, custom color treatments using premium products for lasting brilliance.',
    thumbnail: '/images/hero-3.jpeg',
  },
  {
    id: 3,
    title: 'Styling',
    description: 'Expert styling for any occasion, from everyday elegance to red-carpet glamour.',
    thumbnail: '/images/hero-1.webp',
  },
  {
    id: 4,
    title: 'Treatments',
    description: 'Nourishing hair treatments and deep conditioning for optimal hair health.',
    thumbnail: '/images/hero-2.jpeg',
  },
];

export const Services: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !trackRef.current) return;

    // Horizontal scroll animation
    gsap.registerPlugin(ScrollTrigger);

    const track = trackRef.current;
    const container = containerRef.current;

    gsap.to(track, {
      x: () => -(track.scrollWidth - container.offsetWidth),
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${track.scrollWidth - container.offsetWidth}`,
        scrub: 2,
        pin: true,
        markers: false,
        invalidateOnRefresh: true,
      },
    });

    // Parallax effect on card images
    const cards = gsap.utils.toArray('.service-card') as HTMLElement[];
    cards.forEach((card) => {
      const image = card.querySelector('.service-image') as HTMLElement;
      if (image) {
        gsap.to(image, {
          y: 30,
          scrollTrigger: {
            trigger: card,
            start: 'top center',
            end: 'bottom center',
            scrub: 2,
          },
        });
      }
    });

    // Staggered card entrance
    gsap.fromTo(
      cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
        },
      }
    );
  }, []);

  return (
    <section
      ref={containerRef}
      id="services"
      className="relative w-full py-24 bg-charcoal overflow-hidden"
    >
      {/* Section Header */}
      <div className="container mx-auto px-4 mb-16">
        <h2
          className="text-5xl md:text-6xl font-black text-cream mb-4"
          style={{
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '-0.02em',
          }}
        >
          Our Services
        </h2>
        <p
          className="text-lg text-beige-light max-w-2xl"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            lineHeight: 1.8,
          }}
        >
          Discover our comprehensive range of luxury hair and styling services, crafted to enhance your natural beauty.
        </p>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-8 px-4 md:px-12"
          style={{
            width: 'fit-content',
          }}
        >
          {services.map((service) => (
            <div
              key={service.id}
              className="service-card flex-shrink-0 w-80 h-96 bg-secondary rounded-lg overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
              style={{
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Card Image/Icon Area */}
              <div
                className="service-image w-full h-48 bg-gradient-to-br from-beige/30 to-transparent flex items-center justify-center relative overflow-hidden"
              >
                {service.thumbnail ? (
                  <img
                    src={service.thumbnail}
                    alt="Service thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    {service.thumbnail}
                  </span>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col justify-between h-48">
                <div>
                  <h3
                    className="text-2xl font-bold text-cream mb-3"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-sm text-beige-light"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 300,
                      lineHeight: 1.6,
                    }}
                  >
                    {service.description}
                  </p>
                </div>

                {/* Learn More Link */}
                <a
                  href="#"
                  className="text-beige text-sm font-semibold hover:text-beige-light transition-colors duration-300 inline-flex items-center gap-2"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.05em',
                  }}
                >
                  Learn More →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-beige/50 text-sm"
           style={{ fontFamily: "'Inter', sans-serif" }}>
        Scroll to explore
      </div>
    </section>
  );
};

export default Services;

