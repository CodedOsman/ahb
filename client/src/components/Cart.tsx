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
    <div className="flex items-center gap-4 py-4 border-b border-silk-gray/10">
      {/* Product Image Placeholder */}
      <div className="w-20 h-20 bg-gradient-to-br from-beige/20 to-beige/5 rounded flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-warm-silver text-center">{item.name.split(' ')[0]}</span>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-onyx mb-1 truncate">{item.name}</h4>
        <p className="text-xs text-warm-silver mb-2">{item.category}</p>
        <p className="text-sm font-semibold text-soft-slate">£{subtotal.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 bg-onyx/50 rounded px-2 py-1">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="text-soft-slate hover:text-warm-silver transition-colors w-5 h-5 flex items-center justify-center"
        >
          −
        </button>
        <span className="text-onyx text-xs w-5 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="text-soft-slate hover:text-warm-silver transition-colors w-5 h-5 flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="text-warm-silver hover:text-red-400 transition-colors text-lg ml-2"
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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleCart}
          />

          {/* Cart Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-alabaster border-l border-silk-gray/10 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-silk-gray/10">
              <h2
                className="text-2xl font-black text-soft-slate"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Cart
              </h2>
              <button
                onClick={toggleCart}
                className="text-soft-slate hover:text-warm-silver transition-colors text-2xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-onyx text-lg mb-2">Your cart is empty</p>
                  <p
                    className="text-warm-silver text-sm"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
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
              <div className="border-t border-silk-gray/10 p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-warm-silver font-bold">Delivery Zone</label>
                    <select 
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full bg-silk-gray border border-silk-gray/20 p-2 text-onyx outline-none focus:border-onyx text-sm"
                    >
                      {deliveryZones.map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} - £{zone.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm pt-2">
                    <div className="flex justify-between text-onyx">
                      <span>Subtotal ({itemCount} items)</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-warm-silver">
                      <span>Delivery</span>
                      <span>£{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-soft-slate pt-2 border-t border-silk-gray/10">
                      <span>Total</span>
                      <span>£{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-3 bg-onyx text-alabaster font-semibold hover:bg-champagne transition-colors duration-300 disabled:opacity-50"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {isCheckingOut ? 'Redirecting to secure checkout...' : 'Proceed to Checkout'}
                  </button>

                {/* Continue Shopping */}
                <button
                  onClick={toggleCart}
                  className="w-full py-2 border border-silk-gray/30 text-soft-slate hover:border-onyx hover:bg-champagne/5 transition-colors duration-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}
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

