import { securityReport } from "./types/supabase";

export interface IElectronAPI {
  getSystemInfo: () => Promise<{
    osName: string;
    osVersion: string;
  }>;
  checkAntivirus: () => Promise<string>;
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
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
