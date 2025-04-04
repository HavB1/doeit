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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Scale, User, Ruler, Weight } from "lucide-react";

const formSchema = z.object({
  age: z.number().int().positive().min(1, {
    message: "Age must be at least 1.",
  }),
  sex: z.enum(["male", "female"], {
    required_error: "Please select your sex.",
  }),
  height: z.number().positive().min(1, {
    message: "Height must be at least 1.",
  }),
  currentWeight: z.number().positive().min(1, {
    message: "Current weight must be at least 1.",
  }),
  targetWeight: z.number().positive().min(1, {
    message: "Target weight must be at least 1.",
  }),
});

interface PersonalInfoStepProps {
  onSuccess: () => void;
}

export default function PersonalInfoStep({ onSuccess }: PersonalInfoStepProps) {
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      sex: undefined,
      height: undefined,
      currentWeight: undefined,
      targetWeight: undefined,
    },
  });

  const personalInfoMutation = useMutation({
    ...trpc.userProfile.createOrUpdateProfile.mutationOptions(),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Failed to update personal information. Please try again.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Ensure all numeric values are properly converted
      const processedValues = {
        ...values,
        age: Number(values.age),
        height: Number(values.height),
        currentWeight: Number(values.currentWeight),
        targetWeight: Number(values.targetWeight),
      };

      personalInfoMutation.mutate(processedValues);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred while processing your information.");
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">
          Tell us about yourself
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
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Age
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
                        }}
                        className="h-12 text-lg"
                        placeholder="Enter your age"
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
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Sex
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="Select your sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
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
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Height (cm)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
                        }}
                        className="h-12 text-lg"
                        placeholder="Enter your height"
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
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              <FormField
                control={form.control}
                name="currentWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Weight className="h-4 w-4" />
                      Current Weight (kg)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
                        }}
                        className="h-12 text-lg"
                        placeholder="Enter your current weight"
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
              transition={{ duration: 0.2, delay: 0.4 }}
            >
              <FormField
                control={form.control}
                name="targetWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Target Weight (kg)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
                        }}
                        className="h-12 text-lg"
                        placeholder="Enter your target weight"
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
              transition={{ duration: 0.2, delay: 0.5 }}
            >
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={personalInfoMutation.isPending}
              >
                {personalInfoMutation.isPending ? "Saving..." : "Continue"}
              </Button>
            </motion.div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
