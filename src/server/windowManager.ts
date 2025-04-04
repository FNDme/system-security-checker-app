import { BrowserWindow, Menu } from "electron";
import path from "node:path";
import { getAppIcon } from "./appIcon";

export const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  Menu.setApplicationMenu(null);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  return mainWindow;
};
