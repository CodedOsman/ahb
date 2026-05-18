import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface Setting {
  key: string;
  value: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        const settingsMap = res.data.reduce((acc: any, curr: Setting) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        setSettings(settingsMap);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post('/api/admin/settings', { settings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="text-soft-slate italic">Loading settings...</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
          Site Settings
        </h1>
        <p className="text-warm-silver font-light text-sm">Manage contact information and social media links.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-soft-slate uppercase tracking-widest text-xs font-bold border-b border-silk-gray/10 pb-2">Contact Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Email Address</label>
                <input 
                  type="email" 
                  value={settings.contact_email || ''} 
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Phone Number</label>
                <input 
                  type="text" 
                  value={settings.contact_phone || ''} 
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Address</label>
                <textarea 
                  value={settings.contact_address || ''} 
                  onChange={(e) => handleChange('contact_address', e.target.value)}
                  className="w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all h-24"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-6">
            <h3 className="text-soft-slate uppercase tracking-widest text-xs font-bold border-b border-silk-gray/10 pb-2">Social Media</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Instagram URL</label>
                <input 
                  type="text" 
                  value={settings.social_instagram || ''} 
                  onChange={(e) => handleChange('social_instagram', e.target.value)}
                  className="w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Facebook URL</label>
                <input 
                  type="text" 
                  value={settings.social_facebook || ''} 
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  className="w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Twitter/X URL</label>
                <input 
                  type="text" 
                  value={settings.social_twitter || ''} 
                  onChange={(e) => handleChange('social_twitter', e.target.value)}
                  className="w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-onyx text-alabaster font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
