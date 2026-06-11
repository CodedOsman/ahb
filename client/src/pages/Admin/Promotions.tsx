import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PromoCode {
  id: number;
  code: string;
  discount_percentage: number;
  valid_until: string | null;
  is_active: boolean;
}

interface Promotion {
  id: number;
  title: string;
  message: string;
  end_time: string | null;
  is_active: boolean;
}

export const PromotionsAdmin: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  
  // Forms
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [codeForm, setCodeForm] = useState({ code: '', discount_percentage: 10, valid_until: '', is_active: true });

  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [promoForm, setPromoForm] = useState({ title: '', message: '', end_time: '', is_active: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const [codesRes, promosRes] = await Promise.all([
        axios.get('/api/admin/promo-codes', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/promotions', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPromoCodes(codesRes.data);
      setPromotions(promosRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load promotions data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCodeModal = (code: PromoCode | null = null) => {
    if (code) {
      setEditingCode(code);
      setCodeForm({
        code: code.code,
        discount_percentage: Number(code.discount_percentage),
        valid_until: code.valid_until ? new Date(code.valid_until).toISOString().slice(0, 16) : '',
        is_active: !!code.is_active
      });
    } else {
      setEditingCode(null);
      setCodeForm({ code: '', discount_percentage: 10, valid_until: '', is_active: true });
    }
    setIsCodeModalOpen(true);
  };

  const handleOpenPromoModal = (promo: Promotion | null = null) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoForm({
        title: promo.title,
        message: promo.message || '',
        end_time: promo.end_time ? new Date(promo.end_time).toISOString().slice(0, 16) : '',
        is_active: !!promo.is_active
      });
    } else {
      setEditingPromo(null);
      setPromoForm({ title: '', message: '', end_time: '', is_active: true });
    }
    setIsPromoModalOpen(true);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    try {
      const payload = {
        ...codeForm,
        valid_until: codeForm.valid_until || null
      };
      if (editingCode) {
        await axios.put(`/api/admin/promo-codes/${editingCode.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Promo code updated');
      } else {
        await axios.post('/api/admin/promo-codes', payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Promo code created');
      }
      setIsCodeModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save promo code');
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    try {
      const payload = {
        ...promoForm,
        end_time: promoForm.end_time || null
      };
      if (editingPromo) {
        await axios.put(`/api/admin/promotions/${editingPromo.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Promotion updated');
      } else {
        await axios.post('/api/admin/promotions', payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Promotion created');
      }
      setIsPromoModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save promotion');
    }
  };

  const handleDeleteCode = async (id: number) => {
    if (!window.confirm('Delete this promo code?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`/api/admin/promo-codes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Promo code deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete promo code');
    }
  };

  const handleDeletePromo = async (id: number) => {
    if (!window.confirm('Delete this promotion?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`/api/admin/promotions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Promotion deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete promotion');
    }
  };

  if (loading) return <div className="text-soft-slate italic">Loading...</div>;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Promotions & Discounts
        </h1>
        <p className="text-warm-silver font-light text-sm mb-8">Manage discount codes and sitewide promotional banners.</p>
      </div>

      {/* Promos Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold uppercase text-onyx">Promotional Banners</h2>
          <button 
            onClick={() => handleOpenPromoModal()}
            className="flex items-center gap-2 px-4 py-2 bg-onyx text-alabaster font-bold text-xs uppercase hover:bg-champagne transition-all"
          >
            <Plus size={16} /> Add Promo Banner
          </button>
        </div>
        <div className="bg-white rounded border border-silk-gray/20 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-silk-gray/10 text-xs uppercase tracking-widest text-soft-slate font-bold border-b border-silk-gray/20">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Message</th>
                <th className="p-4">Ends At</th>
                <th className="p-4">Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promo => (
                <tr key={promo.id} className="border-b border-silk-gray/10 hover:bg-silk-gray/5 last:border-0">
                  <td className="p-4 font-bold text-onyx">{promo.title}</td>
                  <td className="p-4 text-warm-silver">{promo.message}</td>
                  <td className="p-4 text-warm-silver">{promo.end_time ? new Date(promo.end_time).toLocaleString() : 'No expiry'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${promo.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenPromoModal(promo)} className="p-1 text-warm-silver hover:text-onyx transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeletePromo(promo.id)} className="p-1 text-red-400 hover:text-red-500 ml-2 transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-warm-silver italic">No promotional banners found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promo Codes Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold uppercase text-onyx">Discount Codes</h2>
          <button 
            onClick={() => handleOpenCodeModal()}
            className="flex items-center gap-2 px-4 py-2 bg-onyx text-alabaster font-bold text-xs uppercase hover:bg-champagne transition-all"
          >
            <Plus size={16} /> Add Discount Code
          </button>
        </div>
        <div className="bg-white rounded border border-silk-gray/20 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-silk-gray/10 text-xs uppercase tracking-widest text-soft-slate font-bold border-b border-silk-gray/20">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Valid Until</th>
                <th className="p-4">Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map(code => (
                <tr key={code.id} className="border-b border-silk-gray/10 hover:bg-silk-gray/5 last:border-0">
                  <td className="p-4 font-bold text-onyx font-mono">{code.code}</td>
                  <td className="p-4 text-onyx">{code.discount_percentage}%</td>
                  <td className="p-4 text-warm-silver">{code.valid_until ? new Date(code.valid_until).toLocaleString() : 'No expiry'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${code.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {code.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenCodeModal(code)} className="p-1 text-warm-silver hover:text-onyx transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteCode(code.id)} className="p-1 text-red-400 hover:text-red-500 ml-2 transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {promoCodes.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-warm-silver italic">No discount codes found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCodeModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md p-6 rounded shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingCode ? 'Edit Code' : 'New Discount Code'}</h3>
              <button onClick={() => setIsCodeModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-soft-slate mb-1">CODE</label>
                <input type="text" value={codeForm.code} onChange={e => setCodeForm({...codeForm, code: e.target.value})} className="w-full border border-silk-gray p-2 uppercase font-mono" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-soft-slate mb-1">DISCOUNT (%)</label>
                <input type="number" min="1" max="100" value={codeForm.discount_percentage} onChange={e => setCodeForm({...codeForm, discount_percentage: Number(e.target.value)})} className="w-full border border-silk-gray p-2" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-soft-slate mb-1">VALID UNTIL (Optional)</label>
                <input type="datetime-local" value={codeForm.valid_until} onChange={e => setCodeForm({...codeForm, valid_until: e.target.value})} className="w-full border border-silk-gray p-2" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" checked={codeForm.is_active} onChange={e => setCodeForm({...codeForm, is_active: e.target.checked})} />
                <label className="text-sm">Active</label>
              </div>
              <button type="submit" className="w-full bg-onyx text-white py-2 font-bold uppercase mt-4 hover:bg-champagne transition-colors">Save Code</button>
            </form>
          </div>
        </div>
      )}

      {/* Promo Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPromoModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md p-6 rounded shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingPromo ? 'Edit Banner' : 'New Promo Banner'}</h3>
              <button onClick={() => setIsPromoModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-soft-slate mb-1">TITLE</label>
                <input type="text" value={promoForm.title} onChange={e => setPromoForm({...promoForm, title: e.target.value})} className="w-full border border-silk-gray p-2" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-soft-slate mb-1">MESSAGE</label>
                <textarea value={promoForm.message} onChange={e => setPromoForm({...promoForm, message: e.target.value})} className="w-full border border-silk-gray p-2 h-20" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-soft-slate mb-1">END TIME (For Countdown Timer - Optional)</label>
                <input type="datetime-local" value={promoForm.end_time} onChange={e => setPromoForm({...promoForm, end_time: e.target.value})} className="w-full border border-silk-gray p-2" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" checked={promoForm.is_active} onChange={e => setPromoForm({...promoForm, is_active: e.target.checked})} />
                <label className="text-sm">Active</label>
              </div>
              <button type="submit" className="w-full bg-onyx text-white py-2 font-bold uppercase mt-4 hover:bg-champagne transition-colors">Save Banner</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PromotionsAdmin;
