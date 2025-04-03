import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center p-4">
      <div className="relative w-full flex-1 max-w-2xl aspect-square rounded-2xl overflow-hidden mb-8">
        <Image
          src="/doeit-hero.png"
          alt="Doeit Fitness App Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/100 from-0% to-transparent" />
      </div>

      <div className="text-center flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your Personal Fitness Journey Starts Here
        </h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Track your progress, set goals, and achieve your fitness dreams with
          Doeit - your all-in-one fitness companion
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/dashboard">Get Started</Link>
        </Button>
      </div>
    </main>
  );
}
