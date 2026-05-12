import { useState } from 'react';
import { Toaster } from '@/components/UI/sonner';
import { TooltipProvider } from '@/components/UI/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components
import { GlobalScroll } from '@/components/Layout/GlobalScroll';
import { Navigation } from '@/components/Layout/Navigation';
import { Footer } from '@/components/Layout/Footer';

// UI Components
import { Preloader } from '@/components/UI/Preloader';
import { Cursor } from '@/components/UI/Cursor';
import { Cart } from '@/components/Cart';

// Section Components
import { Hero } from '@/components/Sections/Hero';
import { Services } from '@/components/Sections/Services';
import { Shop } from '@/components/Sections/Shop';

/**
 * Main App Component
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Integrates all luxury salon components
 * - Manages preloader state and global animations
 * - Provides smooth, cinematic user experience
 */

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <CartProvider>
          <TooltipProvider>
            <GlobalScroll>
              {/* Preloader */}
              {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

              {/* Global Cursor */}
              <Cursor />

              {/* Navigation */}
              <Navigation />

              {/* Cart Sidebar */}
              <Cart />

              {/* Main Content */}
              <main className="w-full">
                {/* Hero Section */}
                <Hero isLoading={isLoading} />

                {/* Services Section */}
                <Services />

                {/* Shop Section */}
                <Shop />
              </main>

              {/* Footer */}
              <Footer />

              {/* Toast Notifications */}
              <Toaster />
            </GlobalScroll>
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

