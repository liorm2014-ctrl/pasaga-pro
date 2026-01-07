export interface User {
  id: string;
  fullName: string;
  gender: 'male' | 'female' | '';
  district: string;
  city: string;
  pisgaSymbol: string;
  pisgaLogo?: string;
  numKindergartens: number;
  numElementary: number;
  numHighSchools: number;
  trainingFileUrl?: string;
  reflectionConversation: ConversationMessage[];
  visionPlan?: VisionPlan;
  swotAnalysis?: SwotAnalysis;
  onboardingCompleted: boolean;
  dashboardVisited: boolean;
  reflectionCompleted: boolean;
  visionCompleted: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface VisionPlan {
  vision3Years: string;
  unlimitedBudgetVision?: string;
  measurableGoals: string[];
  actionSteps: string[];
  expectedChallenges: string[];
  requiredResources: string[];
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Training {
  id: string;
  trainingName: string;
  date: string;
  participants: number;
  category: 'פדגוגיה' | 'טכנולוגיה' | 'ניהול' | 'רווחה' | 'חינוך מיוחד' | 'מנהיגות' | 'אחר';
  targetAudience: 'גנים' | 'יסודי' | 'תיכון' | 'חינוך מיוחד';
  reform: 'אופק חדש' | 'עוז לתמורה' | 'אחר';
  learningMethod: 'פרונטלי' | 'סינכרוני' | 'א-סינכרוני';
  domain: 'מנהיגות' | 'טכנו-פדגוגיה' | 'חינוך מיוחד' | 'אחר';
  durationHours: number;
  facilitator?: string;
  notes?: string;
  userId: string;
}

export interface JourneyStep {
  number: string;
  title: string;
  description: string;
  link: string;
  statusField: keyof User;
  icon: string;
}