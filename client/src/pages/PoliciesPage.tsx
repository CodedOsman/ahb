import React from 'react';
import { motion } from 'framer-motion';

interface PolicySection {
  icon: string;
  title: string;
  content: string[];
}

const defaultPolicies: PolicySection[] = [
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

import { useSettings } from '@/hooks/useSettings';

const PoliciesPage: React.FC = () => {
  const { settings } = useSettings();

  let policies = defaultPolicies;
  if (settings.site_policies) {
    try {
      policies = JSON.parse(settings.site_policies);
    } catch(e) {}
  }

  return (
    <div className="min-h-screen bg-background text-primary overflow-hidden">
      {/* Hero */}
      <section className="relative pt-40 pb-24 flex flex-col items-center justify-center text-center px-6 border-b border-primary">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-label-caps text-label-caps text-secondary tracking-[0.3em] mb-6 block"
        >
          ASANTEY HAIR & BEAUTY
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display-lg text-[clamp(3rem,10vw,7rem)] leading-none uppercase tracking-widest mb-8"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Policies
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="font-body-md text-body-md text-secondary max-w-xl leading-relaxed"
        >
          We accept walk-in clients, but please ensure you call before arriving.
          All braiding appointments must be booked for the morning.
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-20 h-[1px] bg-primary mx-auto mt-10 origin-left"
        />
      </section>

      {/* Policy Sections */}
      <section className="container mx-auto px-4 py-20 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-0"
        >
          {policies.map((policy, index) => (
            <motion.div
              key={policy.title}
              variants={itemVariants}
              className="group grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 md:gap-12 items-start border-b border-primary/20 py-12 hover:bg-surface-container-lowest transition-colors duration-300 px-4"
            >
              {/* Icon */}
              <div className="flex md:justify-center items-start pt-1">
                <span
                  className="text-4xl border border-primary/20 w-16 h-16 flex items-center justify-center group-hover:border-primary transition-colors duration-300 overflow-hidden"
                  aria-hidden="true"
                >
                  {(policy.icon && (policy.icon.startsWith('data:') || policy.icon.startsWith('http'))) ? (
                    <img src={policy.icon} alt={policy.title} className="w-full h-full object-cover" />
                  ) : (
                    policy.icon
                  )}
                </span>
              </div>

              {/* Content */}
              <div>
                <h2
                  className="font-headline-md text-2xl uppercase tracking-widest mb-4"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {policy.title}
                </h2>
                <div className="space-y-2">
                  {policy.content.map((line, i) => (
                    <p key={i} className="font-body-md text-secondary text-sm leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Parking note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 border border-primary/30 p-8 text-center bg-surface-container-lowest"
        >
          <span className="font-label-caps text-label-caps text-secondary tracking-widest text-xs block mb-2">
            🅿️ PARKING
          </span>
          <p className="font-body-md text-secondary text-sm">
            Free parking available at Wilkenston Tram Stop.
          </p>
        </motion.div>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center"
        >
          <p
            className="text-2xl md:text-3xl text-secondary italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Thank you and hope to see you soon ♡
          </p>
          <div className="w-16 h-[1px] bg-primary mx-auto mt-8" />
          <a
            href="https://asanteyhair.as.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8"
          >
            <button className="font-label-caps text-label-caps bg-primary text-on-primary px-10 py-4 border border-primary hover:bg-background hover:text-primary transition-all cursor-pointer">
              BOOK APPOINTMENT
            </button>
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default PoliciesPage;
