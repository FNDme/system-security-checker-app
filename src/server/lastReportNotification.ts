import { getConfig } from "./config";
import path from "node:path";
import { Notification } from "electron";

export function startLastReportNotificationInterval(demo?: boolean) {
  const checkLastReport = async () => {
    const config = getConfig();
    if (!config.lastReportDate) return;
    if (demo) {
      new Notification({
        title: "System Security Checker",
        body: "It's been more than a month since your last security report. Please run a new scan.",
        icon: path.join(__dirname, "../../src/assets/icons/icon.png"),
      }).show();
      return;
    }
    const lastReportDate = new Date(config.lastReportDate);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (lastReportDate < oneMonthAgo) {
      const iconPath = path.join(__dirname, "../../src/assets/icons/icon.png");

      const notification = new Notification({
        title: "System Security Checker",
        body: "It's been more than a month since your last security report. Please run a new scan.",
        icon: iconPath,
      });
      notification.show();
    }
  };

  checkLastReport();
  return setInterval(checkLastReport, 60 * 60 * 1000);
}
