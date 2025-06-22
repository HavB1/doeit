"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  id: string;
  name: string;
  category:
    | "upper_body"
    | "lower_body"
    | "core"
    | "cardio"
    | "full_body"
    | "other"
    | null;
  description: string | null;
}

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base line-clamp-1 flex-1">
            {exercise.name}
          </CardTitle>
          {exercise.category && (
            <Badge
              variant="secondary"
              className="shrink-0 capitalize text-xs px-2 py-1"
            >
              {exercise.category.replace("_", " ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
          {exercise.description || "No description available"}
        </p>
      </CardContent>
    </Card>
  );
}
