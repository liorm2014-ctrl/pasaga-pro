import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroCard from '@/components/home/HeroCard';
import JourneySteps from '@/components/home/JourneySteps';
import InfoBoxes from '@/components/home/InfoBoxes';

const Home: React.FC = () => {
  return (
    <Layout>
      <HeroCard />
      <JourneySteps />
      <InfoBoxes />
    </Layout>
  );
};

export default Home;