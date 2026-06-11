import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface Setting {
  key: string;
  value: string;
}

const PoliciesEditor: React.FC<{ policiesJson: string, onChange: (val: string) => void }> = ({ policiesJson, onChange }) => {
  const defaultPolicies = [
    {
      icon: '💳',
      title: 'Deposits & Payments',
      content: [
        'A 20% non-refundable deposit is required to book and will be deducted from your final bill.',
        'We accept Cash, Apple Pay, Card & PayPal.',
      ],
    },
    {
      icon: '🕐',
      title: 'Late Arrivals',
      content: [
        '20 minutes late = £10 late fee added to your appointment.',
        '25–30 minutes late = appointment will be cancelled.',
      ],
    },
    {
      icon: '💇',
      title: 'Hair Extensions',
      content: [
        'Hair extensions are available as an add-on service. Your own extensions are also accepted — please ensure it is pre-stretched X-Pression.',
        'Drop us a message for custom colour enquiries.',
      ],
    },
    {
      icon: '🏠',
      title: 'Home Service',
      content: [
        'Home service is exclusively provided to individuals who cannot travel due to circumstances like disability, pregnancy, childcare responsibilities, or other health-related concerns.',
      ],
    },
  ];

  let initial = defaultPolicies;
  try {
    if (policiesJson) initial = JSON.parse(policiesJson);
  } catch(e) {}

  const [policies, setPolicies] = useState<any[]>(initial);

  const save = (newPolicies: any[]) => {
    setPolicies(newPolicies);
    onChange(JSON.stringify(newPolicies));
  };

  const addPolicy = () => {
    save([...policies, { icon: '📝', title: 'New Policy', content: ['Policy detail here'] }]);
  };

  const updatePolicy = (index: number, field: string, value: any) => {
    const newPolicies = [...policies];
    newPolicies[index][field] = value;
    save(newPolicies);
  };

  const removePolicy = (index: number) => {
    const newPolicies = policies.filter((_, i) => i !== index);
    save(newPolicies);
  };

  const updateContent = (pIndex: number, text: string) => {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    updatePolicy(pIndex, 'content', lines);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-silk-gray/10 pb-2">
        <h3 className="text-soft-slate uppercase tracking-widest text-xs font-bold">Manage Policies</h3>
        <button type="button" onClick={addPolicy} className="text-xs font-bold text-onyx bg-silk-gray px-3 py-1 hover:bg-champagne transition-all">
          + Add Policy
        </button>
      </div>
      {policies.map((p, i) => (
        <div key={i} className="border border-silk-gray p-4 space-y-4 bg-white relative">
          <button type="button" onClick={() => removePolicy(i)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-xs">Remove</button>
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Icon / Image</label>
              <div className="relative w-full h-12 bg-silk-gray border border-silk-gray/10 flex items-center justify-center cursor-pointer hover:border-onyx transition-all overflow-hidden group">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Image size must be less than 2MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updatePolicy(i, 'icon', reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {(p.icon && (p.icon.startsWith('data:') || p.icon.startsWith('http'))) ? (
                  <img src={p.icon} alt="Icon" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-xl">{p.icon || 'Upload'}</span>
                )}
                <div className="absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-[8px] text-white font-bold tracking-widest uppercase">Change</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Title</label>
              <input type="text" value={p.title} onChange={(e) => updatePolicy(i, 'title', e.target.value)} className="w-full bg-silk-gray border border-silk-gray/10 p-2 text-sm outline-none focus:border-onyx transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Content (one item per line)</label>
            <textarea value={(p.content || []).join('\n')} onChange={(e) => updateContent(i, e.target.value)} className="w-full bg-silk-gray border border-silk-gray/10 p-2 text-sm outline-none focus:border-onyx transition-all h-24 resize-y" />
          </div>
        </div>
      ))}
    </div>
  );
};

const EmailImageUpload: React.FC<{
  label: string;
  url: string;
  align: string;
  width: string;
  onChangeUrl: (val: string) => void;
  onChangeAlign: (val: string) => void;
  onChangeWidth: (val: string) => void;
}> = ({ label, url, align, width, onChangeUrl, onChangeAlign, onChangeWidth }) => {
  return (
    <div className="space-y-2 border border-silk-gray/20 p-4 bg-silk-gray/5">
      <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">{label} Image (Optional)</label>
      
      {url ? (
        <div className="space-y-4">
          <div className="relative w-full h-24 bg-white border border-silk-gray flex items-center justify-center overflow-hidden group">
            <img src={url} alt={label} className="max-h-full object-contain" />
            <div className="absolute inset-0 bg-black/50 transition-opacity flex flex-col items-center justify-center gap-2">
              <button type="button" onClick={() => onChangeUrl('')} className="text-xs text-white bg-red-500 px-3 py-1 font-bold tracking-wider uppercase hover:bg-red-600">Remove</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Alignment</label>
              <select value={align || 'center'} onChange={(e) => onChangeAlign(e.target.value)} className="w-full bg-white border border-silk-gray/20 p-2 text-sm outline-none focus:border-onyx transition-all">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-warm-silver mb-1 font-bold">Max Width</label>
              <select value={width || '100%'} onChange={(e) => onChangeWidth(e.target.value)} className="w-full bg-white border border-silk-gray/20 p-2 text-sm outline-none focus:border-onyx transition-all">
                <option value="100%">100% (Full Width)</option>
                <option value="400px">400px (Large)</option>
                <option value="250px">250px (Medium)</option>
                <option value="150px">150px (Small)</option>
                <option value="80px">80px (Tiny/Logo)</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-12 bg-white border border-dashed border-silk-gray/50 flex items-center justify-center cursor-pointer hover:border-onyx transition-all group">
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 2 * 1024 * 1024) {
                  alert('Image size must be less than 2MB');
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                  onChangeUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <span className="text-xs text-warm-silver font-bold uppercase tracking-wider group-hover:text-onyx transition-colors">+ Upload Image</span>
        </div>
      )}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsingLogo, setParsingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<'General' | 'Homepage' | 'Services' | 'About' | 'Policies' | 'Emails' | 'Account'>('General');

  const [account, setAccount] = useState({ username: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

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

    const adminStr = localStorage.getItem('admin_user');
    if (adminStr) {
      try {
        const adminData = JSON.parse(adminStr);
        setAccount({ username: adminData.username || '', email: adminData.email || '' });
      } catch(e) {}
    }
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.put('/api/admin/profile', account, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post('/api/admin/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

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
        {['General', 'Homepage', 'Services', 'About', 'Policies', 'Emails', 'Account'].map(tab => (
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

      {activeTab !== 'Account' ? (
      <form onSubmit={handleSave} className="space-y-12">

        {activeTab === 'General' && (
          <>
            {/* General Site Info */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>General Site Info</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={labelClass}>Site Logo</label>
                  <div className="relative group border-2 border-dashed border-silk-gray hover:border-onyx rounded-none p-6 text-center cursor-pointer transition-all bg-white mb-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Logo size must be less than 5MB');
                            return;
                          }
                          setParsingLogo(true);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleChange('site_logo', reader.result as string);
                            setParsingLogo(false);
                          };
                          reader.onerror = () => {
                            setParsingLogo(false);
                            toast.error('Failed to load logo file');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {parsingLogo ? (
                      <div className="py-4 text-[10px] text-warm-silver tracking-wider uppercase font-bold animate-pulse">Loading image...</div>
                    ) : settings.site_logo ? (
                      <div className="relative w-full h-24 flex items-center justify-center bg-silk-gray/20">
                        <img src={settings.site_logo} alt="Site Logo" className="h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity pointer-events-none">
                          <p className="text-white text-[10px] font-bold uppercase tracking-wider">Change Logo</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-[10px] text-warm-silver tracking-wider uppercase font-bold">Click or drag image to upload logo</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Footer Description (under logo)</label>
                  <textarea value={settings.footer_description || ''} onChange={(e) => handleChange('footer_description', e.target.value)} className={textareaClass} placeholder="Luxury hair and braiding services..." />
                </div>
              </div>
            </div>

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
                <div>
                  <label className={labelClass}>Pinterest URL</label>
                  <input type="text" value={settings.social_pinterest || ''} onChange={(e) => handleChange('social_pinterest', e.target.value)} className={inputClass} />
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

        {activeTab === 'Policies' && (
          <PoliciesEditor 
             policiesJson={settings.site_policies || ''} 
             onChange={(val) => handleChange('site_policies', val)} 
          />
        )}

        {activeTab === 'Emails' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Editor */}
            <div className="space-y-4">
              <h3 className={sectionHeadClass}>Order Confirmation Email</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Subject Line</label>
                  <input type="text" value={settings.email_customer_subject || 'Order Confirmation - Asantey Hair & Beauty Salon'} onChange={(e) => handleChange('email_customer_subject', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Header Text</label>
                  <input type="text" value={settings.email_header_text || 'Asantey Hair & Beauty Salon'} onChange={(e) => handleChange('email_header_text', e.target.value)} className={inputClass} />
                </div>
                <EmailImageUpload
                  label="Header"
                  url={settings.email_header_image_url || ''}
                  align={settings.email_header_image_align || 'center'}
                  width={settings.email_header_image_width || '100%'}
                  onChangeUrl={(val) => handleChange('email_header_image_url', val)}
                  onChangeAlign={(val) => handleChange('email_header_image_align', val)}
                  onChangeWidth={(val) => handleChange('email_header_image_width', val)}
                />
                <div>
                  <label className={labelClass}>Greeting (use {`{customerName}`} for dynamic name)</label>
                  <input type="text" value={settings.email_greeting || 'Dear {customerName},'} onChange={(e) => handleChange('email_greeting', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Body Text</label>
                  <textarea value={settings.email_body_text || 'Thank you for choosing Asantey Hair & Beauty Salon. We are delighted to confirm that your order and payment have been successfully received.'} onChange={(e) => handleChange('email_body_text', e.target.value)} className={textareaClass} />
                </div>
                <EmailImageUpload
                  label="Body"
                  url={settings.email_body_image_url || ''}
                  align={settings.email_body_image_align || 'center'}
                  width={settings.email_body_image_width || '100%'}
                  onChangeUrl={(val) => handleChange('email_body_image_url', val)}
                  onChangeAlign={(val) => handleChange('email_body_image_align', val)}
                  onChangeWidth={(val) => handleChange('email_body_image_width', val)}
                />
                <div>
                  <label className={labelClass}>Footer Text</label>
                  <textarea value={settings.email_footer_text || 'We will notify you as soon as your order ships. If you have any questions, please reply directly to this email.'} onChange={(e) => handleChange('email_footer_text', e.target.value)} className={textareaClass} />
                </div>
                <EmailImageUpload
                  label="Footer"
                  url={settings.email_footer_image_url || ''}
                  align={settings.email_footer_image_align || 'center'}
                  width={settings.email_footer_image_width || '100%'}
                  onChangeUrl={(val) => handleChange('email_footer_image_url', val)}
                  onChangeAlign={(val) => handleChange('email_footer_image_align', val)}
                  onChangeWidth={(val) => handleChange('email_footer_image_width', val)}
                />
                <div>
                  <label className={labelClass}>Closing Text</label>
                  <textarea value={settings.email_closing_text || 'Warm regards,\nThe Asantey Hair & Beauty Salon Team'} onChange={(e) => handleChange('email_closing_text', e.target.value)} className={textareaClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Primary Text Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.email_primary_color || '#000000'} onChange={(e) => handleChange('email_primary_color', e.target.value)} className="w-10 h-10 border-0 p-0" />
                      <input type="text" value={settings.email_primary_color || '#000000'} onChange={(e) => handleChange('email_primary_color', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Accent Background Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.email_accent_color || '#f9f9f9'} onChange={(e) => handleChange('email_accent_color', e.target.value)} className="w-10 h-10 border-0 p-0" />
                      <input type="text" value={settings.email_accent_color || '#f9f9f9'} onChange={(e) => handleChange('email_accent_color', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="sticky top-8 bg-silk-gray/10 border border-silk-gray/20 p-4">
              <h3 className={sectionHeadClass}>Live Preview</h3>
              <div 
                className="bg-white border border-[#eaeaea] mx-auto overflow-y-auto"
                style={{
                  maxWidth: '100%',
                  height: '600px',
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
                }}
              >
                <div style={{ padding: '40px 20px' }}>
                  
                  {settings.email_header_image_url && (
                    <div style={{ textAlign: (settings.email_header_image_align as any) || 'center', marginBottom: '20px' }}>
                      <img src={settings.email_header_image_url} alt="Header" style={{ maxWidth: settings.email_header_image_width || '100%', height: 'auto' }} />
                    </div>
                  )}

                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: settings.email_primary_color || '#000000', fontSize: '24px', fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
                      {settings.email_header_text || 'Asantey Hair & Beauty Salon'}
                    </h1>
                    <div style={{ height: '1px', backgroundColor: settings.email_primary_color || '#000000', width: '50px', margin: '20px auto' }}></div>
                  </div>
                  <div style={{ color: '#333333', fontSize: '14px', lineHeight: 1.6 }}>
                    <p style={{ fontSize: '16px', fontWeight: 400, color: settings.email_primary_color || '#000000', whiteSpace: 'pre-wrap' }}>
                      {(settings.email_greeting || 'Dear {customerName},').replace('{customerName}', 'Jane Doe')}
                    </p>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{settings.email_body_text || 'Thank you for choosing Asantey Hair & Beauty Salon. We are delighted to confirm that your order and payment have been successfully received.'}</p>
                    
                    {settings.email_body_image_url && (
                      <div style={{ textAlign: (settings.email_body_image_align as any) || 'center', margin: '20px 0' }}>
                        <img src={settings.email_body_image_url} alt="Body" style={{ maxWidth: settings.email_body_image_width || '100%', height: 'auto' }} />
                      </div>
                    )}

                    <div style={{ backgroundColor: settings.email_accent_color || '#f9f9f9', padding: '20px', margin: '30px 0', borderLeft: `3px solid ${settings.email_primary_color || '#000000'}` }}>
                      <p style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#666666' }}>Order Summary</p>
                      
                      {/* Dummy Items Table for Preview */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '10px 0', borderBottom: '1px solid #eaeaea' }}>
                              <strong style={{ color: settings.email_primary_color || '#000000' }}>Luxury Silky Straight Bundle</strong> <span style={{ color: '#999999', fontSize: '12px', marginLeft: '5px' }}>(Hair)</span><br/>
                              <span style={{ color: '#666666', fontSize: '12px' }}>Qty: 2 | Price: £65.00</span>
                            </td>
                            <td style={{ padding: '10px 0', borderBottom: '1px solid #eaeaea', textAlign: 'right', color: settings.email_primary_color || '#000000' }}>
                              £130.00
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '10px 0', borderTop: `2px solid ${settings.email_primary_color || '#000000'}`, textAlign: 'right' }}>
                              <strong style={{ color: '#666666', fontSize: '14px' }}>Subtotal:</strong>
                            </td>
                            <td style={{ padding: '10px 0', borderTop: `2px solid ${settings.email_primary_color || '#000000'}`, textAlign: 'right', color: settings.email_primary_color || '#000000' }}>
                              £130.00
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', textAlign: 'right' }}>
                              <strong style={{ color: '#666666', fontSize: '14px' }}>Delivery Fee:</strong>
                            </td>
                            <td style={{ padding: '5px 0', textAlign: 'right', color: settings.email_primary_color || '#000000' }}>
                              £4.99
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eaeaea', fontSize: '14px', color: '#666666' }}>
                        <strong style={{ color: settings.email_primary_color || '#000000' }}>Shipping Address:</strong><br/>
                        123 Example Street, London, E1 4XX, GB
                      </div>

                      <p style={{ margin: '20px 0 0 0', fontSize: '18px', color: settings.email_primary_color || '#000000', textAlign: 'right' }}>
                        <strong>Total: £134.99</strong>
                      </p>
                    </div>

                    <p style={{ whiteSpace: 'pre-wrap' }}>{settings.email_footer_text || 'We will notify you as soon as your order ships. If you have any questions, please reply directly to this email.'}</p>
                    <p style={{ marginTop: '40px', color: '#666666', whiteSpace: 'pre-wrap' }}>{settings.email_closing_text || 'Warm regards,\nThe Asantey Hair & Beauty Salon Team'}</p>

                    {settings.email_footer_image_url && (
                      <div style={{ textAlign: (settings.email_footer_image_align as any) || 'center', marginTop: '30px' }}>
                        <img src={settings.email_footer_image_url} alt="Footer" style={{ maxWidth: settings.email_footer_image_width || '100%', height: 'auto' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      ) : (
        <div className="space-y-12">
          {/* Profile Form */}
          <form onSubmit={handleProfileSave} className="space-y-4">
            <h3 className={sectionHeadClass}>Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Username</label>
                <input type="text" value={account.username} onChange={(e) => setAccount({ ...account, username: e.target.value })} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} className={inputClass} required />
              </div>
            </div>
            <div className="flex justify-start pt-4">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-onyx text-alabaster font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-all disabled:opacity-50">
                <Save size={16} />
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>

          {/* Password Form */}
          <form onSubmit={handlePasswordSave} className="space-y-4 pt-8 border-t border-silk-gray/10">
            <h3 className={sectionHeadClass}>Change Password</h3>
            <div className="grid grid-cols-1 gap-6 max-w-md">
              <div>
                <label className={labelClass}>Current Password</label>
                <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className={inputClass} required minLength={6} />
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className={inputClass} required minLength={6} />
              </div>
            </div>
            <div className="flex justify-start pt-4">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-onyx text-alabaster font-bold text-xs uppercase tracking-widest hover:bg-champagne transition-all disabled:opacity-50">
                <Save size={16} />
                {saving ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
