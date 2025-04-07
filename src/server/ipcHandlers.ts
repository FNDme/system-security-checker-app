import { ipcMain } from "electron";
import {
  getConfig,
  updateKeepInBackground,
  updateLastReportDate,
} from "./config";
import { getDeviceSerial, getOSInfo } from "./osInfo";
import { checkAntivirus } from "./checks/antivirus";
import { checkScreenLock } from "./checks/screenLock";
import { checkDiskEncryption } from "./checks/diskEncryption";
import { sendReportToSupabase, getLastReport } from "./supabase";
import {
  saveSecureData,
  getSecureData,
  removeSecureData,
} from "./secureStorage";

export const setupIpcHandlers = () => {
  ipcMain.handle("system-info:device-info", () => ({
    ...getOSInfo(),
    serial: getDeviceSerial(),
  }));

  ipcMain.handle("check:antivirus", checkAntivirus);
  ipcMain.handle("check:disk-encryption", checkDiskEncryption);
  ipcMain.handle("check:screen-lock", checkScreenLock);

  ipcMain.handle("supabase:save-credentials", (_, supabaseUrl, supabaseKey) => {
    saveSecureData({ supabaseUrl, supabaseKey });
    return true;
  });

  ipcMain.handle("supabase:has-credentials", () => {
    const data = getSecureData();
    return data !== null;
  });

  ipcMain.handle("supabase:remove-credentials", () => {
    removeSecureData();
    return true;
  });

  ipcMain.handle(
    "supabase:send-report",
    (_, userEmail, userFullName, deviceId, report) => {
      const supabaseData = getSecureData();
      if (!supabaseData) {
        throw new Error("Supabase credentials not found");
      }
      return sendReportToSupabase(
        supabaseData,
        userEmail,
        userFullName,
        deviceId,
        report
      );
    }
  );

  ipcMain.handle("supabase:get-last-report", (_, userEmail, deviceId) => {
    const supabaseData = getSecureData();
    if (!supabaseData) {
      throw new Error("Supabase credentials not found");
    }
    return getLastReport(supabaseData, userEmail, deviceId);
  });

  ipcMain.handle("config:update-keep-in-background", (_, value: boolean) => {
    updateKeepInBackground(value);
    return value;
  });

  ipcMain.handle("config:update-last-report-date", (_, date: string) => {
    updateLastReportDate(date);
  });

  ipcMain.handle("config:get", getConfig);
};
