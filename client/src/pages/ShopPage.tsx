import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  base_price: string;
  image_url: string;
  category_name: string;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
}

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/categories'),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data.filter((c: Category) => c.type === 'product'));
      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const url = selectedCategory === 'all' 
          ? '/api/products' 
          : `/api/products?category=${selectedCategory}`;
        const res = await axios.get(url);
        setProducts(res.data);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-alabaster pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 
            className="text-5xl md:text-7xl font-black text-onyx mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Boutique
          </h1>
          <p className="text-warm-silver max-w-2xl text-lg font-light">
            Discover our curated collection of luxury hair care and premium units.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 border ${
              selectedCategory === 'all' 
                ? 'bg-onyx text-alabaster border-onyx' 
                : 'text-soft-slate border-silk-gray/30 hover:border-onyx'
            } transition-all duration-300 uppercase tracking-widest text-xs font-bold`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-6 py-2 border ${
                selectedCategory === cat.slug 
                  ? 'bg-onyx text-alabaster border-onyx' 
                  : 'text-soft-slate border-silk-gray/30 hover:border-onyx'
              } transition-all duration-300 uppercase tracking-widest text-xs font-bold`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-onyx"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="bg-silk-gray rounded-lg overflow-hidden group border border-silk-gray/5 hover:border-silk-gray/20 transition-all duration-500"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="cursor-pointer h-full flex flex-col">
                      <div className="relative h-80 bg-onyx/50 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-soft-slate/20 text-4xl font-black italic">
                          {product.image_url && !product.image_url.startsWith('Product') ? '' : 'ASANTEY'}
                        </div>
                        {product.image_url && !product.image_url.startsWith('Product') && (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-soft-slate mb-1 font-bold">
                              {product.category_name}
                            </p>
                            <h3 
                              className="text-xl font-bold text-onyx group-hover:text-soft-slate transition-colors duration-300"
                              style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                              {product.name}
                            </h3>
                          </div>
                          <span className="text-soft-slate font-medium">£{product.base_price}</span>
                        </div>
                        
                        <p className="text-sm text-warm-silver/70 font-light line-clamp-2 mb-6">
                          {product.description}
                        </p>

                        <button
                          disabled={product.stock <= 0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: `£${product.base_price}`,
                              category: product.category_name,
                            });
                          }}
                          className={`mt-auto w-full py-3 font-bold tracking-[0.1em] text-xs transition-all duration-300 z-10 ${
                            product.stock <= 0
                              ? 'bg-transparent border border-red-500 text-red-500 cursor-not-allowed'
                              : 'bg-transparent border border-onyx text-soft-slate hover:bg-champagne hover:text-charcoal'
                          }`}
                        >
                          {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO BAG'}
                        </button>
                      </div>
                    </div>
                  </Link>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <p className="text-warm-silver text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
