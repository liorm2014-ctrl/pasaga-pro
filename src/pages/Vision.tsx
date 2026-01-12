import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Rocket, 
  Lightbulb,
  ArrowLeft,
  Save,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { VisionPlan } from '@/types';

const Vision: React.FC = () => {
  const { user, updateUser, isLoading, isSaving } = useApp();
  const navigate = useNavigate();

  const [visionPlan, setVisionPlan] = useState<VisionPlan>(
    user?.visionPlan || {
      myBelief: '',
      unlimitedBudgetVision: '',
    }
  );

  const suggestedIdeas = [
    'הקמת מרכז חדשנות פדגוגית עם סטודיו הקלטות',
    'תוכנית מנטורינג לצוותי הנחיה',
    'שיתופי פעולה בינלאומיים עם מוסדות חינוך',
    'פיתוח קורסים דיגיטליים אסינכרוניים',
    'הכשרה מתקדמת בכלי AI לצוות המדריכים',
    'מעבדת חווית למידה אינטראקטיבית',
  ];

  const handleSave = async () => {
    const success = await updateUser({
      visionPlan,
      visionCompleted: true,
    });
    if (success) {
      toast.success('החזון נשמר בהצלחה!');
      navigate('/output');
    } else {
      toast.error('אירעה שגיאה בשמירת החזון');
    }
  };

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
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">חזון וקפיצה</h1>
            <p className="text-muted-foreground">בניית חזון ו"הקומה הבאה" של הפסג"ה</p>
          </div>
        </div>

        {/* My Belief - "אני מאמין שלי" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 border border-primary/30 bg-primary/15 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">"אני מאמין שלי"</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="my-belief" className="text-base text-muted-foreground">
              שתפו את הערכים המנחים, החזון האישי והאמונות הפדגוגיות שמובילות אתכם...
            </Label>
            <Textarea
              id="my-belief"
              value={visionPlan.myBelief || ''}
              onChange={(e) => setVisionPlan(prev => ({ ...prev, myBelief: e.target.value }))}
              placeholder='מה מנחה אתכם? מה אתם מאמינים בחינוך?...'
              className="min-h-[120px] bg-white/80"
            />
          </div>
        </motion.div>

        {/* Unlimited Budget Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-6 border border-accent/30 bg-accent/15 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">חזון ללא מגבלות</h2>
              <p className="text-sm text-muted-foreground">דמיין שיש לך תקציב בלתי מוגבל</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unlimited-vision" className="text-base font-medium">
                איזה חזון היית רוצה להגשים אילו ניתן לך תקציב בלתי מוגבל? איזה יעדים הוא מקדם?
              </Label>
              <Textarea
                id="unlimited-vision"
                value={visionPlan.unlimitedBudgetVision || ''}
                onChange={(e) => setVisionPlan(prev => ({ ...prev, unlimitedBudgetVision: e.target.value }))}
                placeholder='תאר/י את החזון הגדול שלך ללא מגבלות תקציביות...'
                className="min-h-[120px] bg-white/80"
              />
            </div>

            {/* Suggested Ideas */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">רעיונות לקידום יעדי הפסג"ה:</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedIdeas.map((idea, index) => (
                  <button
                    key={index}
                    onClick={() => setVisionPlan(prev => ({
                      ...prev,
                      unlimitedBudgetVision: prev.unlimitedBudgetVision 
                        ? `${prev.unlimitedBudgetVision}\n• ${idea}`
                        : `• ${idea}`
                    }))}
                    className="px-3 py-1.5 text-sm rounded-full bg-white/80 hover:bg-primary/10 hover:text-primary transition-colors border border-border/50"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mentor Chat Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-6 border border-warning/30 bg-warning/20 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">שיחה עם מנטור מנהלי פסג"ה</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  קבל הכוונה וייעוץ מקצועי ממנטור מנוסה בתחום ניהול פסג"ה. 
                  המנטור יסייע לך לגבש את החזון ולזהות הזדמנויות לפיתוח.
                </p>
              </div>
            </div>
            <a 
              href="https://gemini.google.com/gem/1dzPAAN3Sok2jwxwZ3swuRQWo7S7a0IwQ?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="gap-2 whitespace-nowrap bg-white/80 text-foreground hover:bg-white border border-border">
                <Sparkles className="h-4 w-4" />
                התחל שיחה עם המנטור
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/reflection')}>
            חזרה
          </Button>
          <Button 
            size="lg" 
            disabled={isSaving}
            onClick={handleSave} 
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
                <Save className="h-4 w-4" />
                שמור והמשך
                <ArrowLeft className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Vision;