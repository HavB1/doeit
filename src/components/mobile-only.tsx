"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, Smartphone, Monitor } from "lucide-react";

export default function MobileOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isMobileOS = (): boolean => {
    const userAgent =
      typeof navigator === "undefined" ? "" : navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  };

  // const isSafari = (): boolean => {
  //   const userAgent =
  //     typeof navigator === "undefined" ? "" : navigator.userAgent;
  //   return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  // };

  if (!hasMounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <p className="text-sm text-gray-600">Loading doeit...</p>
        </div>
      </div>
    );
  }

  if (!isMobile || !isMobileOS()) {
    if (process.env.NODE_ENV === "production") {
      return (
        <div className="h-screen w-screen px-6 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Card className="p-8 max-w-md w-full text-center shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-6">
              {/* Icon */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <Monitor className="h-3 w-3 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Mobile Experience Required
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  <strong>doeit</strong> is designed specifically for mobile
                  devices to provide the best fitness tracking experience.
                  Please open this app on your smartphone.
                </p>
              </div>

              {/* Action */}
              <div className="pt-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Try Again
                </Button>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100 w-full">
                <p className="text-xs text-gray-500">
                  💪 Built for your fitness journey
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }
  }

  // if (isSafari()) {
  //   return (
  //     <div className="h-screen w-screen px-4 flex items-center justify-center">
  //       <Card className="p-10 text-balance shadow-red-300">
  //         <p className="text-center text-xl font-bold">
  //           This app may not function optimally in Safari. Please consider using
  //           a different browser.
  //         </p>
  //       </Card>
  //     </div>
  //   );
  // }

  return <>{children}</>;
}
