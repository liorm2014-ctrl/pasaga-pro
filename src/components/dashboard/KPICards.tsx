import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  Users, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { Training } from '@/types';

interface KPICardsProps {
  trainings: Training[];
}

const KPICards: React.FC<KPICardsProps> = ({ trainings }) => {
  // Calculate KPIs
  const totalPrograms = trainings.length;
  
  // Active programs (within last 30 days or future)
  const now = new Date();
  const activePrograms = trainings.filter(t => {
    const trainingDate = new Date(t.date);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return trainingDate >= thirtyDaysAgo;
  }).length;
  
  // Average participation (based on participants per training)
  const avgParticipation = totalPrograms > 0 
    ? Math.round(trainings.reduce((sum, t) => sum + t.participants, 0) / totalPrograms)
    : 0;
  
  // Programs at risk (low participants < 10 or very short duration < 2 hours)
  const atRiskPrograms = trainings.filter(t => 
    t.participants < 10 || t.durationHours < 2
  ).length;
  
  // Total hours
  const totalHours = trainings.reduce((sum, t) => sum + t.durationHours, 0);
  
  // Week over week change (mock - would need historical data)
  const weekChange = totalPrograms > 0 ? Math.round((activePrograms / totalPrograms) * 100) : 0;

  const kpis = [
    {
      label: 'סה"כ תכניות',
      value: totalPrograms,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      trend: null,
    },
    {
      label: 'תכניות פעילות',
      value: activePrograms,
      icon: Play,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      trend: weekChange > 50 ? 'up' : 'down',
      trendValue: `${weekChange}%`,
    },
    {
      label: 'ממוצע משתתפים',
      value: avgParticipation,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20',
      trend: avgParticipation > 15 ? 'up' : 'down',
    },
    {
      label: 'תכניות בסיכון',
      value: atRiskPrograms,
      icon: AlertTriangle,
      color: atRiskPrograms > 0 ? 'text-destructive' : 'text-success',
      bgColor: atRiskPrograms > 0 ? 'bg-destructive/10' : 'bg-success/10',
      borderColor: atRiskPrograms > 0 ? 'border-destructive/20' : 'border-success/20',
      isWarning: atRiskPrograms > 0,
    },
    {
      label: 'סה"כ שעות',
      value: totalHours.toLocaleString(),
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`card-elevated border ${kpi.borderColor} ${kpi.isWarning ? 'animate-pulse' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${kpi.bgColor} flex items-center justify-center ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            {kpi.trend && (
              <div className={`flex items-center gap-1 text-xs ${kpi.trend === 'up' ? 'text-success' : 'text-warning'}`}>
                {kpi.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {kpi.trendValue}
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
          <p className="text-sm text-muted-foreground">{kpi.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default KPICards;
