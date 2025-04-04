import { Menu, nativeImage, Tray } from "electron";
import { getAppIcon } from "./appIcon";

export function createTray({
  onOpen,
  onQuit,
  onRunScan,
}: {
  onOpen: () => void;
  onQuit: () => void;
  onRunScan: () => void;
}) {
  const trayIcon = nativeImage.createFromPath(getAppIcon());
  const tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        onOpen();
      },
    },
    {
      label: "Run Scan",
      click: () => {
        onRunScan();
      },
    },
    {
      label: "Quit",
      click: () => {
        onQuit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  return tray;
}
