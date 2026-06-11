import React from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Cart } from '@/components/Cart';
import { GlobalScroll } from './GlobalScroll';
import { PromoBanner } from '@/components/PromoBanner';

interface ClientLayoutProps {
  children: React.ReactNode;
  isLoading: boolean;
  onPreloaderComplete: () => void;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children, isLoading, onPreloaderComplete }) => {
  return (
    <GlobalScroll>
      <div className="fixed top-0 left-0 right-0 z-50">
        <PromoBanner />
        <Navigation />
      </div>
      <Cart />
      <main className="w-full pt-16">
        {children}
      </main>
      <Footer />
    </GlobalScroll>
  );
};
