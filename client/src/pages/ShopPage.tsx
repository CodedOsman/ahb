import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface CategoryCardProps {
  category: Category;
  onClick: (slug: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      onClick={() => onClick(category.slug)}
      className="group cursor-pointer bg-surface-container-low rounded-none overflow-hidden border border-primary hover:bg-primary transition-all duration-500 shadow-none flex flex-col aspect-square relative"
    >
      <div className="absolute inset-0 bg-background/50 group-hover:bg-transparent transition-all duration-500 z-0"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
        <span className="font-label-caps text-xs tracking-[0.2em] uppercase text-secondary group-hover:text-on-primary/80 mb-4 transition-colors duration-500">
          Curated Collection
        </span>
        <h3 
          className="text-3xl md:text-4xl text-primary group-hover:text-on-primary font-headline-lg uppercase tracking-wider transition-colors duration-500"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {category.name}
        </h3>
        <div className="mt-8 font-label-caps text-xs tracking-widest uppercase border border-primary/20 group-hover:border-on-primary/50 text-primary group-hover:text-on-primary px-6 py-3 transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
          View Products
        </div>
      </div>
    </motion.div>
  );
};

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Parse URL params for initial state
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get('category');
  
  const [view, setView] = useState<'CATEGORIES' | 'PRODUCTS'>(initialCategory ? 'PRODUCTS' : 'CATEGORIES');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const { addToCart } = useCart();
  const [location, setLocation] = useLocation();

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

    if (view === 'PRODUCTS' || searchQuery.trim()) {
      fetchFilteredProducts();
    } else {
      setLoading(false); // Stop loading if just viewing categories without search
    }
  }, [selectedCategory, searchQuery, view]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, view]);
  
  // If user starts typing a search, immediately switch to products view to show results
  useEffect(() => {
    if (searchQuery.trim() && view === 'CATEGORIES') {
      setView('PRODUCTS');
      setSelectedCategory('all');
      // Update URL to remove category if searching globally
      window.history.replaceState(null, '', '/shop');
    }
  }, [searchQuery]);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    setView('PRODUCTS');
    setSearchQuery('');
    // Update URL
    window.history.pushState(null, '', `/shop?category=${slug}`);
  };

  const handleBackToCategories = () => {
    setView('CATEGORIES');
    setSelectedCategory('all');
    setSearchQuery('');
    window.history.pushState(null, '', '/shop');
  };

  const getCategoryName = () => {
    if (selectedCategory === 'all') return 'All Products';
    const cat = categories.find(c => c.slug === selectedCategory);
    return cat ? cat.name : 'Products';
  };

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <h1
                className="text-5xl md:text-7xl font-bold text-primary font-display-lg uppercase tracking-wider"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {view === 'CATEGORIES' ? 'Shop Collection' : getCategoryName()}
              </h1>
            </div>
            {view === 'PRODUCTS' && (
              <button 
                onClick={handleBackToCategories}
                className="font-label-caps text-label-caps border border-primary/40 text-primary px-8 py-3 hover:bg-primary hover:text-on-primary transition-all cursor-pointer whitespace-nowrap"
              >
                ← BACK TO CATEGORIES
              </button>
            )}
          </div>
          <p className="text-secondary max-w-2xl text-base font-body-md">
            {view === 'CATEGORIES' 
              ? 'Discover our curated collection of luxury hair care and premium units.'
              : 'Browse our exquisite selection designed for your perfect look.'}
          </p>
        </div>

        {/* Search Bar - Always available */}
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
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-none h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className={`grid gap-8 ${view === 'CATEGORIES' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-8'}`}>
            <AnimatePresence mode="wait">
              {view === 'CATEGORIES' ? (
                <>
                  {categories.map((cat) => (
                    <CategoryCard key={cat.id} category={cat} onClick={handleCategoryClick} />
                  ))}
                </>
              ) : (
                <>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
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
                                    style={{ fontFamily: "'Inter', sans-serif" }}
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
      
                            <div className="w-full py-4 text-center font-bold tracking-widest text-xs transition-all duration-300 z-10 font-label-caps text-label-caps rounded-none cursor-pointer bg-primary border border-primary text-on-primary hover:bg-background hover:text-primary">
                              {product.stock <= 0 ? 'OUT OF STOCK' : 'SELECT OPTIONS'}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-24">
                      <p className="text-secondary font-body-md text-lg">
                        No products found matching your search and selected category.
                      </p>
                    </div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && view === 'PRODUCTS' && totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-16">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 border border-primary/20 text-primary hover:bg-primary hover:text-on-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-label-caps text-xs tracking-widest uppercase text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 border border-primary/20 text-primary hover:bg-primary hover:text-on-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary transition-all duration-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
