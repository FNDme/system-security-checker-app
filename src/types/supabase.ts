export interface securityReport {
  disk_encrypted: boolean;
  encryption_type: string | null;
  antivirus_detected: boolean;
  antivirus_name: string | null;
  screen_lock_active: boolean;
  screen_lock_time: number | null;
  operating_system: string;
  os_version: string;
  last_check: string;
}
