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
import { motion } from "framer-motion";
import { Apple, Beef } from "lucide-react";

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
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">
          Set your nutrition goals
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
                name="dailyCalories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Apple className="h-4 w-4" />
                      Daily Calorie Goal
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-12 text-lg"
                        placeholder="Enter your daily calorie goal"
                      />
                    </FormControl>
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
                name="dailyProtein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Beef className="h-4 w-4" />
                      Daily Protein Goal (grams)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-12 text-lg"
                        placeholder="Enter your daily protein goal"
                      />
                    </FormControl>
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
                disabled={nutritionGoalsMutation.isPending}
              >
                {nutritionGoalsMutation.isPending ? "Saving..." : "Continue"}
              </Button>
            </motion.div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
