import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Training } from '@/types';

interface DistributionChartsProps {
  trainings: Training[];
}

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#06B6D4'];

const DistributionCharts: React.FC<DistributionChartsProps> = ({ trainings }) => {
  // Category distribution
  const categoryData = useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / trainings.length) * 100),
    }));
  }, [trainings]);

  // Audience distribution
  const audienceData = useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.targetAudience] = (acc[t.targetAudience] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, count]) => ({
      name,
      count,
      hours: trainings.filter(t => t.targetAudience === name).reduce((sum, t) => sum + t.durationHours, 0),
    }));
  }, [trainings]);

  // Monthly trend
  const monthlyData = useMemo(() => {
    const monthNames = ['ינו\'', 'פבר\'', 'מרץ', 'אפר\'', 'מאי', 'יונ\'', 'יול\'', 'אוג\'', 'ספט\'', 'אוק\'', 'נוב\'', 'דצמ\''];
    const grouped: Record<number, { trainings: number; participants: number; hours: number }> = {};
    
    trainings.forEach(t => {
      const month = new Date(t.date).getMonth();
      if (!grouped[month]) {
        grouped[month] = { trainings: 0, participants: 0, hours: 0 };
      }
      grouped[month].trainings += 1;
      grouped[month].participants += t.participants;
      grouped[month].hours += t.durationHours;
    });

    return Object.entries(grouped)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([month, data]) => ({
        month: monthNames[Number(month)],
        ...data,
      }));
  }, [trainings]);

  // Learning method distribution
  const learningMethodData = useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.learningMethod] = (acc[t.learningMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  }, [trainings]);

  // Custom label for pie charts
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        {`${name} ${percentage}%`}
      </text>
    );
  };

  if (trainings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated"
        >
          <h3 className="font-bold text-foreground mb-4">התפלגות לפי תחום</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} תכניות`, name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Learning Method Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated"
        >
          <h3 className="font-bold text-foreground mb-4">אופני למידה</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={learningMethodData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {learningMethodData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} תכניות`, name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 2: Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-elevated"
        >
          <h3 className="font-bold text-foreground mb-4">התפלגות לפי קהל יעד</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={audienceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [value, name === 'count' ? 'תכניות' : 'שעות']}
              />
              <Legend />
              <Bar dataKey="count" name="תכניות" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hours" name="שעות" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elevated"
        >
          <h3 className="font-bold text-foreground mb-4">מגמה חודשית</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="trainings" 
                name="תכניות"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line 
                type="monotone" 
                dataKey="participants" 
                name="משתתפים"
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--accent))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default DistributionCharts;
