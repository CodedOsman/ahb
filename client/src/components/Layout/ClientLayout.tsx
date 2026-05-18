import React from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Cursor } from '@/components/UI/Cursor';
import { Cart } from '@/components/Cart';
import { GlobalScroll } from './GlobalScroll';

interface ClientLayoutProps {
  children: React.ReactNode;
  isLoading: boolean;
  onPreloaderComplete: () => void;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children, isLoading }) => {
  return (
    <GlobalScroll>
      <Cursor />
      <Navigation />
      <Cart />
      <main className="w-full">
        {children}
      </main>
      <Footer />
    </GlobalScroll>
  );
};
