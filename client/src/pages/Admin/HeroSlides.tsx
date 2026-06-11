import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, MoveUp, MoveDown } from 'lucide-react';
import { toast } from 'sonner';

interface HeroSlide {
  id: number;
  image_url: string;
  headline?: string;
  subtitle?: string;
  button_1_text?: string;
  button_1_link?: string;
  button_2_text?: string;
  button_2_link?: string;
  is_active: boolean;
  display_order: number;
}

const HeroSlides: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  
  const [formData, setFormData] = useState({
    image_url: '',
    headline: '',
    subtitle: '',
    button_1_text: '',
    button_1_link: '',
    button_2_text: '',
    button_2_link: '',
    is_active: true,
    display_order: 0
  });

  const [parsingImage, setParsingImage] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('/api/admin/hero-slides', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlides(res.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        image_url: slide.image_url,
        headline: slide.headline || '',
        subtitle: slide.subtitle || '',
        button_1_text: slide.button_1_text || '',
        button_1_link: slide.button_1_link || '',
        button_2_text: slide.button_2_text || '',
        button_2_link: slide.button_2_link || '',
        is_active: slide.is_active,
        display_order: slide.display_order
      });
    } else {
      setEditingSlide(null);
      setFormData({
        image_url: '',
        headline: '',
        subtitle: '',
        button_1_text: '',
        button_1_link: '',
        button_2_text: '',
        button_2_link: '',
        is_active: true,
        display_order: slides.length
      });
    }
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
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
        toast.error('Failed to load image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error('Image is required');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (editingSlide) {
        await axios.put(`/api/admin/hero-slides/${editingSlide.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Slide updated successfully');
      } else {
        await axios.post('/api/admin/hero-slides', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Slide created successfully');
      }
      setIsModalOpen(false);
      fetchSlides();
    } catch (error: any) {
      console.error('Error saving slide:', error);
      toast.error(error.response?.data?.error || 'Failed to save slide');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`/api/admin/hero-slides/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Slide deleted successfully');
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`/api/admin/hero-slides/${slide.id}`, { ...slide, is_active: !slide.is_active }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSlides();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="p-8 text-onyx font-bold">Loading...</div>;
  }

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-onyx mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Hero Slides</h1>
          <p className="text-warm-silver font-bold tracking-widest uppercase text-xs">Manage Homepage Slideshow</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-onyx text-alabaster px-6 py-3 font-bold tracking-[0.2em] text-xs hover:bg-champagne transition-all"
        >
          <Plus size={16} /> ADD SLIDE
        </button>
      </div>

      <div className="bg-white border border-silk-gray/30 p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <div key={slide.id} className="border border-silk-gray/30 group relative">
              <div className="aspect-[16/9] w-full bg-silk-gray relative overflow-hidden">
                <img src={slide.image_url} alt="Slide" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={() => handleOpenModal(slide)} className="bg-white text-onyx p-2 rounded hover:bg-champagne">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(slide.id)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-alabaster">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-warm-silver uppercase">
                    Order: {slide.display_order}
                  </span>
                  <button 
                    onClick={() => handleToggleActive(slide)}
                    className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {slide.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <h4 className="font-bold text-onyx text-sm truncate">{slide.headline || 'Default Headline'}</h4>
              </div>
            </div>
          ))}
          {slides.length === 0 && (
            <div className="col-span-full text-center py-12 text-warm-silver">
              No hero slides found. Add one to get started!
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-onyx/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-alabaster w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-soft-slate hover:text-onyx transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-black text-onyx mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                {editingSlide ? 'Edit Slide' : 'Add Slide'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Slide Image (Required)</label>
                  <div className="relative group border-2 border-dashed border-silk-gray hover:border-onyx rounded-none p-6 text-center cursor-pointer transition-all bg-white">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {parsingImage ? (
                      <div className="space-y-2 py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-onyx border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-[10px] text-warm-silver uppercase tracking-wider">Loading image...</p>
                      </div>
                    ) : formData.image_url ? (
                      <div className="relative w-full h-48">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover rounded-none" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
                          <p className="text-white text-xs font-bold uppercase tracking-wider">Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-8">
                        <div className="w-12 h-12 bg-silk-gray/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Plus className="text-warm-silver" />
                        </div>
                        <p className="text-xs font-bold text-onyx tracking-widest uppercase">Click or drag image to upload</p>
                        <p className="text-[10px] text-warm-silver tracking-wider uppercase">High quality horizontal image recommended</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Display Order</label>
                    <input 
                      type="number" 
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                      className="w-full bg-white border border-silk-gray p-3 text-onyx focus:border-onyx outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Status</label>
                    <select 
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                      className="w-full bg-white border border-silk-gray p-3 text-onyx focus:border-onyx outline-none transition-colors"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-silk-gray/50 pt-6 mt-6">
                  <h3 className="text-xs font-bold text-onyx uppercase tracking-widest mb-4">Optional Overrides</h3>
                  <p className="text-[10px] text-warm-silver mb-4 leading-relaxed">
                    Leave these blank to use the default hero text. If you provide values here, they will replace the default text when this slide is active.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Headline</label>
                      <input 
                        type="text" 
                        value={formData.headline}
                        onChange={(e) => setFormData({...formData, headline: e.target.value})}
                        className="w-full bg-white border border-silk-gray p-3 text-onyx focus:border-onyx outline-none transition-colors"
                        placeholder="e.g. The Art of Elegance"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Subtitle</label>
                      <textarea 
                        value={formData.subtitle}
                        onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                        className="w-full bg-white border border-silk-gray p-3 text-onyx focus:border-onyx outline-none transition-colors h-24 resize-none"
                        placeholder="Short descriptive text..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Button 1 Text</label>
                        <input 
                          type="text" 
                          value={formData.button_1_text}
                          onChange={(e) => setFormData({...formData, button_1_text: e.target.value})}
                          className="w-full bg-white border border-silk-gray p-3 text-onyx focus:border-onyx outline-none transition-colors"
                          placeholder="e.g. BOOK APPOINTMENT"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Button 1 Link</label>
                        <input 
                          type="text" 
                          value={formData.button_1_link}
                          onChange={(e) => setFormData({...formData, button_1_link: e.target.value})}
                          className="w-full bg-white border border-silk-gray p-3 text-onyx focus:border-onyx outline-none transition-colors"
                          placeholder="e.g. https://asanteyhair.as.me/"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Button 2 Text</label>
                        <input 
                          type="text" 
                          value={formData.button_2_text}
                          onChange={(e) => setFormData({...formData, button_2_text: e.target.value})}
                          className="w-full bg-white border border-silk-gray p-3 text-onyx focus:border-onyx outline-none transition-colors"
                          placeholder="e.g. BUY HAIR"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-2 font-bold">Button 2 Link</label>
                        <input 
                          type="text" 
                          value={formData.button_2_link}
                          onChange={(e) => setFormData({...formData, button_2_link: e.target.value})}
                          className="w-full bg-white border border-silk-gray p-3 text-onyx focus:border-onyx outline-none transition-colors"
                          placeholder="e.g. /shop"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-onyx text-alabaster font-bold tracking-[0.2em] hover:bg-champagne transition-all duration-300"
                >
                  SAVE SLIDE
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlides;
