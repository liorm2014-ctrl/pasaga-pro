import { useState, useCallback } from 'react';
import { GapAnalysis } from '@/types/workflow';

const GAP_ANALYSIS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gap-analysis`;

interface TrainingData {
  domain: string;
  category: string;
  hours: number;
  participants: number;
}

interface InstitutionData {
  kindergartens: number;
  elementary: number;
  highSchools: number;
}

export const useGapAnalysis = () => {
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeGaps = useCallback(async (
    trainings: TrainingData[],
    institutions: InstitutionData,
    currentStrengths?: string[]
  ): Promise<GapAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(GAP_ANALYSIS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ trainings, institutions, currentStrengths }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('המערכת עמוסה, אנא נסה שוב מאוחר יותר');
        }
        if (response.status === 402) {
          throw new Error('נדרש תשלום להמשך השימוש');
        }
        throw new Error('שגיאה בניתוח הפערים');
      }

      const data = await response.json();
      setAnalysis(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה לא ידועה';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateStrength = useCallback((strength: string, analysis: GapAnalysis | null): {
    isValid: boolean;
    reason?: string;
  } => {
    if (!analysis) {
      return { isValid: false, reason: 'לא בוצע ניתוח פערים' };
    }

    const rejected = analysis.blockedOptions?.find(
      blocked => strength.toLowerCase().includes(blocked.toLowerCase())
    );

    if (rejected) {
      return { isValid: false, reason: `לא ניתן לציין "${strength}" - אין נתונים תומכים` };
    }

    return { isValid: true };
  }, []);

  return {
    analysis,
    isLoading,
    error,
    analyzeGaps,
    validateStrength,
  };
};
