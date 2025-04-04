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

export const setupIpcHandlers = () => {
  ipcMain.handle("system-info:get", () => ({
    ...getOSInfo(),
    serial: getDeviceSerial(),
  }));

  ipcMain.handle("check:antivirus", checkAntivirus);
  ipcMain.handle("check:disk-encryption", checkDiskEncryption);
  ipcMain.handle("check:screen-lock", checkScreenLock);

  ipcMain.handle(
    "supabase:send-report",
    (_, supabaseSettings, userEmail, userFullName, deviceId, report) => {
      return sendReportToSupabase(
        supabaseSettings,
        userEmail,
        userFullName,
        deviceId,
        report
      );
    }
  );

  ipcMain.handle(
    "supabase:get-last-report",
    (_, supabaseSettings, userEmail, deviceId) => {
      return getLastReport(supabaseSettings, userEmail, deviceId);
    }
  );

  ipcMain.handle("config:update-keep-in-background", (_, value: boolean) => {
    updateKeepInBackground(value);
    return value;
  });

  ipcMain.handle("config:update-last-report-date", (_, date: string) => {
    updateLastReportDate(date);
  });

  ipcMain.handle("config:get", getConfig);
};
