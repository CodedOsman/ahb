import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@/hooks/useGSAP';
import { useCart } from '@/contexts/CartContext';
import gsap from 'gsap';

/**
 * Boutique Shop Section
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - 3D Tilt effect using Framer Motion on hover
 * - Quick Add button with staggered spring animation
 * - Gallery-style layout with image-dominant cards
 * - Smooth product reveal animations
 */

const products = [
  {
    id: 1,
    name: 'Silk Hair Serum',
    price: '$45',
    category: 'Care',
    image: 'Product 1',
  },
  {
    id: 2,
    name: 'Luxury Braid Oil',
    price: '$38',
    category: 'Styling',
    image: 'Product 2',
  },
  {
    id: 3,
    name: 'Hydration Mask',
    price: '$52',
    category: 'Treatment',
    image: 'Product 3',
  },
  {
    id: 4,
    name: 'Color Protect Spray',
    price: '$35',
    category: 'Protection',
    image: 'Product 4',
  },
  {
    id: 5,
    name: 'Premium Brush Set',
    price: '$89',
    category: 'Tools',
    image: 'Product 5',
  },
  {
    id: 6,
    name: 'Silk Pillowcase',
    price: '$42',
    category: 'Accessories',
    image: 'Product 6',
  },
];

interface ProductCardProps {
  product: typeof products[0];
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (y - 0.5) * 10;
    const rotateY = (x - 0.5) * -10;

    gsap.to(cardRef.current, {
      rotationX: rotateX,
      rotationY: rotateY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
    setIsHovered(false);
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Product Card */}
      <div className="bg-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
        {/* Product Image Area */}
        <div className="relative w-full h-64 bg-gradient-to-br from-beige/20 to-transparent flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <p className="text-cream text-sm opacity-50">{product.image}</p>
          </div>

          {/* Overlay on Hover */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Quick Add Button */}
          <motion.button
            onClick={handleAddToCart}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-beige text-charcoal font-semibold text-sm hover:bg-beige-light transition-colors duration-300"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20,
              scale: isHovered ? 1 : 0.8,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.05em',
            }}
          >
            QUICK ADD
          </motion.button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3
              className="text-lg font-bold text-cream"
              style={{
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {product.name}
            </h3>
            <span className="text-beige font-semibold">{product.price}</span>
          </div>

          <p
            className="text-xs text-beige-light mb-3"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
            }}
          >
            {product.category}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-beige text-xs">
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Shop: React.FC = () => {
  useGSAP(() => {
    // Animate section header on scroll
    gsap.fromTo(
      '.shop-header',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.shop-section',
          start: 'top 80%',
        },
      }
    );
  }, []);

  return (
    <section
      id="shop"
      className="shop-section relative w-full py-24 bg-charcoal"
    >
      {/* Section Header */}
      <div className="shop-header container mx-auto px-4 mb-16">
        <h2
          className="text-5xl md:text-6xl font-black text-cream mb-4"
          style={{
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '-0.02em',
          }}
        >
          Asantey Shop
        </h2>
        <p
          className="text-lg text-beige-light max-w-2xl"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            lineHeight: 1.8,
          }}
        >
          Curated luxury hair care products and styling tools to maintain your beautiful look at home.
        </p>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-16">
        <button
          className="px-8 py-3 border-2 border-beige text-beige font-semibold hover:bg-beige hover:text-charcoal transition-all duration-300"
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.1em',
          }}
        >
          VIEW ALL PRODUCTS
        </button>
      </div>
    </section>
  );
};

export default Shop;

