import React, { ReactNode } from 'react';
import Header from './Header';
import ProgressPanel from './ProgressPanel';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <ProgressPanel />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;