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
import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { WorkoutsSkeleton } from "./workouts-skeleton";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  Dumbbell,
  ArrowRight,
  Trash2,
  Calendar,
  Clock,
  Trophy,
  Target,
  Zap,
} from "lucide-react";

export function WorkoutsView() {
  const router = useRouter();
  const trpc = useTRPC();

  const [activeTab, setActiveTab] = useState("workouts");

  const { data: plans, isLoading: isLoadingPlans } = useSuspenseQuery(
    trpc.workout.getMyWorkouts.queryOptions()
  );

  const { data: recentWorkouts, isLoading: isLoadingWorkouts } =
    useSuspenseQuery(trpc.workout.getRecentWorkouts.queryOptions());

  return (
    <div className="container mx-auto relative py-6 space-y-8">
      {/* Tabs - More Angular Design */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
        defaultValue="workouts"
      >
        <TabsList className="w-full max-w-lg mx-auto bg-slate-800 border-2 border-slate-600 p-1 h-12 text-slate-50">
          <TabsTrigger
            value="workouts"
            className="flex-1 text-slate-50 data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-wide border-0"
          >
            <Dumbbell className="h-5 w-5 mr-2" />
            Active Plans
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 text-slate-50 data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-wide border-0"
          >
            <Calendar className="h-5 w-5 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workouts" className="space-y-6">
          {!plans?.length ? (
            <Card className="border-2 border-dashed border-slate-600 bg-slate-800/50">
              <CardContent className="flex flex-col items-center justify-center space-y-8 p-12">
                <div className="h-20 w-20 bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <Dumbbell className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-2xl font-bold text-white">
                    NO WORKOUT PLANS
                  </p>
                  <p className="text-slate-400 font-medium">
                    Time to build your first battle plan
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/workouts/plans/new")}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-10 py-4 text-lg border-0"
                  size="lg"
                >
                  CREATE YOUR FIRST PLAN
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
                    className="group relative overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] cursor-pointer border-4 border-slate-500 bg-black hover:border-primary shadow-2xl"
                    onClick={() => router.push(`/workouts/plan/${plan.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-8 relative z-10">
                      <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <h3 className="font-black text-2xl text-white uppercase tracking-wide drop-shadow-lg">
                              {plan.name}
                            </h3>
                            <p className="text-slate-100 font-medium line-clamp-2">
                              {plan.description || "No description available"}
                            </p>
                          </div>
                          <Badge className="bg-primary text-white font-black px-4 py-2 border-0 shadow-lg text-sm">
                            {completedDays}/{plan.days.length}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold flex items-center gap-2">
                              <Target className="h-5 w-5 text-primary" />
                              PROGRESS
                            </span>
                            <span className="font-black text-xl text-white drop-shadow-lg">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="bg-slate-900 border-2 border-slate-600 h-5 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-500 shadow-lg"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-600">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white uppercase tracking-wide">
                              {plan.goalType === "lose_weight"
                                ? "Weight Loss"
                                : plan.goalType === "gain_muscle"
                                ? "Muscle Gain"
                                : "Maintenance"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-primary font-bold bg-primary/20 px-4 py-2 border-2 border-primary/30 shadow-md">
                            <Zap className="h-4 w-4" />
                            CONTINUE
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {!recentWorkouts?.length ? (
            <Card className="border-2 border-dashed border-slate-600 bg-slate-800/80">
              <CardContent className="flex flex-col items-center justify-center space-y-8 p-12">
                <div className="h-20 w-20 bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-2xl font-bold text-white">
                    NO WORKOUTS LOGGED
                  </p>
                  <p className="text-slate-400 font-medium">
                    Complete your first battle to see it here
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/plans")}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-10 py-4 text-lg border-0"
                  size="lg"
                >
                  START YOUR FIRST BATTLE
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {recentWorkouts?.map((workout) => (
                <Card
                  key={workout.id}
                  className="group relative overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] border-4 border-slate-500 bg-black hover:border-primary shadow-2xl"
                  onClick={() => router.push(`/workouts/${workout.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-8 relative z-10">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <h3 className="font-black text-2xl text-white uppercase tracking-wide drop-shadow-lg">
                            {workout.notes || "Untitled Workout"}
                          </h3>
                          <p className="text-slate-100 font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
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
                        <Badge className="bg-primary text-white font-black px-4 py-2 border-0 shadow-lg flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          {new Date(workout.completedAt).toLocaleTimeString(
                            undefined,
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t-2 border-slate-600">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-primary" />
                            {workout.exerciseLogs?.length || 0} EXERCISES
                            COMPLETED
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/workouts/${workout.id}`);
                          }}
                        >
                          VIEW DETAILS
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
