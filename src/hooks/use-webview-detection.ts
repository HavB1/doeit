"use client";
import { useState, useEffect } from "react";

export function useWebviewDetection() {
  const [isWebview, setIsWebview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    const detectWebview = () => {
      const userAgent = navigator.userAgent.toLowerCase();

      // More specific webview indicators with platform detection
      const webviewPatterns = [
        { pattern: "wv", platform: "Android WebView" },
        { pattern: "instagram", platform: "Instagram" },
        { pattern: "fbav", platform: "Facebook" },
        { pattern: "fban", platform: "Facebook" },
        { pattern: "twitter", platform: "Twitter" },
        { pattern: "linkedin", platform: "LinkedIn" },
        { pattern: "whatsapp", platform: "WhatsApp" },
        { pattern: "telegram", platform: "Telegram" },
        { pattern: "snapchat", platform: "Snapchat" },
        { pattern: "tiktok", platform: "TikTok" },
        { pattern: "line", platform: "Line" },
        { pattern: "wechat", platform: "WeChat" },
        { pattern: "qq", platform: "QQ" },
        { pattern: "ucbrowser", platform: "UC Browser" },
        { pattern: "opera mini", platform: "Opera Mini" },
      ];

      // Check for mobile browsers that are commonly used in webviews
      const mobileBrowserPatterns = [
        { pattern: "chrome mobile", platform: "Chrome Mobile" },
        { pattern: "safari mobile", platform: "Safari Mobile" },
        { pattern: "firefox mobile", platform: "Firefox Mobile" },
      ];

      // Check for social media webview indicators
      const socialMediaIndicators = [
        "instagram",
        "fbav",
        "fban",
        "twitter",
        "linkedin",
        "whatsapp",
        "telegram",
        "snapchat",
        "tiktok",
        "line",
        "wechat",
        "qq",
      ];

      // Check if it's a social media webview
      const isSocialMediaWebview = socialMediaIndicators.some((indicator) =>
        userAgent.includes(indicator)
      );

      // Check for mobile browser patterns
      const mobileBrowserMatch = mobileBrowserPatterns.find(({ pattern }) =>
        userAgent.includes(pattern)
      );

      // Check for specific webview patterns
      const webviewMatch = webviewPatterns.find(({ pattern }) =>
        userAgent.includes(pattern)
      );

      // Additional checks
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      // iOS-specific standalone check
      const isIOSStandalone = (navigator as any).standalone === true;
      const isPWA = isIOSStandalone || isStandalone;

      // Check for viewport height differences (webviews often have different viewport behavior)
      const viewportHeight = window.innerHeight;
      const screenHeight = window.screen.height;
      const hasViewportDifference =
        Math.abs(viewportHeight - screenHeight) > 100;

      // Determine if it's likely a webview
      let detectedWebview = false;
      let platform = null;

      if (isSocialMediaWebview) {
        detectedWebview = true;
        platform = webviewMatch?.platform || "Social Media App";
      } else if (webviewMatch) {
        detectedWebview = true;
        platform = webviewMatch.platform;
      } else if (mobileBrowserMatch && hasViewportDifference && !isPWA) {
        // This might be a webview, but we're less certain
        detectedWebview = true;
        platform = mobileBrowserMatch.platform;
      }

      // Don't show warning for PWA or standalone apps
      if (isPWA) {
        detectedWebview = false;
        platform = null;
      }

      setIsWebview(detectedWebview);
      setDetectedPlatform(platform);
      setIsLoading(false);
    };

    detectWebview();
  }, []);

  return { isWebview, isLoading, detectedPlatform };
}
