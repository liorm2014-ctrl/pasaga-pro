import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Training } from '@/types';
import { useProfileStorage } from '@/hooks/useProfileStorage';

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  trainings: Training[];
  setTrainings: React.Dispatch<React.SetStateAction<Training[]>>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  addTrainings: (newTrainings: Training[], replace?: boolean) => Promise<boolean>;
  isLoading: boolean;
  isSaving: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    trainings,
    setTrainings,
    isLoading,
    isSaving,
    updateUser: updateUserAsync,
    addTrainings: addTrainingsAsync,
  } = useProfileStorage();

  const updateUser = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    return updateUserAsync(updates);
  }, [updateUserAsync]);

  const addTrainings = useCallback(async (newTrainings: Training[], replace = true): Promise<boolean> => {
    return addTrainingsAsync(newTrainings, replace);
  }, [addTrainingsAsync]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        trainings,
        setTrainings,
        updateUser,
        addTrainings,
        isLoading,
        isSaving,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
