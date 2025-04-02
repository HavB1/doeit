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
    <Card>
      <CardHeader>
        <CardTitle>Activity Level</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your current activity level?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
            <FormField
              control={form.control}
              name="weeklyGymGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    How many times per week do you want to go to the gym?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
            <Button type="submit">Continue</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
