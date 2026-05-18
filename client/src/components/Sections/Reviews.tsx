import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  date: string;
  avatar: string;
}

const reviewsData: Review[] = [
  {
    id: 1,
    name: 'Jessica Taylor',
    role: 'Cambodian Hair Install',
    content: 'Absolutely obsessed with my raw Cambodian install! The hair is unbelievably full, soft, and has a gorgeous natural luster. The installation was seamless and the service was absolute luxury. 10/10 recommend!',
    rating: 5,
    date: '1 week ago',
    avatar: 'JT'
  },
  {
    id: 2,
    name: 'Amara Okafor',
    role: 'Knotless Braids & Styling',
    content: 'Hands down the best knotless braids in Nottingham! The parting is so clean, the braids are lightweight, and there was zero tension. The salon atmosphere feels so warm, premium, and welcoming.',
    rating: 5,
    date: '3 weeks ago',
    avatar: 'AO'
  },
  {
    id: 3,
    name: 'Chloe Henderson',
    role: 'Moisture Treatment & Silk Press',
    content: 'Extremely professional team. Got a revitalizing hair treatment and silk press. My natural hair has never felt so healthy, bouncy, and soft. Asantey is truly a gem!',
    rating: 5,
    date: '1 month ago',
    avatar: 'CH'
  },
  {
    id: 4,
    name: 'Elena Rostova',
    role: 'Custom HD Closure Unit',
    content: 'The HD closure unit is flawless. The lace is literally invisible, the bleach job is perfect, and it fits like a glove. I get non-stop compliments on this hair. Sarah is a true artist!',
    rating: 5,
    date: '2 months ago',
    avatar: 'ER'
  }
];

export const Reviews: React.FC = () => {
  return (
    <section className="py-32 bg-alabaster relative overflow-hidden border-t border-mist-gray">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-champagne/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-[10px] text-champagne font-black tracking-[0.25em] uppercase mb-3 block">
            CLIENT VOICE
          </span>
          <h2 
            className="text-4xl md:text-6xl font-black text-onyx mb-6 uppercase tracking-wider leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Google Reviews
          </h2>
          <p className="text-warm-silver font-light text-lg max-w-md mx-auto">
            Read what our clients say about their premium hair installations, custom units, and specialized beauty services.
          </p>
          <div className="w-16 h-0.5 bg-champagne mx-auto mt-6"></div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reviewsData.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-silk-gray border border-mist-gray p-8 flex flex-col justify-between group hover:border-champagne/30 transition-all duration-300 relative shadow-lg shadow-black/10"
            >
              <div>
                {/* Stars and Date */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-champagne text-champagne" />
                    ))}
                  </div>
                  <span className="text-[10px] text-warm-silver/60 uppercase tracking-wider font-bold">
                    {review.date}
                  </span>
                </div>

                {/* Content */}
                <p className="text-soft-slate text-sm font-light leading-relaxed mb-6 italic">
                  "{review.content}"
                </p>
              </div>

              {/* Reviewer Meta */}
              <div className="flex items-center gap-4 pt-6 border-t border-mist-gray/10">
                <div className="w-10 h-10 rounded-full bg-champagne/10 border border-champagne/20 flex items-center justify-center text-champagne font-bold text-xs uppercase">
                  {review.avatar}
                </div>
                <div>
                  <h4 className="text-onyx font-bold text-sm tracking-wide">
                    {review.name}
                  </h4>
                  <span className="text-[10px] text-warm-silver uppercase tracking-wider font-medium">
                    {review.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center mt-16">
          <a
            href="https://www.google.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 bg-champagne text-alabaster px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-xs transition-all hover:opacity-90 active:scale-95 shadow-md shadow-champagne/15"
          >
            <MessageSquare size={14} /> Write A Review On Google
          </a>
        </div>
      </div>
    </section>
  );
};
