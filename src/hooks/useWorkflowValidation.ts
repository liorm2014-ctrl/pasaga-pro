import { useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { WorkflowValidation, WorkflowState, GapAnalysis, BlockedStepInfo, WorkflowStep } from '@/types/workflow';

export const useWorkflowValidation = () => {
  const { user, trainings } = useApp();

  // Check if institutions exist
  const hasInstitutions = useMemo(() => {
    const total = (user?.numKindergartens || 0) + (user?.numElementary || 0) + (user?.numHighSchools || 0);
    return total > 0;
  }, [user?.numKindergartens, user?.numElementary, user?.numHighSchools]);

  // Check if trainings exist
  const hasTrainings = useMemo(() => trainings.length > 0, [trainings.length]);

  // Calculate domain distribution for imbalance detection
  const domainDistribution = useMemo(() => {
    if (!hasTrainings) return null;

    const totalHours = trainings.reduce((sum, t) => sum + t.durationHours, 0);
    const domainHours = trainings.reduce((acc, t) => {
      acc[t.domain] = (acc[t.domain] || 0) + t.durationHours;
      return acc;
    }, {} as Record<string, number>);

    const distribution = Object.entries(domainHours).map(([domain, hours]) => ({
      domain,
      hours,
      percentage: totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0,
    }));

    // Sort by percentage descending
    distribution.sort((a, b) => b.percentage - a.percentage);

    return distribution;
  }, [trainings, hasTrainings]);

  // Detect pedagogical imbalance (>50% in one domain)
  const imbalanceDetection = useMemo(() => {
    if (!domainDistribution || domainDistribution.length === 0) return null;

    const topDomain = domainDistribution[0];
    const isDistortion = topDomain.percentage > 50;

    return {
      domain: topDomain.domain,
      percentage: topDomain.percentage,
      isDistortion,
    };
  }, [domainDistribution]);

  // Full workflow state
  const workflowState: WorkflowState = useMemo(() => ({
    step1_dataIntake: {
      hasInstitutions,
      hasTrainings,
      isComplete: hasInstitutions && hasTrainings && !!user?.onboardingCompleted,
    },
    step2_dashboard: {
      analysisComplete: !!user?.dashboardVisited,
      imbalanceAcknowledged: !imbalanceDetection?.isDistortion || !!user?.segmentationInsight,
      segmentationInsightProvided: !!user?.segmentationInsight,
    },
    step3_reflection: {
      reflectionProvided: (user?.reflectionConversation?.length || 0) >= 2,
      minMessagesReached: (user?.reflectionConversation?.length || 0) >= 4,
      isComplete: !!user?.reflectionCompleted,
    },
    step4_vision: {
      centralGapIdentified: !!user?.swotAnalysis?.weaknesses?.length,
      visionAddressesGap: !!user?.visionPlan?.myBelief || !!user?.visionPlan?.unlimitedBudgetVision,
      flagshipActionDefined: !!user?.visionPlan?.flagshipAction,
      actionPlanValid: (user?.visionPlan?.actionSteps?.length || 0) <= 3,
    },
    step5_output: {
      canGenerate: hasTrainings,
    },
  }), [user, hasInstitutions, hasTrainings, imbalanceDetection]);

  // Validate step access
  const validateStep = useCallback((step: WorkflowStep): WorkflowValidation => {
    // Step 1: Data intake - always accessible
    if (step === 1) {
      return { isValid: true };
    }

    // Check base requirements for all other steps
    if (!hasInstitutions) {
      return {
        isValid: false,
        blockedTitle: 'אין מוסדות חינוך',
        blockedReason: 'לא ניתן להתקדם ללא מוסדות חינוך. אנא הזן לפחות גן אחד, בית ספר יסודי או תיכון.',
        requiredAction: 'הזן את מספר מוסדות החינוך בשלב קליטת הנתונים',
        missingData: ['numKindergartens', 'numElementary', 'numHighSchools'],
      };
    }

    if (!hasTrainings) {
      return {
        isValid: false,
        blockedTitle: 'אין נתוני השתלמויות',
        blockedReason: 'לא ניתן להמשיך ללא העלאת קובץ השתלמויות או הזנת נתונים ידנית.',
        requiredAction: 'העלה קובץ השתלמויות או הזן נתונים ידנית',
        missingData: ['trainings'],
      };
    }

    // Step 2: Dashboard
    if (step === 2) {
      return { isValid: true };
    }

    // Step 3: Reflection
    if (step === 3) {
      // If imbalance detected and not acknowledged, block
      if (imbalanceDetection?.isDistortion && !user?.segmentationInsight) {
        return {
          isValid: false,
          blockedTitle: 'זוהה עיוות פדגוגי',
          blockedReason: `תחום "${imbalanceDetection.domain}" מהווה ${imbalanceDetection.percentage}% מכלל שעות ההשתלמות. יש לתת תובנה מרכזית מהפילוח לפני המשך.`,
          requiredAction: 'הזן תובנה מרכזית מהפילוח בדשבורד',
          missingData: ['segmentationInsight'],
        };
      }
      return { isValid: true };
    }

    // Step 4: Vision - must have reflection
    if (step === 4) {
      if (!workflowState.step3_reflection.reflectionProvided) {
        return {
          isValid: false,
          blockedTitle: 'נדרשת שיחה רפלקטיבית',
          blockedReason: 'עליך לבצע שיחה רפלקטיבית עם המנטור לפני בניית החזון.',
          requiredAction: 'השלם שיחה עם המנטור בשלב הרפלקציה',
          missingData: ['reflectionConversation'],
        };
      }
      return { isValid: true };
    }

    // Step 5: Output
    if (step === 5) {
      return { isValid: true };
    }

    return { isValid: true };
  }, [hasInstitutions, hasTrainings, imbalanceDetection, user, workflowState]);

  // Get blocked step info for UI
  const getBlockedStepInfo = useCallback((step: WorkflowStep): BlockedStepInfo | null => {
    const validation = validateStep(step);
    if (validation.isValid) return null;

    const navigateMap: Record<WorkflowStep, string> = {
      1: '/onboarding',
      2: '/dashboard',
      3: '/reflection',
      4: '/vision',
      5: '/output',
    };

    return {
      step,
      title: validation.blockedTitle || 'שלב חסום',
      reason: validation.blockedReason || 'לא ניתן להמשיך',
      requiredAction: validation.requiredAction || 'השלם את השלבים הקודמים',
      navigateTo: navigateMap[1], // Always navigate to onboarding to fix issues
    };
  }, [validateStep]);

  // Check if action plan is valid (max 3 steps)
  const validateActionPlan = useCallback((steps: string[]): boolean => {
    return steps.length <= 3;
  }, []);

  // Check if SWOT strength is data-backed
  const validateStrength = useCallback((strength: string): boolean => {
    if (!hasTrainings) return false;
    
    // List of keywords that require specific data backing
    const requiresDataFor: Record<string, () => boolean> = {
      'חדשנות דיגיטלית': () => trainings.some(t => t.category === 'טכנולוגיה'),
      'טכנולוגיה': () => trainings.some(t => t.category === 'טכנולוגיה'),
      'דיגיטל': () => trainings.some(t => t.category === 'טכנולוגיה'),
      'מנהיגות': () => trainings.some(t => t.category === 'מנהיגות' || t.domain === 'מנהיגות'),
      'חינוך מיוחד': () => trainings.some(t => t.category === 'חינוך מיוחד' || t.targetAudience === 'חינוך מיוחד'),
      'פדגוגיה': () => trainings.some(t => t.category === 'פדגוגיה'),
    };

    for (const [keyword, validator] of Object.entries(requiresDataFor)) {
      if (strength.includes(keyword) && !validator()) {
        return false;
      }
    }

    return true;
  }, [trainings, hasTrainings]);

  return {
    workflowState,
    hasInstitutions,
    hasTrainings,
    imbalanceDetection,
    domainDistribution,
    validateStep,
    getBlockedStepInfo,
    validateActionPlan,
    validateStrength,
  };
};
