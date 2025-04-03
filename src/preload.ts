// See the Electron documentation for details on how to use preload scripts:
import { contextBridge, ipcRenderer } from "electron";
import { securityReport } from "./types/supabase";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("electronAPI", {
  systemDarkMode: () => ipcRenderer.invoke("prefer-dark-mode:system"),
  getSystemInfo: () => ipcRenderer.invoke("system-info:get"),
  checkAntivirus: () => ipcRenderer.invoke("check:antivirus"),
  checkDiskEncryption: () => ipcRenderer.invoke("check:disk-encryption"),
  checkScreenLock: () => ipcRenderer.invoke("check:screen-lock"),
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
      "send:report",
      supabaseSettings,
      userEmail,
      userFullName,
      deviceId,
      report
    ),
});
