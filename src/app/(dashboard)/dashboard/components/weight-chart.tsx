"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function WeightChart() {
  const trpc = useTRPC();

  const { data: weightHistory, isLoading } = useQuery(
    trpc.weight.getWeightHistory.queryOptions()
  );

  if (isLoading) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!weightHistory?.length) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        No weight data yet. Start tracking your weight to see your progress!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={weightHistory}>
        <XAxis
          dataKey="createdAt"
          tickFormatter={(value) => format(new Date(value), "MMM d")}
        />
        <YAxis
          domain={["dataMin - 1", "dataMax + 1"]}
          tickFormatter={(value) => `${value}kg`}
        />
        <Tooltip
          labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
          formatter={(value) => [`${value}kg`, "Weight"]}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
