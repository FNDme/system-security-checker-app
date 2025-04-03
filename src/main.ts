import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { getDeviceSerial, getOSInfo } from "./server/osInfo";
import { checkAntivirus } from "./server/checks/antivirus";
import { checkDiskEncryption } from "./server/checks/diskEncryption";
import { checkScreenLock } from "./server/checks/screenLock";
import { sendReportToSupabase } from "./server/supabase";
import { updateElectronApp, UpdateSourceType } from "update-electron-app";

updateElectronApp({
  updateSource: {
    type: UpdateSourceType.ElectronPublicUpdateService,
    repo: "FNDme/system-security-checker-app",
  },
  updateInterval: "1 hour",
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  Menu.setApplicationMenu(null);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

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
    "send:report",
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
