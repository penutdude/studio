"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
}

export function Spinner({ className, size = "default" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    default: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };
  return <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />;
}
