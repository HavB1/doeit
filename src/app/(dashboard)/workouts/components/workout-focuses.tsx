"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { InferSelectModel } from "drizzle-orm";
import type { workoutFocuses } from "@/db/schema";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

type WorkoutFocus = InferSelectModel<typeof workoutFocuses>;

interface WorkoutFocusesProps {
  workoutId: string;
}

export function WorkoutFocuses({ workoutId }: WorkoutFocusesProps) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // Get all available focuses
  const { data: allFocuses = [] } = useQuery(
    trpc.workoutFocuses.getAll.queryOptions()
  ) as { data: WorkoutFocus[] };

  // Get focuses for this workout
  const { data: workoutFocuses = [] } = useQuery(
    trpc.workoutFocuses.getByWorkout.queryOptions({ workoutId })
  ) as { data: WorkoutFocus[] };

  // Add focus mutation
  const addFocusMutation = useMutation(
    trpc.workoutFocuses.addFocusToWorkout.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["workoutFocuses", "getByWorkout", workoutId],
        });
        toast.success("Focus added successfully");
      },
      onError: (error: TRPCClientErrorLike<any>) => {
        toast.error("Failed to add focus");
        console.error(error);
      },
    })
  );

  // Remove focus mutation
  const removeFocusMutation = useMutation(
    trpc.workoutFocuses.removeFocusFromWorkout.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["workoutFocuses", "getByWorkout", workoutId],
        });
        toast.success("Focus removed successfully");
      },
      onError: (error: TRPCClientErrorLike<any>) => {
        toast.error("Failed to remove focus");
        console.error(error);
      },
    })
  );

  const availableFocuses = allFocuses.filter(
    (focus) => !workoutFocuses.some((wf) => wf.id === focus.id)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Workout Focuses</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Focus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Workout Focus</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 p-4">
                {availableFocuses.map((focus) => (
                  <Button
                    key={focus.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      addFocusMutation.mutate({ workoutId, focusId: focus.id })
                    }
                    disabled={addFocusMutation.isPending}
                  >
                    {focus.name}
                  </Button>
                ))}
                {availableFocuses.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No focuses available to add
                  </p>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-2">
        {workoutFocuses.map((focus) => (
          <Badge
            key={focus.id}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {focus.name}
            <button
              onClick={() =>
                removeFocusMutation.mutate({ workoutId, focusId: focus.id })
              }
              disabled={removeFocusMutation.isPending}
              className="ml-1 rounded-full p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {workoutFocuses.length === 0 && (
          <p className="text-sm text-muted-foreground">No focuses added yet</p>
        )}
      </div>
    </div>
  );
}
