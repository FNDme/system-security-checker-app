import { Notification } from "electron";
import { getConfig } from "./config";
import { getAppIcon } from "./appIcon";

export interface NotificationServiceOptions {
  title?: string;
  body?: string;
  iconPath?: string;
  intervalMs?: number;
}

export class NotificationService {
  private readonly options: Required<NotificationServiceOptions>;
  public intervalId: NodeJS.Timeout | null = null;

  constructor(options: NotificationServiceOptions = {}) {
    this.options = {
      title: options.title ?? "System Security Checker",
      body:
        options.body ??
        "It's been more than a month since your last security report. Please run a new scan.",
      iconPath: options.iconPath ?? getAppIcon(),
      intervalMs: options.intervalMs ?? 60 * 60 * 1000, // 1 hour
    };
  }

  private createNotification(): void {
    const notification = new Notification({
      title: this.options.title,
      body: this.options.body,
      icon: this.options.iconPath,
    });
    notification.show();
  }

  private shouldShowNotification(lastReportDate: Date): boolean {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return lastReportDate < oneMonthAgo;
  }

  private async checkLastReport(demo = false): Promise<void> {
    try {
      const config = getConfig();
      if (!config.lastReportDate) return;

      if (demo) {
        this.createNotification();
        return;
      }

      const lastReportDate = new Date(config.lastReportDate);
      if (this.shouldShowNotification(lastReportDate)) {
        this.createNotification();
      }
    } catch (error) {
      console.error("Error checking last report date:", error);
    }
  }

  public start(demo = false): void {
    // Run immediately and then on interval
    this.checkLastReport(demo);
    this.intervalId = setInterval(
      () => this.checkLastReport(demo),
      this.options.intervalMs
    );
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// For backward compatibility
export function startLastReportNotificationInterval(
  demo?: boolean
): NodeJS.Timeout {
  const service = new NotificationService();
  service.start(demo);
  if (!service.intervalId) {
    throw new Error("Failed to start notification service");
  }
  return service.intervalId;
}
