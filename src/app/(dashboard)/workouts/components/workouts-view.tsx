"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { useQuery } from "@tanstack/react-query";
import { WorkoutsSkeleton } from "./workouts-skeleton";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dumbbell, ArrowRight } from "lucide-react";

type RouterOutput = inferRouterOutputs<AppRouter>;
type WorkoutPlan = RouterOutput["workoutPlans"]["getMyPlans"][number];
// type WorkoutDay = WorkoutPlan["days"][number];
// type WorkoutLog = RouterOutput["workout"]["getRecentWorkouts"][number];

export function WorkoutsView() {
  const router = useRouter();
  const trpc = useTRPC();
  const [activeTab, setActiveTab] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [showContinueDialog, setShowContinueDialog] = useState(false);

  const { data: plans, isLoading: isLoadingPlans } = useQuery(
    trpc.workoutPlans.getMyPlans.queryOptions()
  );

  const { data: recentWorkouts, isLoading: isLoadingWorkouts } = useQuery(
    trpc.workout.getRecentWorkouts.queryOptions()
  );

  const { data: nextDay, isLoading: isLoadingNextDay } = useQuery(
    trpc.workoutPlans.getNextIncompleteDay.queryOptions(
      {
        planId: selectedPlan?.id || "",
      },
      {
        enabled: !!selectedPlan,
      }
    )
  );

  if (isLoadingPlans || isLoadingWorkouts) {
    return <WorkoutsSkeleton />;
  }

  const handlePlanSelect = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setShowContinueDialog(true);
  };

  const handleContinue = () => {
    if (!nextDay) {
      toast.error("No more days to complete");
      return;
    }
    router.push(
      `/workouts/session?planId=${selectedPlan?.id}&dayId=${nextDay.id}`
    );
  };

  return (
    <div className="container mx-auto relative py-6">
      <div className="flex justify-center items-center w-full h-full overflow-hidden rounded-lg">
        <Image
          src="/doeit-3.png"
          alt="Doeit Hero"
          width={100}
          height={100}
          className="w-full h-full object-contain"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {!plans?.length ? (
            <Card className="p-6">
              <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
                <Dumbbell className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  No workout plans yet
                </p>
                <Button
                  onClick={() => router.push("/workouts/plans/new")}
                  className="rounded-full"
                >
                  Create Your First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            plans?.map((plan) => {
              const completedDays = plan.days.filter((day) =>
                recentWorkouts?.some(
                  (workout) =>
                    workout.planId === plan.id && workout.dayId === day.id
                )
              ).length;
              const progress = (completedDays / plan.days.length) * 100;

              return (
                <Card
                  key={plan.id}
                  className="p-4 transition-all hover:shadow-md active:scale-[0.98]"
                  onClick={() => router.push(`/workouts/plans/${plan.id}`)}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {plan.description || "No description available"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {completedDays}/{plan.days.length} days
                        </Badge>
                      </div>
                    </div>

                    <Progress value={progress} className="h-2" />

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {plan.goalType === "lose_weight"
                            ? "Weight Loss"
                            : plan.goalType === "gain_muscle"
                            ? "Muscle Gain"
                            : "Maintenance"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlanSelect(plan);
                        }}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {!recentWorkouts?.length ? (
            <Card className="p-6">
              <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
                <Dumbbell className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  No workouts logged yet
                </p>
                <Button
                  onClick={() => router.push("/workouts/plans")}
                  className="rounded-full"
                >
                  Start Your First Workout
                </Button>
              </CardContent>
            </Card>
          ) : (
            recentWorkouts?.map((workout) => (
              <Card
                key={workout.id}
                className="p-4 transition-all hover:shadow-md active:scale-[0.98]"
                onClick={() => router.push(`/workouts/${workout.id}`)}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">
                        {workout.notes || "Untitled Workout"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.completedAt).toLocaleDateString(
                          undefined,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {new Date(workout.completedAt).toLocaleTimeString(
                          undefined,
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {workout.exerciseLogs?.length || 0} exercises
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/workouts/${workout.id}`);
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Continue Workout</DialogTitle>
          </DialogHeader>
          {isLoadingNextDay ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : nextDay ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Day {nextDay.dayNumber}</h4>
                  <p className="text-sm text-muted-foreground">
                    {nextDay.focus}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  Ready to continue your {selectedPlan?.name} workout plan?
                </p>
                <p className="text-xs text-muted-foreground">
                  This will start your next incomplete workout session.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No more days to complete in this plan.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowContinueDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!nextDay || isLoadingNextDay}
            >
              Start Workout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
