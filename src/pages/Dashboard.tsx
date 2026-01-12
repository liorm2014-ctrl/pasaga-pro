import React, { useEffect, useMemo, useCallback, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download,
  ArrowLeft,
  MapPin,
  Building2,
  User,
  School,
  Lightbulb,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { useDashboardAnalysis } from '@/hooks/useDashboardAnalysis';
import AIAnalysisSection from '@/components/dashboard/AIAnalysisSection';
import KPICards from '@/components/dashboard/KPICards';
import TrainingsTable from '@/components/dashboard/TrainingsTable';
import InsightsSection from '@/components/dashboard/InsightsSection';
import DistributionCharts from '@/components/dashboard/DistributionCharts';
import { useWorkflowValidation } from '@/hooks/useWorkflowValidation';
import ImbalanceWarning from '@/components/workflow/ImbalanceWarning';
import BlockingDialog from '@/components/workflow/BlockingDialog';

const Dashboard: React.FC = () => {
  const { user, trainings, updateUser, isLoading, isSaving } = useApp();
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
      void updateUser({ dashboardVisited: true });
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

  // Stats for AI analysis
  const stats = useMemo(() => {
    const totalTrainings = trainings.length;
    const totalParticipants = trainings.reduce((sum, t) => sum + t.participants, 0);
    const totalHours = trainings.reduce((sum, t) => sum + t.durationHours, 0);
    const avgParticipants = totalTrainings > 0 ? Math.round(totalParticipants / totalTrainings) : 0;

    return { totalTrainings, totalParticipants, totalHours, avgParticipants };
  }, [trainings]);

  // Category data for AI
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

  // Audience data for AI
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

  // Monthly data for AI
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
      void updateUser({
        swotAnalysis: {
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          opportunities: analysis.opportunities || [],
          threats: analysis.threats || [],
        }
      });
    }
  }, [analysis, user?.swotAnalysis, updateUser]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">טוען נתונים...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
            <h1 className="text-2xl font-bold text-foreground">לוח בקרה ניהולי</h1>
            <p className="text-muted-foreground">סקירה מקיפה של תכניות ההשתלמות בפסג"ה</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              ייצוא Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              ייצוא ל-Docs
            </Button>
          </div>
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
              <School className="h-5 w-5 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">מוסדות חינוך</p>
                <p className="font-medium text-foreground">
                  {(user?.numKindergartens || 0) + (user?.numElementary || 0) + (user?.numHighSchools || 0)} מוסדות
                </p>
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

        {/* KPI Cards */}
        <KPICards trainings={trainings} />

        {/* Distribution Charts */}
        <DistributionCharts trainings={trainings} />

        {/* Trainings Table with Filters */}
        <TrainingsTable trainings={trainings} />

        {/* Insights Section */}
        <InsightsSection trainings={trainings} />

        {/* User Insight Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            onChange={(e) => void updateUser({ segmentationInsight: e.target.value })}
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
            disabled={isSaving}
            onClick={async () => {
              await updateUser({ dashboardVisited: true });
              navigate('/reflection');
            }}
            className="gap-2 text-white border-0"
            style={{ backgroundColor: 'rgba(30, 58, 95, 0.8)' }}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                שמור והמשך
                <ArrowLeft className="h-4 w-4" />
              </>
            )}
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
