import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Save, Package } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  base_price: string;
  image_url: string;
  is_active: boolean;
  category_name: string;
  stock: number;
  lengths?: any[];
}

const ProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    category_id: 1,
    name: '',
    description: '',
    base_price: '',
    image_url: '',
    is_active: true,
    stock: 0,
    lengths: [] as { length: string, price: string, stock: number }[]
  });

  const [parsingImage, setParsingImage] = useState(false);

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Image size must be less than 50MB');
        return;
      }
      setParsingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
        setParsingImage(false);
        toast.success('Image loaded successfully');
      };
      reader.onerror = () => {
        setParsingImage(false);
        toast.error('Failed to load image file');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data.filter((c: any) => c.type === 'product'));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (product: Product | null = null) => {
    if (product) {
      // Fetch details to get lengths
      try {
        const res = await axios.get(`/api/products/${product.id}`);
        const fullProduct = res.data;
        setEditingProduct(fullProduct);
        setFormData({
          category_id: fullProduct.category_id,
          name: fullProduct.name,
          description: fullProduct.description,
          base_price: fullProduct.base_price,
          image_url: fullProduct.image_url,
          is_active: !!fullProduct.is_active,
          stock: fullProduct.stock || 0,
          lengths: fullProduct.lengths || []
        });
      } catch (err) {
        toast.error('Failed to fetch product details');
        return;
      }
    } else {
      setEditingProduct(null);
      setFormData({
        category_id: categories[0]?.id || 1,
        name: '',
        description: '',
        base_price: '',
        image_url: '',
        is_active: true,
        stock: 0,
        lengths: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    try {
      if (editingProduct) {
        await axios.put(`/api/admin/products/${editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated');
      } else {
        await axios.post('/api/admin/products', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const addLength = () => {
    setFormData({
      ...formData,
      lengths: [...formData.lengths, { length: '', price: '', stock: 0 }]
    });
  };

  const removeLength = (index: number) => {
    const newLengths = [...formData.lengths];
    newLengths.splice(index, 1);
    setFormData({ ...formData, lengths: newLengths });
  };

  const updateLength = (index: number, field: string, value: string) => {
    const newLengths = [...formData.lengths];
    (newLengths[index] as any)[field] = value;
    setFormData({ ...formData, lengths: newLengths });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
            Products
          </h1>
          <p className="text-warm-silver font-light text-sm">Manage your hair units and shop inventory.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-2 bg-onyx text-alabaster font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-all"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-soft-slate italic">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-silk-gray p-4 rounded-lg border border-silk-gray/10 flex gap-4 group hover:border-silk-gray/30 transition-all">
              <div className="w-20 h-20 bg-alabaster rounded flex items-center justify-center text-soft-slate/20 overflow-hidden">
                {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover" /> : <Package size={32} />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-onyx mb-0.5">{product.name}</h3>
                <p className="text-[10px] text-soft-slate uppercase tracking-widest font-bold mb-2">{product.category_name}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <span className="text-onyx font-bold">£{product.base_price}</span>
                    <span className="text-warm-silver text-sm">Stock: {product.stock}</span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="p-1.5 text-warm-silver hover:text-soft-slate hover:bg-white/5 rounded transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-silk-gray w-full max-w-3xl p-8 rounded-lg border border-silk-gray/20 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-onyx" style={{ fontFamily: "'Playfair Display', serif" }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-warm-silver hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Category</label>
                  <select 
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                    className="w-full bg-alabaster border border-silk-gray/10 p-3 text-onyx outline-none focus:border-onyx transition-all"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Product Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-alabaster border border-silk-gray/10 p-3 text-onyx outline-none focus:border-onyx transition-all"
                    placeholder="e.g. Peruvian Wave Unit"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-alabaster border border-silk-gray/10 p-3 text-onyx outline-none focus:border-onyx transition-all h-32"
                  placeholder="Describe the product..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Base Price (£)</label>
                  <input 
                    type="number" 
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full bg-alabaster border border-silk-gray/10 p-3 text-onyx outline-none focus:border-onyx transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Base Stock Level</label>
                  <input 
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-alabaster border border-silk-gray/10 p-3 text-onyx outline-none focus:border-onyx transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Product Image</label>
                  <div className="relative group border-2 border-dashed border-silk-gray/20 hover:border-champagne/40 rounded-lg p-6 text-center cursor-pointer transition-all bg-alabaster">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProductFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {parsingImage ? (
                      <div className="space-y-2 py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-champagne border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-[10px] text-warm-silver uppercase tracking-wider">Loading image...</p>
                      </div>
                    ) : formData.image_url ? (
                      <div className="space-y-4">
                        <div className="aspect-[4/3] w-28 mx-auto rounded overflow-hidden border border-silk-gray/10 shadow-sm relative">
                          <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                          className="text-[9px] uppercase tracking-widest text-red-400 hover:underline font-bold z-20 relative"
                        >
                          Clear Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4 text-warm-silver group-hover:text-onyx transition-colors">
                        <p className="text-xs font-bold uppercase tracking-widest">Select Image File</p>
                        <p className="text-[10px] text-warm-silver/60">Drag & drop or click to upload</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Or Direct Image URL</label>
                  <input 
                    type="text" 
                    value={formData.image_url.startsWith('data:') ? '' : formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-alabaster border border-silk-gray/10 p-3 text-onyx outline-none focus:border-onyx transition-all"
                    placeholder="https://..."
                  />
                  <p className="text-[9px] text-warm-silver/50 mt-1 font-light italic">Useful for linking to external image hosts.</p>
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-silk-gray/10 pb-2">
                  <h3 className="text-xs uppercase tracking-widest text-soft-slate font-bold">Length Variants</h3>
                  <button 
                    type="button" 
                    onClick={addLength}
                    className="text-[10px] uppercase tracking-widest text-soft-slate hover:underline font-bold"
                  >
                    + Add Length
                  </button>
                </div>
                
                {formData.lengths.map((len, idx) => (
                  <div key={idx} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-[8px] uppercase tracking-widest text-warm-silver mb-1">Length (e.g. 18")</label>
                      <input 
                        type="text" 
                        value={len.length}
                        onChange={(e) => updateLength(idx, 'length', e.target.value)}
                        className="w-full bg-alabaster border border-silk-gray/10 p-2 text-sm text-onyx outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[8px] uppercase tracking-widest text-warm-silver mb-1">Price (£)</label>
                      <input 
                        type="number" 
                        value={len.price}
                        onChange={(e) => updateLength(idx, 'price', e.target.value)}
                        className="w-full bg-alabaster border border-silk-gray/10 p-2 text-sm text-onyx outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[8px] uppercase tracking-widest text-warm-silver mb-1">Stock</label>
                      <input 
                        type="number" 
                        value={len.stock}
                        onChange={(e) => updateLength(idx, 'stock', e.target.value)}
                        className="w-full bg-alabaster border border-silk-gray/10 p-2 text-sm text-onyx outline-none"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeLength(idx)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="p_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 bg-alabaster border-silk-gray/10 rounded accent-beige"
                />
                <label htmlFor="p_active" className="text-xs text-warm-silver font-bold uppercase tracking-widest">Active & Visible in Shop</label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-onyx text-alabaster font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-all"
                >
                  <Save size={16} />
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;
