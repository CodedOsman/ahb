import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AboutPage: React.FC = () => {
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/client-photos')
      .then(res => {
        if (Array.isArray(res.data)) {
          setPhotos(res.data);
        } else {
          console.warn('Client photos API did not return an array:', res.data);
        }
      })
      .catch(err => {
        console.error('Error loading client photos:', err);
      });
  }, []);

  const defaultPhotos = [
    { id: 'd1', image_url: 'https://images.unsplash.com/photo-1605497746444-1240c50c8397?auto=format&fit=crop&q=80&w=800', caption: 'Luxury Raw Cambodian Silk Press' },
    { id: 'd2', image_url: 'https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&q=80&w=800', caption: 'Perfect Knotless Braids' },
    { id: 'd3', image_url: 'https://images.unsplash.com/photo-1595959183075-c1d0a161b03d?auto=format&fit=crop&q=80&w=800', caption: 'Custom HD Closure Unit & Tint' },
    { id: 'd4', image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800', caption: 'Ultra-Sharp Cornrows & Styling' },
  ];

  const displayPhotos = Array.isArray(photos) && photos.length > 0 ? photos : defaultPhotos;

  return (
    <div className="min-h-screen bg-alabaster pt-32 pb-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 
              className="text-6xl md:text-8xl font-black text-onyx mb-8 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The Art of <br />
              <span className="text-soft-slate italic font-medium">Sophistication</span>
            </h1>
            <p className="text-warm-silver text-xl font-light leading-relaxed mb-8 max-w-lg">
              Asantey Luxury Salon was born from a vision to blend cultural heritage with contemporary high-fashion aesthetics.
            </p>
            <div className="w-20 h-1 bg-champagne mb-8"></div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-silk-gray overflow-hidden relative z-10">
              <img 
                src="/images/hero-1.webp" 
                alt="Salon Interior" 
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-64 h-64 border-2 border-silk-gray/20 z-0 hidden md:block"></div>
          </motion.div>
        </div>

        {/* Narrative Section */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <h2 
            className="text-4xl md:text-5xl font-bold text-onyx mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            About Us
          </h2>
          <p className="text-warm-silver font-light text-lg leading-relaxed mb-6 text-justify md:text-center">
            AHB Salon is a Nottingham-based hair and beauty brand dedicated to providing high-quality products and professional services. We specialise in supplying top-quality Cambodian hair extensions, known for their durability, fullness, and natural finish.
          </p>
          <p className="text-warm-silver font-light text-lg leading-relaxed mb-6 text-justify md:text-center">
            Alongside our premium hair range, we offer a variety of expert services including braids, cornrows, and hair treatments designed to maintain and promote healthy hair. Our beauty services include lash extensions, eyebrow waxing, and threading, helping you achieve a complete, polished look.
          </p>
          <p className="text-warm-silver font-light text-lg leading-relaxed text-justify md:text-center">
            At AHB Salon, our focus is on delivering excellent service, enhancing natural beauty, and ensuring every client leaves feeling confident and satisfied.
          </p>
        </div>

        {/* Client Transformations Gallery Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-onyx mb-4 uppercase tracking-widest"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Client Gallery
            </h2>
            <p className="text-warm-silver font-light text-lg max-w-lg mx-auto">
              Real transformations, flawless installs, and professional styling crafted at Asantey Luxury Salon.
            </p>
            <div className="w-16 h-0.5 bg-champagne mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group relative overflow-hidden bg-silk-gray aspect-[4/5] border border-silk-gray/10 shadow-xl"
              >
                <img 
                  src={photo.image_url} 
                  alt={photo.caption || 'Client transformation'} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-white text-sm font-bold tracking-wide uppercase mb-2">
                    {photo.caption || 'Flawless Installation'}
                  </p>
                  <span className="text-[10px] text-champagne uppercase tracking-widest font-black">
                    @asanteyhair
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-silk-gray p-12 md:p-16 relative mb-16 overflow-hidden border border-silk-gray/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-champagne/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h3 
              className="text-3xl font-bold text-soft-slate mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Contact & Location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-lg mx-auto">
              <div>
                <h4 className="text-onyx font-bold mb-2 uppercase tracking-widest text-xs">Address</h4>
                <p className="text-warm-silver font-light">Asantey Hair and Beauty Salon<br />358 Radford Road<br />Nottingham<br />NG7 5GQ</p>
              </div>
              
              <div>
                <h4 className="text-onyx font-bold mb-2 uppercase tracking-widest text-xs">Get In Touch</h4>
                <p className="text-warm-silver font-light mb-4">Phone / WhatsApp: <br /><span className="text-soft-slate">07827129797</span></p>
                <div className="flex gap-4">
                  <a href="https://www.instagram.com/ahb_salon" target="_blank" rel="noreferrer" className="text-soft-slate hover:text-onyx transition-colors uppercase tracking-widest text-xs font-bold">Instagram</a>
                  <a href="https://www.tiktok.com/@ahbsalon" target="_blank" rel="noreferrer" className="text-soft-slate hover:text-onyx transition-colors uppercase tracking-widest text-xs font-bold">TikTok</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
