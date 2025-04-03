import { NewWorkoutForm } from "./components/new-workout-form";

export default function NewWorkoutPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">New Workout</h1>
      <NewWorkoutForm />
    </div>
  );
}
