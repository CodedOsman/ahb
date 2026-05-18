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
    <div className="min-h-screen bg-alabaster pt-32 pb-24 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center">
        <div className="mb-8 flex justify-center text-green-400">
          <CheckCircle size={80} />
        </div>
        
        <h1 
          className="text-4xl md:text-5xl font-black text-onyx mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Order Confirmed
        </h1>
        
        <p className="text-warm-silver text-lg font-light mb-12">
          Thank you for your purchase. We have received your order and will begin processing it immediately. You will receive an email confirmation shortly.
        </p>

        <Link href="/">
          <button className="px-8 py-4 bg-onyx text-alabaster font-bold tracking-[0.2em] text-sm hover:bg-champagne transition-colors uppercase w-full sm:w-auto">
            Return to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
