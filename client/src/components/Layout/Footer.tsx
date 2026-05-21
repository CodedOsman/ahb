import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import axios from 'axios';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        const settingsMap = res.data.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        setSettings(settingsMap);
      } catch (error) {
        console.error('Error fetching settings for footer:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-surface pt-24 pb-12 border-t border-primary">
      <div className="max-w-container-max mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-1 md:col-span-1">
          <Link href="/">
            <img 
              alt="ASANTEY" 
              className="h-16 w-auto mb-8 cursor-pointer" 
              src="/images/logo.webp"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida/ADBb0uhHIMu3aN7Mv2CFtNLh3hhzuewZebUB-erUVLTiL2jXVjX3Y2bC2O-h-YlOfpS8bzARTWHdNr4vU0cVkl89SAc6XlS3S0OP8ggrVS7FfJ5xdsY-_w5E0izWs8xT6yjgzMQgltvUJQn_Gv5JUC7Ur2GJozn7Zyrnf1L1-zbtmRt-o_DQdqfpN4p9smdbMTTIu8V4mhL3ShB1JWgE7Q51BJU_hFU0P0KP1Ft1hLfbL-E8BOiQuK60Ez7aZ-4";
              }}
            />
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-8">
            {settings.footer_description || 'Luxury hair and braiding services for the modern woman. Redefining elegance through artistry.'}
          </p>
          <div className="font-body-md text-body-md space-y-2 opacity-70">
            <p>{settings.contact_address || '358 Radford Road, Nottingham, NG7 5GQ'}</p>
            <p>{settings.contact_phone || '07827129797'}</p>
            <p>{settings.contact_email || 'hello@asantey.com'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps mb-8">NAVIGATION</h4>
          <ul className="flex flex-col gap-4 font-body-md text-body-md">
            <li>
              <Link href="/services" className="opacity-70 hover:opacity-100 hover:line-through transition-all">
                SERVICES
              </Link>
            </li>
            <li>
              <Link href="/shop" className="opacity-70 hover:opacity-100 hover:line-through transition-all">
                SHOP
              </Link>
            </li>
            <li>
              <Link href="/about" className="opacity-70 hover:opacity-100 hover:line-through transition-all">
                ABOUT
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps mb-8">COMPANY</h4>
          <ul className="flex flex-col gap-4 font-body-md text-body-md">
            <li><a className="opacity-70 hover:opacity-100 hover:line-through transition-all" href="#">BLOG</a></li>
            <li><a className="opacity-70 hover:opacity-100 hover:line-through transition-all" href="#">CAREERS</a></li>
            <li><a className="opacity-70 hover:opacity-100 hover:line-through transition-all" href="#">POLICIES</a></li>
            <li><a className="opacity-70 hover:opacity-100 hover:line-through transition-all" href="#">CONTACT</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps mb-8">SOCIAL</h4>
          <ul className="flex flex-col gap-4 font-body-md text-body-md">
            <li>
              <a 
                className="opacity-70 hover:opacity-100 hover:line-through transition-all" 
                href={settings.social_instagram || 'https://www.instagram.com/ahb_salon'}
                target="_blank"
                rel="noopener noreferrer"
              >
                INSTAGRAM
              </a>
            </li>
            <li>
              <a 
                className="opacity-70 hover:opacity-100 hover:line-through transition-all" 
                href={settings.social_tiktok || 'https://www.tiktok.com/@ahbsalon'}
                target="_blank"
                rel="noopener noreferrer"
              >
                TIKTOK
              </a>
            </li>
            <li>
              <a className="opacity-70 hover:opacity-100 hover:line-through transition-all" href="#">
                PINTEREST
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-6 pt-12 border-t border-primary/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="font-label-caps text-label-caps text-primary opacity-70">
          © {new Date().getFullYear()} ASANTEY HAIR & BEAUTY. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-8">
          <a className="font-label-caps text-label-caps opacity-70 hover:opacity-100" href="#">TERMS OF SERVICE</a>
          <a className="font-label-caps text-label-caps opacity-70 hover:opacity-100" href="#">PRIVACY POLICY</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
