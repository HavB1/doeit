import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-white">
      {/* Hero Image */}
      <div className="absolute h-full w-full  inset-0">
        <Image
          src="/doeit-hero.png"
          alt="Fitness woman with dumbbells"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-black leading-tight">
            Your Ultimate
            <br />
            Guide to Health
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Elevate Fitness Journey With a Cutting-Edge to Fuel Your Motivation
            & Crush Your Goals
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full rounded-full border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
          >
            <Link href="/plans">Get Started</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
