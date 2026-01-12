import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface ImbalanceWarningProps {
  domain: string;
  percentage: number;
  onAcknowledge?: () => void;
}

const ImbalanceWarning: React.FC<ImbalanceWarningProps> = ({
  domain,
  percentage,
  onAcknowledge,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/30"
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-destructive text-lg">זוהה עיוות פדגוגי</h3>
          <p className="text-sm text-foreground/80 mt-1">
            תחום <strong>"{domain}"</strong> מהווה <strong>{percentage}%</strong> מכלל שעות ההשתלמות.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            ריכוז של יותר מ-50% בתחום אחד עלול לפגוע באיזון הפדגוגי ובפיתוח מקצועי מגוון.
          </p>
          
          <div className="mt-4 p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">שאלה לרפלקציה:</span>
            </div>
            <p className="text-sm text-foreground italic">
              "למה זה קרה? מה הוביל לריכוז כה גבוה בתחום זה?"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImbalanceWarning;
