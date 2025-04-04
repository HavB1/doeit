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
import { Target, Trophy } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  fitnessGoal: z.enum(["lose_weight", "maintain", "gain_muscle"], {
    required_error: "Please select your fitness goal.",
  }),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your experience level.",
  }),
});

interface FitnessGoalStepProps {
  onSuccess: () => void;
}

export default function FitnessGoalStep({ onSuccess }: FitnessGoalStepProps) {
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fitnessGoal: undefined,
      experienceLevel: undefined,
    },
  });

  const fitnessGoalMutation = useMutation(
    trpc.userProfile.createOrUpdateProfile.mutationOptions({
      onSuccess: () => {
        toast.success("Fitness goal updated successfully");
        onSuccess();
      },
    })
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    fitnessGoalMutation.mutate(values);
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">
          What are your fitness goals?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FormField
                control={form.control}
                name="fitnessGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Primary Fitness Goal
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="Select your goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lose_weight">Lose Weight</SelectItem>
                        <SelectItem value="maintain">
                          Maintain Weight
                        </SelectItem>
                        <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
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
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Experience Level
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">
                          Beginner (0-1 year)
                        </SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate (1-3 years)
                        </SelectItem>
                        <SelectItem value="advanced">
                          Advanced (3+ years)
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
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={fitnessGoalMutation.isPending}
              >
                {fitnessGoalMutation.isPending ? "Saving..." : "Continue"}
              </Button>
            </motion.div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
