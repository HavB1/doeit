"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Activity, Calendar } from "lucide-react";

const formSchema = z.object({
  activityLevel: z.enum(
    ["sedentary", "light", "moderate", "very_active", "extra_active"],
    {
      required_error: "Please select your activity level.",
    }
  ),
  weeklyGymGoal: z.enum(["2-3", "3-4", "4-5", "5-6", "6+"], {
    required_error: "Please select your weekly gym goal.",
  }),
});

interface ActivityLevelStepProps {
  onSuccess: () => void;
}

export default function ActivityLevelStep({
  onSuccess,
}: ActivityLevelStepProps) {
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityLevel: undefined,
      weeklyGymGoal: undefined,
    },
  });

  const activityLevelMutation = useMutation(
    trpc.userProfile.createOrUpdateProfile.mutationOptions({
      onSuccess: () => {
        onSuccess();
      },
    })
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    activityLevelMutation.mutate(values);
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">
          How active are you?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Current Activity Level
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="Select your activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">
                          Sedentary (little or no exercise)
                        </SelectItem>
                        <SelectItem value="light">
                          Light (light exercise/sports 1-3 days/week)
                        </SelectItem>
                        <SelectItem value="moderate">
                          Moderate (moderate exercise/sports 3-5 days/week)
                        </SelectItem>
                        <SelectItem value="very_active">
                          Very Active (hard exercise/sports 6-7 days/week)
                        </SelectItem>
                        <SelectItem value="extra_active">
                          Extra Active (very hard exercise/sports & physical job
                          or training twice/day)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="weeklyGymGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Weekly Gym Goal
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="Select your weekly gym goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2-3">2-3 times per week</SelectItem>
                        <SelectItem value="3-4">3-4 times per week</SelectItem>
                        <SelectItem value="4-5">4-5 times per week</SelectItem>
                        <SelectItem value="5-6">5-6 times per week</SelectItem>
                        <SelectItem value="6+">6+ times per week</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={activityLevelMutation.isPending}
              >
                {activityLevelMutation.isPending ? "Saving..." : "Continue"}
              </Button>
            </motion.div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
