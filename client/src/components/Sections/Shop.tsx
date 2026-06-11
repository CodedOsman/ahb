import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';
import { Link } from 'wouter';
import { useSettings } from '@/hooks/useSettings';

interface Product {
  id: number;
  name: string;
  base_price: string;
  category_name: string;
  category_slug: string;
  image_url: string;
  stock: number;
  slug: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: `£${product.base_price}`,
        category: product.category_name,
      });
    }
  };

  // Curated elegant fallback images if DB placeholder is used
  const getFallbackImage = (id: number) => {
    const fallbacks = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClAqq8It38R4jRifD07R8EbPDwH8fTQIulAwdwcxxngHjUotimPsvbFYARWHaCKHw0p2WCIWkuDZm4D6Y8K0THEYUDViZpelCXYf6FoUtkRH4sLo0YkqvOtg0KmN-MRP8shp84GywUkaiJDTq22CTjsKNH6Ig5Y9jDq4CAKUSi4Z9kzUI3JQH6Si5sosMKNa6A4ZpWOrM3CDTG34juNMBXxsQ2OECEXEN0UBhHyyNBSIGg4lgxhmoePzjot5SiMp2WpLwBP9TftGg",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXZivTAE72U7P_sat3rq4j6YqqrT71BFtEaZ4ESyO0Rpgwf0vr8-KSwBBMIIAbcMMlLPYP43-vaa_1SX0hdpYpltfKrf2pkZfy3UG5yrxnoPKCvV2dJR08vtCK2n6gs81jJNAHujydfuOm2NnBaPgrdzieUguVsL-kec1cKI-VSmTHWsXS0oy0dzN9z_LixLoRtvZxq5YBoji8_4EAgqriwaGQL5L5olzTowT0cQtS_O9fkVSS_ktHu-x0S8QDjfT-2EH4d2lBVcU",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDpiy5oR00aXIfpYXBrpsiHF-72nuBJoEm2pOqh6PoOfBbPHry6bUmT-uKjGBJOHIj1mVThw87HZvKtiK4JFuQZU_08ccTAkB2O9LLeeAhh7K0FC9Uk9YMwjT1BEunBo9j78apVyfC7ZY8Mmn_UP86rIcQF5HvLZ4tCCf_5_F2m3TxY4pkacXElHMSttw3IJczy5YeXjPOUZIHH7MOC9xXpWpwclubPdQNf0YY4ij6ekLn7gu7XKxWs4MAOoEpi-w53z9QEYJ73H5c",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBN-NidL-n2mW_5yiVxbU14cMSzyG4gAHI4rmmszJZBRljPcViVkc-ynuEhoLwP07wE0PuId1lIMGbXmPv3d65Gx4kjx8lN0O4CH2yD4dvlwaFwbctrsvkql25ha6Y8qITFuUgWuRUJqtsdv3QPBLGYd8get9UnbWQc7C29qngbYR1ZSojvS8yka3Do0ywAjhJVpLQUfd_w0DnAm5pCUF8WRpse5bys3VNZm17EEiE7d-lx_61hFqy60OXXvv6yOKwo00k2ac_ML6w"
    ];
    return fallbacks[(id - 1) % fallbacks.length];
  };

  const imageSrc = imgError || !product.image_url || product.image_url.startsWith('Product') 
    ? getFallbackImage(product.id) 
    : product.image_url;

  return (
    <Link href={`/product/${product.category_slug || 'category'}/${product.slug || product.id}`} className="group cursor-pointer block">
      <div>
        <div className="aspect-[3/4] bg-surface-container-highest mb-4 overflow-hidden relative">
          <img
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src={imageSrc}
            onError={() => setImgError(true)}
          />
          {/* Quick Add Slide-up Label */}
          <div
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 py-4 bg-white text-black font-label-caps text-center text-[11px] font-bold transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out cursor-pointer z-10 hover:bg-neutral-200"
          >
            {product.stock <= 0 ? 'OUT OF STOCK' : 'QUICK ADD'}
          </div>
        </div>

        <div className="flex justify-between items-start mt-2">
          <div>
            <h3 className="font-label-caps text-label-caps uppercase text-white tracking-wider line-clamp-1">
              {product.name}
            </h3>
            <p className="text-[10px] text-white opacity-60 mt-1 uppercase tracking-widest">
              {product.category_name}
            </p>
          </div>
          <span className="font-label-caps text-label-caps text-white shrink-0">
            £{parseFloat(product.base_price).toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
};

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  image_url?: string;
}

