import { useState, useEffect } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
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
import AdminForgotPassword from './pages/Admin/ForgotPassword';
import AdminResetPassword from './pages/Admin/ResetPassword';
import AdminDashboard from './pages/Admin/Dashboard';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import PoliciesPage from './pages/PoliciesPage';
import AdminCategories from './pages/Admin/Categories';
import AdminServices from './pages/Admin/Services';
import AdminProducts from './pages/Admin/Products';
import AdminSettings from './pages/Admin/Settings';
import AdminOrders from './pages/Admin/Orders';
import AdminDeliveryZones from './pages/Admin/DeliveryZones';
import AdminPhotos from './pages/Admin/Photos';
import AdminReviews from './pages/Admin/Reviews';
import AdminHeroSlides from './pages/Admin/HeroSlides';
import PromotionsAdmin from './pages/Admin/Promotions';


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Need a small timeout to ensure page is rendered
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

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
              ) : location === '/admin/forgot-password' ? (
                <AdminForgotPassword />
              ) : location.startsWith('/admin/reset-password') ? (
                <AdminResetPassword />
              ) : (
                <AdminLayout>
                  <Route path="/admin/dashboard" component={AdminDashboard} />
                  <Route path="/admin/categories" component={AdminCategories} />
                  <Route path="/admin/services" component={AdminServices} />
                  <Route path="/admin/products" component={AdminProducts} />
                  <Route path="/admin/settings" component={AdminSettings} />
                  <Route path="/admin/orders" component={AdminOrders} />
                  <Route path="/admin/delivery" component={AdminDeliveryZones} />
                  <Route path="/admin/photos" component={AdminPhotos} />
                  <Route path="/admin/reviews" component={AdminReviews} />
                  <Route path="/admin/hero-slides" component={AdminHeroSlides} />
                  <Route path="/admin/promotions" component={PromotionsAdmin} />
                </AdminLayout>
              )
            ) : (
              <ClientLayout isLoading={isLoading} onPreloaderComplete={handlePreloaderComplete}>
                <Switch>
                  <Route path="/">
                    <Home isLoading={isLoading} />
                  </Route>
                  <Route path="/cart"><Redirect to="/" /></Route>
                  <Route path="/shop" component={ShopPage} />
                  <Route path="/product/:category/:slug" component={ProductDetailPage} />
                  <Route path="/checkout/success" component={CheckoutSuccessPage} />
                  <Route path="/services" component={ServicesPage} />
                  <Route path="/about" component={AboutPage} />
                  <Route path="/policies" component={PoliciesPage} />
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

