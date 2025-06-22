"use client";

import * as React from "react";
import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Scale,
  Dumbbell,
  Settings,
  BarChart3,
  Target,
  BookOpen,
  Home,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview & progress",
    badge: "Home",
  },
  {
    title: "Workouts",
    href: "/workouts",
    icon: Dumbbell,
    description: "Track your sessions",
    badge: "Active",
  },
  {
    title: "Preset Plans",
    href: "/plans",
    icon: Target,
    description: "Ready-made routines",
    badge: "New",
  },
  {
    title: "Exercise Catalog",
    href: "/exercises",
    icon: BookOpen,
    description: "Browse exercises",
  },
  // {
  //   title: "Weight",
  //   href: "/weight",
  //   icon: Scale,
  //   description: "Track your weight",
  // },
  // {
  //   title: "Progress",
  //   href: "/progress",
  //   icon: BarChart3,
  //   description: "View analytics",
  // },
  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: Settings,
  //   description: "App preferences",
  // },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Navigation</h2>
            <p className="text-xs text-muted-foreground">Quick access</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <div className="space-y-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Fragment key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center space-x-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-accent/50",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="truncate font-medium">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={
                            item.badge === "New" ? "default" : "secondary"
                          }
                          className="text-xs px-1.5 py-0.5 h-5"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                </Link>

                {/* Separator after certain items */}
                {index === 0 && <Separator className="my-3" />}
              </Fragment>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground text-center">
            Stay consistent, see results
          </p>
        </div>
      </div>
    </div>
  );
}
