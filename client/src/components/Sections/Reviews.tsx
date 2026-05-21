import React from 'react';

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
    date: '1 WEEK AGO',
    avatar: 'JT'
  },
  {
    id: 2,
    name: 'Amara Okafor',
    role: 'Knotless Braids & Styling',
    content: 'Hands down the best knotless braids in Nottingham! The parting is so clean, the braids are lightweight, and there was zero tension. The salon atmosphere feels so warm, premium, and welcoming.',
    rating: 5,
    date: '3 WEEKS AGO',
    avatar: 'AO'
  },
  {
    id: 3,
    name: 'Chloe Henderson',
    role: 'Moisture Treatment & Silk Press',
    content: 'Extremely professional team. Got a revitalizing hair treatment and silk press. My natural hair has never felt so healthy, bouncy, and soft. Asantey is truly a gem!',
    rating: 5,
    date: '1 MONTH AGO',
    avatar: 'CH'
  },
  {
    id: 4,
    name: 'Elena Rostova',
    role: 'Custom HD Closure Unit',
    content: 'The HD closure unit is flawless. The lace is literally invisible, the bleach job is perfect, and it fits like a glove. I get non-stop compliments on this hair. Sarah is a true artist!',
    rating: 5,
    date: '2 MONTHS AGO',
    avatar: 'ER'
  }
];

export const Reviews: React.FC = () => {
  return (
    <section className="py-24 bg-surface border-t border-primary">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="font-label-caps text-label-caps block mb-4">CLIENT VOICE</span>
          <h2 className="font-headline-lg text-headline-lg uppercase">Google Reviews</h2>
          <div className="editorial-line w-24 mx-auto my-6"></div>
          <p className="font-body-md text-body-md max-w-2xl mx-auto text-on-surface-variant">
            Read what our clients say about their premium hair installations, custom units, and specialized beauty services.
          </p>
        </div>

        {/* Reviews Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-primary bg-background">
          {reviewsData.map((review, i) => (
            <div 
              key={review.id} 
              className={`p-8 border-primary flex flex-col justify-between
                ${i < 3 ? 'border-b md:border-b-0 md:border-r' : ''} 
                ${i === 3 ? 'border-b md:border-b-0' : ''}
              `}
            >
              <div>
                {/* Stars and Date */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, index) => (
                      <span 
                        key={index} 
                        className="material-symbols-outlined text-[14px] text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="font-label-caps text-[10px] opacity-50 tracking-wider">
                    {review.date}
                  </span>
                </div>

                <p className="font-body-md text-body-md italic mb-6 text-on-surface-variant">
                  "{review.content}"
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="flex items-center gap-3 pt-6 border-t border-primary/10">
                <div className="w-9 h-9 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                  {review.avatar}
                </div>
                <div>
                  <h4 className="font-label-caps text-label-caps text-[11px] text-primary">
                    {review.name}
                  </h4>
                  <span className="text-[10px] opacity-60 uppercase tracking-widest block mt-0.5">
                    {review.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call To Action */}
        <div className="mt-12 text-center">
          <a 
            href="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            <button className="font-label-caps text-label-caps bg-surface-container-high text-primary px-8 py-4 flex items-center gap-2 mx-auto border border-primary hover:bg-primary hover:text-on-primary transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">rate_review</span>
              WRITE A REVIEW ON GOOGLE
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
