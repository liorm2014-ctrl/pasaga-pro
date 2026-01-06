import React, { useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Clock, 
  BookOpen,
  Download,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
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

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

const Dashboard: React.FC = () => {
  const { user, trainings, updateUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    if (!user.dashboardVisited) {
      updateUser({ dashboardVisited: true });
    }
  }, [user, navigate, updateUser]);

  const stats = useMemo(() => {
    const totalTrainings = trainings.length;
    const totalParticipants = trainings.reduce((sum, t) => sum + t.participants, 0);
    const totalHours = trainings.reduce((sum, t) => sum + t.durationHours, 0);
    const avgParticipants = totalTrainings > 0 ? Math.round(totalParticipants / totalTrainings) : 0;

    return { totalTrainings, totalParticipants, totalHours, avgParticipants };
  }, [trainings]);

  const categoryData = useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
    }));
  }, [trainings]);

  const audienceData = useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.targetAudience] = (acc[t.targetAudience] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }, [trainings]);

  const monthlyData = useMemo(() => {
    const months = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ'];
    return months.map((month, index) => {
      const monthTrainings = trainings.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === index;
      });
      return {
        month,
        trainings: monthTrainings.length,
        participants: monthTrainings.reduce((sum, t) => sum + t.participants, 0),
      };
    });
  }, [trainings]);

  const renderCustomLabel = ({ name, percentage }: { name: string; percentage: number }) => {
    return `${name} ${percentage}%`;
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ניתוח פדגוגי</h1>
            <p className="text-muted-foreground">סקירה מקיפה של נתוני ההשתלמויות בפסג"ה</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            ייצוא ל-Docs
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'סך השתלמויות', value: stats.totalTrainings, icon: BookOpen, color: 'text-primary' },
            { label: 'סך משתתפים', value: stats.totalParticipants.toLocaleString(), icon: Users, color: 'text-accent' },
            { label: 'שעות הדרכה', value: stats.totalHours, icon: Clock, color: 'text-success' },
            { label: 'ממוצע משתתפים', value: stats.avgParticipants, icon: BarChart3, color: 'text-warning' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-elevated"
            >
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated"
          >
            <h3 className="font-bold text-foreground mb-4">התפלגות לפי קטגוריה</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart - Audience */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated"
          >
            <h3 className="font-bold text-foreground mb-4">התפלגות לפי קהל יעד</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={audienceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Line Chart - Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elevated lg:col-span-2"
          >
            <h3 className="font-bold text-foreground mb-4">מגמת השתלמויות ומשתתפים</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))' }} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--foreground))' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="trainings" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="השתלמויות"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="participants" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  name="משתתפים"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* AI Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elevated bg-gradient-to-br from-primary/5 to-accent/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">ניתוח AI לפסג"ה</h3>
          </div>
          
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="mb-4">
              <strong>אפיון הפסג"ה:</strong> הפסג"ה שלך מתאפיינת בדגש משמעותי על {categoryData[0]?.name || 'פדגוגיה'}, 
              עם התמקדות בקהל יעד מגוון. ניכר מאמץ להכליל את כלל שכבות הגיל במערכת החינוך.
            </p>
            <p className="mb-4">
              <strong>חוזקות:</strong> מגוון רחב של השתלמויות ({stats.totalTrainings} השתלמויות), 
              מספר משתתפים גבוה ({stats.totalParticipants}), ופריסה טובה על פני השנה.
            </p>
            <p>
              <strong>המלצות:</strong> מומלץ לשקול הרחבת ההשתלמויות בתחום הטכנולוגיה והבינה המלאכותית, 
              וכן לבחון אפשרויות ללמידה א-סינכרונית להגדלת הנגישות.
            </p>
          </div>
        </motion.div>

        {/* Next Step */}
        <div className="flex justify-end">
          <Button 
            size="lg" 
            onClick={() => navigate('/reflection')}
            className="gap-2"
          >
            המשך לשיחה רפלקטיבית
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;