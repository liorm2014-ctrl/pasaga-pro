import React from 'react';
import { motion } from 'framer-motion';
import { Gift, HelpCircle, Check, Sparkles } from 'lucide-react';

const InfoBoxes: React.FC = () => {
  const benefits = [
    'ניתוח מעמיק של נתוני ההשתלמויות',
    'תובנות SWOT פדגוגי מותאם אישית',
    'תוכנית חזון ופעולה מפורטת',
    'מכתב מנטור אישי ומעצים',
    'דוחות לייצוא וכלי הצגה',
  ];

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* What You'll Get */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="card-elevated"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-accent" />
          </div>
          <h3 className="text-lg font-bold text-foreground">מה תקבלו בסוף התהליך?</h3>
        </div>
        
        <ul className="space-y-3">
          {benefits.map((benefit, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-success" />
              </div>
              <span className="text-sm text-foreground">{benefit}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="card-elevated"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">איך זה עובד?</h3>
        </div>
        
        <p className="text-muted-foreground leading-relaxed mb-4">
          המערכת משלבת בינה מלאכותית מתקדמת עם מתודולוגיה מנהיגותית יישומית. 
          יש להזין את הנתונים הרלוונטיים. באמצעות התשובות ושיחה רפלקטיבית עם סוכן AI 
          שמבין את עולם הפסג"ה.
        </p>
        
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/5 border border-accent/20">
          <Sparkles className="h-5 w-5 text-accent flex-shrink-0" />
          <span className="text-sm text-foreground">
            בסוף התהליך תקבלו תמונה מלאה ותוכנית פעולה מותאמת אישית
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default InfoBoxes;