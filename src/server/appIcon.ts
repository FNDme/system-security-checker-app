import path from "node:path";

export function getAppIcon() {
  return process.env.NODE_ENV === "development"
    ? path.join(__dirname, "../../build/assets/icons/icon.ico")
    : path.join(process.resourcesPath, "assets/icons/icon.ico");
}
