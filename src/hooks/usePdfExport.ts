import { useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface ExportData {
  user?: {
    fullName?: string;
    gender?: string;
    district?: string;
    city?: string;
    pisgaSymbol?: string;
    numKindergartens?: number;
    numElementary?: number;
    numHighSchools?: number;
  };
  stats?: {
    totalTrainings: number;
    totalParticipants: number;
    totalHours: number;
    avgParticipants: number;
  };
  conversation?: Array<{ role: string; content: string }>;
  visionPlan?: {
    myBelief?: string;
    vision3Years?: string;
    measurableGoals?: string[];
    actionSteps?: string[];
    expectedChallenges?: string[];
    requiredResources?: string[];
    unlimitedBudgetVision?: string;
  };
  mentorLetter?: string;
  analysisData?: {
    characterization?: string;
    keyInsight?: string;
    recommendations?: string[];
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
  };
}

export function usePdfExport() {
  const exportToPdf = useCallback(async (data: ExportData) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set RTL direction and Hebrew font
      doc.setR2L(true);
      
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const rightMargin = pageWidth - 20;
      const maxWidth = pageWidth - 40;

      const addNewPage = () => {
        doc.addPage();
        yPos = 25;
      };

      const addSectionTitle = (title: string) => {
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246);
        doc.text(title, rightMargin, yPos, { align: 'right' });
        yPos += 12;
      };

      // ===== PAGE 1: COVER PAGE =====
      doc.setFontSize(28);
      doc.setTextColor(59, 130, 246);
      doc.text('מסע מנהיגות פדגוגית', pageWidth / 2, 80, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setTextColor(100, 100, 100);
      doc.text('דוח מסכם מקיף', pageWidth / 2, 95, { align: 'center' });

      if (data.user) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`${data.user.fullName || ''}`, pageWidth / 2, 120, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`פסג"ה ${data.user.city || ''} | מחוז ${data.user.district || ''}`, pageWidth / 2, 130, { align: 'center' });
        doc.text(`סמל מוסד: ${data.user.pisgaSymbol || ''}`, pageWidth / 2, 140, { align: 'center' });
      }

      const today = new Date().toLocaleDateString('he-IL');
      doc.setFontSize(10);
      doc.text(`תאריך הפקה: ${today}`, pageWidth / 2, 160, { align: 'center' });

      // ===== PAGE 2: PISGAH PROFILE & STATS =====
      addNewPage();
      addSectionTitle('פרופיל הפסג"ה ונתונים');
      
      if (data.user) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const profileData = [
          `שם המנהל/ת: ${data.user.fullName || 'לא צוין'}`,
          `מחוז: ${data.user.district || 'לא צוין'}`,
          `ישוב: ${data.user.city || 'לא צוין'}`,
          `סמל פסג"ה: ${data.user.pisgaSymbol || 'לא צוין'}`,
          `גני ילדים: ${data.user.numKindergartens || 0}`,
          `בתי ספר יסודיים: ${data.user.numElementary || 0}`,
          `בתי ספר תיכוניים: ${data.user.numHighSchools || 0}`,
        ];
        profileData.forEach(text => {
          doc.text(text, rightMargin, yPos, { align: 'right' });
          yPos += 8;
        });
        yPos += 10;
      }

      if (data.stats) {
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text('סיכום נתוני השתלמויות', rightMargin, yPos, { align: 'right' });
        yPos += 10;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const statsText = [
          `סך השתלמויות: ${data.stats.totalTrainings}`,
          `סך משתתפים: ${data.stats.totalParticipants.toLocaleString()}`,
          `שעות הדרכה: ${data.stats.totalHours}`,
          `ממוצע משתתפים להשתלמות: ${data.stats.avgParticipants}`,
        ];
        statsText.forEach(text => {
          doc.text(text, rightMargin, yPos, { align: 'right' });
          yPos += 8;
        });
      }

      // ===== PAGE 3: PEDAGOGICAL ANALYSIS =====
      if (data.analysisData) {
        addNewPage();
        addSectionTitle('ניתוח פדגוגי');

        if (data.analysisData.characterization) {
          doc.setFontSize(12);
          doc.setTextColor(59, 130, 246);
          doc.text('אפיון הפסג"ה:', rightMargin, yPos, { align: 'right' });
          yPos += 8;
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const charLines = doc.splitTextToSize(data.analysisData.characterization, maxWidth);
          charLines.forEach((line: string) => {
            doc.text(line, rightMargin, yPos, { align: 'right' });
            yPos += 6;
          });
          yPos += 8;
        }

        if (data.analysisData.keyInsight) {
          doc.setFontSize(12);
          doc.setTextColor(59, 130, 246);
          doc.text('תובנה מרכזית:', rightMargin, yPos, { align: 'right' });
          yPos += 8;
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const insightLines = doc.splitTextToSize(data.analysisData.keyInsight, maxWidth);
          insightLines.forEach((line: string) => {
            doc.text(line, rightMargin, yPos, { align: 'right' });
            yPos += 6;
          });
          yPos += 8;
        }

        if (data.analysisData.recommendations?.length) {
          doc.setFontSize(12);
          doc.setTextColor(59, 130, 246);
          doc.text('המלצות:', rightMargin, yPos, { align: 'right' });
          yPos += 8;
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          data.analysisData.recommendations.forEach(rec => {
            doc.text(`• ${rec}`, rightMargin - 3, yPos, { align: 'right' });
            yPos += 7;
          });
        }
      }

      // ===== PAGE 4: SWOT ANALYSIS =====
      if (data.analysisData?.strengths || data.analysisData?.weaknesses) {
        addNewPage();
        addSectionTitle('ניתוח SWOT');

        const swotSections = [
          { title: 'חוזקות', items: data.analysisData?.strengths || [] },
          { title: 'חולשות', items: data.analysisData?.weaknesses || [] },
          { title: 'הזדמנויות', items: data.analysisData?.opportunities || [] },
          { title: 'איומים', items: data.analysisData?.threats || [] },
        ];

        swotSections.forEach(section => {
          if (section.items.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(59, 130, 246);
            doc.text(`${section.title}:`, rightMargin, yPos, { align: 'right' });
            yPos += 8;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            section.items.forEach(item => {
              if (yPos > 270) { addNewPage(); }
              doc.text(`• ${item}`, rightMargin - 3, yPos, { align: 'right' });
              yPos += 6;
            });
            yPos += 8;
          }
        });
      }

      // ===== PAGE 5: REFLECTIVE CONVERSATION =====
      if (data.conversation && data.conversation.length > 0) {
        addNewPage();
        addSectionTitle('שיחה רפלקטיבית');
        
        doc.setFontSize(10);
        data.conversation.forEach(msg => {
          if (yPos > 260) { addNewPage(); }
          
          const roleLabel = msg.role === 'assistant' ? 'מנטור:' : 'אני:';
          doc.setFontSize(11);
          doc.setTextColor(msg.role === 'assistant' ? 59 : 139, msg.role === 'assistant' ? 130 : 92, msg.role === 'assistant' ? 246 : 246);
          doc.text(roleLabel, rightMargin, yPos, { align: 'right' });
          yPos += 7;
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          const lines = doc.splitTextToSize(msg.content, maxWidth);
          lines.forEach((line: string) => {
            if (yPos > 275) { addNewPage(); }
            doc.text(line, rightMargin, yPos, { align: 'right' });
            yPos += 5;
          });
          yPos += 8;
        });
      }

      // ===== PAGE 6: VISION PLAN =====
      if (data.visionPlan) {
        addNewPage();
        addSectionTitle('חזון');

        if (data.visionPlan.myBelief) {
          doc.setFontSize(12);
          doc.setTextColor(59, 130, 246);
          doc.text('"אני מאמין שלי":', rightMargin, yPos, { align: 'right' });
          yPos += 8;
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const beliefLines = doc.splitTextToSize(data.visionPlan.myBelief, maxWidth);
          beliefLines.forEach((line: string) => {
            if (yPos > 275) { addNewPage(); }
            doc.text(line, rightMargin, yPos, { align: 'right' });
            yPos += 6;
          });
          yPos += 10;
        }

        if (data.visionPlan.unlimitedBudgetVision) {
          doc.setFontSize(12);
          doc.setTextColor(59, 130, 246);
          doc.text('חזון ללא מגבלות תקציב:', rightMargin, yPos, { align: 'right' });
          yPos += 8;
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const unlimitedLines = doc.splitTextToSize(data.visionPlan.unlimitedBudgetVision, maxWidth);
          unlimitedLines.forEach((line: string) => {
            if (yPos > 275) { addNewPage(); }
            doc.text(line, rightMargin, yPos, { align: 'right' });
            yPos += 6;
          });
          yPos += 10;
        }
      }

      // ===== PAGE 7: MENTOR LETTER =====
      if (data.mentorLetter) {
        addNewPage();
        addSectionTitle('מכתב מנטור אישי');
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        // Clean asterisks for PDF
        const cleanLetter = data.mentorLetter.replace(/\*\*/g, '');
        const letterLines = doc.splitTextToSize(cleanLetter, maxWidth);
        letterLines.forEach((line: string) => {
          if (yPos > 275) { addNewPage(); }
          doc.text(line, rightMargin, yPos, { align: 'right' });
          yPos += 6;
        });
      }

      // Footer on last page
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`נוצר בתאריך: ${today} | מסע מנהיגות פדגוגית`, pageWidth / 2, 290, { align: 'center' });

      // Save the PDF
      const fileName = `מסע-מנהיגות-${data.user?.fullName?.replace(/\s/g, '-') || 'דוח'}.pdf`;
      doc.save(fileName);
      
      toast.success('קובץ PDF נוצר בהצלחה!');
      return true;
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('שגיאה ביצירת קובץ PDF');
      return false;
    }
  }, []);

  return { exportToPdf };
}
