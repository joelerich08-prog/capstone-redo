"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { mockCategories } from "@/lib/mock-data/categories"
import { cn } from "@/lib/utils"
import { Layers } from "lucide-react"

interface CategoryPillsProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  className?: string
}

export function CategoryPills({ 
  selectedCategory, 
  onCategoryChange,
  className 
}: CategoryPillsProps) {
  return (
    <div className={cn("relative", className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-3">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full h-9 px-4 shrink-0 transition-all duration-200",
              selectedCategory === "all" 
                ? "shadow-sm" 
                : "hover:bg-accent/80 border-border/60"
            )}
            onClick={() => onCategoryChange("all")}
          >
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            All Products
          </Button>
          {mockCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full h-9 px-4 shrink-0 transition-all duration-200",
                selectedCategory === category.id 
                  ? "shadow-sm" 
                  : "hover:bg-accent/80 border-border/60"
              )}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
      {/* Fade indicators */}
      <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  )
}
