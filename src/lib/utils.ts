
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    // Use date-fns to nicely format the date
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (error) {
    console.error("Invalid date format:", error);
    return "Invalid date";
  }
}

export function formatDateTime(dateString: string, timeString?: string): string {
  try {
    // Format date
    const formattedDate = format(new Date(dateString), "EEE, MMM d, yyyy");
    
    // Add time if provided
    if (timeString) {
      return `${formattedDate} at ${timeString}`;
    }
    
    return formattedDate;
  } catch (error) {
    console.error("Invalid date/time format:", error);
    return "Invalid date";
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return Math.ceil(day / 7);
}
