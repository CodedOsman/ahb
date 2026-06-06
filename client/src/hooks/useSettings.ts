import { useState, useEffect } from 'react';
import axios from 'axios';

type SettingsMap = Record<string, string>;

const DEFAULTS: SettingsMap = {
  // Homepage Hero
  hero_title: 'The Art of Elegance',
  hero_subtitle: 'Experience luxury hair transformation with our award-winning stylists. From intricate braiding to vibrant color, we craft your perfect look.',

  // Homepage Services Section
  services_section_label: 'EXPERTISE',
  services_section_title: 'Our Services',
  services_section_subtitle: 'Discover our comprehensive range of luxury hair and styling services, crafted to enhance your natural beauty.',

  // Homepage Shop Section
  shop_section_label: 'CURATED COLLECTION',
  shop_section_title: 'Asantey Shop',
  shop_section_subtitle_categories: 'Explore our curated collections of luxury hair care products and styling tools.',
  shop_section_subtitle_products: 'Browse our premium products to maintain your beautiful look at home.',

  // Services Page
  services_page_title: 'Our Services',
  services_page_subtitle: 'From intricate braiding to premium color treatments, discover our full range of luxury hair and beauty services.',

  // About Page
  about_hero_title: 'The Art of Sophistication',
  about_hero_subtitle: 'Asantey Luxury Salon was born from a vision to blend cultural heritage with contemporary high-fashion aesthetics.',
  about_content_p1: 'AHB Salon is a Nottingham-based hair and beauty brand dedicated to providing high-quality products and professional services. We specialise in supplying top-quality Cambodian hair extensions, known for their durability, fullness, and natural finish.',
  about_content_p2: 'Alongside our premium hair range, we offer a variety of expert services including braids, cornrows, and hair treatments designed to maintain and promote healthy hair. Our beauty services include lash extensions, eyebrow waxing, and threading, helping you achieve a complete, polished look.',
  about_content_p3: 'At AHB Salon, our focus is on delivering excellent service, enhancing natural beauty, and ensuring every client leaves feeling confident and satisfied.',
  gallery_section_title: 'Client Gallery',
  gallery_section_subtitle: 'Real transformations, flawless installs, and professional styling crafted at Asantey Luxury Salon.',

  // Admin Configuration
  admin_notification_email: '',
};

let cache: SettingsMap | null = null;
let fetchPromise: Promise<SettingsMap> | null = null;

async function fetchSettings(): Promise<SettingsMap> {
  if (cache) return cache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = axios.get('/api/settings').then((res) => {
    const map: SettingsMap = { ...DEFAULTS };
    if (Array.isArray(res.data)) {
      for (const s of res.data) {
        if (s.key && s.value !== null && s.value !== undefined) {
          map[s.key] = s.value;
        }
      }
    }
    cache = map;
    fetchPromise = null;
    return map;
  }).catch(() => {
    fetchPromise = null;
    return { ...DEFAULTS };
  });

  return fetchPromise;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsMap>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
