import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@/hooks/useGSAP';
import { useCart } from '@/contexts/CartContext';
import gsap from 'gsap';
import axios from 'axios';
import { Link } from 'wouter';

/**
 * Boutique Shop Section
 * 
 * Design Philosophy: Cinematic Editorial Sophistication
 * - 3D Tilt effect using Framer Motion on hover
 * - Quick Add button with staggered spring animation
 * - Gallery-style layout with image-dominant cards
 * - Smooth product reveal animations
 */

interface Product {
  id: number;
  name: string;
  base_price: string;
  category_name: string;
  image_url: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: `£${product.base_price}`,
      category: product.category_name,
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
      <Link href={`/product/${product.id}`}>
        <div className="bg-silk-gray rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col">
          <div className="relative w-full h-64 bg-gradient-to-br from-beige/20 to-transparent flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <p className="text-onyx text-sm opacity-50">
                {product.image_url && !product.image_url.startsWith('Product') ? '' : 'ASANTEY'}
              </p>
            </div>
            {product.image_url && !product.image_url.startsWith('Product') && (
              <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
            )}

            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            <motion.button
              onClick={handleAddToCart}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-onyx text-alabaster font-semibold text-sm hover:bg-champagne transition-colors duration-300 z-10"
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
              disabled={product.stock <= 0}
            >
              {product.stock <= 0 ? 'OUT OF STOCK' : 'QUICK ADD'}
            </motion.button>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3
                className="text-lg font-bold text-onyx group-hover:text-soft-slate transition-colors"
                style={{
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {product.name}
              </h3>
              <span className="text-soft-slate font-semibold">£{product.base_price}</span>
            </div>

            <p
              className="text-xs text-warm-silver mb-3 font-light"
            >
              {product.category_name}
            </p>

            <div className="flex items-center gap-1 mt-auto">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-soft-slate text-xs">
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>

    </motion.div>
  );
};

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useGSAP(() => {
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
      className="shop-section relative w-full py-24 bg-alabaster"
    >
      <div className="shop-header container mx-auto px-4 mb-16">
        <h2
          className="text-5xl md:text-6xl font-black text-onyx mb-4"
          style={{
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '-0.02em',
          }}
        >
          Asantey Shop
        </h2>
        <p
          className="text-lg text-warm-silver max-w-2xl"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            lineHeight: 1.8,
          }}
        >
          Curated luxury hair care products and styling tools to maintain your beautiful look at home.
        </p>
      </div>

      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-onyx"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center mt-16">
        <Link href="/shop">
          <button
            className="px-8 py-3 border-2 border-onyx text-soft-slate font-semibold hover:bg-champagne hover:text-charcoal transition-all duration-300"
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.1em',
            }}
          >
            VIEW ALL PRODUCTS
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Shop;
