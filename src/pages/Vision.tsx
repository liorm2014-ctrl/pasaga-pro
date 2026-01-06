import React, { useState, useEffect } from 'react';
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
  TrendingUp, 
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  Plus,
  X,
  ArrowLeft,
  Save
} from 'lucide-react';
import { SwotAnalysis, VisionPlan } from '@/types';
import { cn } from '@/lib/utils';

const Vision: React.FC = () => {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();

  const [swotAnalysis] = useState<SwotAnalysis>({
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
  });

  const [visionPlan, setVisionPlan] = useState<VisionPlan>(
    user?.visionPlan || {
      vision3Years: '',
      measurableGoals: [''],
      actionSteps: [''],
      expectedChallenges: [''],
      requiredResources: [''],
    }
  );

  useEffect(() => {
    if (!user?.reflectionCompleted) {
      navigate('/reflection');
    }
  }, [user, navigate]);

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

  const swotSections = [
    { key: 'strengths', title: 'חוזקות', icon: TrendingUp, color: 'bg-success/10 text-success border-success/30' },
    { key: 'weaknesses', title: 'חולשות', icon: TrendingDown, color: 'bg-destructive/10 text-destructive border-destructive/30' },
    { key: 'opportunities', title: 'הזדמנויות', icon: Lightbulb, color: 'bg-primary/10 text-primary border-primary/30' },
    { key: 'threats', title: 'איומים', icon: AlertTriangle, color: 'bg-warning/10 text-warning border-warning/30' },
  ];

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

        {/* SWOT Analysis */}
        <div className="card-elevated">
          <h2 className="text-xl font-bold text-foreground mb-6">ניתוח SWOT פדגוגי</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {swotSections.map((section) => {
              const Icon = section.icon;
              const items = swotAnalysis[section.key as keyof SwotAnalysis];
              
              return (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn("p-4 rounded-xl border", section.color)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-5 w-5" />
                    <h3 className="font-bold">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
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
          <Button size="lg" onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            שמור תוכנית חזון
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Vision;