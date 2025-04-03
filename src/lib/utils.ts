import { ScanResults } from "@/context/ScanContext";
import { securityReport } from "@/types/supabase";
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

export function mapResultsToReport(
  results: ScanResults,
  operatingSystem: string,
  osVersion: string,
  lastCheck: string
): securityReport {
  return {
    disk_encrypted: results.encryption.exists,
    encryption_type: results.encryption.name,
    antivirus_detected: results.antivirus.exists,
    antivirus_name: results.antivirus.name,
    screen_lock_active: results.screenLock.value > 0,
    screen_lock_time: results.screenLock.value,
    operating_system: operatingSystem,
    os_version: osVersion,
    last_check: lastCheck,
  };
}
