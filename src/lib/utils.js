import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Based on shadcn/ui's cn utility
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

