import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  Users,
  Target,
  Lightbulb,
  School,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Training } from '@/types';

interface InsightsSectionProps {
  trainings: Training[];
}

interface Insight {
  type: 'warning' | 'gap' | 'overload' | 'opportunity';
  title: string;
  description: string;
  icon: React.ElementType;
  items?: string[];
  severity: 'high' | 'medium' | 'low';
}

const InsightsSection: React.FC<InsightsSectionProps> = ({ trainings }) => {
  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    // 1. Underperforming programs (low participants)
    const lowParticipation = trainings.filter(t => t.participants < 10);
    if (lowParticipation.length > 0) {
      result.push({
        type: 'warning',
        title: 'תכניות עם השתתפות נמוכה',
        description: `${lowParticipation.length} תכניות עם פחות מ-10 משתתפים`,
        icon: TrendingDown,
        items: lowParticipation.slice(0, 5).map(t => `${t.trainingName} (${t.participants} משתתפים)`),
        severity: lowParticipation.length > 5 ? 'high' : 'medium',
      });
    }

    // 2. Short duration programs
    const shortPrograms = trainings.filter(t => t.durationHours < 2);
    if (shortPrograms.length > 0) {
      result.push({
        type: 'warning',
        title: 'תכניות קצרות מידי',
        description: `${shortPrograms.length} תכניות עם פחות מ-2 שעות`,
        icon: AlertTriangle,
        items: shortPrograms.slice(0, 5).map(t => `${t.trainingName} (${t.durationHours} שעות)`),
        severity: 'medium',
      });
    }

    // 3. Audience coverage gaps
    const audienceCount: Record<string, number> = {};
    trainings.forEach(t => {
      audienceCount[t.targetAudience] = (audienceCount[t.targetAudience] || 0) + 1;
    });
    
    const allAudiences = ['גנים', 'יסודי', 'תיכון', 'חינוך מיוחד'];
    const underservedAudiences = allAudiences.filter(a => (audienceCount[a] || 0) < 3);
    
    if (underservedAudiences.length > 0) {
      result.push({
        type: 'gap',
        title: 'פערים בכיסוי קהלים',
        description: 'קהלי יעד עם מספר מועט של תכניות',
        icon: Users,
        items: underservedAudiences.map(a => `${a}: ${audienceCount[a] || 0} תכניות`),
        severity: underservedAudiences.length > 2 ? 'high' : 'medium',
      });
    }

    // 4. Category distribution gaps
    const categoryCount: Record<string, number> = {};
    trainings.forEach(t => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });
    
    const allCategories = ['פדגוגיה', 'טכנולוגיה', 'ניהול', 'רווחה', 'חינוך מיוחד', 'מנהיגות'];
    const underservedCategories = allCategories.filter(c => (categoryCount[c] || 0) < 2);
    
    if (underservedCategories.length > 0) {
      result.push({
        type: 'gap',
        title: 'פערים בתחומי תוכן',
        description: 'תחומים שדורשים חיזוק',
        icon: Target,
        items: underservedCategories.map(c => `${c}: ${categoryCount[c] || 0} תכניות`),
        severity: 'medium',
      });
    }

    // 5. Monthly overload detection
    const monthlyCount: Record<string, number> = {};
    trainings.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
      monthlyCount[month] = (monthlyCount[month] || 0) + 1;
    });
    
    const overloadedMonths = Object.entries(monthlyCount)
      .filter(([_, count]) => count > 10)
      .map(([month, count]) => `${month}: ${count} תכניות`);
    
    if (overloadedMonths.length > 0) {
      result.push({
        type: 'overload',
        title: 'עומס בחודשים מסוימים',
        description: 'חודשים עם ריכוז גבוה של תכניות',
        icon: Calendar,
        items: overloadedMonths,
        severity: 'medium',
      });
    }

    // 6. Opportunities - high performing categories
    const highPerformingCategories = Object.entries(categoryCount)
      .filter(([_, count]) => count > 5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (highPerformingCategories.length > 0) {
      result.push({
        type: 'opportunity',
        title: 'תחומי חוזק',
        description: 'תחומים עם נוכחות משמעותית',
        icon: Lightbulb,
        items: highPerformingCategories.map(([cat, count]) => `${cat}: ${count} תכניות`),
        severity: 'low',
      });
    }

    return result;
  }, [trainings]);

  const getTypeStyles = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-destructive/5',
          border: 'border-destructive/20',
          iconBg: 'bg-destructive/10',
          iconColor: 'text-destructive',
        };
      case 'gap':
        return {
          bg: 'bg-warning/5',
          border: 'border-warning/20',
          iconBg: 'bg-warning/10',
          iconColor: 'text-warning',
        };
      case 'overload':
        return {
          bg: 'bg-accent/5',
          border: 'border-accent/20',
          iconBg: 'bg-accent/10',
          iconColor: 'text-accent',
        };
      case 'opportunity':
        return {
          bg: 'bg-success/5',
          border: 'border-success/20',
          iconBg: 'bg-success/10',
          iconColor: 'text-success',
        };
    }
  };

  const getSeverityBadge = (severity: Insight['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">קריטי</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">בינוני</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-success border-success">נמוך</Badge>;
    }
  };

  if (trainings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated text-center py-8"
      >
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-bold text-foreground mb-2">אין נתונים לניתוח</h3>
        <p className="text-muted-foreground">העלה קובץ נתונים כדי לראות תובנות</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">תובנות וממצאים</h3>
          <p className="text-sm text-muted-foreground">ניתוח אוטומטי של הנתונים</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 bg-success/5 rounded-lg border border-success/20">
          <School className="h-12 w-12 text-success mx-auto mb-4" />
          <h4 className="font-bold text-foreground mb-2">מצב תקין!</h4>
          <p className="text-muted-foreground">לא נמצאו בעיות או פערים משמעותיים</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const styles = getTypeStyles(insight.type);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${styles.bg} ${styles.border}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
                      <insight.icon className={`h-5 w-5 ${styles.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                  {getSeverityBadge(insight.severity)}
                </div>
                
                {insight.items && insight.items.length > 0 && (
                  <ul className="space-y-1 mt-3 pr-4">
                    {insight.items.map((item, i) => (
                      <li key={i} className="text-sm text-foreground flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.iconBg.replace('/10', '')}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default InsightsSection;
