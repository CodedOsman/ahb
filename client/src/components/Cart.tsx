import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';

/**
 * Cart Component
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - Slides in from the right side
 * - Shows cart items with quantity controls
 * - Checkout button at the bottom
 * - Semi-transparent backdrop overlay
 */

interface CartItemProps {
  item: ReturnType<typeof useCart>['items'][0];
}

const CartItemComponent: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  // Extract price value from string like "£45"
  const priceValue = parseFloat(item.price.replace('£', ''));
  const subtotal = priceValue * item.quantity;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-primary/20">
      {/* Product Image Placeholder */}
      <div className="w-20 h-20 bg-surface-container-high rounded-none flex items-center justify-center flex-shrink-0 border border-primary/10">
        <span className="text-xs text-primary font-label-caps text-center">{item.name.split(' ')[0]}</span>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-primary mb-1 truncate font-body-md">{item.name}</h4>
        <p className="text-xs text-secondary mb-2 font-body-md uppercase tracking-wider">{item.category}</p>
        <p className="text-sm font-bold text-primary">£{subtotal.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 bg-primary/5 rounded-none px-2 py-1 border border-primary/10">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="text-primary hover:text-secondary transition-colors w-5 h-5 flex items-center justify-center font-bold"
        >
          −
        </button>
        <span className="text-primary text-xs w-5 text-center font-bold font-body-md">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="text-primary hover:text-secondary transition-colors w-5 h-5 flex items-center justify-center font-bold"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="text-secondary hover:text-error transition-colors text-lg ml-2 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
};

export const Cart: React.FC = () => {
  const { items, isOpen, toggleCart, clearCart } = useCart();
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios.get('/api/delivery-zones').then((res) => {
        setDeliveryZones(res.data);
        if (res.data.length > 0) {
          setSelectedZoneId(res.data[0].id.toString());
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  // Calculate totals
  const subtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.price.replace('£', ''));
    return acc + price * item.quantity;
  }, 0);

  const selectedZone = deliveryZones.find(z => z.id.toString() === selectedZoneId);
  const deliveryFee = selectedZone ? parseFloat(selectedZone.price) : 0;
  
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!selectedZoneId) return alert('Please select a delivery zone');
    setIsCheckingOut(true);
    try {
      const res = await axios.post('/api/checkout/create-session', {
        items,
        deliveryZoneId: selectedZoneId
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleCart}
          />

          {/* Cart Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-background border-l border-primary flex flex-col shadow-none"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary">
              <h2
                className="text-2xl font-bold uppercase tracking-widest text-primary"
                style={{ fontFamily: "'Bodoni Moda', serif" }}
              >
                Cart
              </h2>
              <button
                onClick={toggleCart}
                className="text-primary hover:text-secondary transition-colors text-2xl w-8 h-8 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 hide-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-primary font-headline-md text-xl mb-2">Your cart is empty</p>
                  <p
                    className="text-secondary text-sm font-body-md"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 300 }}
                  >
                    Add items from the shop to get started
                  </p>
                </div>
              ) : (
                <div className="pt-4">
                  {items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Checkout */}
            {items.length > 0 && (
              <div className="border-t border-primary p-6 space-y-4 bg-surface-container-low">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-primary font-bold font-label-caps">Delivery Zone</label>
                    <select 
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full bg-background border border-primary p-3 text-primary outline-none focus:bg-white text-xs font-label-caps rounded-none"
                    >
                      {deliveryZones.map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name.toUpperCase()} - £{zone.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-xs pt-2 font-label-caps tracking-wider">
                    <div className="flex justify-between text-primary">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-bold">£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                      <span>Delivery</span>
                      <span className="font-bold">£{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-primary pt-2 border-t border-primary/20">
                      <span>Total</span>
                      <span>£{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-4 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs hover:bg-background hover:text-primary border border-primary transition-all duration-300 disabled:opacity-50 cursor-pointer rounded-none"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                  >
                    {isCheckingOut ? 'Redirecting...' : 'Proceed to Checkout'}
                  </button>

                {/* Continue Shopping */}
                <button
                  onClick={toggleCart}
                  className="w-full py-4 border border-primary text-primary font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer rounded-none"
                  style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;

