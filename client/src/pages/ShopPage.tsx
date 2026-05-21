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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await axios.get('/api/categories');
        setCategories(catRes.data.filter((c: Category) => c.type === 'product'));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (selectedCategory !== 'all') {
          params.set('category', selectedCategory);
        }

        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim());
        }

        const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await axios.get(url);
        setProducts(res.data);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 
            className="text-5xl md:text-7xl font-bold text-primary mb-6 font-display-lg uppercase tracking-wider"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Boutique
          </h1>
          <p className="text-secondary max-w-2xl text-base font-body-md">
            Discover our curated collection of luxury hair care and premium units.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-12 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label htmlFor="shop-search" className="sr-only">Search products</label>
            <input
              id="shop-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-none border border-primary/20 bg-surface px-4 py-3 text-sm text-primary outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-wrap gap-4 md:items-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 border font-label-caps text-label-caps transition-all duration-300 rounded-none cursor-pointer ${
                selectedCategory === 'all' 
                  ? 'bg-primary text-on-primary border-primary' 
                  : 'text-primary border-primary/20 hover:border-primary hover:bg-primary/5'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-6 py-3 border font-label-caps text-label-caps transition-all duration-300 rounded-none cursor-pointer ${
                  selectedCategory === cat.slug 
                    ? 'bg-primary text-on-primary border-primary' 
                    : 'text-primary border-primary/20 hover:border-primary hover:bg-primary/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-none h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence exitBeforeEnter>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="bg-surface-container-low rounded-none overflow-hidden group border border-primary hover:bg-surface-container transition-all duration-500 shadow-none flex flex-col"
                >
                  <Link href={`/product/${product.id}`} className="cursor-pointer flex-1 flex flex-col">
                    <div className="relative h-80 bg-background overflow-hidden border-b border-primary">
                      <div className="absolute inset-0 flex items-center justify-center text-primary/10 text-4xl font-black font-display-lg uppercase">
                        {product.image_url && !product.image_url.startsWith('Product') ? '' : 'ASANTEY'}
                      </div>
                      {product.image_url && !product.image_url.startsWith('Product') && (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                        />
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-1 font-bold font-label-caps">
                              {product.category_name}
                            </p>
                            <h3 
                              className="text-xl text-primary group-hover:line-through transition-colors duration-300 font-headline-md uppercase tracking-wide"
                              style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                              {product.name}
                            </h3>
                          </div>
                          <span className="text-primary font-bold font-body-md text-base">£{product.base_price}</span>
                        </div>
                        
                        <p className="text-sm text-secondary font-body-md line-clamp-2 mb-6">
                          {product.description}
                        </p>
                      </div>

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
                        className={`w-full py-4 font-bold tracking-widest text-xs transition-all duration-300 z-10 font-label-caps text-label-caps rounded-none cursor-pointer ${
                          product.stock <= 0
                            ? 'bg-transparent border border-error text-error cursor-not-allowed'
                            : 'bg-primary border border-primary text-on-primary hover:bg-background hover:text-primary'
                        }`}
                      >
                        {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO BAG'}
                      </button>
                    </div>
                  </Link>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <p className="text-secondary font-body-md text-lg">
              No products found matching your search and selected category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
