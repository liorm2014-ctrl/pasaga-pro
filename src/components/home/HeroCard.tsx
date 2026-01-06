import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-md p-8 md:p-12 shadow-lg border border-white/30"
    >
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <span className="text-lg font-bold text-primary">מערכת חכמה למנהלי פסג"ה</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-extrabold mb-6 text-primary px-6 py-2 rounded-xl inline-block"
          style={{ backgroundColor: 'rgba(212, 175, 55, 0.3)' }}
        >
          פסג"ה פורצת דרך
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-primary/80 mb-8 max-w-2xl mx-auto font-bold"
        >
          מסע מנהיגותי לניתוח, רפלקציה וחזון אסטרטגי. שלבו בינה מלאכותית עם מתודולוגיה מקצועית ליצירת תוכנית עבודה שנתית
          מותאמת אישית.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default HeroCard;