interface CategoryCardProps {
  category: Category;
  onClick: (slug: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <div 
      onClick={() => onClick(category.slug)}
      className={`group cursor-pointer block border border-white/20 bg-surface-container-highest transition-all duration-500 overflow-hidden relative aspect-[4/3] flex flex-col justify-center items-center text-center p-6 ${!category.image_url ? 'hover:bg-white' : ''}`}
    >
      {category.image_url && (
        <img src={category.image_url} alt={category.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-0" />
      )}
      <div className={`absolute inset-0 transition-all duration-500 z-0 ${category.image_url ? 'bg-black/40 group-hover:bg-black/20' : 'bg-black/40 group-hover:bg-transparent'}`}></div>
      <div className={`z-10 transition-colors duration-500 ${category.image_url ? 'text-white' : 'text-white group-hover:text-black'}`}>
        <span className="font-label-caps text-[10px] tracking-widest uppercase opacity-70 mb-2 block drop-shadow-md">
          Collection
        </span>
        <h3 className="font-headline-md text-2xl uppercase tracking-wider drop-shadow-md">
          {category.name}
        </h3>
      </div>
      <div className={`absolute bottom-6 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 font-label-caps text-xs tracking-widest uppercase ${category.image_url ? 'text-white drop-shadow-md' : 'text-black'}`}>
        Explore
      </div>
    </div>
  );
};

export const Shop: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'CATEGORIES' | 'PRODUCTS'>('CATEGORIES');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await axios.get('/api/categories');
        setCategories(catRes.data.filter((c: Category) => c.type === 'product'));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleCategoryClick = async (slug: string) => {
    setSelectedCategory(slug);
    setView('PRODUCTS');
    setLoading(true);
    try {
      const res = await axios.get(`/api/products?category=${slug}`);
      setProducts(res.data.slice(0, 4)); // Show top 4 products
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCategories = () => {
    setView('CATEGORIES');
    setSelectedCategory(null);
  };

  return (
    <section id="shop" className="bg-primary text-on-primary py-24 min-h-[600px]">
      <div className="max-w-container-max mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="font-label-caps text-label-caps border-b border-on-primary pb-2 opacity-60">
              {settings.shop_section_label || 'CURATED COLLECTION'}
            </span>
            <h2 className="font-headline-lg text-headline-lg mt-4 text-white uppercase">
              {settings.shop_section_title || 'Asantey Shop'}
            </h2>
            <p className="font-body-md text-body-md mt-4 max-w-md opacity-70 text-white">
              {view === 'CATEGORIES'
                ? (settings.shop_section_subtitle_categories || 'Explore our curated collections of luxury hair care products and styling tools.')
                : (settings.shop_section_subtitle_products || 'Browse our premium products to maintain your beautiful look at home.')}
            </p>
          </div>
          {view === 'PRODUCTS' && (
            <button 
              onClick={handleBackToCategories}
              className="font-label-caps text-label-caps border border-white/40 text-white px-8 py-3 hover:bg-white hover:text-black transition-all cursor-pointer whitespace-nowrap"
            >
              ← BACK TO CATEGORIES
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {view === 'CATEGORIES' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {categories.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} onClick={handleCategoryClick} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-4 text-center py-12 text-white/70">
                    No products found in this category.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-16 text-center">
          <Link href={view === 'PRODUCTS' && selectedCategory ? `/shop?category=${selectedCategory}` : "/shop"}>
            <button className="font-label-caps text-label-caps border border-white text-white px-12 py-4 hover:bg-white hover:text-black transition-all cursor-pointer">
              {view === 'PRODUCTS' && selectedCategory ? 'VIEW ALL IN CATEGORY' : 'VIEW ALL PRODUCTS'}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Shop;
