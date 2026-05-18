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
    <div className="min-h-screen bg-alabaster pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 
            className="text-5xl md:text-8xl font-black text-onyx mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our Services
          </h1>
          <p className="text-warm-silver max-w-2xl mx-auto text-lg font-light leading-relaxed">
            From intricate braiding to premium color treatments, discover our full range of luxury hair and beauty services.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-onyx"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-silk-gray p-1 border border-silk-gray/10 hover:border-silk-gray/30 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Image Part */}
                  <div className="md:w-1/2 aspect-square md:aspect-auto overflow-hidden bg-alabaster">
                    {service.image_url ? (
                      <img 
                        src={service.image_url} 
                        alt={service.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-soft-slate/10 text-4xl font-black italic">
                        ASANTEY
                      </div>
                    )}
                  </div>
                  
                  {/* Content Part */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <h3 
                      className="text-3xl font-bold text-onyx mb-4"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {service.title}
                    </h3>
                    <p className="text-warm-silver/80 font-light leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-light text-soft-slate">
                        From £{service.price}
                      </span>
                      <a href="https://asanteyhair.as.me/" target="_blank" rel="noopener noreferrer">
                        <button className="px-6 py-2 bg-onyx text-alabaster font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-all">
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
