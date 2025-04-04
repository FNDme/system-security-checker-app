import { securityReport } from "./types/supabase";

export interface IElectronAPI {
  getSystemInfo: () => Promise<{
    osName: string;
    osVersion: string;
  }>;
  checkAntivirus: () => Promise<string | null>;
  checkDiskEncryption: () => Promise<
    | "FileVault"
    | "BitLocker"
    | "Bitlocker: only space used"
    | "ecryptfs"
    | "LUKS"
    | null
  >;
  checkScreenLock: () => Promise<number | null>;
  sendReport: (
    supabaseSettings: {
      supabaseUrl: string;
      supabaseKey: string;
    },
    userEmail: string,
    userFullName: string,
    deviceId: string,
    report: securityReport
  ) => Promise<boolean>;
  getLastReport: (
    supabaseSettings: {
      supabaseUrl: string;
      supabaseKey: string;
    },
    userEmail: string,
    deviceId: string
  ) => Promise<securityReport | null>;
  configUpdateKeepInBackground: (value: boolean) => Promise<void>;
  configUpdateLastReportDate: (date: string) => Promise<void>;
  configGet: () => Promise<{
    keepInBackground: boolean;
    lastReportDate: string | null;
  }>;
  onRunScan: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
