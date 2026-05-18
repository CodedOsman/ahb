import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import axios from 'axios';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        const settingsMap = res.data.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        setSettings(settingsMap);
      } catch (error) {
        console.error('Error fetching settings for footer:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-alabaster border-t border-silk-gray/10 py-16">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/">
              <h3
                className="text-2xl font-black text-soft-slate mb-4 cursor-pointer"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                ASANTEY
              </h3>
            </Link>

            <p
              className="text-sm text-warm-silver"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                lineHeight: 1.8,
              }}
            >
              {settings.footer_description || 'Luxury hair and braiding services for the modern woman.'}
            </p>
            <div className="mt-4 text-xs text-warm-silver/60 space-y-1">
              <p>{settings.contact_address || '358 Radford Road, Nottingham, NG7 5GQ'}</p>
              <p>{settings.contact_phone || '07827129797'}</p>
              <p>{settings.contact_email || ''}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-sm font-bold text-onyx mb-4 uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Navigation
            </h4>
            <ul className="space-y-2">
              {[
                { name: 'Services', path: '/services' },
                { name: 'Shop', path: '/shop' },
                { name: 'About', path: '/about' }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-sm text-warm-silver hover:text-soft-slate transition-colors duration-300 font-light"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              className="text-sm font-bold text-onyx mb-4 uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Company
            </h4>
            <ul className="space-y-2">
              {['Blog', 'Careers', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-warm-silver hover:text-soft-slate transition-colors duration-300 font-light"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4
              className="text-sm font-bold text-onyx mb-4 uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Newsletter
            </h4>
            <p
              className="text-sm text-warm-silver mb-4 font-light"
            >
              Subscribe for exclusive offers and beauty tips.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-silk-gray text-onyx text-sm outline-none border border-silk-gray/10 focus:border-silk-gray/30 transition-all"
              />
              <button
                className="px-4 py-2 bg-onyx text-alabaster font-semibold text-sm hover:bg-champagne transition-colors duration-300"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-silk-gray/10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-6">
            {[
              { name: 'Instagram', url: settings.social_instagram || 'https://www.instagram.com/ahb_salon' },
              { name: 'TikTok', url: settings.social_tiktok || 'https://www.tiktok.com/@ahbsalon' }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-warm-silver hover:text-soft-slate transition-colors duration-300 font-light"
              >
                {social.name}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p
            className="text-sm text-warm-silver font-light"
          >
            © {new Date().getFullYear()} Asantey Hair & Braids. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


