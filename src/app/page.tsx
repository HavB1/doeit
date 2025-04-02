import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl aspect-square rounded-2xl overflow-hidden mb-8">
        <Image
          src="/lino-1.png"
          alt="Lino Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your Personal Fitness Journey
        </h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Track your progress, set goals, and achieve your fitness dreams with
          Lino
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/onboarding">Get Started</Link>
        </Button>
      </div>
    </main>
  );
}
