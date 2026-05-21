import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';

export const Navigation: React.FC = () => {
  const { toggleCart, items } = useCart();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const linkClass = (path: string) => {
    const base = "font-label-caps text-label-caps px-4 py-2 hover:line-through transition-all duration-300";
    if (location === path) {
      return `${base} bg-primary text-on-primary`;
    }
    return `${base} text-primary`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-b border-primary">
      <div className="flex justify-between items-center w-full h-20 px-6 max-w-container-max mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <img 
              alt="ASANTEY LOGO" 
              className="h-12 w-auto object-contain cursor-pointer" 
              src="/images/logo.webp"
              onError={(e) => {
                // Fallback to online logo if local image fails
                (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida/ADBb0uhHIMu3aN7Mv2CFtNLh3hhzuewZebUB-erUVLTiL2jXVjX3Y2bC2O-h-YlOfpS8bzARTWHdNr4vU0cVkl89SAc6XlS3S0OP8ggrVS7FfJ5xdsY-_w5E0izWs8xT6yjgzMQgltvUJQn_Gv5JUC7Ur2GJozn7Zyrnf1L1-zbtmRt-o_DQdqfpN4p9smdbMTTIu8V4mhL3ShB1JWgE7Q51BJU_hFU0P0KP1Ft1hLfbL-E8BOiQuK60Ez7aZ-4";
              }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/services" className={linkClass('/services')}>SERVICES</Link>
            <Link href="/shop" className={linkClass('/shop')}>SHOP</Link>
            <Link href="/about" className={linkClass('/about')}>ABOUT</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleCart} 
            className="material-symbols-outlined text-primary p-2 hover:scale-95 transition-transform relative cursor-pointer"
          >
            shopping_cart
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          
          <button 
            className="block md:hidden material-symbols-outlined text-primary p-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? 'close' : 'menu'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-primary py-4 px-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top duration-300">
          <Link 
            href="/services" 
            className="font-label-caps text-label-caps py-2 text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            SERVICES
          </Link>
          <Link 
            href="/shop" 
            className="font-label-caps text-label-caps py-2 text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            SHOP
          </Link>
          <Link 
            href="/about" 
            className="font-label-caps text-label-caps py-2 text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            ABOUT
          </Link>
          <a 
            href="https://asanteyhair.as.me/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full mt-2"
          >
          </a>
        </div>
      )}
    </header>
  );
};

export default Navigation;
