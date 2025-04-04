// See the Electron documentation for details on how to use preload scripts:
import { contextBridge, ipcRenderer } from "electron";
import { securityReport } from "./types/supabase";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("electronAPI", {
  systemDarkMode: () =>
    ipcRenderer.invoke("prefer-dark-mode:system") as Promise<boolean>,
  getSystemInfo: () =>
    ipcRenderer.invoke("system-info:get") as Promise<{
      osName: string;
      osVersion: string;
    }>,
  checkAntivirus: () =>
    ipcRenderer.invoke("check:antivirus") as Promise<string | null>,
  checkDiskEncryption: () =>
    ipcRenderer.invoke("check:disk-encryption") as Promise<
      | "FileVault"
      | "BitLocker"
      | "Bitlocker: only space used"
      | "ecryptfs"
      | "LUKS"
      | null
    >,
  checkScreenLock: () =>
    ipcRenderer.invoke("check:screen-lock") as Promise<number | null>,
  sendReport: (
    supabaseSettings: {
      supabaseUrl: string;
      supabaseKey: string;
    },
    userEmail: string,
    userFullName: string,
    deviceId: string,
    report: securityReport
  ) =>
    ipcRenderer.invoke(
      "supabase:send-report",
      supabaseSettings,
      userEmail,
      userFullName,
      deviceId,
      report
    ) as Promise<boolean>,
  getLastReport: (
    supabaseSettings: {
      supabaseUrl: string;
      supabaseKey: string;
    },
    userEmail: string,
    deviceId: string
  ) =>
    ipcRenderer.invoke(
      "supabase:get-last-report",
      supabaseSettings,
      userEmail,
      deviceId
    ) as Promise<securityReport | null>,
});
