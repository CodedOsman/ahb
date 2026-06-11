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
              src={settings.site_logo || "/images/logo.png"}
              onError={(e) => {
                if (!settings.site_logo) {
                  (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida/ADBb0uhHIMu3aN7Mv2CFtNLh3hhzuewZebUB-erUVLTiL2jXVjX3Y2bC2O-h-YlOfpS8bzARTWHdNr4vU0cVkl89SAc6XlS3S0OP8ggrVS7FfJ5xdsY-_w5E0izWs8xT6yjgzMQgltvUJQn_Gv5JUC7Ur2GJozn7Zyrnf1L1-zbtmRt-o_DQdqfpN4p9smdbMTTIu8V4mhL3ShB1JWgE7Q51BJU_hFU0P0KP1Ft1hLfbL-E8BOiQuK60Ez7aZ-4";
                }
              }}
            />
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-8">
            {settings.footer_description || 'Luxury hair and braiding services for the modern woman. Redefining elegance through artistry.'}
          </p>
          <div className="font-body-md text-body-md space-y-2 opacity-70">
            {settings.contact_address && <p>{settings.contact_address}</p>}
            {settings.contact_phone && <p>{settings.contact_phone}</p>}
            {settings.contact_email && <p>{settings.contact_email}</p>}
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
            <li><Link href="/policies" className="opacity-70 hover:opacity-100 hover:line-through transition-all">POLICIES</Link></li>
            <li><Link href="/about#contact" className="opacity-70 hover:opacity-100 hover:line-through transition-all">CONTACT</Link></li>
          </ul>
        </div>

        {(settings.social_instagram || settings.social_tiktok || settings.social_facebook || settings.social_pinterest) && (
          <div>
            <h4 className="font-label-caps text-label-caps mb-8">SOCIAL</h4>
            <ul className="flex flex-col gap-4 font-body-md text-body-md">
              {settings.social_instagram && (
                <li>
                  <a 
                    className="opacity-70 hover:opacity-100 hover:line-through transition-all" 
                    href={settings.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    INSTAGRAM
                  </a>
                </li>
              )}
              {settings.social_tiktok && (
                <li>
                  <a 
                    className="opacity-70 hover:opacity-100 hover:line-through transition-all" 
                    href={settings.social_tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    TIKTOK
                  </a>
                </li>
              )}
              {settings.social_facebook && (
                <li>
                  <a 
                    className="opacity-70 hover:opacity-100 hover:line-through transition-all" 
                    href={settings.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FACEBOOK
                  </a>
                </li>
              )}
              {settings.social_pinterest && (
                <li>
                  <a 
                    className="opacity-70 hover:opacity-100 hover:line-through transition-all" 
                    href={settings.social_pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PINTEREST
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="max-w-container-max mx-auto px-6 pt-12 border-t border-primary/20 flex justify-center items-center">
        <p className="font-label-caps text-label-caps text-primary opacity-70 text-center">
          © {new Date().getFullYear()} ASANTEY HAIR & BEAUTY. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
