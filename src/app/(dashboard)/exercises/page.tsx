import { prefetch, trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";
import { ExerciseCatalogView } from "./exercise-catalog-view";

export const dynamic = "force-dynamic";

export default function ExercisesPage() {
  // Prefetch exercises
  prefetch(trpc.exerciseCatalog.getAll.queryOptions());

  return (
    <div className="container py-4 px-4">
      <h1 className="text-xl font-bold mb-4">Exercise Catalog</h1>
      <HydrateClient>
        <ExerciseCatalogView />
      </HydrateClient>
    </div>
  );
}
