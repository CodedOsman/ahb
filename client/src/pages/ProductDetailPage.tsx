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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-none h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary font-headline-md text-xl">
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
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/5] bg-surface-container-low rounded-none overflow-hidden border border-primary relative"
          >
          <img
            src={product.image_url && !product.image_url.startsWith('Product') ? product.image_url : 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
          />
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-4 font-bold font-label-caps">
              {product.category_name}
            </p>
            <h1 
              className="text-4xl md:text-6xl font-bold text-primary mb-6 font-display-lg uppercase tracking-wide"
              style={{ fontFamily: "'Bodoni Moda', serif" }}
            >
              {product.name}
            </h1>
            
            <p className="text-3xl text-primary mb-8 font-bold font-body-md">
              {selectedLength ? `£${selectedLength.price}` : `£${product.base_price}`}
            </p>

            <div className="prose prose-invert mb-12">
              <p className="text-secondary leading-relaxed font-body-md text-base">
                {product.description}
              </p>
            </div>

            {/* Length Selection */}
            {product.lengths && product.lengths.length > 0 && (
              <div className="mb-12">
                <h4 className="text-xs uppercase tracking-widest text-primary mb-4 font-bold font-label-caps">
                  Select Length
                </h4>
                <div className="flex flex-wrap gap-3">
                  {product.lengths.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedLength(variant)}
                      className={`px-6 py-3 border transition-all duration-300 text-xs font-label-caps rounded-none cursor-pointer ${
                        selectedLength?.id === variant.id
                          ? 'bg-primary text-on-primary border-primary font-bold'
                          : 'border-primary/20 text-secondary hover:border-primary'
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
              className={`w-full py-5 font-bold tracking-widest transition-all duration-300 font-label-caps text-label-caps rounded-none cursor-pointer ${
                (selectedLength ? selectedLength.stock : product.stock) <= 0 
                  ? 'bg-background border border-error text-error cursor-not-allowed'
                  : 'bg-primary border border-primary text-on-primary hover:bg-background hover:text-primary'
              }`}
            >
              {(selectedLength ? selectedLength.stock : product.stock) <= 0 ? 'OUT OF STOCK' : 'ADD TO SHOPPING BAG'}
            </button>

            {/* Additional Info */}
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-primary/20 pt-12">
              <div>
                <h5 className="text-[10px] uppercase tracking-widest text-primary mb-2 font-bold font-label-caps">Shipping</h5>
                <p className="text-xs text-secondary font-body-md">Free worldwide shipping on orders over £500.</p>
              </div>
              <div>
                <h5 className="text-[10px] uppercase tracking-widest text-primary mb-2 font-bold font-label-caps">Returns</h5>
                <p className="text-xs text-secondary font-body-md">14-day return policy for unused items.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
