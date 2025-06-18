"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

interface ClonePlanButtonProps {
  planId: string;
}

export function ClonePlanButton({ planId }: ClonePlanButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();
  const trpc = useTRPC();
  const { isSignedIn } = useAuth();

  const { mutate: clonePlan, isPending } = useMutation(
    trpc.workout.clonePresetPlan.mutationOptions({
      onSuccess: () => {
        toast.success("Plan cloned successfully");
        setOpen(false);
        router.push("/workouts");
      },
      onError: (error) => {
        toast.error("Failed to clone plan");
        console.error(error);
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clonePlan({ presetPlanId: planId });
  };

  if (!isSignedIn) {
    return (
      <SignInButton fallbackRedirectUrl={"/plans/" + planId} mode="modal">
        <Button>Sign in to Clone Plan</Button>
      </SignInButton>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Clone Plan</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Clone Workout Plan</DialogTitle>
            <DialogDescription>
              Your new plan will be added to your workouts.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Cloning..." : "Clone Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
