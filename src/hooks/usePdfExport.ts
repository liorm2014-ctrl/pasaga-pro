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
  };
  stats?: {
    totalTrainings: number;
    totalParticipants: number;
    totalHours: number;
    avgParticipants: number;
  };
  conversation?: Array<{ role: string; content: string }>;
  visionPlan?: {
    vision3Years: string;
    measurableGoals: string[];
    actionSteps: string[];
    expectedChallenges: string[];
    requiredResources: string[];
  };
  mentorLetter?: string;
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

      // Title
      doc.setFontSize(24);
      doc.setTextColor(59, 130, 246); // Primary blue
      doc.text('מסע מנהיגות פדגוגית', rightMargin, yPos, { align: 'right' });
      yPos += 15;

      // User Info
      if (data.user) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`${data.user.fullName || ''} | פסג"ה ${data.user.city || ''}`, rightMargin, yPos, { align: 'right' });
        yPos += 8;
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`מחוז: ${data.user.district || ''} | סמל: ${data.user.pisgaSymbol || ''}`, rightMargin, yPos, { align: 'right' });
        yPos += 15;
      }

      // Stats Section
      if (data.stats) {
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('סיכום נתונים', rightMargin, yPos, { align: 'right' });
        yPos += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const statsText = [
          `סך השתלמויות: ${data.stats.totalTrainings}`,
          `סך משתתפים: ${data.stats.totalParticipants.toLocaleString()}`,
          `שעות הדרכה: ${data.stats.totalHours}`,
          `ממוצע משתתפים: ${data.stats.avgParticipants}`,
        ];
        statsText.forEach(text => {
          doc.text(text, rightMargin, yPos, { align: 'right' });
          yPos += 7;
        });
        yPos += 10;
      }

      // Reflection Conversation
      if (data.conversation && data.conversation.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('שיחה רפלקטיבית', rightMargin, yPos, { align: 'right' });
        yPos += 10;
        
        doc.setFontSize(10);
        data.conversation.forEach(msg => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          const roleLabel = msg.role === 'assistant' ? 'מנטור:' : 'אני:';
          doc.setTextColor(msg.role === 'assistant' ? 59 : 139, msg.role === 'assistant' ? 130 : 92, msg.role === 'assistant' ? 246 : 246);
          doc.text(roleLabel, rightMargin, yPos, { align: 'right' });
          yPos += 6;
          
          doc.setTextColor(0, 0, 0);
          const lines = doc.splitTextToSize(msg.content, maxWidth);
          lines.forEach((line: string) => {
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, rightMargin, yPos, { align: 'right' });
            yPos += 5;
          });
          yPos += 5;
        });
        yPos += 10;
      }

      // Vision Plan
      if (data.visionPlan) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('חזון ותוכנית פעולה', rightMargin, yPos, { align: 'right' });
        yPos += 10;
        
        if (data.visionPlan.vision3Years) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text('חזון ל-3 שנים:', rightMargin, yPos, { align: 'right' });
          yPos += 7;
          doc.setFontSize(10);
          const visionLines = doc.splitTextToSize(data.visionPlan.vision3Years, maxWidth);
          visionLines.forEach((line: string) => {
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, rightMargin, yPos, { align: 'right' });
            yPos += 5;
          });
          yPos += 10;
        }

        const sections = [
          { title: 'יעדים מדידים', items: data.visionPlan.measurableGoals },
          { title: 'צעדי פעולה', items: data.visionPlan.actionSteps },
          { title: 'אתגרים צפויים', items: data.visionPlan.expectedChallenges },
          { title: 'משאבים נדרשים', items: data.visionPlan.requiredResources },
        ];

        sections.forEach(section => {
          if (section.items.some(item => item.trim())) {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            doc.text(`${section.title}:`, rightMargin, yPos, { align: 'right' });
            yPos += 6;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            section.items.filter(item => item.trim()).forEach(item => {
              if (yPos > 280) {
                doc.addPage();
                yPos = 20;
              }
              doc.text(`• ${item}`, rightMargin - 3, yPos, { align: 'right' });
              yPos += 5;
            });
            yPos += 5;
          }
        });
      }

      // Mentor Letter
      if (data.mentorLetter) {
        doc.addPage();
        yPos = 20;
        
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('מכתב מנטור אישי', rightMargin, yPos, { align: 'right' });
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const letterLines = doc.splitTextToSize(data.mentorLetter, maxWidth);
        letterLines.forEach((line: string) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, rightMargin, yPos, { align: 'right' });
          yPos += 5;
        });
      }

      // Footer on last page
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const today = new Date().toLocaleDateString('he-IL');
      doc.text(`נוצר בתאריך: ${today}`, pageWidth / 2, 290, { align: 'center' });

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
