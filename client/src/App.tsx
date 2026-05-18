import { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { Toaster } from '@/components/UI/sonner';
import { TooltipProvider } from '@/components/UI/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components
import { ClientLayout } from '@/components/Layout/ClientLayout';
import AdminLayout from '@/components/Layout/AdminLayout';

// UI Components
import { Preloader } from '@/components/UI/Preloader';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import AdminServices from './pages/Admin/Services';
import AdminProducts from './pages/Admin/Products';
import AdminSettings from './pages/Admin/Settings';
import AdminOrders from './pages/Admin/Orders';
import AdminDeliveryZones from './pages/Admin/DeliveryZones';
import AdminPhotos from './pages/Admin/Photos';


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [location] = useLocation();

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  const isAdminRoute = location.startsWith('/admin');
  const isLoginPage = location === '/admin';

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <CartProvider>
          <TooltipProvider>
            {/* Preloader - Only on client routes */}
            {!isAdminRoute && isLoading && <Preloader onComplete={handlePreloaderComplete} />}

            {isAdminRoute ? (
              (location === '/admin' || location === '/admin/') ? (
                <AdminLogin />
              ) : (
                <AdminLayout>
                  <Route path="/admin/dashboard" component={AdminDashboard} />
                  <Route path="/admin/services" component={AdminServices} />
                  <Route path="/admin/products" component={AdminProducts} />
                  <Route path="/admin/settings" component={AdminSettings} />
                  <Route path="/admin/orders" component={AdminOrders} />
                  <Route path="/admin/delivery" component={AdminDeliveryZones} />
                  <Route path="/admin/photos" component={AdminPhotos} />
                </AdminLayout>
              )
            ) : (
              <ClientLayout isLoading={isLoading} onPreloaderComplete={handlePreloaderComplete}>
                <Switch>
                  <Route path="/">
                    <Home isLoading={isLoading} />
                  </Route>
                  <Route path="/shop" component={ShopPage} />
                  <Route path="/product/:id" component={ProductDetailPage} />
                  <Route path="/checkout/success" component={CheckoutSuccessPage} />
                  <Route path="/services" component={ServicesPage} />
                  <Route path="/about" component={AboutPage} />
                  <Route path="*" component={NotFound} />
                </Switch>
              </ClientLayout>
            )}

            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

