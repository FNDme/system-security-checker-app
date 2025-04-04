// See the Electron documentation for details on how to use preload scripts:
import { contextBridge, ipcRenderer } from "electron";
import { securityReport } from "./types/supabase";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("electronAPI", {
  // ? Two Way IPC handlers
  // system info
  getSystemInfo: () =>
    ipcRenderer.invoke("system-info:device-info") as Promise<{
      osName: string;
      osVersion: string;
    }>,
  // checks
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
  // supabase
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
  // config file
  configUpdateKeepInBackground: (value: boolean) =>
    ipcRenderer.invoke(
      "config:update-keep-in-background",
      value
    ) as Promise<boolean>,
  configGet: () =>
    ipcRenderer.invoke("config:get") as Promise<{
      keepInBackground: boolean;
      lastReportDate: string | null;
    }>,
  configUpdateLastReportDate: (date: string) =>
    ipcRenderer.invoke("config:update-last-report-date", date) as Promise<void>,

  // ? One Way IPC handlers
  onRunScan: (callback: () => void) => ipcRenderer.on("run-scan", callback),
});
