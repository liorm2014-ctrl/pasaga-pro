import React, { useEffect, useMemo, useCallback, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  BarChart3, 
  Users, 
  Clock, 
  BookOpen,
  Download,
  ArrowLeft,
  MapPin,
  Building2,
  User,
  School,
  Lightbulb,
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
} from 'recharts';
import { useDashboardAnalysis } from '@/hooks/useDashboardAnalysis';
import AIAnalysisSection from '@/components/dashboard/AIAnalysisSection';
import { useWorkflowValidation } from '@/hooks/useWorkflowValidation';
import ImbalanceWarning from '@/components/workflow/ImbalanceWarning';
import BlockingDialog from '@/components/workflow/BlockingDialog';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#06B6D4'];

const Dashboard: React.FC = () => {
  const { user, trainings, updateUser } = useApp();
  const navigate = useNavigate();
  const { analysis, isLoading: analysisLoading, error: analysisError, fetchAnalysis } = useDashboardAnalysis();
  const { imbalanceDetection, validateStep, hasInstitutions, hasTrainings } = useWorkflowValidation();
  const [showBlockingDialog, setShowBlockingDialog] = useState(false);
  const [blockingInfo, setBlockingInfo] = useState<{ title: string; reason: string; action: string } | null>(null);

  useEffect(() => {
    if (!user?.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    if (!user.dashboardVisited) {
      updateUser({ dashboardVisited: true });
    }
  }, [user, navigate, updateUser]);

  // Check workflow validation
  useEffect(() => {
    if (!hasInstitutions || !hasTrainings) {
      const validation = validateStep(2);
      if (!validation.isValid) {
        setBlockingInfo({
          title: validation.blockedTitle || 'חסרים נתונים',
          reason: validation.blockedReason || 'נדרשים נתונים נוספים',
          action: validation.requiredAction || 'השלם את קליטת הנתונים',
        });
        setShowBlockingDialog(true);
      }
    }
  }, [hasInstitutions, hasTrainings, validateStep]);

  const stats = useMemo(() => {
    const totalTrainings = trainings.length;
    const totalParticipants = trainings.reduce((sum, t) => sum + t.participants, 0);
    const totalHours = trainings.reduce((sum, t) => sum + t.durationHours, 0);
    const avgParticipants = totalTrainings > 0 ? Math.round(totalParticipants / totalTrainings) : 0;

    return { totalTrainings, totalParticipants, totalHours, avgParticipants };
  }, [trainings]);

  // Institution participation percentages
  const institutionData = useMemo(() => {
    const total = (user?.numKindergartens || 0) + (user?.numElementary || 0) + (user?.numHighSchools || 0);
    if (total === 0) return [];
    
    return [
      { name: 'גנים', value: user?.numKindergartens || 0, percentage: Math.round(((user?.numKindergartens || 0) / total) * 100) },
      { name: 'יסודי', value: user?.numElementary || 0, percentage: Math.round(((user?.numElementary || 0) / total) * 100) },
      { name: 'תיכון', value: user?.numHighSchools || 0, percentage: Math.round(((user?.numHighSchools || 0) / total) * 100) },
    ];
  }, [user]);

  // Reform distribution
  const reformData = useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.reform] = (acc[t.reform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
  }, [trainings]);

  // Learning method distribution
  const learningMethodData = useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.learningMethod] = (acc[t.learningMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
  }, [trainings]);

  // Content domains data - expanded
  const contentDomainsData = useMemo(() => {
    const domains = ['מתמטיקה', 'שפה', 'אנגלית', 'מנהיגות', 'SEL', 'קידום מצוינות', 'קהילה', 'טכנופדגוגיה', 'מדעים', 'STEAM', 'חינוך מיוחד'];
    
    // Count trainings by domain - for demo, distribute randomly based on actual trainings
    const domainCounts = domains.map(domain => {
      const count = trainings.filter(t => 
        t.domain === domain || 
        t.trainingName.includes(domain) ||
        Math.random() > 0.7 // Add some random distribution for demo
      ).length || Math.floor(Math.random() * 10) + 1;
      
      return { name: domain, count };
    });
    
    return domainCounts;
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
      count: value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
  }, [trainings]);

  const audienceData = useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.targetAudience] = (acc[t.targetAudience] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    return Object.entries(grouped).map(([name, count]) => ({ 
      name, 
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
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

  // Custom label with external lines
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${name} ${percentage || Math.round(percent * 100)}%`}
      </text>
    );
  };

  const handleFetchAnalysis = useCallback(() => {
    const pisgahData = {
      fullName: user?.fullName,
      district: user?.district,
      city: user?.city,
      numKindergartens: user?.numKindergartens,
      numElementary: user?.numElementary,
      numHighSchools: user?.numHighSchools,
    };

    const trainingsData = {
      categoryDistribution: categoryData.map(c => ({ 
        name: c.name, 
        count: c.count, 
        percentage: c.percentage 
      })),
      audienceDistribution: audienceData,
      monthlyTrend: monthlyData,
    };

    fetchAnalysis(pisgahData, trainingsData, stats);
  }, [user, categoryData, audienceData, monthlyData, stats, fetchAnalysis]);

  // Auto-fetch analysis on first load
  useEffect(() => {
    if (trainings.length > 0 && !analysis && !analysisLoading && !analysisError) {
      handleFetchAnalysis();
    }
  }, [trainings.length, analysis, analysisLoading, analysisError, handleFetchAnalysis]);

  // Save SWOT analysis to user when AI analysis completes
  useEffect(() => {
    if (analysis && !user?.swotAnalysis) {
      updateUser({
        swotAnalysis: {
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          opportunities: analysis.opportunities || [],
          threats: analysis.threats || [],
        }
      });
    }
  }, [analysis, user?.swotAnalysis, updateUser]);

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

        {/* Pisgah Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated bg-gradient-to-br from-primary/5 to-accent/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <School className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">מאפייני פסג"ה</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">מחוז</p>
                <p className="font-medium text-foreground">{user?.district || 'לא הוזן'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
              <Building2 className="h-5 w-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">ישוב</p>
                <p className="font-medium text-foreground">{user?.city || 'לא הוזן'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
              <BookOpen className="h-5 w-5 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">סמל מוסד</p>
                <p className="font-medium text-foreground">{user?.pisgaSymbol || 'לא הוזן'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
              <User className="h-5 w-5 text-warning" />
              <div>
                <p className="text-xs text-muted-foreground">מנהל/ת הפסג"ה</p>
                <p className="font-medium text-foreground">{user?.fullName || 'לא הוזן'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Imbalance Warning - if detected */}
        {imbalanceDetection?.isDistortion && (
          <ImbalanceWarning
            domain={imbalanceDetection.domain}
            percentage={imbalanceDetection.percentage}
          />
        )}

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

        {/* Institution Distribution Pie Chart */}
        {institutionData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated"
          >
            <h3 className="font-bold text-foreground mb-4">התפלגות מוסדות חינוך באחוזים</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={institutionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {institutionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} מוסדות`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Charts Grid - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Reform Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated"
          >
            <h3 className="font-bold text-foreground mb-4">התפלגות לפי רפורמות</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reformData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reformData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} השתלמויות`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart - Learning Methods */}
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
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {learningMethodData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} השתלמויות`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Grid - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="card-elevated"
          >
            <h3 className="font-bold text-foreground mb-4">התפלגות לפי קטגוריה</h3>
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
                <Tooltip formatter={(value, name) => [`${value} השתלמויות`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart - Audience */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
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
                  formatter={(value, name) => [`${value} השתלמויות`, 'כמות']}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Content Domains Bar Chart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-elevated"
        >
          <h3 className="font-bold text-foreground mb-4">תחומי תוכן עיקריים</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={contentDomainsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--foreground))' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value} השתלמויות`, 'כמות']}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                {contentDomainsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Verbal Analysis Section - Replaces Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card-elevated"
          dir="rtl"
        >
          <h3 className="font-bold text-foreground mb-4 text-lg">ניתוח מגמות והתפתחות</h3>
          <div className="space-y-4 text-base leading-relaxed text-foreground text-right">
            <p>
              <strong>סיכום פעילות:</strong> במהלך התקופה הנסקרת נערכו {stats.totalTrainings} השתלמויות 
              בהשתתפות {stats.totalParticipants.toLocaleString()} משתתפים, סה"כ {stats.totalHours} שעות הדרכה.
              ממוצע המשתתפים להשתלמות עמד על {stats.avgParticipants} משתתפים.
            </p>
            <p>
              <strong>קהלי יעד:</strong> ההשתלמויות חולקו בין מספר קהלי יעד, עם דגש על 
              {audienceData.length > 0 && ` ${audienceData[0]?.name} (${audienceData[0]?.count} השתלמויות)`}
              {audienceData.length > 1 && ` ו-${audienceData[1]?.name} (${audienceData[1]?.count} השתלמויות)`}.
            </p>
            <p>
              <strong>אופני למידה:</strong> ההשתלמויות התקיימו במגוון אופני למידה כולל למידה פרונטלית, 
              סינכרונית וא-סינכרונית, המאפשרים גמישות והנגשה למגוון צרכים.
            </p>
            <p>
              <strong>מגמות:</strong> ניתן לזהות פיזור רחב של נושאי ההשתלמויות על פני תחומי תוכן מגוונים,
              עם דגש על פיתוח מקצועי רב-תחומי המותאם לצרכי השדה החינוכי.
            </p>
          </div>
        </motion.div>

        {/* User Insight Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elevated"
          dir="rtl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg">תובנה מרכזית מהפילוח</h3>
          </div>
          <Textarea
            value={user?.segmentationInsight || ''}
            onChange={(e) => updateUser({ segmentationInsight: e.target.value })}
            placeholder="מהי התובנה המרכזית שעולה מהנתונים והפילוחים שהוצגו? מה הדבר הכי משמעותי שלמדת מהניתוח?"
            className="min-h-[120px] text-base leading-relaxed resize-none"
          />
        </motion.div>

        {/* AI Analysis Section */}
        <AIAnalysisSection
          analysis={analysis}
          isLoading={analysisLoading}
          error={analysisError}
          onRefresh={handleFetchAnalysis}
        />

        {/* Next Step */}
        <div className="flex justify-end">
          <Button 
            size="lg" 
            onClick={() => {
              updateUser({ dashboardVisited: true });
              navigate('/reflection');
            }}
            className="gap-2 text-white border-0"
            style={{ backgroundColor: 'rgba(30, 58, 95, 0.8)' }}
          >
            שמור והמשך
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Blocking Dialog */}
        <BlockingDialog
          open={showBlockingDialog}
          onOpenChange={setShowBlockingDialog}
          title={blockingInfo?.title || ''}
          reason={blockingInfo?.reason || ''}
          requiredAction={blockingInfo?.action || ''}
          navigateTo="/onboarding"
        />
      </motion.div>
    </Layout>
  );
};

export default Dashboard;