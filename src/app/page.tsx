import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen flex flex-col justify-end bg-background">
      {/* Hero Image with warm overlay */}
      <div className="absolute inset-0 h-full w-full">
        <Image
          src="/doeit-hero.png"
          alt="Home workout inspiration"
          fill
          className="object-cover w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pt-20 pb-10 flex flex-col items-center w-full max-w-md mx-auto">
        {/* Badge */}
        <span className="mb-4 inline-block rounded-full bg-primary/10 text-primary font-semibold text-xs px-4 py-1 tracking-wide">
          Home & Gym Friendly
        </span>
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-foreground text-center mb-4">
          Start Your <span className="text-primary">Fitness</span> Journey
          <br />
          <span className="text-primary">Anywhere</span>, Anytime
        </h1>
        {/* Subheading */}
        <p className="text-base text-muted-foreground text-center mb-6 max-w-xs">
          Simple, effective plans for home or gym. No equipment? No problem.
          Your path to a healthier you starts here.
        </p>
        {/* Stats */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-primary">50+</span>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Preset Plans
            </span>
          </div>
          <div className="w-px bg-border mx-2" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-primary">100+</span>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Unique Exercises
            </span>
          </div>
        </div>
        {/* CTA Buttons */}
        <Button
          asChild
          size="lg"
          className="w-full rounded-full font-bold text-lg bg-primary text-primary-foreground shadow-md mb-3 hover:bg-primary/90 transition-colors"
        >
          <Link href="/plans">Get Started</Link>
        </Button>
        <Link
          href="/exercises"
          className="w-full text-center text-primary font-semibold underline underline-offset-4 text-base"
        >
          Browse Exercises
        </Link>
      </div>
    </main>
  );
}
