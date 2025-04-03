import OnboardingView from "./components/onboarding-view";

export default function OnboardingPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Welcome to Doeit!
      </h1>
      <OnboardingView />
    </div>
  );
}
