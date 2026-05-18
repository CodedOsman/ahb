import React from 'react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';


/**
 * Navigation Component
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Glassmorphism effect with backdrop blur
 * - Minimal, elegant design with beige accents
 * - Sticky positioning for easy access
 */

export const Navigation: React.FC = () => {
  const { toggleCart, items } = useCart();

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-alabaster/90 border-b border-silk-gray"
      style={{
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <img src="/images/logo.webp" alt="Logo" className="w-16 h-16 cursor-pointer" />
          </Link>
        </div>

        {/* Menu Items */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/services"
            className="text-onyx text-sm font-light hover:text-soft-slate transition-colors duration-300"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Services
          </Link>
          <Link
            href="/shop"
            className="text-onyx text-sm font-light hover:text-soft-slate transition-colors duration-300"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-onyx text-sm font-light hover:text-soft-slate transition-colors duration-300"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            About
          </Link>


          <div className="flex items-center gap-2">
            <button
              onClick={toggleCart}
              className="text-soft-slate hover:text-warm-silver transition-colors duration-300 p-2 relative"
              title="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0h2m-2 0a2 2 0 100 4 2 2 0 000-4zm-10 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-onyx text-alabaster text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <a href="https://asanteyhair.as.me/" target="_blank" rel="noopener noreferrer">
              <button
                className="px-6 py-2 bg-onyx text-alabaster text-sm font-semibold hover:bg-champagne transition-colors duration-300"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Book Now
              </button>
            </a>
          </div>

        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-soft-slate hover:text-warm-silver transition-colors duration-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;

