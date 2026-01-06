import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  BarChart3, 
  MessageCircle, 
  Rocket, 
  Download,
  Check,
  ArrowLeft,
  Circle
} from 'lucide-react';

const journeySteps = [
  {
    number: '01',
    title: 'קליטת נתונים',
    description: 'הזנת פרטי הפסג"ה, נתונים כמותיים והעלאת קובץ השתלמויות',
    link: '/onboarding',
    statusField: 'onboardingCompleted' as const,
    icon: FileText,
  },
  {
    number: '02',
    title: 'דשבורד פדגוגי',
    description: 'ניתוח ויזואלי של נתוני ההשתלמויות עם תובנות מעמיקות',
    link: '/dashboard',
    statusField: 'dashboardVisited' as const,
    icon: BarChart3,
  },
  {
    number: '03',
    title: 'שיחה רפלקטיבית',
    description: 'דיאלוג עם מנטור AI לרפלקציה מקצועית וחשיבה אסטרטגית',
    link: '/reflection',
    statusField: 'reflectionCompleted' as const,
    icon: MessageCircle,
  },
  {
    number: '04',
    title: 'חזון וקפיצה',
    description: 'ניתוח SWOT, הצבת יעדים ובניית תוכנית עבודה שנתית',
    link: '/vision',
    statusField: 'visionCompleted' as const,
    icon: Rocket,
  },
  {
    number: '05',
    title: 'תוצרים',
    description: 'דוחות, מכתב מנטור וייצוא לכלים חיצוניים',
    link: '/output',
    statusField: null,
    icon: Download,
  },
];

const JourneySteps: React.FC = () => {
  const { user } = useApp();

  const getStatus = (statusField: string | null, index: number) => {
    if (!statusField) return 'not-started';
    if (!user) return 'not-started';
    
    const field = statusField as keyof typeof user;
    if (user[field]) return 'completed';
    
    // Check if previous step completed
    if (index === 0) return 'in-progress';
    const prevStep = journeySteps[index - 1];
    if (prevStep.statusField && user[prevStep.statusField as keyof typeof user]) {
      return 'in-progress';
    }
    
    return 'not-started';
  };

  return (
    <div className="mt-12">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-foreground mb-6 text-center"
      >
        מסע המנהיגות הפדגוגית
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {journeySteps.map((step, index) => {
          const status = getStatus(step.statusField, index);
          const Icon = step.icon;
          
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={step.link}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={cn(
                    "relative h-full p-5 rounded-2xl border transition-all cursor-pointer",
                    status === 'completed' && "bg-success/5 border-success/30 shadow-md",
                    status === 'in-progress' && "bg-warning/5 border-warning/30 shadow-lg animate-pulse-glow",
                    status === 'not-started' && "bg-card border-border/50 shadow-card hover:shadow-lg"
                  )}
                >
                  {/* Step Number Badge */}
                  <div className={cn(
                    "absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md",
                    status === 'completed' && "bg-success text-success-foreground",
                    status === 'in-progress' && "bg-warning text-warning-foreground",
                    status === 'not-started' && "bg-muted text-muted-foreground"
                  )}>
                    {step.number}
                  </div>

                  {/* Status Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    status === 'completed' && "bg-success/10 text-success",
                    status === 'in-progress' && "bg-warning/10 text-warning",
                    status === 'not-started' && "bg-primary/10 text-primary"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Status Indicator */}
                  <div className="mt-4 flex items-center gap-2">
                    {status === 'completed' && (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-xs text-success font-medium">הושלם</span>
                      </>
                    )}
                    {status === 'in-progress' && (
                      <>
                        <ArrowLeft className="h-4 w-4 text-warning" />
                        <span className="text-xs text-warning font-medium">בתהליך</span>
                      </>
                    )}
                    {status === 'not-started' && (
                      <>
                        <Circle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">לא התחיל</span>
                      </>
                    )}
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneySteps;