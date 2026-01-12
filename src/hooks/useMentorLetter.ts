import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from './useDashboardAnalysis';

const LETTER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-letter`;

interface UserData {
  fullName?: string;
  gender?: string;
  district?: string;
  city?: string;
  pisgaSymbol?: string;
  numKindergartens?: number;
  numElementary?: number;
  numHighSchools?: number;
}

interface TrainingsStats {
  totalTrainings: number;
  totalParticipants: number;
  totalHours: number;
  avgParticipants: number;
}

export function useMentorLetter() {
  const [letter, setLetter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLetter = useCallback(async (
    userData: UserData,
    trainingsStats: TrainingsStats,
    analysisData?: AnalysisResult | null,
    conversationSummary?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("יש להתחבר למערכת כדי להשתמש בשירות");
      }

      const resp = await fetch(LETTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userData,
          trainingsStats,
          analysisData,
          conversationSummary,
        }),
      });

      if (resp.status === 401) {
        throw new Error("יש להתחבר מחדש למערכת");
      }
      if (resp.status === 429) {
        throw new Error("מגבלת בקשות הושגה, נסו שוב מאוחר יותר");
      }
      if (resp.status === 402) {
        throw new Error("נדרשת הוספת קרדיט לחשבון");
      }
      if (!resp.ok) {
        throw new Error("שגיאה ביצירת המכתב");
      }

      const data = await resp.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setLetter(data.letter);
      return data.letter;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "שגיאה לא ידועה";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { letter, isLoading, error, generateLetter };
}
