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
    segmentationInsight?: string;
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
  pulseMetrics?: {
    innovation: number;
    fieldConnection: number;
    organizationalResilience: number;
    leadership: number;
    initiative: number;
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

      const addChapterTitle = (title: string) => {
        doc.setFontSize(24);
        doc.setTextColor(59, 130, 246);
        doc.text(title, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
      };

      const addSectionTitle = (title: string) => {
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text(title, rightMargin, yPos, { align: 'right' });
        yPos += 10;
      };

      const addSubtitle = (title: string) => {
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text(title, rightMargin, yPos, { align: 'right' });
        yPos += 8;
      };

      const today = new Date().toLocaleDateString('he-IL');
      const totalInstitutions = (data.user?.numKindergartens || 0) + 
                                (data.user?.numElementary || 0) + 
                                (data.user?.numHighSchools || 0);

      // ===== PAGE 1: פרק 1 - תעודת זהות ומיפוי נתונים =====
      addChapterTitle('פסג"ה - תוכנית עבודה אסטרטגית');
      yPos += 5;
      addSectionTitle('פרק 1: תעודת זהות ומיפוי נתונים');
      yPos += 5;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`סמל מוסד: ${data.user?.pisgaSymbol || 'לא צוין'}`, rightMargin, yPos, { align: 'right' });
      yPos += 8;
      doc.text(`ישוב: ${data.user?.city || 'לא צוין'}`, rightMargin, yPos, { align: 'right' });
      yPos += 12;

      // קהל יעד
      addSubtitle('קהל יעד:');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`גנים: ${data.user?.numKindergartens || 0}`, rightMargin - 10, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`בתי ספר יסודיים: ${data.user?.numElementary || 0}`, rightMargin - 10, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`בתי ספר תיכוניים: ${data.user?.numHighSchools || 0}`, rightMargin - 10, yPos, { align: 'right' });
      yPos += 7;
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.text(`סה"כ: ${totalInstitutions}`, rightMargin - 10, yPos, { align: 'right' });
      yPos += 15;

      // ניתוח פילוח השתלמויות
      addSubtitle('ניתוח פילוח השתלמויות:');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      if (data.stats) {
        doc.text(`סה"כ השתלמויות: ${data.stats.totalTrainings}`, rightMargin - 10, yPos, { align: 'right' });
        yPos += 7;
        doc.text(`סה"כ משתתפים: ${data.stats.totalParticipants.toLocaleString()}`, rightMargin - 10, yPos, { align: 'right' });
        yPos += 7;
        doc.text(`שעות הדרכה: ${data.stats.totalHours}`, rightMargin - 10, yPos, { align: 'right' });
        yPos += 7;
        doc.text(`ממוצע משתתפים: ${data.stats.avgParticipants}`, rightMargin - 10, yPos, { align: 'right' });
        yPos += 15;
      }

      // ===== PAGE 2: תובנה מרכזית מהפילוח =====
      addNewPage();
      addSectionTitle('תובנה מרכזית מהפילוח:');
      yPos += 5;
      
      const insight = data.user?.segmentationInsight || data.analysisData?.keyInsight || 'לא הוזנה תובנה';
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const insightLines = doc.splitTextToSize(insight, maxWidth);
      insightLines.forEach((line: string) => {
        if (yPos > 270) { addNewPage(); }
        doc.text(line, rightMargin, yPos, { align: 'right' });
        yPos += 7;
      });

      // ===== PAGE 3: פרק 2 - אני מאמין =====
      addNewPage();
      addChapterTitle('פרק 2');
      yPos += 5;

      // אני מאמין
      addSectionTitle('אני מאמין:');
      if (data.visionPlan?.myBelief) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const beliefLines = doc.splitTextToSize(data.visionPlan.myBelief, maxWidth);
        beliefLines.forEach((line: string) => {
          if (yPos > 270) { addNewPage(); }
          doc.text(line, rightMargin, yPos, { align: 'right' });
          yPos += 6;
        });
        yPos += 10;
      }

      // פעולות דגל והשפעתן
      addSectionTitle('פעולות דגל והשפעתן:');
      if (data.visionPlan?.actionSteps?.length) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        data.visionPlan.actionSteps.forEach((step, idx) => {
          if (yPos > 270) { addNewPage(); }
          doc.text(`${idx + 1}. ${step}`, rightMargin - 5, yPos, { align: 'right' });
          yPos += 7;
        });
        yPos += 10;
      }

      // חזון "ללא הגבלה"
      addSectionTitle('חזון "ללא הגבלה":');
      if (data.visionPlan?.unlimitedBudgetVision) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const visionLines = doc.splitTextToSize(data.visionPlan.unlimitedBudgetVision, maxWidth);
        visionLines.forEach((line: string) => {
          if (yPos > 270) { addNewPage(); }
          doc.text(line, rightMargin, yPos, { align: 'right' });
          yPos += 6;
        });
      }

      // ===== PAGE 4: פרק 3 - אסטרטגיית צמיחה =====
      addNewPage();
      addChapterTitle('פרק 3');
      doc.setFontSize(16);
      doc.setTextColor(80, 80, 80);
      doc.text('אסטרטגיית צמיחה ופתרון קשיים', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // מדד הדופק הפדגוגי
      addSectionTitle('📈 מדד הדופק הפדגוגי:');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const pulseMetrics = data.pulseMetrics || {
        innovation: 0,
        fieldConnection: 0,
        organizationalResilience: 0,
        leadership: 0,
        initiative: 0,
      };
      
      const metrics = [
        { label: 'חדשנות', value: pulseMetrics.innovation },
        { label: 'חיבור לשטח', value: pulseMetrics.fieldConnection },
        { label: 'חוסן ארגוני', value: pulseMetrics.organizationalResilience },
        { label: 'מנהיגות', value: pulseMetrics.leadership },
        { label: 'יוזמה', value: pulseMetrics.initiative },
      ];

      metrics.forEach(metric => {
        doc.text(`${metric.label}: ${metric.value}%`, rightMargin - 10, yPos, { align: 'right' });
        yPos += 7;
      });
      yPos += 10;

      // לזהות
      addSectionTitle('לזהות:');
      const identifyItems = [
        { label: 'חדשנות', value: data.analysisData?.strengths?.[0] || '—' },
        { label: 'חיבור לשטח', value: data.analysisData?.strengths?.[1] || '—' },
        { label: 'חוסן ארגוני', value: data.analysisData?.opportunities?.[0] || '—' },
        { label: 'מנהיגות', value: data.analysisData?.opportunities?.[1] || '—' },
        { label: 'יוזמה', value: data.analysisData?.recommendations?.[0] || '—' },
      ];
      
      doc.setFontSize(10);
      identifyItems.forEach(item => {
        if (yPos > 270) { addNewPage(); }
        doc.text(`• ${item.label}: ${item.value}`, rightMargin - 5, yPos, { align: 'right' });
        yPos += 6;
      });

      // ===== PAGE 5: החסם המרכזי ויעדים =====
      addNewPage();
      
      // החסם המרכזי
      addSectionTitle('החסם המרכזי שזוהה:');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const obstacle = data.analysisData?.weaknesses?.[0] || data.visionPlan?.expectedChallenges?.[0] || 'לא זוהה';
      const obstacleLines = doc.splitTextToSize(obstacle, maxWidth);
      obstacleLines.forEach((line: string) => {
        doc.text(line, rightMargin, yPos, { align: 'right' });
        yPos += 6;
      });
      yPos += 10;

      // נתיב פתרון
      addSectionTitle('נתיב פתרון יצירתי:');
      const solution = data.analysisData?.recommendations?.[0] || 'לא הוזן';
      const solutionLines = doc.splitTextToSize(solution, maxWidth);
      solutionLines.forEach((line: string) => {
        doc.text(line, rightMargin, yPos, { align: 'right' });
        yPos += 6;
      });
      yPos += 10;

      // יעדי ליבה
      addSectionTitle('יעדי ליבה:');
      doc.setFontSize(10);
      doc.text('איך נדע שהצלחנו?', rightMargin, yPos, { align: 'right' });
      yPos += 8;
      
      const goals = data.visionPlan?.measurableGoals || [];
      goals.slice(0, 3).forEach((goal, idx) => {
        doc.text(`${idx + 1}. ${goal}`, rightMargin - 5, yPos, { align: 'right' });
        yPos += 7;
      });
      yPos += 10;

      // התרשמות המנטור
      addSectionTitle('התרשמות המנטור - סיכום תובנות:');
      if (data.analysisData?.characterization) {
        const charLines = doc.splitTextToSize(data.analysisData.characterization, maxWidth);
        charLines.forEach((line: string) => {
          if (yPos > 270) { addNewPage(); }
          doc.text(line, rightMargin, yPos, { align: 'right' });
          yPos += 6;
        });
      }

      // ===== PAGE 6: תוכנית פעולה =====
      addNewPage();
      addSectionTitle('תוכנית פעולה למימוש החזון');
      yPos += 5;

      if (data.visionPlan?.actionSteps?.length) {
        doc.setFontSize(11);
        data.visionPlan.actionSteps.forEach((step, idx) => {
          if (yPos > 270) { addNewPage(); }
          doc.text(`${idx + 1}. ${step}`, rightMargin - 5, yPos, { align: 'right' });
          yPos += 8;
        });
      } else {
        doc.text('לא הוזנה תוכנית פעולה', rightMargin, yPos, { align: 'right' });
      }

      // ===== PAGE 7: מכתב מהמנטור =====
      if (data.mentorLetter) {
        addNewPage();
        addSectionTitle('מכתב מהמנטור בנימה אישית');
        yPos += 5;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const cleanLetter = data.mentorLetter.replace(/\*\*/g, '');
        const letterLines = doc.splitTextToSize(cleanLetter, maxWidth);
        letterLines.forEach((line: string) => {
          if (yPos > 260) { addNewPage(); }
          doc.text(line, rightMargin, yPos, { align: 'right' });
          yPos += 6;
        });
      }

      // ===== משפט השראה אישי =====
      yPos += 15;
      if (yPos > 230) { addNewPage(); yPos = 80; }
      
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('משפט השראה אישי:', pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;
      
      const inspirationalQuote = data.user?.gender === 'female' 
        ? '"את לא רק מנהלת פסג"ה - את בונה את הדור הבא של המורים"'
        : '"אתה לא רק מנהל פסג"ה - אתה בונה את הדור הבא של המורים"';
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(inspirationalQuote, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      doc.setFontSize(14);
      doc.text(data.user?.fullName || '', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`מחוז ${data.user?.district || ''}`, pageWidth / 2, yPos, { align: 'center' });

      // Footer
      yPos = 280;
      doc.setFontSize(10);
      doc.setTextColor(59, 130, 246);
      doc.text('פסג"ה פורצת דרך | מערכת חכמה למנהלי פסג"ה', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`תאריך הפקה: ${today}`, pageWidth / 2, yPos, { align: 'center' });

      // Save the PDF
      const fileName = `תוכנית-אסטרטגית-${data.user?.fullName?.replace(/\s/g, '-') || 'דוח'}.pdf`;
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