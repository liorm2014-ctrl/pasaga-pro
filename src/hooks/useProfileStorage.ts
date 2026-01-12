import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Training } from '@/types';
import { useAuth } from '@/context/AuthContext';
import type { Json } from '@/integrations/supabase/types';

const createDefaultUser = (authUserId: string): User => ({
  id: authUserId,
  fullName: '',
  gender: '',
  district: '',
  city: '',
  pisgaSymbol: '',
  numKindergartens: 0,
  numElementary: 0,
  numHighSchools: 0,
  reflectionConversation: [],
  onboardingCompleted: false,
  dashboardVisited: false,
  reflectionCompleted: false,
  visionCompleted: false,
});

export const useProfileStorage = () => {
  const { user: authUser } = useAuth();
  const authUserId = authUser?.id;

  const [user, setUser] = useState<User | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile and trainings from database
  const loadData = useCallback(async () => {
    if (!authUserId) {
      setUser(null);
      setTrainings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('data')
        .eq('user_id', authUserId)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      }

      if (profileData?.data) {
        const userData = profileData.data as unknown as User;
        setUser({ ...userData, id: authUserId });
      } else {
        setUser(createDefaultUser(authUserId));
      }

      // Load trainings
      const { data: trainingsData, error: trainingsError } = await supabase
        .from('trainings')
        .select('*')
        .eq('user_id', authUserId);

      if (trainingsError) {
        console.error('Error loading trainings:', trainingsError);
      }

      if (trainingsData) {
        const mappedTrainings: Training[] = trainingsData.map((t) => ({
          id: t.id,
          trainingName: t.training_name,
          date: t.date,
          participants: t.participants,
          category: t.category as Training['category'],
          targetAudience: t.target_audience as Training['targetAudience'],
          reform: t.reform as Training['reform'],
          learningMethod: t.learning_method as Training['learningMethod'],
          domain: t.domain as Training['domain'],
          durationHours: t.duration_hours,
          facilitator: t.facilitator || undefined,
          notes: t.notes || undefined,
          userId: t.user_id,
        }));
        setTrainings(mappedTrainings);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save profile to database
  const saveProfile = useCallback(async (userData: User): Promise<boolean> => {
    if (!authUserId) return false;
    
    setIsSaving(true);
    try {
      const { id, ...dataToSave } = userData;
      
      // Check if profile exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authUserId)
        .maybeSingle();

      let error;
      if (existing) {
        // Update existing
        const result = await supabase
          .from('profiles')
          .update({ data: JSON.parse(JSON.stringify(dataToSave)) })
          .eq('user_id', authUserId);
        error = result.error;
      } else {
        // Insert new
        const result = await supabase
          .from('profiles')
          .insert([{ user_id: authUserId, data: JSON.parse(JSON.stringify(dataToSave)) }]);
        error = result.error;
      }

      if (error) {
        console.error('Error saving profile:', error);
        return false;
      }

      setUser(userData);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [authUserId]);

  // Update user data
  const updateUser = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    const updatedUser = { ...user, ...updates };
    return saveProfile(updatedUser);
  }, [user, saveProfile]);

  // Clean string from problematic Unicode characters (null bytes, etc.)
  const sanitizeString = (str: string | null | undefined): string | null => {
    if (!str) return null;
    // Remove null bytes and other control characters that PostgreSQL can't handle
    return str.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim();
  };

  // Save trainings to database (replace all)
  const saveTrainings = useCallback(async (newTrainings: Training[]): Promise<boolean> => {
    if (!authUserId) return false;

    setIsSaving(true);
    try {
      // Delete existing trainings for user
      const { error: deleteError } = await supabase
        .from('trainings')
        .delete()
        .eq('user_id', authUserId);

      if (deleteError) {
        console.error('Error deleting old trainings:', deleteError);
        return false;
      }

      if (newTrainings.length === 0) {
        setTrainings([]);
        return true;
      }

      // Insert new trainings with sanitized strings
      const trainingsToInsert = newTrainings.map((t) => ({
        user_id: authUserId,
        training_name: sanitizeString(t.trainingName) || 'ללא שם',
        date: t.date,
        participants: t.participants,
        category: sanitizeString(t.category) || 'אחר',
        target_audience: sanitizeString(t.targetAudience) || 'יסודי',
        reform: sanitizeString(t.reform) || 'אחר',
        learning_method: sanitizeString(t.learningMethod) || 'פרונטלי',
        domain: sanitizeString(t.domain) || 'אחר',
        duration_hours: t.durationHours,
        facilitator: sanitizeString(t.facilitator),
        notes: sanitizeString(t.notes),
      }));

      const { data, error: insertError } = await supabase
        .from('trainings')
        .insert(trainingsToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting trainings:', insertError);
        return false;
      }

      // Map back to Training type with new IDs
      if (data) {
        const mappedTrainings: Training[] = data.map((t) => ({
          id: t.id,
          trainingName: t.training_name,
          date: t.date,
          participants: t.participants,
          category: t.category as Training['category'],
          targetAudience: t.target_audience as Training['targetAudience'],
          reform: t.reform as Training['reform'],
          learningMethod: t.learning_method as Training['learningMethod'],
          domain: t.domain as Training['domain'],
          durationHours: t.duration_hours,
          facilitator: t.facilitator || undefined,
          notes: t.notes || undefined,
          userId: t.user_id,
        }));
        setTrainings(mappedTrainings);
      }

      return true;
    } catch (error) {
      console.error('Error saving trainings:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [authUserId]);

  // Add trainings (with optional replace)
  const addTrainings = useCallback(async (newTrainings: Training[], replace = true): Promise<boolean> => {
    if (replace) {
      return saveTrainings(newTrainings);
    } else {
      return saveTrainings([...trainings, ...newTrainings]);
    }
  }, [trainings, saveTrainings]);

  return {
    user,
    setUser,
    trainings,
    setTrainings,
    isLoading,
    isSaving,
    updateUser,
    addTrainings,
    refreshData: loadData,
  };
};
