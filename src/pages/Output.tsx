import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  FileText, 
  Mail, 
  Download,
  Share2,
  Presentation,
  Sparkles,
  ExternalLink,
  Quote,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  FileDown,
  Eye
} from 'lucide-react';
import { useMentorLetter } from '@/hooks/useMentorLetter';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useDashboardAnalysis } from '@/hooks/useDashboardAnalysis';
import { SwotAnalysis } from '@/types';
import { cn } from '@/lib/utils';
import FullReportViewer from '@/components/output/FullReportViewer';

const Output: React.FC = () => {
  const { user, trainings, updateUser } = useApp();
  const { letter, isLoading, error, generateLetter } = useMentorLetter();
  const { exportToPdf } = usePdfExport();
  const { analysis, isLoading: analysisLoading, fetchAnalysis } = useDashboardAnalysis();
  const [copied, setCopied] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  // Fallback static SWOT for when no AI analysis is available
  const defaultSwot: SwotAnalysis = {
    strengths: [
      'מגוון רחב של השתלמויות',
      'מספר משתתפים גבוה',
      'צוות מנחים מקצועי',
      'פריסה טובה לאורך השנה',
    ],
    weaknesses: [
      'מיעוט השתלמויות בתחום הטכנולוגיה',
      'קושי במעקב אחר יישום בשטח',
      'תקציב מוגבל',
    ],
    opportunities: [
      'שילוב כלי AI בהשתלמויות',
      'הרחבת למידה היברידית',
      'שיתופי פעולה עם פסג"ות נוספות',
      'רפורמות חדשות במשרד החינוך',
    ],
    threats: [
      'קיצוצים תקציביים',
      'שינויים בדרישות הרפורמה',
      'התמודדות עם שחיקה בצוות',
    ],
  };

  // Use AI analysis SWOT if available, fallback to user's saved SWOT, then default
  const swotAnalysis: SwotAnalysis = useMemo(() => {
    if (analysis) {
      return {
        strengths: analysis.strengths || defaultSwot.strengths,
        weaknesses: analysis.weaknesses || defaultSwot.weaknesses,
        opportunities: analysis.opportunities || defaultSwot.opportunities,
        threats: analysis.threats || defaultSwot.threats,
      };
    }
    return user?.swotAnalysis || defaultSwot;
  }, [analysis, user?.swotAnalysis]);

  const swotSections = [
    { key: 'strengths', title: 'חוזקות', icon: TrendingUp, color: 'bg-success/10 text-success border-success/30' },
    { key: 'weaknesses', title: 'חולשות', icon: TrendingDown, color: 'bg-destructive/10 text-destructive border-destructive/30' },
    { key: 'opportunities', title: 'הזדמנויות', icon: Lightbulb, color: 'bg-primary/10 text-primary border-primary/30' },
    { key: 'threats', title: 'איומים', icon: AlertTriangle, color: 'bg-warning/10 text-warning border-warning/30' },
  ];

  const stats = useMemo(() => {
    const totalTrainings = trainings.length;
    const totalParticipants = trainings.reduce((sum, t) => sum + t.participants, 0);
    const totalHours = trainings.reduce((sum, t) => sum + t.durationHours, 0);
    const avgParticipants = totalTrainings > 0 ? Math.round(totalParticipants / totalTrainings) : 0;
    return { totalTrainings, totalParticipants, totalHours, avgParticipants };
  }, [trainings]);

  // Category and audience data for AI analysis
  const categoryData = useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      count: value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
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
      categoryDistribution: categoryData,
      audienceDistribution: audienceData,
      monthlyTrend: monthlyData,
    };

    fetchAnalysis(pisgahData, trainingsData, stats);
  }, [user, categoryData, audienceData, monthlyData, stats, fetchAnalysis]);

  // Auto-fetch AI analysis on load if not available
  useEffect(() => {
    if (trainings.length > 0 && !analysis && !analysisLoading && !user?.swotAnalysis) {
      handleFetchAnalysis();
    }
  }, [trainings.length, analysis, analysisLoading, user?.swotAnalysis, handleFetchAnalysis]);

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

  const conversationSummary = useMemo(() => {
    if (!user?.reflectionConversation?.length) return '';
    return user.reflectionConversation
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n');
  }, [user?.reflectionConversation]);

  // Auto-generate letter on first load
  useEffect(() => {
    if (!letter && !isLoading && !error && trainings.length > 0) {
      handleGenerateLetter();
    }
  }, []);

  const handleGenerateLetter = async () => {
    try {
      await generateLetter(
        {
          fullName: user?.fullName,
          gender: user?.gender,
          district: user?.district,
          city: user?.city,
          pisgaSymbol: user?.pisgaSymbol,
          numKindergartens: user?.numKindergartens,
          numElementary: user?.numElementary,
          numHighSchools: user?.numHighSchools,
        },
        stats,
        null, // analysisData - would be passed from stored state if available
        conversationSummary
      );
      toast.success('המכתב נוצר בהצלחה!');
    } catch {
      toast.error('שגיאה ביצירת המכתב');
    }
  };

  const handleExportPdf = async () => {
    await exportToPdf({
      user: {
        fullName: user?.fullName,
        gender: user?.gender,
        district: user?.district,
        city: user?.city,
        pisgaSymbol: user?.pisgaSymbol,
        numKindergartens: user?.numKindergartens,
        numElementary: user?.numElementary,
        numHighSchools: user?.numHighSchools,
      },
      stats,
      conversation: user?.reflectionConversation?.map(msg => ({ role: msg.role, content: msg.content })),
      visionPlan: user?.visionPlan,
      mentorLetter: letter || undefined,
      analysisData: swotAnalysis ? {
        strengths: swotAnalysis.strengths,
        weaknesses: swotAnalysis.weaknesses,
        opportunities: swotAnalysis.opportunities,
        threats: swotAnalysis.threats,
      } : undefined,
    });
  };

  const handleExportGoogleDocs = () => {
    // Create a text content for Google Docs
    const content = generateTextContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `מסע-מנהיגות-${user?.fullName?.replace(/\s/g, '-') || 'דוח'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('הקובץ הורד! ניתן להעלות אותו ל-Google Docs');
  };

  const generateTextContent = () => {
    let content = `מסע מנהיגות פדגוגית - דוח מסכם\n`;
    content += `${'='.repeat(40)}\n\n`;
    
    // User info
    if (user) {
      content += `פרופיל הפסג"ה\n${'-'.repeat(20)}\n`;
      content += `שם: ${user.fullName || ''}\n`;
      content += `מחוז: ${user.district || ''}\n`;
      content += `ישוב: ${user.city || ''}\n`;
      content += `סמל: ${user.pisgaSymbol || ''}\n\n`;
    }
    
    // Stats
    content += `נתוני השתלמויות\n${'-'.repeat(20)}\n`;
    content += `סך השתלמויות: ${stats.totalTrainings}\n`;
    content += `סך משתתפים: ${stats.totalParticipants}\n`;
    content += `שעות הדרכה: ${stats.totalHours}\n`;
    content += `ממוצע משתתפים: ${stats.avgParticipants}\n\n`;
    
    // SWOT
    content += `ניתוח SWOT\n${'-'.repeat(20)}\n`;
    content += `חוזקות: ${swotAnalysis.strengths.join(', ')}\n`;
    content += `חולשות: ${swotAnalysis.weaknesses.join(', ')}\n`;
    content += `הזדמנויות: ${swotAnalysis.opportunities.join(', ')}\n`;
    content += `איומים: ${swotAnalysis.threats.join(', ')}\n\n`;
    
    // Conversation
    if (user?.reflectionConversation?.length) {
      content += `שיחה רפלקטיבית\n${'-'.repeat(20)}\n`;
      user.reflectionConversation.forEach(msg => {
        const role = msg.role === 'assistant' ? 'מנטור' : 'אני';
        content += `${role}: ${msg.content}\n\n`;
      });
    }
    
    // Vision
    if (user?.visionPlan) {
      content += `תוכנית חזון\n${'-'.repeat(20)}\n`;
      if (user.visionPlan.vision3Years) content += `חזון 3 שנים: ${user.visionPlan.vision3Years}\n\n`;
      if (user.visionPlan.unlimitedBudgetVision) content += `חזון ללא מגבלות: ${user.visionPlan.unlimitedBudgetVision}\n\n`;
    }
    
    // Letter
    if (letter) {
      content += `מכתב מנטור אישי\n${'-'.repeat(20)}\n`;
      content += letter.replace(/\*\*/g, '') + '\n';
    }
    
    return content;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportNotebookLM = () => {
    const content = generateTextContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `מסע-מנהיגות-${user?.fullName?.replace(/\s/g, '-') || 'דוח'}-notebooklm.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('הקובץ הורד! העלה אותו ל-NotebookLM ליצירת מצגת');
  };

  const handleDownloadLetter = () => {
    if (!letter) return;
    const cleanLetter = letter.replace(/\*\*/g, '');
    const blob = new Blob([cleanLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `מכתב-מנטור-${user?.fullName?.replace(/\s/g, '-') || 'אישי'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('המכתב הורד בהצלחה!');
  };

  const handleCopyLetter = () => {
    if (letter) {
      navigator.clipboard.writeText(letter);
      setCopied(true);
      toast.success('המכתב הועתק!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inspirationalQuote = user?.gender === 'female' 
    ? "את לא רק מנהלת פסג\"ה - את בונה את הדור הבא של המורים"
    : "אתה לא רק מנהל פסג\"ה - אתה בונה את הדור הבא של המורים";

  const outputCards = [
    {
      title: 'צפה בדוח המלא',
      description: 'תצוגת מסמך מלאה עם כל הנתונים מהמסע',
      icon: Eye,
      action: () => setShowFullReport(true),
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'ייצוא המסע המלא ל-PDF',
      description: 'קובץ PDF מקיף עם דשבורד, שיחה, חזון ומכתב מנטור',
      icon: FileDown,
      action: handleExportPdf,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'ייצוא ל-Google Docs',
      description: 'הורד קובץ טקסט לייבוא לגוגל דוקס',
      icon: FileText,
      action: handleExportGoogleDocs,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'ייצוא ל-NotebookLM',
      description: 'הורד קובץ להעלאה ל-NotebookLM ליצירת מצגת',
      icon: Presentation,
      action: handleExportNotebookLM,
      color: 'bg-secondary text-secondary-foreground',
    },
    {
      title: 'הדפסה',
      description: 'הדפסת הדוח ישירות מהדפדפן',
      icon: Share2,
      action: handlePrint,
      color: 'bg-warning/10 text-warning',
    },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">תוצרים</h1>
              <p className="text-muted-foreground">דוחות, מכתבים וכלי ייצוא</p>
            </div>
          </div>
          
          <a 
            href="https://notebooklm.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <Presentation className="h-5 w-5" />
            צור מצגת ב-NotebookLM
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Inspirational Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-primary-foreground"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <Quote className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
              {inspirationalQuote}
            </p>
            <p className="text-lg opacity-80">{user?.fullName} | פסג"ה {user?.city}</p>
          </div>
        </motion.div>

        {/* Full Report Viewer Modal */}
        {showFullReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowFullReport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFullReport(false)}
                  className="gap-2"
                >
                  סגור
                </Button>
              </div>
              <FullReportViewer
                user={user}
                trainings={trainings}
                stats={stats}
                swotAnalysis={swotAnalysis}
                mentorLetter={letter}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outputCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated hover-lift cursor-pointer group"
                onClick={card.action}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* SWOT Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">ניתוח SWOT פדגוגי (מבוסס AI)</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFetchAnalysis}
              disabled={analysisLoading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", analysisLoading && "animate-spin")} />
              {analysisLoading ? 'מנתח...' : 'רענן ניתוח'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {swotSections.map((section) => {
              const Icon = section.icon;
              const items = swotAnalysis[section.key as keyof SwotAnalysis];
              
              return (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn("p-4 rounded-xl border backdrop-blur-md", section.color)}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
                >
                  <div className="flex items-center gap-2 mb-3" style={{ textAlign: 'right' }}>
                    <Icon className="h-5 w-5" />
                    <h3 className="font-bold">{section.title}</h3>
                  </div>
                  <ul className="space-y-2" style={{ textAlign: 'right' }}>
                    {items.map((item, index) => (
                      <li key={index} className="text-sm flex items-start gap-2" style={{ direction: 'rtl' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mentor Letter Preview */}
        <motion.div
          id="mentor-letter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-elevated"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">מכתב מנטור אישי</h2>
                <p className="text-sm text-muted-foreground">נכתב במיוחד עבורך על ידי AI</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateLetter}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'יוצר...' : 'צור מחדש'}
            </Button>
          </div>

          {isLoading && !letter && (
            <div className="p-6 rounded-xl bg-secondary/30 border border-border/50">
              <div className="space-y-3">
                <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-2/3" />
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
              <p className="text-destructive mb-2">{error}</p>
              <Button variant="outline" onClick={handleGenerateLetter}>
                נסה שוב
              </Button>
            </div>
          )}

          {letter && (
            <>
              <div className="p-8 rounded-xl bg-secondary/30 border border-border/50" dir="rtl">
                <div className="max-w-none text-foreground text-lg leading-loose whitespace-pre-wrap" style={{ maxWidth: '70ch' }}>
                  {letter.split('\n').map((paragraph, idx) => {
                    if (!paragraph.trim()) return <div key={idx} className="h-4" />;
                    // Convert **text** to bold
                    const parts = paragraph.split(/\*\*(.*?)\*\*/g);
                    return (
                      <p key={idx} className="mb-4">
                        {parts.map((part, i) => 
                          i % 2 === 1 ? <strong key={i} className="font-bold text-primary">{part}</strong> : part
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCopyLetter}
                  className="gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'הועתק!' : 'העתק'}
                </Button>
                <Button onClick={handleDownloadLetter} className="gap-2">
                  <Download className="h-4 w-4" />
                  הורד מכתב
                </Button>
              </div>
            </>
          )}

          {!letter && !isLoading && !error && (
            <div className="p-8 rounded-xl bg-secondary/30 border border-border/50 text-center">
              <Sparkles className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">יצירת מכתב אישי</h3>
              <p className="text-muted-foreground mb-4">
                לחץ על הכפתור למטה ליצירת מכתב מנטור מותאם אישית
              </p>
              <Button onClick={handleGenerateLetter} className="gap-2">
                <Sparkles className="h-4 w-4" />
                צור מכתב
              </Button>
            </div>
          )}
        </motion.div>

        {/* External Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a 
            href="https://gemini.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
          >
            <Sparkles className="h-4 w-4" />
            סוכן Gemini
            <ExternalLink className="h-3 w-3" />
          </a>
          <a 
            href="https://notebooklm.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
          >
            <Presentation className="h-4 w-4" />
            NotebookLM
            <ExternalLink className="h-3 w-3" />
          </a>
          <a 
            href="https://docs.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
          >
            <FileText className="h-4 w-4" />
            Google Docs
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Output;
