import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from '@/hooks/useDashboardAnalysis';

interface AIAnalysisSectionProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({
  analysis,
  isLoading,
  error,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated bg-gradient-to-br from-primary/5 to-accent/5"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">ניתוח AI מעמיק</h3>
            <p className="text-sm text-muted-foreground">מנתח את הנתונים...</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
          </div>
          <div className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated bg-gradient-to-br from-destructive/5 to-destructive/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">שגיאה בניתוח</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            נסה שוב
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!analysis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated bg-gradient-to-br from-primary/5 to-accent/5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">ניתוח AI מעמיק</h3>
              <p className="text-sm text-muted-foreground">קבל תובנות מעמיקות על הפסג"ה שלך</p>
            </div>
          </div>
          <Button onClick={onRefresh} className="gap-2">
            <Sparkles className="h-4 w-4" />
            הפעל ניתוח
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      dir="rtl"
    >
      {/* Header with Key Insight */}
      <div className="card-elevated bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg">ניתוח AI מעמיק</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            רענן
          </Button>
        </div>

        {/* Characterization */}
        <div className="mb-6 p-4 bg-background/50 rounded-xl border border-border/50">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-right">אפיון הפסג"ה</h4>
          <p className="text-foreground leading-relaxed text-base text-right">{analysis.characterization}</p>
        </div>

        {/* Key Insight */}
        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-right">
              <h4 className="text-sm font-semibold text-primary mb-1">תובנה מרכזית</h4>
              <p className="text-foreground text-base">{analysis.keyInsight}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated border-success/20 bg-success/5 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3 justify-end">
            <h4 className="font-semibold text-success text-base">חוזקות</h4>
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-base text-foreground justify-end text-right">
                {strength}
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated border-warning/20"
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3 justify-end">
            <h4 className="font-semibold text-warning text-base">אתגרים</h4>
            <TrendingDown className="h-5 w-5 text-warning" />
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2 text-base text-foreground justify-end text-right">
                {weakness}
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Opportunities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated border-primary/20"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3 justify-end">
            <h4 className="font-semibold text-primary text-base">הזדמנויות</h4>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <ul className="space-y-2">
            {analysis.opportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start gap-2 text-base text-foreground justify-end text-right">
                {opportunity}
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Threats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card-elevated border-destructive/20"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3 justify-end">
            <h4 className="font-semibold text-destructive text-base">איומים</h4>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <ul className="space-y-2">
            {analysis.threats.map((threat, index) => (
              <li key={index} className="flex items-start gap-2 text-base text-foreground justify-end text-right">
                {threat}
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-elevated bg-gradient-to-br from-accent/5 to-primary/5"
      >
        <div className="flex items-center gap-2 mb-4 justify-end">
          <h4 className="font-semibold text-foreground text-base">המלצות לפעולה</h4>
          <Lightbulb className="h-5 w-5 text-accent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="p-3 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="flex items-center gap-2 mb-2 justify-end">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <p className="text-base text-foreground text-right">{recommendation}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIAnalysisSection;