"use client";

import { useRouter, useSearchParams } from "next/navigation";
import PersonalInfoStep from "./personal-info-step";
import FitnessGoalStep from "./fitness-goal-step";
import ActivityLevelStep from "./activity-level-step";
import NutritionGoalsStep from "./nutrition-goals-step";

const STEPS = [
  { id: "personal", component: PersonalInfoStep },
  { id: "fitness", component: FitnessGoalStep },
  { id: "activity", component: ActivityLevelStep },
  { id: "nutrition", component: NutritionGoalsStep },
] as const;

export default function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get("step") || "personal";

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const CurrentStepComponent = STEPS[currentStepIndex]?.component;

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentStepIndex + 1].id;
      router.push(`/onboarding?step=${nextStep}`);
    } else {
      // Handle completion
      router.push("/dashboard");
    }
  };

  if (!CurrentStepComponent) {
    return null;
  }

  return <CurrentStepComponent onSuccess={handleNext} />;
}
