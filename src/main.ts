import { app, BrowserWindow, Tray } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { updateElectronApp, UpdateSourceType } from "update-electron-app";
import { getConfig, listenForConfigChanges } from "./server/config";
import { createTray } from "./server/createTray";
import { NotificationService } from "./server/lastReportNotification";
import { createMainWindow } from "./server/windowManager";
import { setupIpcHandlers } from "./server/ipcHandlers";

updateElectronApp({
  updateSource: {
    type: UpdateSourceType.ElectronPublicUpdateService,
    repo: "FNDme/system-security-checker-app",
  },
  updateInterval: "1 hour",
});

const notificationService = new NotificationService();
let hasInitializedHandlers = false;
let tray: Tray | null = null;

const handleAddTray = () => {
  if (!tray) {
    tray = createTray({
      onOpen: () => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length === 0) createWindow();
        else windows[0].show();
      },
      onQuit: () => app.quit(),
      onRunScan: () => {
        const windows = BrowserWindow.getAllWindows();
        let window: BrowserWindow | null = null;
        if (windows.length === 0) window = createWindow();
        else window = windows[0];
        setTimeout(() => {
          if (window) window.webContents.send("run-scan");
        }, 1000);
      },
    });
  }
};

const handleRemoveTray = () => {
  if (tray) {
    tray.destroy();
    tray = null;
  }
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const config = getConfig();
app.setLoginItemSettings({
  openAtLogin: config.keepInBackground || false,
  args: ["--hidden"],
  name: "System Security Checker",
  path: path.resolve(
    path.dirname(process.execPath),
    "..",
    path.basename(process.execPath)
  ),
});

const createWindow = () => {
  // Create the browser window.
  const window = createMainWindow();
  listenForConfigChanges((config) => {
    if (config.keepInBackground) {
      handleAddTray();
      app.setLoginItemSettings({
        ...app.getLoginItemSettings(),
        openAtLogin: true,
      });
    } else {
      handleRemoveTray();
      app.setLoginItemSettings({
        ...app.getLoginItemSettings(),
        openAtLogin: false,
      });
    }
  });
  if (!hasInitializedHandlers) {
    setupIpcHandlers();
    hasInitializedHandlers = true;
  }
  notificationService.start();

  return window;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  if (!tray && config.keepInBackground) {
    handleAddTray();
  }

  const isHidden = process.argv.includes("--hidden");
  if (isHidden) {
    notificationService.start();
  } else {
    createWindow();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  const config = getConfig();
  if (config.keepInBackground && process.platform === "darwin") app.dock.hide();
  else if (!config.keepInBackground && process.platform !== "darwin")
    app.quit();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  notificationService.stop();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
