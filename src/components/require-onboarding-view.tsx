"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function RequireOnboardingView({
  children,
}: {
  children: React.ReactNode;
}) {
  const trpc = useTRPC();
  const router = useRouter();

  const { data: userProfile, error } = useQuery(
    trpc.userProfile.getProfile.queryOptions()
  );

  const isOnboardingCompleted = !!userProfile;

  useEffect(() => {
    if (!isOnboardingCompleted) {
      router.push("/onboarding");
    }
  }, [isOnboardingCompleted, router]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
