import { db } from "../src/db";
import {
  presetWorkoutPlans,
  presetWorkoutDays,
  presetExercises,
} from "../src/db/schema";
// import { sql } from "drizzle-orm";

export async function seed() {
  console.log("🌱 Seeding expanded preset workout plans...");

  const plans = [
    {
      goalType: "gain_muscle",
      name: "Gym Machines: Full Body Builder",
      description:
        "Full body strength plan using gym machines, ideal for hypertrophy.",
      days: [
        {
          dayNumber: 1,
          focus: "Chest + Triceps",
          exercises: [
            { name: "Chest Press Machine", sets: 4, reps: "10" },
            { name: "Pec Deck Machine", sets: 4, reps: "12" },
            { name: "Triceps Pushdown (Cable)", sets: 4, reps: "12" },
            { name: "Overhead Triceps Extension (Cable)", sets: 3, reps: "15" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Back + Biceps",
          exercises: [
            { name: "Lat Pulldown Machine", sets: 4, reps: "10" },
            { name: "Seated Row Machine", sets: 4, reps: "12" },
            { name: "Preacher Curl Machine", sets: 3, reps: "12" },
            { name: "Cable Rope Hammer Curl", sets: 3, reps: "12" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Legs",
          exercises: [
            { name: "Leg Press Machine", sets: 4, reps: "10" },
            { name: "Leg Curl Machine", sets: 3, reps: "15" },
            { name: "Leg Extension Machine", sets: 3, reps: "15" },
            { name: "Calf Raise Machine", sets: 4, reps: "20" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Shoulders + Core",
          exercises: [
            { name: "Shoulder Press Machine", sets: 4, reps: "10" },
            { name: "Lateral Raise Machine", sets: 4, reps: "12" },
            { name: "Cable Crunch", sets: 4, reps: "15" },
            { name: "Hanging Leg Raises", sets: 3, reps: "15" },
          ],
        },
      ],
    },
  ];

  for (const plan of plans) {
    const [insertedPlan] = await db
      .insert(presetWorkoutPlans)
      .values({
        name: plan.name,
        description: plan.description,
        goalType: plan.goalType as "lose_weight" | "gain_muscle" | "maintain",
      })
      .returning({ id: presetWorkoutPlans.id });

    for (const day of plan.days) {
      const [insertedDay] = await db
        .insert(presetWorkoutDays)
        .values({
          presetPlanId: insertedPlan.id,
          dayNumber: day.dayNumber,
          focus: day.focus,
        })
        .returning({ id: presetWorkoutDays.id });

      await db.insert(presetExercises).values(
        day.exercises.map((ex) => ({
          presetDayId: insertedDay.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
        }))
      );
    }
  }

  console.log("✅ Expanded preset plans seeded.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
