import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: "default" | "card";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4 border-2 border-primary/20">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-slate-400 font-medium max-w-md">{description}</p>
      </div>
      {action && (
        <Button
          asChild={!!action.href}
          onClick={action.onClick}
          className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 text-lg border-0 shadow-lg"
          size="lg"
        >
          {action.href ? (
            <Link href={action.href}>{action.label}</Link>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <Card className="border-2 border-dashed border-slate-600 bg-slate-800/50">
        <CardContent className="p-8">{content}</CardContent>
      </Card>
    );
  }

  return content;
}
