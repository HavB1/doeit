"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CompleteStepProps {
  onSuccess: () => void;
}

export default function CompleteStep({ onSuccess }: CompleteStepProps) {
  const router = useRouter();

  const handleComplete = async () => {
    // Set the cookie to indicate onboarding is completed
    document.cookie = "onboarding_completed=true; path=/; max-age=31536000"; // 1 year expiry
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-[calc(100vh-rem)] rounded-lg overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/doeit-hero.png"
          alt="Fitness motivation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-2rem)] p-6">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center text-white">
              You're all set! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8 bg-transparent">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <CheckCircle2 className="h-24 w-24 text-green-500" />
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-2"
            >
              <h3 className="text-xl font-semibold text-white">
                Welcome to Doeit!
              </h3>
              <p className="text-white/80">
                Your fitness journey starts now. We've created a personalized
                plan just for you.
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full max-w-md"
            >
              <Button
                onClick={handleComplete}
                className="w-full h-12 text-lg bg-white text-black hover:bg-white/90"
                size="lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
