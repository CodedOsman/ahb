import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  image_url?: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'product' | 'service'>('product');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'product',
    image_url: ''
  });

  const [parsingImage, setParsingImage] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }
      setParsingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
        setParsingImage(false);
      };
      reader.onerror = () => {
        setParsingImage(false);
        alert('Failed to load image file');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        type: category.type,
        image_url: category.image_url || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        type: 'product',
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingCategory) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      console.log('Submitting formData:', formData);
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/admin/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category? Products/Services in it will have a NULL category.')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  if (loading) return <div className="text-soft-slate p-8">Loading categories...</div>;

  const filteredCategories = categories.filter(c => c.type === activeTab);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-onyx" style={{ fontFamily: "'Playfair Display', serif" }}>
            Categories
          </h1>
          <p className="text-warm-silver font-light text-sm">Manage product and service categories.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-onyx text-alabaster px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="flex gap-6 mb-6 border-b border-silk-gray/10 pb-2">
        <button
          onClick={() => { setActiveTab('product'); setCurrentPage(1); }}
          className={`pb-2 text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === 'product' ? 'text-onyx border-b-2 border-onyx' : 'text-warm-silver hover:text-soft-slate'}`}
        >
          Product Categories
        </button>
        <button
          onClick={() => { setActiveTab('service'); setCurrentPage(1); }}
          className={`pb-2 text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === 'service' ? 'text-onyx border-b-2 border-onyx' : 'text-warm-silver hover:text-soft-slate'}`}
        >
          Service Categories
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCategories.map((category) => (
          <div key={category.id} className="bg-silk-gray p-6 rounded-lg border border-silk-gray/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-onyx">{category.name}</h3>
                <p className="text-[10px] text-warm-silver">/{category.slug}</p>
              </div>
              <div className="flex gap-2 text-warm-silver">
                <button onClick={() => handleOpenModal(category)} className="hover:text-soft-slate transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(category.id)} className="hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded ${category.type === 'service' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                {category.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-silk-gray/20 rounded hover:bg-silk-gray disabled:opacity-50 disabled:cursor-not-allowed transition-all text-onyx"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-soft-slate">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-silk-gray/20 rounded hover:bg-silk-gray disabled:opacity-50 disabled:cursor-not-allowed transition-all text-onyx"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-alabaster w-full max-w-lg p-8 rounded-lg border border-silk-gray/20 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-soft-slate hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-black text-soft-slate mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Category Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full bg-silk-gray border border-silk-gray/20 p-3 text-onyx focus:border-onyx outline-none transition-colors"
                    required
                    placeholder="e.g. Raw Hair"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Slug</label>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-silk-gray border border-silk-gray/20 p-3 text-onyx focus:border-onyx outline-none transition-colors"
                    required
                    placeholder="e.g. raw-hair"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-silk-gray border border-silk-gray/20 p-3 text-onyx focus:border-onyx outline-none transition-colors"
                  >
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Thumbnail Image</label>
                  <div className="relative group border-2 border-dashed border-silk-gray/20 hover:border-onyx/40 rounded-lg p-6 text-center cursor-pointer transition-all bg-silk-gray">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {parsingImage ? (
                      <div className="space-y-2 py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-onyx border-t-transparent rounded-full mx-auto"></div>
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
                    className="w-full bg-silk-gray border border-silk-gray/20 p-3 text-onyx outline-none focus:border-onyx transition-all"
                    placeholder="https://..."
                  />
                  <p className="text-[9px] text-warm-silver/50 mt-1 font-light italic">Useful for linking to external image hosts.</p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-onyx text-alabaster py-4 font-bold tracking-[0.2em] uppercase text-xs hover:bg-champagne transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesPage;
