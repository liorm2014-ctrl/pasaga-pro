import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Rocket, 
  Lightbulb,
  Plus,
  X,
  ArrowLeft,
  Save,
  ExternalLink,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { VisionPlan } from '@/types';

const Vision: React.FC = () => {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();

  const [visionPlan, setVisionPlan] = useState<VisionPlan>(
    user?.visionPlan || {
      vision3Years: '',
      unlimitedBudgetVision: '',
      measurableGoals: [''],
      actionSteps: [''],
      expectedChallenges: [''],
      requiredResources: [''],
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

  // Remove the redirect - allow direct access to Vision page

  const handleArrayChange = (field: keyof VisionPlan, index: number, value: string) => {
    setVisionPlan(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item),
    }));
  };

  const addArrayItem = (field: keyof VisionPlan) => {
    setVisionPlan(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ''],
    }));
  };

  const removeArrayItem = (field: keyof VisionPlan, index: number) => {
    setVisionPlan(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    updateUser({
      visionPlan,
      visionCompleted: true,
    });
    toast.success('תוכנית החזון נשמרה בהצלחה!');
    navigate('/output');
  };

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
            <p className="text-muted-foreground">בניית תוכנית חזון ו"הקומה הבאה" של הפסג"ה</p>
          </div>
        </div>

        {/* Mentor Chat Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20"
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
              <Button className="gap-2 whitespace-nowrap">
                <Sparkles className="h-4 w-4" />
                התחל שיחה עם המנטור
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Unlimited Budget Vision */}
        <div className="card-elevated">
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
                className="min-h-[120px]"
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
                    className="px-3 py-1.5 text-sm rounded-full bg-secondary hover:bg-primary/10 hover:text-primary transition-colors border border-border/50"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vision Form */}
        <div className="card-elevated">
          <h2 className="text-xl font-bold text-foreground mb-6">תוכנית חזון</h2>
          
          <div className="space-y-6">
            {/* 3 Year Vision */}
            <div className="space-y-2">
              <Label htmlFor="vision" className="text-base font-medium">
                החזון שלי ל-3 שנים קדימה
              </Label>
              <Textarea
                id="vision"
                value={visionPlan.vision3Years}
                onChange={(e) => setVisionPlan(prev => ({ ...prev, vision3Years: e.target.value }))}
                placeholder='תאר/י את החזון הפדגוגי שלך לפסג"ה בשלוש השנים הקרובות...'
                className="min-h-[120px]"
              />
            </div>

            {/* Measurable Goals */}
            <div className="space-y-2">
              <Label className="text-base font-medium">יעדים מדידים</Label>
              {visionPlan.measurableGoals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={(e) => handleArrayChange('measurableGoals', index, e.target.value)}
                    placeholder="הוסף יעד מדיד..."
                  />
                  {visionPlan.measurableGoals.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('measurableGoals', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('measurableGoals')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                הוסף יעד
              </Button>
            </div>

            {/* Action Steps */}
            <div className="space-y-2">
              <Label className="text-base font-medium">צעדי פעולה</Label>
              {visionPlan.actionSteps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={step}
                    onChange={(e) => handleArrayChange('actionSteps', index, e.target.value)}
                    placeholder="הוסף צעד פעולה..."
                  />
                  {visionPlan.actionSteps.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('actionSteps', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('actionSteps')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                הוסף צעד
              </Button>
            </div>

            {/* Expected Challenges */}
            <div className="space-y-2">
              <Label className="text-base font-medium">אתגרים צפויים</Label>
              {visionPlan.expectedChallenges.map((challenge, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={challenge}
                    onChange={(e) => handleArrayChange('expectedChallenges', index, e.target.value)}
                    placeholder="הוסף אתגר..."
                  />
                  {visionPlan.expectedChallenges.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('expectedChallenges', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('expectedChallenges')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                הוסף אתגר
              </Button>
            </div>

            {/* Required Resources */}
            <div className="space-y-2">
              <Label className="text-base font-medium">משאבים נדרשים</Label>
              {visionPlan.requiredResources.map((resource, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={resource}
                    onChange={(e) => handleArrayChange('requiredResources', index, e.target.value)}
                    placeholder="הוסף משאב..."
                  />
                  {visionPlan.requiredResources.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('requiredResources', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('requiredResources')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                הוסף משאב
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/reflection')}>
            חזרה
          </Button>
          <Button 
            size="lg" 
            onClick={handleSave} 
            className="gap-2 text-white border-0"
            style={{ backgroundColor: 'rgba(30, 58, 95, 0.8)' }}
          >
            <Save className="h-4 w-4" />
            שמור והמשך
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Vision;