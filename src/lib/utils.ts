import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function antivirusToString(antivirus: string | null) {
  if (!antivirus) return "❌ No antivirus detected.";
  return `✅ Antivirus protection detected: ${antivirus}`;
}

export function diskEncryptionToString(
  encryptionMethod: string | null
): string {
  if (!encryptionMethod) return "❌ Disk is not encrypted.";
  return `✅ Disk is encrypted with ${encryptionMethod}.`;
}

export function screenLockToString(screenLockTime: number | null) {
  if (screenLockTime !== null) {
    const unit = "minutes";
    return `✅ Screen lock activates after ${screenLockTime} ${unit} of inactivity.`;
  }
  return "❌ Screen lock is not configured or is disabled.";
}
