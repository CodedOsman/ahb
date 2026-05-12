import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

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

  // Extract price value from string like "$45"
  const priceValue = parseFloat(item.price.replace('$', ''));
  const subtotal = priceValue * item.quantity;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-beige/10">
      {/* Product Image Placeholder */}
      <div className="w-20 h-20 bg-gradient-to-br from-beige/20 to-beige/5 rounded flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-beige-light text-center">{item.name.split(' ')[0]}</span>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-cream mb-1 truncate">{item.name}</h4>
        <p className="text-xs text-beige-light mb-2">{item.category}</p>
        <p className="text-sm font-semibold text-beige">${subtotal.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 bg-charcoal/50 rounded px-2 py-1">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="text-beige hover:text-beige-light transition-colors w-5 h-5 flex items-center justify-center"
        >
          −
        </button>
        <span className="text-cream text-xs w-5 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="text-beige hover:text-beige-light transition-colors w-5 h-5 flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="text-beige-light hover:text-red-400 transition-colors text-lg ml-2"
      >
        ✕
      </button>
    </div>
  );
};

export const Cart: React.FC = () => {
  const { items, isOpen, toggleCart, clearCart } = useCart();

  // Calculate totals
  const subtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return acc + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

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
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-charcoal border-l border-beige/10 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-beige/10">
              <h2
                className="text-2xl font-black text-beige"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Cart
              </h2>
              <button
                onClick={toggleCart}
                className="text-beige hover:text-beige-light transition-colors text-2xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-cream text-lg mb-2">Your cart is empty</p>
                  <p
                    className="text-beige-light text-sm"
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
              <div className="border-t border-beige/10 p-6 space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-cream">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-beige-light">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-beige pt-2 border-t border-beige/10">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  className="w-full py-3 bg-beige text-charcoal font-semibold hover:bg-beige-light transition-colors duration-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Proceed to Checkout
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={toggleCart}
                  className="w-full py-2 border border-beige/30 text-beige hover:border-beige hover:bg-beige/5 transition-colors duration-300"
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

