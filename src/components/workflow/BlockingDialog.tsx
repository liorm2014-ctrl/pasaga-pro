import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BlockingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  reason: string;
  requiredAction: string;
  navigateTo?: string;
  missingData?: string[];
}

const BlockingDialog: React.FC<BlockingDialogProps> = ({
  open,
  onOpenChange,
  title,
  reason,
  requiredAction,
  navigateTo,
  missingData,
}) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </motion.div>
          <DialogTitle className="text-xl text-center">{title}</DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed">
            {reason}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm font-medium text-foreground mb-2">מה נדרש:</p>
          <p className="text-sm text-muted-foreground">{requiredAction}</p>
          
          {missingData && missingData.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">נתונים חסרים:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {missingData.map((data, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive"
                  >
                    {data}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
            <X className="h-4 w-4" />
            סגור
          </Button>
          {navigateTo && (
            <Button onClick={handleNavigate} className="gap-2">
              עבור לתיקון
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockingDialog;
