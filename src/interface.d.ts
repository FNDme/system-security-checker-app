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
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
