import React from 'react';
import { Hero } from '@/components/Sections/Hero';
import { Services } from '@/components/Sections/Services';
import { Shop } from '@/components/Sections/Shop';
import { Reviews } from '@/components/Sections/Reviews';

interface HomeProps {
  isLoading: boolean;
}

const Home: React.FC<HomeProps> = ({ isLoading }) => {
  return (
    <>
      {/* Hero Section */}
      <Hero isLoading={isLoading} />

      {/* Services Section */}
      <Services />

      {/* Shop Section */}
      <Shop />

      {/* Reviews Section */}
      <Reviews />
    </>
  );
};

export default Home;
