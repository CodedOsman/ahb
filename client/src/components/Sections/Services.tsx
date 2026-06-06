import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'wouter';
import { useSettings } from '@/hooks/useSettings';

interface Service {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

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

  return (
    <section id="services" className="relative w-full py-24 bg-surface overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-6 mb-16">
        <span className="font-label-caps text-label-caps border-b border-primary pb-2">{settings.services_section_label || 'EXPERTISE'}</span>
        <h2 className="font-headline-lg text-headline-lg mt-4 uppercase">{settings.services_section_title || 'Our Services'}</h2>
        <p className="font-body-md text-body-md mt-4 max-w-xl text-on-surface-variant">
          {settings.services_section_subtitle || 'Discover our comprehensive range of luxury hair and styling services, crafted to enhance your natural beauty.'}
        </p>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="overflow-x-auto overflow-y-hidden py-4 snap-x snap-mandatory scroll-smooth">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="flex gap-6 px-6">
            {services.map((service) => (
              <Link
                key={service.id}
                href="/services"
                className="service-card flex-none w-[45%] min-w-[260px] max-w-[320px] border-r border-b border-primary p-8 group hover:bg-black hover:text-white transition-colors duration-500 shrink-0 cursor-pointer block"
              >
                {/* Image container with fixed aspect ratio */}
                <div className="aspect-[4/3] mb-8 overflow-hidden bg-surface-container">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary-container flex items-center justify-center font-label-caps text-label-caps text-on-secondary-container">
                      ASANTEY
                    </div>
                  )}
                </div>
                <h3 className="font-headline-md text-headline-md mb-4 uppercase">{service.title}</h3>
                <p className="font-body-md text-body-md mb-6 opacity-80 line-clamp-3">{service.description}</p>
                <span className="font-label-caps text-label-caps flex items-center gap-2 group-hover:underline">
                  LEARN MORE <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 font-label-caps text-[10px] text-primary/40 tracking-widest">
        SCROLL TO EXPLORE
      </div>
    </section>
  );
};

export default Services;
