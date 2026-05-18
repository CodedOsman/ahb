import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Save, Scissors } from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: number;
  category_id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
  is_active: boolean;
  category_name?: string;
}

const ServicesAdmin: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    category_id: 1,
    title: '',
    description: '',
    price: '',
    image_url: '',
    is_active: true
  });

  const [parsingImage, setParsingImage] = useState(false);

  const handleServiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const [servicesRes, categoriesRes] = await Promise.all([
        axios.get('/api/services'),
        axios.get('/api/categories')
      ]);
      setServices(servicesRes.data);
      setCategories(categoriesRes.data.filter((c: any) => c.type === 'service'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service: Service | null = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        category_id: service.category_id,
        title: service.title,
        description: service.description,
        price: service.price,
        image_url: service.image_url,
        is_active: !!service.is_active
      });
    } else {
      setEditingService(null);
      setFormData({
        category_id: categories[0]?.id || 1,
        title: '',
        description: '',
        price: '',
        image_url: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    try {
      if (editingService) {
        await axios.put(`/api/admin/services/${editingService.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Service updated successfully');
      } else {
        await axios.post('/api/admin/services', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Service created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`/api/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Service deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
            Services
          </h1>
          <p className="text-warm-silver font-light text-sm">Manage your salon service menu.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-2 bg-onyx text-alabaster font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-all"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="text-soft-slate italic">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-silk-gray p-4 rounded-lg border border-silk-gray/10 flex gap-4 group hover:border-silk-gray/30 transition-all">
              <div className="w-20 h-20 bg-alabaster rounded flex items-center justify-center text-soft-slate/20 overflow-hidden flex-shrink-0">
                {service.image_url ? (
                  <img src={service.image_url} className="w-full h-full object-cover" />
                ) : (
                  <Scissors size={32} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-onyx mb-0.5 truncate">{service.title}</h3>
                <p className="text-[10px] text-soft-slate uppercase tracking-widest font-bold mb-2">
                  {service.category_name || 'Service'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <span className="text-onyx font-bold">£{service.price}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${service.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenModal(service)}
                      className="p-1.5 text-warm-silver hover:text-soft-slate hover:bg-white/5 rounded transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
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
          <div className="relative bg-silk-gray w-full max-w-2xl p-8 rounded-lg border border-silk-gray/20 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-onyx" style={{ fontFamily: "'Playfair Display', serif" }}>
                {editingService ? 'Edit Service' : 'Add New Service'}
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
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Service Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-alabaster border border-silk-gray/10 p-3 text-onyx outline-none focus:border-onyx transition-all"
                    placeholder="e.g. Silk Press"
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
                  placeholder="Describe the service..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Base Price (£)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-alabaster border border-silk-gray/10 p-3 text-onyx outline-none focus:border-onyx transition-all"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Service Image</label>
                  <div className="relative group border-2 border-dashed border-silk-gray/20 hover:border-champagne/40 rounded-lg p-6 text-center cursor-pointer transition-all bg-alabaster">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleServiceFileChange}
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

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 bg-alabaster border-silk-gray/10 rounded accent-beige"
                />
                <label htmlFor="is_active" className="text-xs text-warm-silver font-bold uppercase tracking-widest">Active & Visible on Site</label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-onyx text-alabaster font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-all"
                >
                  <Save size={16} />
                  {editingService ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesAdmin;
