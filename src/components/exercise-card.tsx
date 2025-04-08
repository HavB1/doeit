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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg line-clamp-1">
            {exercise.name}
          </CardTitle>
          {exercise.category && (
            <Badge variant="secondary" className="shrink-0 capitalize">
              {exercise.category.replace("_", " ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {exercise.description || "No description available"}
        </p>
      </CardContent>
    </Card>
  );
}
