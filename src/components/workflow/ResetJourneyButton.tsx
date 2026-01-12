import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ResetJourneyButton: React.FC = () => {
  const { user, updateUser, setTrainings } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    // Keep only the basic onboarding data
    updateUser({
      // Reset all journey data but keep personal info
      reflectionConversation: [],
      visionPlan: undefined,
      swotAnalysis: undefined,
      segmentationInsight: undefined,
      onboardingCompleted: true, // Keep this so they don't need to re-enter basic info
      dashboardVisited: false,
      reflectionCompleted: false,
      visionCompleted: false,
    });

    // Don't reset trainings - keep the uploaded data
    // setTrainings([]); // Uncomment if you want to reset trainings too

    toast.success('המסע אופס בהצלחה! ניתן להתחיל מחדש.');
    setIsOpen(false);
    navigate('/dashboard');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          התחל מסע חדש
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>התחלת מסע חדש</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            פעולה זו תאפס את כל נתוני המסע:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>השיחה הרפלקטיבית</li>
              <li>החזון ותוכנית הפעולה</li>
              <li>ניתוח ה-SWOT</li>
              <li>תובנות הפילוח</li>
            </ul>
            <p className="mt-3 font-medium">
              הפרטים האישיים ונתוני ההשתלמויות יישמרו.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
            אפס והתחל מחדש
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetJourneyButton;
