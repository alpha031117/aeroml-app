import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils.ts
export function convertToArray(data: unknown): unknown[] {
    console.log('Converting data to array:', data);
  // If the data is already an array, return it
  if (Array.isArray(data)) {
    return data;
  }

  // If it's an object with a 'sources' key, return the array in 'sources'
  if (data && typeof data === 'object' && 'sources' in data) {
    const dataWithSources = data as { sources: unknown };
    if (Array.isArray(dataWithSources.sources)) {
      return dataWithSources.sources;
    }
  }

  // Otherwise, return an empty array
  return [];
}
