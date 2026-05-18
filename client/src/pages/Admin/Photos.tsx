import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, X, Image as ImageIcon, Upload, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface ClientPhoto {
  id: number;
  image_url: string;
  caption: string;
  created_at: string;
}

const PhotosAdmin: React.FC = () => {
  const [photos, setPhotos] = useState<ClientPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    image_url: '',
    caption: ''
  });

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get('/api/client-photos');
      if (Array.isArray(res.data)) {
        setPhotos(res.data);
      } else {
        console.warn('Client photos API did not return an array:', res.data);
        setPhotos([]);
      }
    } catch (error) {
      console.error('Error fetching client photos:', error);
      toast.error('Failed to load gallery photos');
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Image size must be less than 50MB');
        return;
      }
      
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
        setUploading(false);
        toast.success('Image parsed successfully');
      };
      reader.onerror = () => {
        setUploading(false);
        toast.error('Failed to parse image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error('Please upload an image or enter an image URL');
      return;
    }

    const token = localStorage.getItem('admin_token');
    try {
      await axios.post('/api/admin/client-photos', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Photo added to client gallery successfully');
      setIsModalOpen(false);
      setFormData({ image_url: '', caption: '' });
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading client photo:', error);
      toast.error('Failed to save client photo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this photo from the client gallery?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`/api/admin/client-photos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Photo removed from gallery');
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const displayPhotos = Array.isArray(photos) ? photos : [];

  return (
    <div className="space-y-8 p-6 text-foreground">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-widest text-primary italic" style={{ fontFamily: "'Playfair Display', serif" }}>
            Client Photo Gallery
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the beautiful photos of your clients shown on the About page.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all hover:opacity-90 active:scale-95 shadow-md shadow-accent/15"
        >
          <Plus size={16} /> Add Client Photo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-accent" size={32} />
        </div>
      ) : displayPhotos.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <ImageIcon className="mx-auto text-muted-foreground/30 mb-4" size={48} />
          <h3 className="text-lg font-bold text-muted-foreground">No Photos Uploaded</h3>
          <p className="text-muted-foreground/75 text-sm mt-1">Click the button above to upload your first client photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayPhotos.map((photo) => (
            <div 
              key={photo.id} 
              className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-accent/40 transition-all duration-300 shadow-lg shadow-black/10"
            >
              <div className="aspect-[4/5] overflow-hidden bg-black/10">
                <img 
                  src={photo.image_url} 
                  alt={photo.caption || 'Client photo'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white font-medium text-sm leading-relaxed drop-shadow-md">
                  {photo.caption || 'No caption'}
                </p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                    {photo.created_at && !isNaN(Date.parse(photo.created_at)) 
                      ? new Date(photo.created_at).toLocaleDateString() 
                      : 'Recently added'}
                  </span>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg transition-all active:scale-95"
                    title="Delete Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border bg-black/10">
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                Add New Client Photo
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* File Uploader */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Photo File
                </label>
                <div className="relative group border-2 border-dashed border-border hover:border-accent/40 rounded-xl p-6 text-center cursor-pointer transition-all bg-black/5">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {uploading ? (
                    <div className="space-y-2 py-4">
                      <Loader className="animate-spin mx-auto text-accent" size={28} />
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Parsing image file...</p>
                    </div>
                  ) : formData.image_url ? (
                    <div className="space-y-4">
                      <div className="aspect-[4/3] w-40 mx-auto rounded-lg overflow-hidden border border-border shadow-md">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] text-green-400 font-bold uppercase tracking-widest">✓ Image uploaded & loaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4 text-muted-foreground group-hover:text-foreground transition-colors">
                      <Upload className="mx-auto" size={32} />
                      <p className="text-sm font-medium">Drag & drop or click to upload</p>
                      <p className="text-xs text-muted-foreground/60">Supports PNG, JPG, JPEG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Or enter direct URL */}
              <div className="space-y-2">
                <div className="flex items-center my-2">
                  <hr className="flex-grow border-border" />
                  <span className="px-3 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">OR ENTER IMAGE URL</span>
                  <hr className="flex-grow border-border" />
                </div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Direct Image URL
                </label>
                <input 
                  type="url" 
                  value={formData.image_url.startsWith('data:') ? '' : formData.image_url} 
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/client-hair.jpg"
                  className="w-full bg-black/25 border border-border hover:border-accent/40 focus:border-accent rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                />
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Caption / Stylist Note
                </label>
                <textarea 
                  value={formData.caption} 
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Raw Cambodian Hair 24 inch Silk Press by Stylist Sarah"
                  rows={3}
                  className="w-full bg-black/25 border border-border hover:border-accent/40 focus:border-accent rounded-xl px-4 py-3 text-sm focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-border bg-black/5 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-border hover:bg-white/5 text-foreground py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !formData.image_url}
                  className="flex-1 bg-accent text-accent-foreground disabled:opacity-50 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all hover:opacity-90 active:scale-95 shadow-md shadow-accent/10"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosAdmin;
