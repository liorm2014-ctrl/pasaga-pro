import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Training } from '@/types';

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  trainings: Training[];
  setTrainings: React.Dispatch<React.SetStateAction<Training[]>>;
  updateUser: (updates: Partial<User>) => void;
  addTrainings: (newTrainings: Training[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultUser: User = {
  id: '1',
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
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pisgaUser');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [trainings, setTrainings] = useState<Training[]>(() => {
    const saved = localStorage.getItem('pisgaTrainings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pisgaUser', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pisgaTrainings', JSON.stringify(trainings));
  }, [trainings]);

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const addTrainings = (newTrainings: Training[]) => {
    setTrainings((prev) => [...prev, ...newTrainings]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        trainings,
        setTrainings,
        updateUser,
        addTrainings,
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