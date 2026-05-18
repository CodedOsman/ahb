import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

interface ProductVariant {
  id: number;
  length: string;
  price: string;
  stock: number;
}

interface ProductDetail {
  id: number;
  name: string;
  description: string;
  base_price: string;
  image_url: string;
  category_name: string;
  stock: number;
  lengths: ProductVariant[];
}

const ProductDetailPage: React.FC = () => {
  const [, params] = useRoute('/product/:id');
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedLength, setSelectedLength] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id) return;
      try {
        const res = await axios.get(`/api/products/${params.id}`);
        setProduct(res.data);
        if (res.data.lengths && res.data.lengths.length > 0) {
          setSelectedLength(res.data.lengths[0]);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-onyx"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center text-onyx">
        Product not found
      </div>
    );
  }

  const handleAddToCart = () => {
    const price = selectedLength ? `£${selectedLength.price}` : `£${product.base_price}`;
    const name = selectedLength ? `${product.name} - ${selectedLength.length}` : product.name;
    
    addToCart({
      id: selectedLength ? `${product.id}-${selectedLength.id}` : product.id,
      name,
      price,
      category: product.category_name,
    });
  };

  return (
    <div className="min-h-screen bg-alabaster pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/5] bg-silk-gray rounded-lg overflow-hidden relative"
          >
            <div className="absolute inset-0 flex items-center justify-center text-soft-slate/10 text-6xl font-black italic">
              {product.image_url.startsWith('Product') ? product.image_url : 'ASANTEY'}
            </div>
            {product.image_url && !product.image_url.startsWith('Product') && (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-soft-slate mb-4 font-bold">
              {product.category_name}
            </p>
            <h1 
              className="text-4xl md:text-6xl font-black text-onyx mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {product.name}
            </h1>
            
            <p className="text-3xl text-soft-slate mb-8 font-light">
              {selectedLength ? `£${selectedLength.price}` : `£${product.base_price}`}
            </p>

            <div className="prose prose-invert mb-12">
              <p className="text-warm-silver leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Length Selection */}
            {product.lengths && product.lengths.length > 0 && (
              <div className="mb-12">
                <h4 className="text-xs uppercase tracking-widest text-onyx mb-4 font-bold">
                  Select Length
                </h4>
                <div className="flex flex-wrap gap-3">
                  {product.lengths.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedLength(variant)}
                      className={`px-6 py-3 border transition-all duration-300 text-sm ${
                        selectedLength?.id === variant.id
                          ? 'bg-onyx text-alabaster border-onyx font-bold'
                          : 'border-silk-gray/20 text-warm-silver hover:border-onyx'
                      } ${variant.stock <= 0 ? 'opacity-50 cursor-not-allowed line-through' : ''}`}
                      disabled={variant.stock <= 0}
                    >
                      {variant.length} {variant.stock <= 0 && '(Out of Stock)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={(selectedLength ? selectedLength.stock : product.stock) <= 0}
              className={`w-full py-5 font-bold tracking-[0.2em] transition-all duration-300 ${
                (selectedLength ? selectedLength.stock : product.stock) <= 0 
                  ? 'bg-alabaster border border-red-500 text-red-500 cursor-not-allowed'
                  : 'bg-onyx text-alabaster hover:bg-champagne'
              }`}
            >
              {(selectedLength ? selectedLength.stock : product.stock) <= 0 ? 'OUT OF STOCK' : 'ADD TO SHOPPING BAG'}
            </button>

            {/* Additional Info */}
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-silk-gray/10 pt-12">
              <div>
                <h5 className="text-[10px] uppercase tracking-widest text-onyx mb-2 font-bold">Shipping</h5>
                <p className="text-xs text-warm-silver font-light">Free worldwide shipping on orders over £500.</p>
              </div>
              <div>
                <h5 className="text-[10px] uppercase tracking-widest text-onyx mb-2 font-bold">Returns</h5>
                <p className="text-xs text-warm-silver font-light">14-day return policy for unused items.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
