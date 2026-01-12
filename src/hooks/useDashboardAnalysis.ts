import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ANALYSIS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-analysis`;

export interface AnalysisResult {
  characterization: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  keyInsight: string;
}

interface TrainingsData {
  categoryDistribution: { name: string; count: number; percentage: number }[];
  audienceDistribution: { name: string; count: number }[];
  monthlyTrend: { month: string; trainings: number; participants: number }[];
}

interface PisgahData {
  fullName?: string;
  district?: string;
  city?: string;
  numKindergartens?: number;
  numElementary?: number;
  numHighSchools?: number;
}

interface Stats {
  totalTrainings: number;
  totalParticipants: number;
  totalHours: number;
  avgParticipants: number;
}

export function useDashboardAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (
    pisgahData: PisgahData,
    trainingsData: TrainingsData,
    stats: Stats
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("יש להתחבר למערכת כדי להשתמש בשירות");
      }

      const resp = await fetch(ANALYSIS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          pisgahData,
          trainingsData,
          stats,
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
        throw new Error("שגיאה בחיבור לשירות הניתוח");
      }

      const data = await resp.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "שגיאה לא ידועה";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analysis, isLoading, error, fetchAnalysis };
}
