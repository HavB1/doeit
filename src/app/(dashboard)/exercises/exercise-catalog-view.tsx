"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExerciseCard } from "@/components/exercise-card";
import { CategorySelector } from "@/components/category-selector";
import { Search } from "lucide-react";

export function ExerciseCatalogView() {
  const trpc = useTRPC();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: allExercises = [], isLoading } = useQuery(
    trpc.exerciseCatalog.getAll.queryOptions()
  );

  // Filter exercises based on search term and category
  const filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || exercise.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="sticky top-0 z-10 bg-background pb-2">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exercises by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <CategorySelector
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {filteredExercises.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">No exercises found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
}
