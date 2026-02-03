import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSafeDate(val: any, formatStr: string = "MMM d, yyyy") {
  if (!val) return "N/A"

  let date: Date
  // Handle Firestore Timestamp
  if (val && typeof val.toDate === 'function') {
    date = val.toDate()
  } else {
    date = new Date(val)
  }

  if (!isValid(date)) return "N/A"

  return format(date, formatStr)
}
