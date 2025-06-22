import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doeit - Your Personal Fitness Journey",
  description:
    "Track your progress, set goals, and achieve your fitness dreams with Doeit. Your all-in-one fitness companion for workouts, nutrition, and personal growth.",
  keywords:
    "fitness, workout, exercise, health, fitness tracking, personal trainer, fitness goals, workout app",

  manifest: "/manifest.json",
  openGraph: {
    title: "Doeit - Your Personal Fitness Journey",
    description:
      "Track your progress, set goals, and achieve your fitness dreams with Doeit",
    url: "https://doeit.ditolab.com",
    siteName: "Doeit",
    images: [
      {
        url: "https://doeit.ditolab.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Doeit - Your Personal Fitness Journey",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doeit - Your Personal Fitness Journey",
    description:
      "Track your progress, set goals, and achieve your fitness dreams with Doeit",
    images: ["https://doeit.ditolab.com/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <main className="flex w-full flex-col items-center justify-center">
              {children}
            </main>
            <Toaster />
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
