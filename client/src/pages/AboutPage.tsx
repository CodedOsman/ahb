import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSettings } from '@/hooks/useSettings';

const AboutPage: React.FC = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const { settings } = useSettings();

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
    <div className="min-h-screen bg-background pt-32 pb-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8 leading-tight font-display-lg tracking-tight uppercase relative z-20"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {settings.about_hero_title || 'The Art of Sophistication'}
            </h1>
            <p className="text-secondary text-lg leading-relaxed mb-8 max-w-lg font-body-md">
              {settings.about_hero_subtitle || 'Asantey Luxury Salon was born from a vision to blend cultural heritage with contemporary high-fashion aesthetics.'}
            </p>
            <div className="w-20 h-[1px] bg-primary mb-8"></div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-surface-container overflow-hidden relative z-10 border border-primary">
              <img 
                src="/images/hero-1.webp" 
                alt="Salon Interior" 
                className="w-full h-full object-cover transition-all duration-700"
              />
            </div>
          </motion.div>
        </div>

        {/* Narrative Section */}
        <div className="max-w-4xl mx-auto text-center mb-32 border border-primary p-12 bg-surface-container-lowest">
          <h2 
            className="text-4xl md:text-5xl text-primary mb-8 font-headline-lg uppercase tracking-widest"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            About Us
          </h2>
          <div className="space-y-6 max-w-2xl mx-auto">
            <p className="text-secondary text-base leading-relaxed text-justify md:text-center font-body-md">
              {settings.about_content_p1 || 'AHB Salon is a Nottingham-based hair and beauty brand dedicated to providing high-quality products and professional services. We specialise in supplying top-quality Cambodian hair extensions, known for their durability, fullness, and natural finish.'}
            </p>
            <p className="text-secondary text-base leading-relaxed text-justify md:text-center font-body-md">
              {settings.about_content_p2 || 'Alongside our premium hair range, we offer a variety of expert services including braids, cornrows, and hair treatments designed to maintain and promote healthy hair. Our beauty services include lash extensions, eyebrow waxing, and threading, helping you achieve a complete, polished look.'}
            </p>
            <p className="text-secondary text-base leading-relaxed text-justify md:text-center font-body-md">
              {settings.about_content_p3 || 'At AHB Salon, our focus is on delivering excellent service, enhancing natural beauty, and ensuring every client leaves feeling confident and satisfied.'}
            </p>
          </div>
        </div>

        {/* Client Transformations Gallery Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl text-primary mb-4 uppercase tracking-widest font-headline-lg"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {settings.gallery_section_title || 'Client Gallery'}
            </h2>
            <p className="text-secondary text-base font-body-md max-w-lg mx-auto">
              {settings.gallery_section_subtitle || 'Real transformations, flawless installs, and professional styling crafted at Asantey Luxury Salon.'}
            </p>
            <div className="w-16 h-[1px] bg-primary mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group relative overflow-hidden bg-surface-container aspect-[4/5] border border-primary rounded-none shadow-none"
              >
                <img 
                  src={photo.image_url} 
                  alt={photo.caption || 'Client transformation'} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-white text-sm font-bold tracking-widest uppercase mb-2 font-label-caps">
                    {photo.caption || 'Flawless Installation'}
                  </p>
                  <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold font-label-caps">
                    @asanteyhair
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div id="contact" className="bg-surface-container-low p-12 md:p-16 relative mb-16 overflow-hidden border border-primary rounded-none shadow-none scroll-mt-32">
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h3 
              className="text-3xl font-bold text-primary mb-8 font-headline-md uppercase tracking-widest"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Contact & Location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-lg mx-auto">
              <div>
                <h4 className="text-primary font-bold mb-2 uppercase tracking-widest text-xs font-label-caps">Address</h4>
                <p className="text-secondary font-body-md text-sm">Asantey Hair and Beauty Salon<br />358 Radford Road<br />Nottingham<br />NG7 5GQ</p>
              </div>
              
              <div>
                <h4 className="text-primary font-bold mb-2 uppercase tracking-widest text-xs font-label-caps">Get In Touch</h4>
                <p className="text-secondary font-body-md text-sm mb-4">Phone / WhatsApp: <br /><span className="text-primary font-bold">07827129797</span></p>
                <div className="flex gap-4">
                  <a href="https://www.instagram.com/ahb_salon" target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors uppercase tracking-widest text-xs font-bold font-label-caps hover:line-through">Instagram</a>
                  <a href="https://www.tiktok.com/@ahbsalon" target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors uppercase tracking-widest text-xs font-bold font-label-caps hover:line-through">TikTok</a>
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
