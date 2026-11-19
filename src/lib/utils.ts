import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a module number with leading zero for single digits (e.g., 01, 02, 10, 11)
 */
export function formatModuleNumber(num: number): string {
  if (num < 10 && num > 0) {
    return `0${num}`;
  }
  return `${num}`;
}
