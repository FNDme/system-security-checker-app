import { Menu, nativeImage, Tray, BrowserWindow } from "electron";
import path from "node:path";

export function createTray(createWindow: () => void, quit: () => void) {
  const trayIcon = nativeImage.createFromPath(
    path.join(__dirname, "../../src/assets/icons/icon.png")
  );
  const tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length === 0) createWindow();
        else windows[0].show();
      },
    },
    {
      label: "Quit",
      click: () => {
        quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  return tray;
}
