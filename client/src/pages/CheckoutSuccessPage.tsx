import React, { useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CheckoutSuccessPage: React.FC = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart upon successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center border border-primary p-12 bg-surface-container-low">
        <div className="mb-8 flex justify-center text-primary">
          <CheckCircle size={80} strokeWidth={1} />
        </div>
        
        <h1 
          className="text-4xl md:text-5xl font-bold text-primary mb-6 font-headline-lg uppercase tracking-wider"
          style={{ fontFamily: "'Bodoni Moda', serif" }}
        >
          Order Confirmed
        </h1>
        
        <p className="text-secondary text-base font-body-md mb-12">
          Thank you for your purchase. We have received your order and will begin processing it immediately. You will receive an email confirmation shortly.
        </p>

        <Link href="/" className="cursor-pointer">
          <button className="px-8 py-4 bg-primary text-on-primary border border-primary hover:bg-background hover:text-primary transition-all duration-300 font-label-caps text-label-caps tracking-widest rounded-none w-full sm:w-auto cursor-pointer">
            Return to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
