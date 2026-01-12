// Workflow validation types for the strict pedagogical journey

export interface WorkflowValidation {
  isValid: boolean;
  blockedReason?: string;
  blockedTitle?: string;
  requiredAction?: string;
  missingData?: string[];
}

export interface GapAnalysis {
  centralRisk: string;
  whyItMatters: string;
  blockedOptions: string[];
  allowedActions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dataSource: string[];
  imbalanceDetected?: {
    domain: string;
    percentage: number;
    isDistortion: boolean;
  };
}

export interface WorkflowState {
  step1_dataIntake: {
    hasInstitutions: boolean;
    hasTrainings: boolean;
    isComplete: boolean;
  };
  step2_dashboard: {
    analysisComplete: boolean;
    imbalanceAcknowledged: boolean;
    segmentationInsightProvided: boolean;
  };
  step3_reflection: {
    reflectionProvided: boolean;
    minMessagesReached: boolean;
    isComplete: boolean;
  };
  step4_vision: {
    centralGapIdentified: boolean;
    visionAddressesGap: boolean;
    flagshipActionDefined: boolean;
    actionPlanValid: boolean; // max 3 steps for 90-day plan
  };
  step5_output: {
    canGenerate: boolean;
  };
}

export interface ActionPlan90Days {
  step1: string;
  step2: string;
  step3: string;
}

export type WorkflowStep = 1 | 2 | 3 | 4 | 5;

export interface BlockedStepInfo {
  step: WorkflowStep;
  title: string;
  reason: string;
  requiredAction: string;
  navigateTo?: string;
}
