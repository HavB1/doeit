"use client";

import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { value: "all", label: "All" },
  { value: "upper_body", label: "Upper" },
  { value: "lower_body", label: "Lower" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "full_body", label: "Full" },
  { value: "other", label: "Other" },
];

export function CategorySelector({
  activeCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  return (
    <div className="flex w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex min-w-max space-x-2 px-1">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium transition-colors min-h-[36px] whitespace-nowrap",
              activeCategory === category.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
