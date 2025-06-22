import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function WorkoutsSkeleton() {
  return (
    <div className="container mx-auto relative py-6 space-y-8">
      {/* Hero Section Skeleton */}
      {/* <div className="relative flex justify-center items-center w-full overflow-hidden h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
          <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 px-8 py-6">
            <Skeleton className="h-12 w-64 bg-slate-700 mb-2" />
            <Skeleton className="h-6 w-48 bg-slate-600" />
          </div>
        </div>
      </div> */}

      {/* Tabs Skeleton */}
      <div className="space-y-8">
        <div className="w-full max-w-lg mx-auto bg-slate-800 border-2 border-slate-600 p-1 h-12 rounded-lg">
          <div className="flex h-full">
            <div className="flex-1 bg-primary rounded-md" />
            <div className="flex-1" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          {/* Workout Plans Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="group relative overflow-hidden transition-all border-4 border-slate-500 bg-black shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 opacity-0" />
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <Skeleton className="h-8 w-48 bg-slate-700" />
                        <Skeleton className="h-4 w-full bg-slate-700" />
                        <Skeleton className="h-4 w-3/4 bg-slate-700" />
                      </div>
                      <Skeleton className="h-8 w-16 bg-primary ml-4" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-20 bg-slate-700" />
                        <Skeleton className="h-6 w-12 bg-slate-700" />
                      </div>
                      <div className="bg-slate-900 border-2 border-slate-600 h-5 shadow-inner">
                        <Skeleton className="h-full w-3/4 bg-primary" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-slate-600">
                      <Skeleton className="h-4 w-24 bg-slate-700" />
                      <Skeleton className="h-8 w-24 bg-primary/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
