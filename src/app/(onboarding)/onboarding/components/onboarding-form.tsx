"use client";

import { useRouter, useSearchParams } from "next/navigation";
import PersonalInfoStep from "./personal-info-step";
import FitnessGoalStep from "./fitness-goal-step";
import ActivityLevelStep from "./activity-level-step";
import NutritionGoalsStep from "./nutrition-goals-step";
import CompleteStep from "./complete-step";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: "personal", component: PersonalInfoStep, title: "Personal Info" },
  { id: "fitness", component: FitnessGoalStep, title: "Fitness Goals" },
  { id: "activity", component: ActivityLevelStep, title: "Activity Level" },
  { id: "nutrition", component: NutritionGoalsStep, title: "Nutrition Goals" },
  { id: "complete", component: CompleteStep, title: "Complete" },
] as const;

export default function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get("step") || "personal";

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const CurrentStepComponent = STEPS[currentStepIndex]?.component;
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentStepIndex + 1].id;
      router.push(`/onboarding?step=${nextStep}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = STEPS[currentStepIndex - 1].id;
      router.push(`/onboarding?step=${prevStep}`);
    }
  };

  if (!CurrentStepComponent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-md space-y-6">
        {/* Progress Bar - Hide on complete step */}
        {currentStep !== "complete" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStepIndex + 1} of {STEPS.length - 1}
              </span>
              <span>{STEPS[currentStepIndex].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Navigation - Hide on complete step */}
        {currentStep !== "complete" && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className={currentStepIndex === 0 ? "invisible" : ""}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        )}

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentStepComponent onSuccess={handleNext} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
