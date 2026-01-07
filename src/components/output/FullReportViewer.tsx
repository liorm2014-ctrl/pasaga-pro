import React from 'react';
import { motion } from 'framer-motion';
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
}

const FullReportViewer: React.FC<FullReportViewerProps> = ({
  user,
  trainings,
  stats,
  mentorLetter,
}) => {
  const today = new Date().toLocaleDateString('he-IL');

  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-bold text-primary">{part}</strong> : part
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden" dir="rtl">
      {/* Document Header */}
      <div className="bg-gradient-to-l from-primary/10 to-accent/10 px-8 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">דוח מסע מנהיגות פדגוגית</h2>
          <span className="text-sm text-muted-foreground">{today}</span>
        </div>
      </div>

      {/* Scrollable Document Content */}
      <ScrollArea className="h-[600px]">
        <div className="p-8 space-y-8" style={{ fontFamily: 'David, serif', lineHeight: '1.8' }}>
          
          {/* Cover Section */}
          <section className="text-center pb-8 border-b-2 border-primary/20">
            <h1 className="text-3xl font-bold text-primary mb-4">מסע מנהיגות פדגוגית</h1>
            <p className="text-xl text-muted-foreground mb-2">דוח מסכם מקיף</p>
            {user && (
              <>
                <p className="text-2xl font-semibold text-foreground mt-6">{user.fullName}</p>
                <p className="text-lg text-muted-foreground">פסג"ה {user.city} | מחוז {user.district}</p>
                <p className="text-md text-muted-foreground">סמל מוסד: {user.pisgaSymbol}</p>
              </>
            )}
          </section>

          {/* Section 1: Pisgah Profile */}
          <section className="pb-6 border-b border-border/50">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">1</span>
              פרופיל הפסג"ה
            </h2>
            <div className="grid grid-cols-2 gap-4 text-base">
              <div><span className="text-muted-foreground">שם המנהל/ת:</span> <span className="font-medium">{user?.fullName || '—'}</span></div>
              <div><span className="text-muted-foreground">מגדר:</span> <span className="font-medium">{user?.gender === 'female' ? 'נקבה' : user?.gender === 'male' ? 'זכר' : '—'}</span></div>
              <div><span className="text-muted-foreground">מחוז:</span> <span className="font-medium">{user?.district || '—'}</span></div>
              <div><span className="text-muted-foreground">ישוב:</span> <span className="font-medium">{user?.city || '—'}</span></div>
              <div><span className="text-muted-foreground">סמל פסג"ה:</span> <span className="font-medium">{user?.pisgaSymbol || '—'}</span></div>
              <div><span className="text-muted-foreground">גני ילדים:</span> <span className="font-medium">{user?.numKindergartens || 0}</span></div>
              <div><span className="text-muted-foreground">בתי ספר יסודיים:</span> <span className="font-medium">{user?.numElementary || 0}</span></div>
              <div><span className="text-muted-foreground">בתי ספר תיכוניים:</span> <span className="font-medium">{user?.numHighSchools || 0}</span></div>
            </div>
          </section>

          {/* Section 2: Statistics */}
          <section className="pb-6 border-b border-border/50">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">2</span>
              נתוני השתלמויות
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <div className="text-3xl font-bold text-primary">{stats.totalTrainings}</div>
                <div className="text-sm text-muted-foreground">סה"כ השתלמויות</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <div className="text-3xl font-bold text-primary">{stats.totalParticipants.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">סה"כ משתתפים</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <div className="text-3xl font-bold text-primary">{stats.totalHours}</div>
                <div className="text-sm text-muted-foreground">שעות הדרכה</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <div className="text-3xl font-bold text-primary">{stats.avgParticipants}</div>
                <div className="text-sm text-muted-foreground">ממוצע משתתפים</div>
              </div>
            </div>
          </section>

          {/* Section 3: Reflective Conversation */}
          {user?.reflectionConversation && user.reflectionConversation.length > 0 && (
            <section className="pb-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">3</span>
                שיחה רפלקטיבית - עיקרי הדברים
              </h2>
              <div className="space-y-4 bg-secondary/20 p-4 rounded-xl">
                {user.reflectionConversation.slice(0, 6).map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${msg.role === 'assistant' ? 'bg-primary/10 mr-8' : 'bg-white ml-8 border border-border'}`}>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {msg.role === 'assistant' ? 'מנטור' : 'אני'}
                    </div>
                    <p className="text-sm leading-relaxed">{msg.content.slice(0, 300)}{msg.content.length > 300 ? '...' : ''}</p>
                  </div>
                ))}
                {user.reflectionConversation.length > 6 && (
                  <p className="text-sm text-muted-foreground text-center">... ועוד {user.reflectionConversation.length - 6} הודעות</p>
                )}
              </div>
            </section>
          )}

          {/* Section 4: Vision */}
          {user?.visionPlan && (user.visionPlan.myBelief || user.visionPlan.unlimitedBudgetVision) && (
            <section className="pb-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">4</span>
                חזון
              </h2>
              
              {user.visionPlan.myBelief && (
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-2">"אני מאמין שלי":</h3>
                  <p className="text-base bg-accent/10 p-4 rounded-lg">{user.visionPlan.myBelief}</p>
                </div>
              )}

              {user.visionPlan.unlimitedBudgetVision && (
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-2">חזון ללא מגבלות תקציב:</h3>
                  <p className="text-base bg-secondary/30 p-4 rounded-lg">{user.visionPlan.unlimitedBudgetVision}</p>
                </div>
              )}
            </section>
          )}

          {/* Section 5: Mentor Letter */}
          {mentorLetter && (
            <section className="pb-6">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">5</span>
                מכתב מנטור אישי
              </h2>
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

          {/* Footer */}
          <div className="text-center pt-6 border-t border-border text-sm text-muted-foreground">
            <p>נוצר בתאריך: {today}</p>
            <p>מסע מנהיגות פדגוגית | פסג"ה {user?.city}</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default FullReportViewer;