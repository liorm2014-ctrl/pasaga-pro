import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Training } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  trainings: Training[];
  setTrainings: React.Dispatch<React.SetStateAction<Training[]>>;
  updateUser: (updates: Partial<User>) => void;
  addTrainings: (newTrainings: Training[], replace?: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

// Helper to get user-specific storage key
const getUserStorageKey = (authUserId: string | undefined, key: string) => {
  if (!authUserId) return null;
  return `pisga_${authUserId}_${key}`;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const authUserId = authUser?.id;

  const [user, setUser] = useState<User | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);

  // Load user-specific data when auth user changes
  useEffect(() => {
    if (authUserId) {
      const userKey = getUserStorageKey(authUserId, 'user');
      const trainingsKey = getUserStorageKey(authUserId, 'trainings');
      
      if (userKey) {
        const savedUser = localStorage.getItem(userKey);
        setUser(savedUser ? JSON.parse(savedUser) : createDefaultUser(authUserId));
      }
      
      if (trainingsKey) {
        const savedTrainings = localStorage.getItem(trainingsKey);
        setTrainings(savedTrainings ? JSON.parse(savedTrainings) : []);
      }
    } else {
      // User logged out - clear state
      setUser(null);
      setTrainings([]);
    }
  }, [authUserId]);

  // Save user data when it changes
  useEffect(() => {
    const userKey = getUserStorageKey(authUserId, 'user');
    if (user && userKey) {
      localStorage.setItem(userKey, JSON.stringify(user));
    }
  }, [user, authUserId]);

  // Save trainings when they change
  useEffect(() => {
    const trainingsKey = getUserStorageKey(authUserId, 'trainings');
    if (trainingsKey && authUserId) {
      localStorage.setItem(trainingsKey, JSON.stringify(trainings));
    }
  }, [trainings, authUserId]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const addTrainings = (newTrainings: Training[], replace = true) => {
    if (replace) {
      setTrainings(newTrainings);
    } else {
      setTrainings((prev) => [...prev, ...newTrainings]);
    }
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