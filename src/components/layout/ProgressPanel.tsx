import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, ArrowLeft, Circle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const steps = [
  { key: 'onboardingCompleted', label: 'קליטת נתונים', path: '/onboarding' },
  { key: 'dashboardVisited', label: 'דשבורד פדגוגי', path: '/dashboard' },
  { key: 'reflectionCompleted', label: 'שיחה רפלקטיבית', path: '/reflection' },
  { key: 'visionCompleted', label: 'חזון וקפיצה', path: '/vision' },
  { key: 'outputGenerated', label: 'תוצרים', path: '/output' },
];

const ProgressPanel: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user?.fullName) return null;

  const getStepStatus = (key: string, index: number): 'completed' | 'in-progress' | 'not-started' => {
    const userKey = key as keyof typeof user;
    if (user[userKey]) return 'completed';
    
    // Check if previous step is completed
    if (index === 0) return 'in-progress';
    const prevKey = steps[index - 1].key as keyof typeof user;
    if (user[prevKey]) return 'in-progress';
    
    return 'not-started';
  };

  const canNavigate = (index: number): boolean => {
    // Can always go to onboarding
    if (index === 0) return true;
    
    // Check all previous steps are completed
    for (let i = 0; i < index; i++) {
      const stepKey = steps[i].key as keyof typeof user;
      if (!user[stepKey]) return false;
    }
    return true;
  };

  const handleStepClick = (step: typeof steps[0], index: number) => {
    if (canNavigate(index)) {
      navigate(step.path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hidden md:block bg-card rounded-2xl border border-border/50 p-4 shadow-card"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">שלום,</span>
          <span className="font-bold text-foreground">{user.fullName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key, index);
            const isClickable = canNavigate(index);
            const isCurrentPath = location.pathname === step.path;
            
            return (
              <div key={step.key} className="flex items-center gap-2">
                <motion.div
                  whileHover={isClickable ? { scale: 1.05 } : undefined}
                  onClick={() => handleStepClick(step, index)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    status === 'completed' && "bg-success/10 text-success border border-success/30",
                    status === 'in-progress' && "bg-warning/10 text-warning border border-warning/30",
                    status === 'not-started' && "bg-muted text-muted-foreground border border-border",
                    isCurrentPath && "ring-2 ring-primary/50",
                    isClickable ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed opacity-60"
                  )}
                  title={step.label}
                >
                  {status === 'completed' && <Check className="h-3 w-3" />}
                  {status === 'in-progress' && <ArrowLeft className="h-3 w-3" />}
                  {status === 'not-started' && <Circle className="h-3 w-3" />}
                  <span className="hidden md:inline">{step.label}</span>
                  <span className="md:hidden">{index + 1}</span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressPanel;
