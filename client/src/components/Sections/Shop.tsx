import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';
import { Link } from 'wouter';

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
    <Link href={`/product/${product.id}`} className="group cursor-pointer block">
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

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        // Take first 4 products to fit in 4-column layout like code.html
        setProducts(res.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section id="shop" className="bg-primary text-on-primary py-24">
      <div className="max-w-container-max mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="font-label-caps text-label-caps border-b border-on-primary pb-2 opacity-60">
              CURATED COLLECTION
            </span>
            <h2 className="font-headline-lg text-headline-lg mt-4 text-white uppercase">
              Asantey Shop
            </h2>
            <p className="font-body-md text-body-md mt-4 max-w-md opacity-70 text-white">
              Curated luxury hair care products and styling tools to maintain your beautiful look at home.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link href="/shop">
            <button className="font-label-caps text-label-caps border border-white text-white px-12 py-4 hover:bg-white hover:text-black transition-all cursor-pointer">
              VIEW ALL PRODUCTS
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Shop;
