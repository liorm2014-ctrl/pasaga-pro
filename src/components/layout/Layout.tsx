import React, { ReactNode } from 'react';
import Header from './Header';
import ProgressPanel from './ProgressPanel';
import Footer from './Footer';
import MobileNav from './MobileNav';
import { motion } from 'framer-motion';
import backgroundImage from '@/assets/background.png';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Header />
      <div className="container py-4 md:py-6 flex-1 pb-24 md:pb-6">
        <ProgressPanel />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 md:mt-6"
        >
          {children}
        </motion.main>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
