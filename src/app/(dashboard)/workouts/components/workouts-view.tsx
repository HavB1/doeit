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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Dumbbell, ArrowRight, Trash2 } from "lucide-react";

type RouterOutput = inferRouterOutputs<AppRouter>;
type WorkoutPlan = RouterOutput["workoutPlans"]["getMyPlans"][number];
// type WorkoutDay = WorkoutPlan["days"][number];
// type WorkoutLog = RouterOutput["workout"]["getRecentWorkouts"][number];

export function WorkoutsView() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const deletePlanMutation = useMutation(
    trpc.workoutPlans.deletePlan.mutationOptions()
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

  const handleDelete = () => {
    if (!selectedPlan) return;
    deletePlanMutation.mutate(
      { planId: selectedPlan.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.workoutPlans.getMyPlans.queryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.workoutPlans.getNextIncompleteDay.queryKey({
              planId: selectedPlan.id,
            }),
          });
          setSelectedPlan(null);
          toast.success("Workout plan deleted successfully");
          setShowDeleteDialog(false);
        },
        onError: (error) => {
          toast.error("Failed to delete workout plan");
          console.error(error);
        },
      }
    );
  };

  return (
    <div className="container mx-auto relative py-8 space-y-8">
      <div className="flex justify-center items-center w-full overflow-hidden h-56 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
        <Image
          src="/doeit-4.png"
          alt="Doeit"
          width={1000}
          height={1000}
          className="w-full h-full object-cover object-top"
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="w-full max-w-md mx-auto">
          <TabsTrigger value="plans" className="flex-1">
            My Plans
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            Workout History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {!plans?.length ? (
            <Card className="p-8 border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center space-y-6 p-0">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">No workout plans yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first workout plan to get started
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/workouts/plans/new")}
                  className="rounded-full px-8"
                  size="lg"
                >
                  Create Your First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {plans?.map((plan) => {
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
                    className="p-6 transition-all hover:shadow-lg active:scale-[0.98] border-2"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-xl">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {plan.description || "No description available"}
                          </p>
                        </div>
                        <Badge className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                          {completedDays}/{plan.days.length} days
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {plan.goalType === "lose_weight"
                              ? "Weight Loss"
                              : plan.goalType === "gain_muscle"
                              ? "Muscle Gain"
                              : "Maintenance"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlan(plan);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {!recentWorkouts?.length ? (
            <Card className="p-8 border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center space-y-6 p-0">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">No workouts logged yet</p>
                  <p className="text-sm text-muted-foreground">
                    Complete your first workout to see it here
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/workouts/plans")}
                  className="rounded-full px-8"
                  size="lg"
                >
                  Start Your First Workout
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {recentWorkouts?.map((workout) => (
                <Card
                  key={workout.id}
                  className="p-6 transition-all hover:shadow-lg active:scale-[0.98] border-2"
                  onClick={() => router.push(`/workouts/${workout.id}`)}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-xl">
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
                      <Badge className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                        {new Date(workout.completedAt).toLocaleTimeString(
                          undefined,
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {workout.exerciseLogs?.length || 0} exercises
                          completed
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
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Continue Workout</DialogTitle>
          </DialogHeader>
          {isLoadingNextDay ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : nextDay ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">
                    Day {nextDay.dayNumber}
                  </h4>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-base">
                  Ready to continue your {selectedPlan?.name} workout plan?
                </p>
                <p className="text-sm text-muted-foreground">
                  This will start your next incomplete workout session.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-base text-muted-foreground">
                No more days to complete in this plan.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowContinueDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!nextDay || isLoadingNextDay}
              className="w-full sm:w-auto"
            >
              Start Workout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Workout Plan</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete this workout plan? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deletePlanMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePlanMutation.isPending}
              className="w-full sm:w-auto"
            >
              {deletePlanMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
