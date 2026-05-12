import React from 'react';

/**
 * Footer Component
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Minimal, elegant footer with luxury branding
 * - Contact information and social links
 * - Newsletter subscription
 */

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal border-t border-beige/10 py-16">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3
              className="text-2xl font-black text-beige mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              ASANTEY
            </h3>
            <p
              className="text-sm text-beige-light"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                lineHeight: 1.8,
              }}
            >
              Luxury hair and braiding services for the modern woman.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-sm font-bold text-cream mb-4 uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Services
            </h4>
            <ul className="space-y-2">
              {['Braiding', 'Color', 'Styling', 'Treatments'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-beige-light hover:text-beige transition-colors duration-300"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              className="text-sm font-bold text-cream mb-4 uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Company
            </h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-beige-light hover:text-beige transition-colors duration-300"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 300,
                    }}
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
              className="text-sm font-bold text-cream mb-4 uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Newsletter
            </h4>
            <p
              className="text-sm text-beige-light mb-4"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
              }}
            >
              Subscribe for exclusive offers and beauty tips.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-secondary text-cream text-sm outline-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button
                className="px-4 py-2 bg-beige text-charcoal font-semibold text-sm hover:bg-beige-light transition-colors duration-300"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-beige/10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-6">
            {['Instagram', 'Facebook', 'Twitter'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-sm text-beige-light hover:text-beige transition-colors duration-300"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                }}
              >
                {social}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p
            className="text-sm text-beige-light"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
            }}
          >
            © 2024 Asantey Hair & Braids. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
