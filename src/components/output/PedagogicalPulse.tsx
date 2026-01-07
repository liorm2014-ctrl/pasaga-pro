import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Lightbulb, Users, Shield, Target, Rocket } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface PedagogicalPulseProps {
  stats: {
    totalTrainings: number;
    totalParticipants: number;
    totalHours: number;
    avgParticipants: number;
  };
  trainings: Array<{
    category: string;
    learningMethod: string;
    targetAudience: string;
  }>;
}

interface PulseMetric {
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  fullMark: number;
}

const PedagogicalPulse: React.FC<PedagogicalPulseProps> = ({ stats, trainings }) => {
  // Calculate pulse metrics based on training data
  const pulseMetrics = useMemo(() => {
    const total = trainings.length || 1;
    
    // חדשנות - based on variety of learning methods and tech-related trainings
    const techTrainings = trainings.filter(t => 
      t.category === 'טכנולוגיה' || t.learningMethod === 'א-סינכרוני' || t.learningMethod === 'סינכרוני'
    ).length;
    const innovation = Math.min(100, Math.round((techTrainings / total) * 100 + 20));
    
    // חיבור לשטח - based on audience variety
    const audienceTypes = new Set(trainings.map(t => t.targetAudience)).size;
    const fieldConnection = Math.min(100, Math.round(audienceTypes * 25 + 10));
    
    // חוסן ארגוני - based on total trainings and consistency
    const organizationalResilience = Math.min(100, Math.round(Math.min(stats.totalTrainings, 50) * 2 + 10));
    
    // מנהיגות - based on leadership and management trainings
    const leadershipTrainings = trainings.filter(t => 
      t.category === 'מנהיגות' || t.category === 'ניהול'
    ).length;
    const leadership = Math.min(100, Math.round((leadershipTrainings / total) * 100 + 25));
    
    // יוזמה - based on total participants and average engagement
    const initiative = Math.min(100, Math.round(Math.min(stats.avgParticipants, 40) * 2 + 20));

    return [
      { name: 'חדשנות', value: innovation, icon: Lightbulb, fullMark: 100 },
      { name: 'חיבור לשטח', value: fieldConnection, icon: Users, fullMark: 100 },
      { name: 'חוסן ארגוני', value: organizationalResilience, icon: Shield, fullMark: 100 },
      { name: 'מנהיגות', value: leadership, icon: Target, fullMark: 100 },
      { name: 'יוזמה', value: initiative, icon: Rocket, fullMark: 100 },
    ];
  }, [stats, trainings]);

  const radarData = pulseMetrics.map(m => ({ subject: m.name, value: m.value }));
  
  // Calculate overall pulse score
  const overallPulse = Math.round(pulseMetrics.reduce((sum, m) => sum + m.value, 0) / pulseMetrics.length);
  
  // Determine pulse level
  const getPulseLevel = (score: number) => {
    if (score >= 80) return { text: 'דופק גבוה', color: 'text-green-600' };
    if (score >= 60) return { text: 'דופק בינוני-גבוה', color: 'text-blue-600' };
    if (score >= 40) return { text: 'דופק בינוני', color: 'text-amber-600' };
    return { text: 'דופק נמוך - פוטנציאל לשיפור', color: 'text-red-600' };
  };

  const pulseLevel = getPulseLevel(overallPulse);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-foreground">מדד הדופק הפדגוגי</h2>
            <p className="text-sm text-muted-foreground">אינדיקציה ויזואלית של רמת האנרגיה והמיקוד</p>
          </div>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center bg-white shadow-lg">
          <span className="text-2xl font-bold text-primary">{overallPulse}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Metrics */}
        <div className="space-y-4">
          {/* Pulse Level Card */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-bold ${pulseLevel.color}`}>{pulseLevel.text}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  הפסג"ה מציג רמת פוטנציאל לשיפור
                </p>
              </div>
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>

          {/* Individual Metrics */}
          <div className="space-y-3">
            {pulseMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={metric.name}
                  className="p-3 rounded-xl bg-white border border-border/50 flex items-center gap-4"
                >
                  <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 text-right">
                    <span className="font-medium text-foreground">{metric.name}</span>
                  </div>
                  <div className="w-24">
                    <Progress value={metric.value} className="h-2" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground w-8">{metric.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side - Radar Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name="דופק פדגוגי"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default PedagogicalPulse;