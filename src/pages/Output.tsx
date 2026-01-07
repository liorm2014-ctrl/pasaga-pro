import React, { useEffect, useMemo, useState } from 'react';
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
  Check
} from 'lucide-react';
import { useMentorLetter } from '@/hooks/useMentorLetter';
import { usePdfExport } from '@/hooks/usePdfExport';

const Output: React.FC = () => {
  const { user, trainings } = useApp();
  const { letter, isLoading, error, generateLetter } = useMentorLetter();
  const { exportToPdf } = usePdfExport();
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const totalTrainings = trainings.length;
    const totalParticipants = trainings.reduce((sum, t) => sum + t.participants, 0);
    const totalHours = trainings.reduce((sum, t) => sum + t.durationHours, 0);
    const avgParticipants = totalTrainings > 0 ? Math.round(totalParticipants / totalTrainings) : 0;
    return { totalTrainings, totalParticipants, totalHours, avgParticipants };
  }, [trainings]);

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
      },
      stats,
      conversation: user?.reflectionConversation?.map(msg => ({ role: msg.role, content: msg.content })),
      visionPlan: user?.visionPlan,
      mentorLetter: letter || undefined,
    });
  };

  const handleExport = (type: string) => {
    toast.success(`מייצא ${type}...`);
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
      title: 'ייצוא המסע המלא ל-PDF',
      description: 'קובץ PDF מקיף עם דשבורד, שיחה, חזון ומכתב מנטור',
      icon: FileText,
      action: handleExportPdf,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'מכתב מנטור אישי',
      description: 'מכתב מעצים ומחזק מה-AI מנטור',
      icon: Mail,
      action: () => document.getElementById('mentor-letter')?.scrollIntoView({ behavior: 'smooth' }),
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'ייצוא ל-Google Docs',
      description: 'ייצוא כל הנתונים לגוגל דוקס לעריכה ושיתוף',
      icon: Download,
      action: () => handleExport('Google Docs'),
      color: 'bg-success/10 text-success',
    },
    {
      title: 'שתף עם הצוות',
      description: 'שלח דוח מסכם בדוא"ל לחברי הצוות',
      icon: Share2,
      action: () => handleExport('דוא"ל'),
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
              <div className="p-6 rounded-xl bg-secondary/30 border border-border/50">
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                  {letter}
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
                <Button onClick={() => handleExport('הורדת מכתב')} className="gap-2">
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
