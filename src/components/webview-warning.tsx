"use client";

import { AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useWebviewDetection } from "@/hooks/use-webview-detection";

export function WebviewWarning() {
  const { isWebview, isLoading, detectedPlatform } = useWebviewDetection();

  if (isLoading || !isWebview) {
    return null;
  }

  const openInBrowser = () => {
    // Try to open the current URL in the default browser
    const currentUrl = window.location.href;

    // For iOS, try to open in Safari
    if (
      navigator.userAgent.includes("iPhone") ||
      navigator.userAgent.includes("iPad")
    ) {
      window.location.href = currentUrl;
    } else {
      // For Android and other platforms, try to open in default browser
      window.open(currentUrl, "_system");
    }
  };

  const getPlatformSpecificMessage = () => {
    if (detectedPlatform) {
      return `You're currently using doeit in ${detectedPlatform}. For the best experience and to ensure all features work properly, please open this link in your web browser.`;
    }
    return "It looks like you're using doeit in a social media app. For the best experience, please open this link in your web browser.";
  };

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="text-orange-800 dark:text-orange-200">
        <div className="flex flex-col gap-2">
          <p className="text-sm">{getPlatformSpecificMessage()}</p>
          <Button
            onClick={openInBrowser}
            variant="outline"
            size="sm"
            className="w-fit border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Browser
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
