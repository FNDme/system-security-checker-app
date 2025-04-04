import { ipcMain } from "electron";
import { getDeviceSerial, getOSInfo } from "./server/osInfo";
import { getConfig, updateKeepInBackground } from "./server/config";
import { checkAntivirus } from "./server/checks/antivirus";
import { checkDiskEncryption } from "./server/checks/diskEncryption";
import { checkScreenLock } from "./server/checks/screenLock";
import { getLastReport, sendReportToSupabase } from "./server/supabase";

export function initializeHandlers() {
  ipcMain.handle("system-info:get", () => ({
    ...getOSInfo(),
    serial: getDeviceSerial(),
  }));

  ipcMain.handle("check:antivirus", () => {
    return checkAntivirus();
  });

  ipcMain.handle("check:disk-encryption", () => {
    return checkDiskEncryption();
  });

  ipcMain.handle("check:screen-lock", () => {
    return checkScreenLock();
  });

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
}
