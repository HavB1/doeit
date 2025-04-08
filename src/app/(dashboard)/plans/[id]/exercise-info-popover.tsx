"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export function ExerciseInfoPopover({ exerciseId }: { exerciseId: string }) {
  const trpc = useTRPC();

  // Query the exercise from the database by ID
  const { data: catalogExercise, isLoading } = useQuery(
    trpc.exerciseCatalog.getById.queryOptions({ id: exerciseId })
  );

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Info className="h-4 w-4" />
      </Button>
    );
  }

  if (!catalogExercise) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="relative h-48 w-full bg-muted flex items-center justify-center">
            {/* Placeholder for image */}
            <div className="text-muted-foreground">Exercise Image</div>
          </div>
          <div>
            <h4 className="font-semibold">{catalogExercise.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {catalogExercise.category}
            </p>
            <p className="text-sm mt-2">
              {catalogExercise.description || "No description available"}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
