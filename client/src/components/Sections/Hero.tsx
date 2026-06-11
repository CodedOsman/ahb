import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'wouter';
import { useSettings } from '@/hooks/useSettings';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

interface HeroSlide {
  id: number;
  image_url: string;
  headline?: string;
  subtitle?: string;
  button_1_text?: string;
  button_1_link?: string;
  button_2_text?: string;
  button_2_link?: string;
}

export const Hero: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { settings } = useSettings();
  
  const [hasAnimatedDefaults, setHasAnimatedDefaults] = useState(false);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await axios.get('/api/hero-slides');
        if (res.data && res.data.length > 0) {
          setSlides(res.data);
        } else {
          setSlides([{
            id: 0,
            image_url: "https://lh3.googleusercontent.com/aida/ADBb0uipSoXkhetoJ8N3sqfc48MZLn2o_4UEbFV7sjGWrue_QtqZuzsnhjbUMeTU22JOzfQbz7hy2ZCzlxekmDLhClLkxFtP8xQZBq6xtZX7X3W9tDj7PNeHyDEf7jkTpwPkzx5t2CPnpzMTzDrh_kCiXIwIwNL-iPOezSSDr6VTQxpvotVOj0-nlwCFi2pbAwwdmC_Y5Ybc3Wf7yYp7iJJ_BMZfRvBxDwJkch2Nce5OXsv9DzLGL1Y_GiP_zj8",
          }]);
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        setSlides([{
          id: 0,
          image_url: "https://lh3.googleusercontent.com/aida/ADBb0uipSoXkhetoJ8N3sqfc48MZLn2o_4UEbFV7sjGWrue_QtqZuzsnhjbUMeTU22JOzfQbz7hy2ZCzlxekmDLhClLkxFtP8xQZBq6xtZX7X3W9tDj7PNeHyDEf7jkTpwPkzx5t2CPnpzMTzDrh_kCiXIwIwNL-iPOezSSDr6VTQxpvotVOj0-nlwCFi2pbAwwdmC_Y5Ybc3Wf7yYp7iJJ_BMZfRvBxDwJkch2Nce5OXsv9DzLGL1Y_GiP_zj8",
        }]);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (isLoading || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isLoading, slides.length]);

  // Initial GSAP animation for elements
  useEffect(() => {
    if (isLoading || slides.length === 0) return;
    
    // Select all images in the slideshow
    const images = document.querySelectorAll('.hero-image-bg');
    images.forEach((img) => {
      // Clear previous animations
      gsap.killTweensOf(img);
      
      // Apply Ken Burns to ALL images so they continuously zoom subtly
      gsap.fromTo(
        img,
        { scale: 1.15 },
        { scale: 1, duration: 2, ease: 'power2.out' }
      );
      gsap.to(img, {
        scale: 1.05,
        duration: 20,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 2
      });
    });

    if (!hasAnimatedDefaults) {
      const headlineChars = gsap.utils.toArray('.headline-char') as HTMLElement[];
      if (headlineChars.length > 0) {
        gsap.fromTo(headlineChars, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'power3.out', delay: 0.2 });
      }
      gsap.fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.8 });
      gsap.fromTo('.hero-ctas', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.0 });
      setHasAnimatedDefaults(true);
    }
  }, [isLoading, currentIndex, slides.length, hasAnimatedDefaults]);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  
  const isCustomText = currentSlide.headline || currentSlide.subtitle || currentSlide.button_1_text || currentSlide.button_2_text;
  
  const headlineText = currentSlide.headline || settings.hero_title || 'The Art of Elegance';
  const subtitleText = currentSlide.subtitle || settings.hero_subtitle || 'Experience luxury hair transformation with our award-winning stylists. From intricate braiding to vibrant color, we craft your perfect look.';
  const btn1Text = currentSlide.button_1_text || 'BOOK APPOINTMENT';
  const btn1Link = currentSlide.button_1_link || 'https://asanteyhair.as.me/';
  const btn2Text = currentSlide.button_2_text || 'BUY HAIR';
  const btn2Link = currentSlide.button_2_link || '/shop';

  const headlineChars = headlineText.split('').map((char, i) => (
    <span key={i} className="headline-char inline-block" style={{ overflow: 'hidden' }}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  const TextContent = () => (
    <div className="text-white flex flex-col items-center z-20 w-full">
      <h1 className="font-display-lg text-[clamp(1.2rem,7.5vw,4.5rem)] whitespace-nowrap leading-tight mb-6 font-normal">
        {headlineChars}
      </h1>
      <p className="hero-subtitle font-body-lg text-body-lg mb-10 max-w-2xl opacity-90 text-white text-center">
        {subtitleText}
      </p>
      <div className="hero-ctas flex flex-col sm:flex-row gap-4">
        {btn1Link.startsWith('http') ? (
          <a href={btn1Link} target="_blank" rel="noopener noreferrer">
            <button className="w-full sm:w-auto font-label-caps text-label-caps bg-primary text-on-primary px-10 py-5 border border-primary hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer uppercase">
              {btn1Text}
            </button>
          </a>
        ) : (
          <Link href={btn1Link}>
            <button className="w-full sm:w-auto font-label-caps text-label-caps bg-primary text-on-primary px-10 py-5 border border-primary hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer uppercase">
              {btn1Text}
            </button>
          </Link>
        )}
        
        {btn2Link.startsWith('http') ? (
          <a href={btn2Link} target="_blank" rel="noopener noreferrer">
            <button className="w-full sm:w-auto font-label-caps text-label-caps bg-transparent text-white px-10 py-5 border border-white hover:bg-white hover:text-black transition-all cursor-pointer uppercase">
              {btn2Text}
            </button>
          </a>
        ) : (
          <Link href={btn2Link}>
            <button className="w-full sm:w-auto font-label-caps text-label-caps bg-transparent text-white px-10 py-5 border border-white hover:bg-white hover:text-black transition-all cursor-pointer uppercase">
              {btn2Text}
            </button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-black pt-20 pb-10 px-6 lg:px-12">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentSlide.id}
            src={currentSlide.image_url}
            alt="Hero Slide"
            className="hero-image-bg absolute inset-0 w-full h-full object-cover opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/30 z-10" />
      </div>

      <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center text-center justify-center">
        <AnimatePresence mode="wait">
          {isCustomText ? (
            <motion.div
              key={`custom-${currentSlide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
            >
              <TextContent />
            </motion.div>
          ) : (
            <motion.div
              key="default-text"
              initial={hasAnimatedDefaults ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
            >
              <TextContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Editorial subtle vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] z-30" />
    </section>
  );
};

export default Hero;
