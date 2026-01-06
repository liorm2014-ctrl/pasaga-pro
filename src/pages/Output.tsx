import React from 'react';
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
  Quote
} from 'lucide-react';

const Output: React.FC = () => {
  const { user, trainings } = useApp();

  const handleExport = (type: string) => {
    toast.success(`מייצא ${type}...`);
    // In real app, this would trigger actual export
  };

  const mentorLetter = `
    ${user?.gender === 'female' ? 'מנהלת' : 'מנהל'} ${user?.fullName} היקר/ה,

    בסיום מסע הרפלקציה והחזון שעברת, אני רוצה לשתף אותך בכמה תובנות.

    ראיתי מנהל/ת פסג"ה עם חזון ברור ומחויבות עמוקה לפיתוח מקצועי של צוותי ההוראה. 
    הנתונים מראים פעילות עשירה עם ${trainings.length} השתלמויות ו-${trainings.reduce((sum, t) => sum + t.participants, 0)} משתתפים - 
    זו עדות לעבודה מסורה ומתמשכת.

    החוזקות שזיהיתי:
    • יכולת לחבר בין צרכי השטח לתכנון האסטרטגי
    • גמישות מחשבתית בהתמודדות עם אתגרים
    • מנהיגות מקצועית המעודדת למידה והתפתחות

    המלצתי האישית: המשיכו לפעול מתוך החזון, גם כשמופיעים קשיים. 
    הדרך לקומה הבאה של הפסג"ה עוברת דרך צעדים קטנים ועקביים.

    בהערכה רבה,
    המנטור הפדגוגי
  `;

  const inspirationalQuote = user?.gender === 'female' 
    ? "את לא רק מנהלת פסג\"ה - את בונה את הדור הבא של המורים"
    : "אתה לא רק מנהל פסג\"ה - אתה בונה את הדור הבא של המורים";

  const outputCards = [
    {
      title: 'דוח מלא',
      description: 'דוח PDF מקיף עם כל הנתונים, גרפים וניתוחים',
      icon: FileText,
      action: () => handleExport('דוח PDF'),
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'מכתב מנטור אישי',
      description: 'מכתב מעצים ומחזק מה-AI מנטור',
      icon: Mail,
      action: () => handleExport('מכתב מנטור'),
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-elevated"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">מכתב מנטור אישי</h2>
          </div>

          <div className="p-6 rounded-xl bg-secondary/30 border border-border/50">
            <pre className="whitespace-pre-wrap font-sans text-foreground leading-relaxed text-sm">
              {mentorLetter}
            </pre>
          </div>

          <div className="flex justify-end mt-4 gap-3">
            <Button variant="outline" onClick={() => handleExport('העתקה')}>
              העתק
            </Button>
            <Button onClick={() => handleExport('הורדת מכתב')} className="gap-2">
              <Download className="h-4 w-4" />
              הורד מכתב
            </Button>
          </div>
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