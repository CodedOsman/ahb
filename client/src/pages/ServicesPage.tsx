import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 
            className="text-5xl md:text-8xl font-bold text-primary mb-6 font-display-lg uppercase tracking-wider"
            style={{ fontFamily: "'Bodoni Moda', serif" }}
          >
            Our Services
          </h1>
          <p className="text-secondary max-w-2xl mx-auto text-base font-body-md leading-relaxed">
            From intricate braiding to premium color treatments, discover our full range of luxury hair and beauty services.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-none h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-surface-container-low border border-primary hover:bg-surface-container transition-all duration-500 rounded-none shadow-none p-0 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Image Part */}
                  <div className="md:w-1/2 aspect-square md:aspect-auto overflow-hidden bg-background md:border-r border-b md:border-b-0 border-primary">
                    {service.image_url ? (
                      <img 
                        src={service.image_url} 
                        alt={service.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/10 text-4xl font-black font-display-lg uppercase">
                        ASANTEY
                      </div>
                    )}
                  </div>
                  
                  {/* Content Part */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <h3 
                      className="text-2xl font-bold text-primary mb-4 font-headline-md uppercase tracking-wider"
                      style={{ fontFamily: "'Bodoni Moda', serif" }}
                    >
                      {service.title}
                    </h3>
                    <p className="text-secondary font-body-md text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/10">
                      <span className="text-xl font-bold text-primary font-body-md">
                        From £{service.price}
                      </span>
                      <a href="https://asanteyhair.as.me/" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <button className="px-6 py-3 bg-primary text-on-primary border border-primary hover:bg-background hover:text-primary transition-all duration-300 font-label-caps text-label-caps rounded-none cursor-pointer">
                          Book Now
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
