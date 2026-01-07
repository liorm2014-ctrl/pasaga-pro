import React from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  BarChart3, 
  MessageCircle, 
  Target, 
  FileOutput 
} from 'lucide-react';

const steps = [
  { key: 'onboardingCompleted', label: 'נתונים', path: '/onboarding', icon: FileText },
  { key: 'dashboardVisited', label: 'דשבורד', path: '/dashboard', icon: BarChart3 },
  { key: 'reflectionCompleted', label: 'שיחה', path: '/reflection', icon: MessageCircle },
  { key: 'visionCompleted', label: 'חזון', path: '/vision', icon: Target },
  { key: 'outputGenerated', label: 'תוצרים', path: '/output', icon: FileOutput },
];

const MobileNav: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user?.fullName) return null;

  const canNavigate = (index: number): boolean => {
    if (index === 0) return true;
    const prevKey = steps[index - 1].key as keyof typeof user;
    return !!user[prevKey];
  };

  const getStepStatus = (key: string, index: number): 'completed' | 'in-progress' | 'not-started' => {
    const userKey = key as keyof typeof user;
    if (user[userKey]) return 'completed';
    if (index === 0) return 'in-progress';
    const prevKey = steps[index - 1].key as keyof typeof user;
    if (user[prevKey]) return 'in-progress';
    return 'not-started';
  };

  const handleStepClick = (step: typeof steps[0], index: number) => {
    if (canNavigate(index)) {
      navigate(step.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 md:hidden safe-area-pb">
      <div className="flex justify-around items-center py-2 px-1">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key, index);
          const isClickable = canNavigate(index);
          const isCurrentPath = location.pathname === step.path;
          const Icon = step.icon;

          return (
            <button
              key={step.key}
              onClick={() => handleStepClick(step, index)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all min-w-[60px]",
                isCurrentPath && "bg-primary/10",
                isClickable ? "opacity-100" : "opacity-40"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full",
                status === 'completed' && "bg-green-100 text-green-600",
                status === 'in-progress' && "bg-amber-100 text-amber-600",
                status === 'not-started' && "bg-gray-100 text-gray-400",
                isCurrentPath && "ring-2 ring-primary"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isCurrentPath ? "text-primary" : "text-gray-600"
              )}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
