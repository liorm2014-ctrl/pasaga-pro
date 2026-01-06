import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 md:p-12 text-primary-foreground shadow-elevated"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-4"
        >
          <Sparkles className="h-6 w-6 text-accent" />
          <span className="text-sm font-medium text-accent">מערכת חכמה למנהלי פסג"ה</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-extrabold mb-4"
        >
          טיפ טופ בפסג"ה
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl"
        >
          מסע מנהיגותי לניתוח, רפלקציה וחזון אסטרטגי. שלבו בינה מלאכותית עם מתודולוגיה מקצועית ליצירת תוכנית עבודה שנתית
          מותאמת אישית.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Link to="/onboarding">
            <Button size="lg" className="btn-hero gap-2 text-foreground">
              <span>התחילו את המסע</span>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroCard;
