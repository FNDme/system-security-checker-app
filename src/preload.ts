// See the Electron documentation for details on how to use preload scripts:
import { contextBridge, ipcRenderer } from "electron";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("electronAPI", {
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
  checkAntivirus: () => ipcRenderer.invoke("check-antivirus"),
  checkDiskEncryption: () => ipcRenderer.invoke("check-disk-encryption"),
  checkScreenLock: () => ipcRenderer.invoke("check-screen-lock"),
});
