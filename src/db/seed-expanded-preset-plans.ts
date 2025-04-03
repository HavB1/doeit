
import { db } from "@/lib/db"
import { presetWorkoutPlans, presetWorkoutDays, presetExercises } from "@/schemas/schema"
import { sql } from "drizzle-orm"

async function seedExpandedPresetPlans() {
  console.log("🌱 Seeding expanded preset workout plans...")

  const plans = [
    {
      goalType: "lose_weight",
      name: "Fat Burner Beginner",
      description: "Light cardio-focused plan with bodyweight strength work.",
      days: [
        {
          dayNumber: 1,
          focus: "Full Body Burn",
          exercises: [
            { name: "Bodyweight Squats", sets: 3, reps: "15" },
            { name: "Push-Ups (Knee)", sets: 3, reps: "10" },
            { name: "Jumping Jacks", sets: 3, reps: "30 sec" },
            { name: "Wall Sit", sets: 3, reps: "30 sec" },
            { name: "Glute Bridge", sets: 3, reps: "15" }
          ]
        },
        {
          dayNumber: 2,
          focus: "Core + Cardio",
          exercises: [
            { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
            { name: "Plank", sets: 3, reps: "30 sec" },
            { name: "High Knees", sets: 3, reps: "30 sec" },
            { name: "Flutter Kicks", sets: 3, reps: "20" },
            { name: "Toe Touches", sets: 3, reps: "20" }
          ]
        }
      ]
    },
    {
      goalType: "gain_muscle",
      name: "Muscle Builder Beginner",
      description: "Foundational hypertrophy plan with machines and bodyweight.",
      days: [
        {
          dayNumber: 1,
          focus: "Push (Chest + Shoulders)",
          exercises: [
            { name: "Chest Press Machine", sets: 3, reps: "12" },
            { name: "Shoulder Press Machine", sets: 3, reps: "10" },
            { name: "Triceps Pushdowns", sets: 3, reps: "12" },
            { name: "Lateral Raises", sets: 3, reps: "15" },
            { name: "Incline Push-Ups", sets: 3, reps: "10" }
          ]
        },
        {
          dayNumber: 2,
          focus: "Pull (Back + Biceps)",
          exercises: [
            { name: "Lat Pulldown", sets: 3, reps: "10" },
            { name: "Seated Cable Row", sets: 3, reps: "10" },
            { name: "EZ Bar Curls", sets: 3, reps: "12" },
            { name: "Hammer Curls", sets: 3, reps: "12" },
            { name: "Face Pulls", sets: 3, reps: "15" }
          ]
        }
      ]
    },
    {
      goalType: "maintain",
      name: "Full Body Maintenance Beginner",
      description: "Gentle all-around conditioning for habit building.",
      days: [
        {
          dayNumber: 1,
          focus: "Light Strength",
          exercises: [
            { name: "Bodyweight Squat", sets: 3, reps: "15" },
            { name: "Wall Push-Ups", sets: 3, reps: "12" },
            { name: "Step-ups", sets: 3, reps: "10 each leg" },
            { name: "Bird Dog", sets: 3, reps: "10" },
            { name: "Glute Bridge", sets: 3, reps: "15" }
          ]
        },
        {
          dayNumber: 2,
          focus: "Core + Mobility",
          exercises: [
            { name: "Standing Toe Touch", sets: 2, reps: "30 sec" },
            { name: "Side Bends", sets: 3, reps: "20" },
            { name: "Plank", sets: 3, reps: "30 sec" },
            { name: "Back Extensions", sets: 3, reps: "15" },
            { name: "Ankle Hops", sets: 2, reps: "20" }
          ]
        }
      ]
    }
  ]

  for (const plan of plans) {
    const [insertedPlan] = await db
      .insert(presetWorkoutPlans)
      .values({
        name: plan.name,
        description: plan.description,
        goalType: plan.goalType
      })
      .returning({ id: presetWorkoutPlans.id })

    for (const day of plan.days) {
      const [insertedDay] = await db
        .insert(presetWorkoutDays)
        .values({
          presetPlanId: insertedPlan.id,
          dayNumber: day.dayNumber,
          focus: day.focus
        })
        .returning({ id: presetWorkoutDays.id })

      await db.insert(presetExercises).values(
        day.exercises.map((ex) => ({
          presetDayId: insertedDay.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps
        }))
      )
    }
  }

  console.log("✅ Expanded preset plans seeded.")
}

seedExpandedPresetPlans().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
