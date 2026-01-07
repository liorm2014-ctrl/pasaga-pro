import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Training } from '@/types';

interface FullReportViewerProps {
  user?: User;
  trainings: Training[];
  stats: {
    totalTrainings: number;
    totalParticipants: number;
    totalHours: number;
    avgParticipants: number;
  };
  mentorLetter?: string | null;
  analysisData?: {
    characterization?: string;
    keyInsight?: string;
    recommendations?: string[];
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
  };
  pulseMetrics?: {
    innovation: number;
    fieldConnection: number;
    organizationalResilience: number;
    leadership: number;
    initiative: number;
  };
}

const FullReportViewer: React.FC<FullReportViewerProps> = ({
  user,
  trainings,
  stats,
  mentorLetter,
  analysisData,
  pulseMetrics,
}) => {
  const today = new Date().toLocaleDateString('he-IL');

  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-bold text-primary">{part}</strong> : part
    );
  };

  // Calculate audience distribution
  const audienceDistribution = React.useMemo(() => {
    const grouped = trainings.reduce((acc, t) => {
      acc[t.targetAudience] = (acc[t.targetAudience] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return grouped;
  }, [trainings]);

  // Calculate total institutions
  const totalInstitutions = (user?.numKindergartens || 0) + (user?.numElementary || 0) + (user?.numHighSchools || 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden" dir="rtl">
      {/* Document Header */}
      <div className="bg-gradient-to-l from-primary/10 to-accent/10 px-8 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">פסג"ה - תוכנית עבודה אסטרטגית</h2>
          <span className="text-sm text-muted-foreground">{today}</span>
        </div>
      </div>

      {/* Scrollable Document Content */}
      <ScrollArea className="h-[600px]">
        <div className="p-8 space-y-10" style={{ fontFamily: 'David, serif', lineHeight: '1.8' }}>
          
          {/* ===== פרק 1: תעודת זהות ומיפוי נתונים ===== */}
          <section className="pb-8 border-b-2 border-primary/20">
            <h1 className="text-2xl font-bold text-primary mb-6 text-center">פרק 1: תעודת זהות ומיפוי נתונים</h1>
            
            <div className="grid grid-cols-2 gap-6 text-base mb-6">
              <div className="bg-secondary/20 p-4 rounded-lg">
                <span className="text-muted-foreground block mb-1">סמל מוסד:</span>
                <span className="font-bold text-lg">{user?.pisgaSymbol || '—'}</span>
              </div>
              <div className="bg-secondary/20 p-4 rounded-lg">
                <span className="text-muted-foreground block mb-1">ישוב:</span>
                <span className="font-bold text-lg">{user?.city || '—'}</span>
              </div>
            </div>

            {/* קהל יעד */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-foreground mb-3">קהל יעד:</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-right">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-3 bg-secondary/10 font-medium">גנים</td>
                      <td className="p-3">{user?.numKindergartens || 0}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 bg-secondary/10 font-medium">בתי ספר יסודיים</td>
                      <td className="p-3">{user?.numElementary || 0}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 bg-secondary/10 font-medium">בתי ספר תיכוניים</td>
                      <td className="p-3">{user?.numHighSchools || 0}</td>
                    </tr>
                    <tr className="bg-primary/10">
                      <td className="p-3 font-bold">סה"כ:</td>
                      <td className="p-3 font-bold">{totalInstitutions}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ניתוח פילוח השתלמויות */}
            <div className="bg-accent/5 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-foreground mb-4">ניתוח פילוח השתלמויות:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary">{stats.totalTrainings}</div>
                  <div className="text-sm text-muted-foreground">סה"כ השתלמויות</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary">{stats.totalParticipants.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">סה"כ משתתפים</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary">{stats.totalHours}</div>
                  <div className="text-sm text-muted-foreground">שעות הדרכה</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary">{stats.avgParticipants}</div>
                  <div className="text-sm text-muted-foreground">ממוצע משתתפים</div>
                </div>
              </div>
              
              {/* Distribution by audience */}
              {Object.keys(audienceDistribution).length > 0 && (
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">התפלגות לפי קהל יעד:</h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(audienceDistribution).map(([audience, count]) => (
                      <span key={audience} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {audience}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ===== תובנה מרכזית מהפילוח ===== */}
          <section className="pb-8 border-b-2 border-primary/20">
            <h2 className="text-xl font-bold text-primary mb-4">תובנה מרכזית מהפילוח:</h2>
            <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-6 rounded-xl border border-primary/20">
              <p className="text-lg leading-relaxed">
                {user?.segmentationInsight || analysisData?.keyInsight || 'לא הוזנה תובנה מרכזית'}
              </p>
            </div>
          </section>

          {/* ===== פרק 2: אני מאמין ===== */}
          <section className="pb-8 border-b-2 border-primary/20">
            <h1 className="text-2xl font-bold text-primary mb-6 text-center">פרק 2</h1>
            
            {/* אני מאמין */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-foreground mb-3">אני מאמין:</h3>
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                <p className="text-lg leading-relaxed">
                  {user?.visionPlan?.myBelief || 'לא הוזן'}
                </p>
              </div>
            </div>

            {/* פעולות דגל והשפעתן */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-foreground mb-3">פעולות דגל והשפעתן:</h3>
              <div className="bg-secondary/20 p-6 rounded-xl">
                {user?.visionPlan?.actionSteps && user.visionPlan.actionSteps.length > 0 ? (
                  <ul className="space-y-2">
                    {user.visionPlan.actionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">לא הוזנו פעולות דגל</p>
                )}
              </div>
            </div>

            {/* חזון "ללא הגבלה" */}
            <div>
              <h3 className="font-bold text-lg text-foreground mb-3">חזון "ללא הגבלה":</h3>
              <div className="bg-gradient-to-br from-primary/5 to-accent/10 p-6 rounded-xl border border-primary/20">
                <p className="text-lg leading-relaxed">
                  {user?.visionPlan?.unlimitedBudgetVision || 'לא הוזן'}
                </p>
              </div>
            </div>
          </section>

          {/* ===== פרק 3: אסטרטגיית צמיחה ופתרון קשיים ===== */}
          <section className="pb-8 border-b-2 border-primary/20">
            <h1 className="text-2xl font-bold text-primary mb-6 text-center">פרק 3</h1>
            <h2 className="text-xl font-bold text-foreground mb-4 text-center">אסטרטגיית צמיחה ופתרון קשיים</h2>

            {/* מדד הדופק הפדגוגי */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                📈 מדד הדופק הפדגוגי:
              </h3>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-border">
                <div className="space-y-3">
                  {[
                    { label: 'חדשנות', value: pulseMetrics?.innovation || 0 },
                    { label: 'חיבור לשטח', value: pulseMetrics?.fieldConnection || 0 },
                    { label: 'חוסן ארגוני', value: pulseMetrics?.organizationalResilience || 0 },
                    { label: 'מנהיגות', value: pulseMetrics?.leadership || 0 },
                    { label: 'יוזמה', value: pulseMetrics?.initiative || 0 },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium">{metric.label}:</span>
                      <div className="flex-1 bg-secondary/30 rounded-full h-4 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                      <span className="w-12 text-sm font-bold text-primary">{metric.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* לזהות */}
            <div className="bg-secondary/10 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-foreground mb-3">לזהות:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <strong>חדשנות:</strong> {analysisData?.strengths?.[0] || '—'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <strong>חיבור לשטח:</strong> {analysisData?.strengths?.[1] || '—'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <strong>חוסן ארגוני:</strong> {analysisData?.opportunities?.[0] || '—'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <strong>מנהיגות:</strong> {analysisData?.opportunities?.[1] || '—'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <strong>יוזמה:</strong> {analysisData?.recommendations?.[0] || '—'}
                </li>
              </ul>
            </div>
          </section>

          {/* ===== החסם המרכזי ופתרון ===== */}
          <section className="pb-8 border-b-2 border-primary/20">
            <div className="mb-6">
              <h3 className="font-bold text-lg text-foreground mb-2">החסם המרכזי שזוהה:</h3>
              <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                <h4 className="font-bold text-destructive mb-2">תיאור הקושי</h4>
                <p className="text-foreground">
                  {analysisData?.weaknesses?.[0] || user?.visionPlan?.expectedChallenges?.[0] || 'לא זוהה חסם מרכזי'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg text-foreground mb-2">נתיב פתרון יצירתי:</h3>
              <div className="bg-success/10 p-4 rounded-xl border border-success/20">
                <p className="text-foreground">
                  {analysisData?.recommendations?.[0] || 'לא הוזן פתרון'}
                </p>
              </div>
            </div>

            {/* יעדי ליבה */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-foreground mb-3">יעדי ליבה:</h3>
              <p className="text-sm text-muted-foreground mb-3">איך נדע שהצלחנו?</p>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-right">
                  <tbody>
                    {(user?.visionPlan?.measurableGoals || ['יעד 1', 'יעד 2', 'יעד 3']).slice(0, 3).map((goal, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="p-3 bg-primary/10 font-bold w-12 text-center">{idx + 1}</td>
                        <td className="p-3">{goal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* התרשמות המנטור */}
            <div>
              <h3 className="font-bold text-lg text-foreground mb-3">התרשמות המנטור</h3>
              <h4 className="font-medium text-foreground mb-2">סיכום תובנות:</h4>
              <div className="bg-accent/10 p-4 rounded-xl">
                <p className="text-foreground leading-relaxed">
                  {analysisData?.characterization || 'לא הוזן סיכום תובנות'}
                </p>
              </div>
            </div>
          </section>

          {/* ===== תוכנית פעולה למימוש החזון ===== */}
          <section className="pb-8 border-b-2 border-primary/20">
            <h2 className="text-xl font-bold text-primary mb-4">תוכנית פעולה למימוש החזון</h2>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-xl border border-primary/20">
              {user?.visionPlan?.actionSteps && user.visionPlan.actionSteps.length > 0 ? (
                <ol className="space-y-4">
                  {user.visionPlan.actionSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground text-center">לא הוזנה תוכנית פעולה</p>
              )}
            </div>
          </section>

          {/* ===== מכתב מהמנטור בנימה אישית ===== */}
          {mentorLetter && (
            <section className="pb-8 border-b-2 border-primary/20">
              <h2 className="text-xl font-bold text-primary mb-4">מכתב מהמנטור בנימה אישית</h2>
              <div className="bg-gradient-to-br from-accent/5 to-primary/5 p-6 rounded-xl border border-primary/20">
                <div className="text-base leading-loose">
                  {mentorLetter.split('\n').map((paragraph, idx) => {
                    if (!paragraph.trim()) return <div key={idx} className="h-3" />;
                    return (
                      <p key={idx} className="mb-3">
                        {renderBoldText(paragraph)}
                      </p>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ===== משפט השראה אישי ===== */}
          <section className="pb-6">
            <h2 className="text-xl font-bold text-primary mb-4 text-center">משפט השראה אישי:</h2>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-8 rounded-xl border border-amber-200 text-center">
              <p className="text-xl font-bold text-foreground mb-6 italic">
                "{user?.gender === 'female' 
                  ? "את לא רק מנהלת פסג\"ה - את בונה את הדור הבא של המורים"
                  : "אתה לא רק מנהל פסג\"ה - אתה בונה את הדור הבא של המורים"
                }"
              </p>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">{user?.fullName}</p>
                <p className="text-muted-foreground">מחוז {user?.district}</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-border">
            <p className="text-lg font-bold text-primary mb-2">פסג"ה פורצת דרך | מערכת חכמה למנהלי פסג"ה</p>
            <p className="text-sm text-muted-foreground">תאריך הפקה: {today}</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default FullReportViewer;