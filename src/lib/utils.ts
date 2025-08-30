import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils.ts
export function convertToArray(data: any): any[] {
    console.log('Converting data to array:', data);
  // If the data is already an array, return it
  if (Array.isArray(data)) {
    return data;
  }

  // If it's an object with a 'sources' key, return the array in 'sources'
  if (data && data.sources && Array.isArray(data.sources)) {
    return data.sources;
  }

  // Otherwise, return an empty array
  return [];
}
