import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Promotion {
  id: number;
  title: string;
  message: string;
  end_time: string | null;
}

export const PromoBanner: React.FC = () => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    axios.get('/api/promotions/active')
      .then(res => setPromos(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (promos.length === 0) return;

    const timer = setInterval(() => {
      const newTimeLeft: { [key: number]: string } = {};
      
      promos.forEach(promo => {
        if (!promo.end_time) return;
        
        const diff = new Date(promo.end_time).getTime() - Date.now();
        if (diff <= 0) {
          newTimeLeft[promo.id] = 'Expired';
          return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        
        let timeString = '';
        if (d > 0) timeString += `${d}d `;
        timeString += `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
        
        newTimeLeft[promo.id] = timeString;
      });
      
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [promos]);

  if (promos.length === 0) return null;

  // Render the most recent active promo
  const promo = promos[0];

  return (
    <div className="bg-primary text-on-primary py-3 px-4 text-center border-b border-white/20">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
        <div>
          <span className="font-bold uppercase tracking-widest text-sm mr-2">{promo.title}</span>
          <span className="text-xs opacity-80">{promo.message}</span>
        </div>
        {promo.end_time && timeLeft[promo.id] && timeLeft[promo.id] !== 'Expired' && (
          <div className="font-mono text-sm bg-white/10 px-3 py-1 rounded">
            Ends in: {timeLeft[promo.id]}
          </div>
        )}
      </div>
    </div>
  );
};
