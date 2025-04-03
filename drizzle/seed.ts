import { db } from "../src/db";
import {
  presetWorkoutPlans,
  presetWorkoutDays,
  presetExercises,
} from "../src/db/schema";
// import { sql } from "drizzle-orm";

export async function seed() {
  console.log("🌱 Seeding expanded preset workout plans...");

  // const plans = [
  //   {
  //     goalType: "lose_weight" as const,
  //     name: "Fat Burner Beginner",
  //     description: "Light cardio-focused plan with bodyweight strength work.",
  //     days: [
  //       {
  //         dayNumber: 1,
  //         focus: "Full Body Burn",
  //         exercises: [
  //           { name: "Bodyweight Squats", sets: 3, reps: "15" },
  //           { name: "Push-Ups (Knee)", sets: 3, reps: "10" },
  //           { name: "Jumping Jacks", sets: 3, reps: "30 sec" },
  //           { name: "Wall Sit", sets: 3, reps: "30 sec" },
  //           { name: "Glute Bridge", sets: 3, reps: "15" },
  //         ],
  //       },
  //       {
  //         dayNumber: 2,
  //         focus: "Core + Cardio",
  //         exercises: [
  //           { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
  //           { name: "Plank", sets: 3, reps: "30 sec" },
  //           { name: "High Knees", sets: 3, reps: "30 sec" },
  //           { name: "Flutter Kicks", sets: 3, reps: "20" },
  //           { name: "Toe Touches", sets: 3, reps: "20" },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     goalType: "gain_muscle",
  //     name: "Muscle Builder Beginner",
  //     description:
  //       "Foundational hypertrophy plan with machines and bodyweight.",
  //     days: [
  //       {
  //         dayNumber: 1,
  //         focus: "Push (Chest + Shoulders)",
  //         exercises: [
  //           { name: "Chest Press Machine", sets: 3, reps: "12" },
  //           { name: "Shoulder Press Machine", sets: 3, reps: "10" },
  //           { name: "Triceps Pushdowns", sets: 3, reps: "12" },
  //           { name: "Lateral Raises", sets: 3, reps: "15" },
  //           { name: "Incline Push-Ups", sets: 3, reps: "10" },
  //         ],
  //       },
  //       {
  //         dayNumber: 2,
  //         focus: "Pull (Back + Biceps)",
  //         exercises: [
  //           { name: "Lat Pulldown", sets: 3, reps: "10" },
  //           { name: "Seated Cable Row", sets: 3, reps: "10" },
  //           { name: "EZ Bar Curls", sets: 3, reps: "12" },
  //           { name: "Hammer Curls", sets: 3, reps: "12" },
  //           { name: "Face Pulls", sets: 3, reps: "15" },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     goalType: "maintain",
  //     name: "Full Body Maintenance Beginner",
  //     description: "Gentle all-around conditioning for habit building.",
  //     days: [
  //       {
  //         dayNumber: 1,
  //         focus: "Light Strength",
  //         exercises: [
  //           { name: "Bodyweight Squat", sets: 3, reps: "15" },
  //           { name: "Wall Push-Ups", sets: 3, reps: "12" },
  //           { name: "Step-ups", sets: 3, reps: "10 each leg" },
  //           { name: "Bird Dog", sets: 3, reps: "10" },
  //           { name: "Glute Bridge", sets: 3, reps: "15" },
  //         ],
  //       },
  //       {
  //         dayNumber: 2,
  //         focus: "Core + Mobility",
  //         exercises: [
  //           { name: "Standing Toe Touch", sets: 2, reps: "30 sec" },
  //           { name: "Side Bends", sets: 3, reps: "20" },
  //           { name: "Plank", sets: 3, reps: "30 sec" },
  //           { name: "Back Extensions", sets: 3, reps: "15" },
  //           { name: "Ankle Hops", sets: 2, reps: "20" },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  const plans = [
    {
      goalType: "lose_weight",
      name: "Fat Burner Beginner",
      description: "Light cardio-focused plan with bodyweight strength work.",
      days: [
        {
          dayNumber: 1,
          focus: "Lower Body Burn",
          exercises: [
            { name: "Bodyweight Squats", sets: 3, reps: "15" },
            { name: "Glute Bridge", sets: 3, reps: "15" },
            { name: "Wall Sit", sets: 3, reps: "30 sec" },
            { name: "Step-Ups", sets: 3, reps: "12" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Core & Cardio",
          exercises: [
            { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
            { name: "Plank", sets: 3, reps: "30 sec" },
            { name: "Flutter Kicks", sets: 3, reps: "20" },
            { name: "High Knees", sets: 3, reps: "30 sec" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Upper Body Strength",
          exercises: [
            { name: "Incline Push-Ups", sets: 3, reps: "12" },
            { name: "Shoulder Taps", sets: 3, reps: "20" },
            { name: "Superman Hold", sets: 3, reps: "30 sec" },
            { name: "Wall Push-Ups", sets: 3, reps: "15" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Full Body HIIT",
          exercises: [
            { name: "Burpees", sets: 3, reps: "10" },
            { name: "Jumping Jacks", sets: 3, reps: "1 min" },
            { name: "Skaters", sets: 3, reps: "20" },
            { name: "Toe Touches", sets: 3, reps: "20" },
          ],
        },
      ],
    },
    {
      goalType: "gain_muscle",
      name: "Muscle Foundation Beginner",
      description: "Full body strength plan using machines and light weights.",
      days: [
        {
          dayNumber: 1,
          focus: "Chest + Shoulders",
          exercises: [
            { name: "Chest Press Machine", sets: 3, reps: "12" },
            { name: "Shoulder Press Machine", sets: 3, reps: "10" },
            { name: "Incline Push-ups", sets: 3, reps: "12" },
            { name: "Lateral Raises", sets: 3, reps: "15" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Back + Biceps",
          exercises: [
            { name: "Lat Pulldown", sets: 3, reps: "10" },
            { name: "Cable Row", sets: 3, reps: "12" },
            { name: "Hammer Curl", sets: 3, reps: "12" },
            { name: "EZ Bar Curl", sets: 3, reps: "10" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Leg Day",
          exercises: [
            { name: "Leg Press", sets: 3, reps: "15" },
            { name: "Bodyweight Lunges", sets: 3, reps: "12 each leg" },
            { name: "Romanian Deadlift", sets: 3, reps: "10" },
            { name: "Calf Raise", sets: 3, reps: "20" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Core + Conditioning",
          exercises: [
            { name: "Bicycle Crunches", sets: 3, reps: "30" },
            { name: "Plank", sets: 3, reps: "45 sec" },
            { name: "Kettlebell Swings", sets: 3, reps: "15" },
            { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
          ],
        },
      ],
    },
    {
      goalType: "maintain",
      name: "Maintain Lite",
      description: "Gentle conditioning for consistency.",
      days: [
        {
          dayNumber: 1,
          focus: "Full Body Basics",
          exercises: [
            { name: "Bodyweight Squats", sets: 3, reps: "15" },
            { name: "Wall Push-Ups", sets: 3, reps: "12" },
            { name: "Glute Bridge", sets: 3, reps: "15" },
            { name: "Bird Dog", sets: 3, reps: "10 each side" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Mobility & Core",
          exercises: [
            { name: "Plank", sets: 3, reps: "30 sec" },
            { name: "Cat-Cow Stretch", sets: 3, reps: "10" },
            { name: "Standing Toe Touch", sets: 3, reps: "30 sec" },
            { name: "Superman Hold", sets: 3, reps: "30 sec" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Strength & Balance",
          exercises: [
            { name: "Step-ups", sets: 3, reps: "12" },
            { name: "Lateral Lunges", sets: 3, reps: "10 each side" },
            { name: "Push-Ups", sets: 3, reps: "10" },
            { name: "Arm Circles", sets: 3, reps: "30 sec" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Active Recovery",
          exercises: [
            { name: "Yoga Flow", sets: 1, reps: "15 min" },
            { name: "Foam Rolling", sets: 1, reps: "10 min" },
            { name: "Walking", sets: 1, reps: "20 min" },
            { name: "Stretching", sets: 1, reps: "15 min" },
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
