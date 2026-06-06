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
  const [activeTab, setActiveTab] = useState<'General' | 'Homepage' | 'Services' | 'About'>('General');

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

  const inputClass = "w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all";
  const textareaClass = "w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all h-24 resize-y";
  const labelClass = "block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold";
  const sectionHeadClass = "text-soft-slate uppercase tracking-widest text-xs font-bold border-b border-silk-gray/10 pb-2 mb-4";

  if (loading) return <div className="text-soft-slate italic">Loading settings...</div>;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
          Site Settings
        </h1>
        <p className="text-warm-silver font-light text-sm">Manage all editable content across the website.</p>
      </div>

      <div className="flex gap-6 mb-8 border-b border-silk-gray/10 pb-2 overflow-x-auto hide-scrollbar">
        {['General', 'Homepage', 'Services', 'About'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 whitespace-nowrap text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === tab ? 'text-onyx border-b-2 border-onyx' : 'text-warm-silver hover:text-soft-slate'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-12">

        {activeTab === 'General' && (
          <>
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" value={settings.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="text" value={settings.contact_phone || ''} onChange={(e) => handleChange('contact_phone', e.target.value)} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address</label>
                  <textarea value={settings.contact_address || ''} onChange={(e) => handleChange('contact_address', e.target.value)} className={textareaClass} />
                </div>
              </div>
            </div>

            {/* Admin Configuration */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>Admin Notifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>Notification Email Address (for orders & reviews)</label>
                  <input type="email" value={settings.admin_notification_email || ''} onChange={(e) => handleChange('admin_notification_email', e.target.value)} className={inputClass} placeholder="admin@asantey.com" />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Instagram URL</label>
                  <input type="text" value={settings.social_instagram || ''} onChange={(e) => handleChange('social_instagram', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>TikTok URL</label>
                  <input type="text" value={settings.social_tiktok || ''} onChange={(e) => handleChange('social_tiktok', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Facebook URL</label>
                  <input type="text" value={settings.social_facebook || ''} onChange={(e) => handleChange('social_facebook', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Homepage' && (
          <>
            {/* Homepage Hero */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>Homepage — Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Hero Title</label>
                  <input type="text" value={settings.hero_title || ''} onChange={(e) => handleChange('hero_title', e.target.value)} className={inputClass} placeholder="The Art of Elegance" />
                </div>
                <div>
                  <label className={labelClass}>Hero Subtitle</label>
                  <textarea value={settings.hero_subtitle || ''} onChange={(e) => handleChange('hero_subtitle', e.target.value)} className={textareaClass} placeholder="Experience luxury hair transformation..." />
                </div>
              </div>
            </div>

            {/* Homepage Services Section */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>Homepage — Services Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Section Label (small caps above heading)</label>
                  <input type="text" value={settings.services_section_label || ''} onChange={(e) => handleChange('services_section_label', e.target.value)} className={inputClass} placeholder="EXPERTISE" />
                </div>
                <div>
                  <label className={labelClass}>Section Title</label>
                  <input type="text" value={settings.services_section_title || ''} onChange={(e) => handleChange('services_section_title', e.target.value)} className={inputClass} placeholder="Our Services" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Section Subtitle</label>
                  <textarea value={settings.services_section_subtitle || ''} onChange={(e) => handleChange('services_section_subtitle', e.target.value)} className={textareaClass} placeholder="Discover our comprehensive range..." />
                </div>
              </div>
            </div>

            {/* Homepage Shop Section */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>Homepage — Shop Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Section Label</label>
                  <input type="text" value={settings.shop_section_label || ''} onChange={(e) => handleChange('shop_section_label', e.target.value)} className={inputClass} placeholder="CURATED COLLECTION" />
                </div>
                <div>
                  <label className={labelClass}>Section Title</label>
                  <input type="text" value={settings.shop_section_title || ''} onChange={(e) => handleChange('shop_section_title', e.target.value)} className={inputClass} placeholder="Asantey Shop" />
                </div>
                <div>
                  <label className={labelClass}>Subtitle (Category View)</label>
                  <textarea value={settings.shop_section_subtitle_categories || ''} onChange={(e) => handleChange('shop_section_subtitle_categories', e.target.value)} className={textareaClass} placeholder="Explore our curated collections..." />
                </div>
                <div>
                  <label className={labelClass}>Subtitle (Product View)</label>
                  <textarea value={settings.shop_section_subtitle_products || ''} onChange={(e) => handleChange('shop_section_subtitle_products', e.target.value)} className={textareaClass} placeholder="Browse our premium products..." />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Services' && (
          <>
            {/* Services Page */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>Services Page</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Page Title</label>
                  <input type="text" value={settings.services_page_title || ''} onChange={(e) => handleChange('services_page_title', e.target.value)} className={inputClass} placeholder="Our Services" />
                </div>
                <div>
                  <label className={labelClass}>Page Subtitle</label>
                  <textarea value={settings.services_page_subtitle || ''} onChange={(e) => handleChange('services_page_subtitle', e.target.value)} className={textareaClass} placeholder="From intricate braiding..." />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'About' && (
          <>
            {/* About Page */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>About Page — Hero</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Hero Title</label>
                  <input type="text" value={settings.about_hero_title || ''} onChange={(e) => handleChange('about_hero_title', e.target.value)} className={inputClass} placeholder="The Art of Sophistication" />
                </div>
                <div>
                  <label className={labelClass}>Hero Subtitle</label>
                  <textarea value={settings.about_hero_subtitle || ''} onChange={(e) => handleChange('about_hero_subtitle', e.target.value)} className={textareaClass} placeholder="Asantey Luxury Salon was born..." />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={sectionHeadClass}>About Page — About Us Content</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Paragraph 1</label>
                  <textarea value={settings.about_content_p1 || ''} onChange={(e) => handleChange('about_content_p1', e.target.value)} className="w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all h-28 resize-y" />
                </div>
                <div>
                  <label className={labelClass}>Paragraph 2</label>
                  <textarea value={settings.about_content_p2 || ''} onChange={(e) => handleChange('about_content_p2', e.target.value)} className="w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all h-28 resize-y" />
                </div>
                <div>
                  <label className={labelClass}>Paragraph 3</label>
                  <textarea value={settings.about_content_p3 || ''} onChange={(e) => handleChange('about_content_p3', e.target.value)} className="w-full bg-silk-gray border border-silk-gray/10 p-3 text-sm text-onyx outline-none focus:border-onyx transition-all h-28 resize-y" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={sectionHeadClass}>About Page — Client Gallery Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Gallery Title</label>
                  <input type="text" value={settings.gallery_section_title || ''} onChange={(e) => handleChange('gallery_section_title', e.target.value)} className={inputClass} placeholder="Client Gallery" />
                </div>
                <div>
                  <label className={labelClass}>Gallery Subtitle</label>
                  <textarea value={settings.gallery_section_subtitle || ''} onChange={(e) => handleChange('gallery_section_subtitle', e.target.value)} className={textareaClass} placeholder="Real transformations..." />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-onyx text-alabaster font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
