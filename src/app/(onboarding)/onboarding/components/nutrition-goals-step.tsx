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

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

const formSchema = z.object({
  dailyCalories: z
    .number()
    .int()
    .positive()
    .min(500, {
      message: "Daily calories must be at least 500.",
    })
    .max(5000, {
      message: "Daily calories must be less than 5000.",
    })
    .optional(),
  dailyProtein: z
    .number()
    .int()
    .positive()
    .min(20, {
      message: "Daily protein must be at least 20g.",
    })
    .max(400, {
      message: "Daily protein must be less than 400g.",
    })
    .optional(),
});

interface NutritionGoalsStepProps {
  onSuccess: () => void;
}

export default function NutritionGoalsStep({
  onSuccess,
}: NutritionGoalsStepProps) {
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyCalories: undefined,
      dailyProtein: undefined,
    },
  });

  const nutritionGoalsMutation = useMutation(
    trpc.userProfile.createOrUpdateProfile.mutationOptions({
      onSuccess: () => {
        onSuccess();
      },
    })
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    nutritionGoalsMutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Goals (Optional)</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="dailyCalories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Calorie Goal (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Enter your daily calorie goal"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dailyProtein"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Protein Goal in grams (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Enter your daily protein goal"
                    />
                  </FormControl>
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
