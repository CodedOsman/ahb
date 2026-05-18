import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP, ScrollTrigger } from '@/hooks/useGSAP';
import axios from 'axios';
import { Link } from 'wouter';

interface Service {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

/**
 * Services Section with Horizontal Scroll
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Vertical scroll triggers horizontal translation
 * - Multi-card track with parallax movement on internal images
 * - Cinematic card reveals with staggered animation
 */

export const Services: React.FC = () => {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('/api/services');
        setServices(res.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useGSAP(() => {
    if (!containerRef.current || !trackRef.current || services.length === 0) return;

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
  }, [services]);

  return (
    <section
      ref={containerRef}
      id="services"
      className="relative w-full py-24 bg-alabaster overflow-hidden"
    >
      {/* Section Header */}
      <div className="container mx-auto px-4 mb-16">
        <h2
          className="text-5xl md:text-6xl font-black text-onyx mb-4"
          style={{
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '-0.02em',
          }}
        >
          Our Services
        </h2>
        <p
          className="text-lg text-warm-silver max-w-2xl"
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
            <Link
              key={service.id}
              href="/services"
              className="service-card flex-shrink-0 w-80 h-96 bg-silk-gray rounded-lg overflow-hidden group hover:shadow-2xl transition-shadow duration-300 block cursor-pointer"
              style={{
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Card Image/Icon Area */}
              <div
                className="service-image w-full h-48 bg-gradient-to-br from-beige/30 to-transparent flex items-center justify-center relative overflow-hidden"
              >
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt="Service image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    ASANTEY
                  </span>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>


              {/* Card Content */}
              <div className="p-6 flex flex-col justify-between h-48">
                <div>
                  <h3
                    className="text-2xl font-bold text-onyx mb-3"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-sm text-warm-silver"
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
                <span
                  className="text-soft-slate text-sm font-semibold group-hover:text-warm-silver transition-colors duration-300 inline-flex items-center gap-2"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.05em',
                  }}
                >
                  Learn More →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-soft-slate/50 text-sm"
           style={{ fontFamily: "'Inter', sans-serif" }}>
        Scroll to explore
      </div>
    </section>
  );
};

export default Services;

