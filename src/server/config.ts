import { app } from "electron";
import fs from "fs";
import path from "path";
import { EventEmitter } from "events";

interface AppConfig {
  keepInBackground: boolean;
  lastReportDate: string | null;
}

const defaultConfig: AppConfig = {
  keepInBackground: false,
  lastReportDate: null,
};

class ConfigManager extends EventEmitter {
  private config: AppConfig;
  private configPath: string;
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly SAVE_DELAY = 1000; // Debounce save operations by 1 second

  constructor() {
    super();
    this.configPath = path.join(app.getPath("userData"), "config.json");
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, "utf-8");
        return JSON.parse(configData);
      }
    } catch (error) {
      console.error("Error reading config:", error);
      if (fs.existsSync(this.configPath)) {
        const backupPath = `${this.configPath}.${Date.now()}.bak`;
        fs.copyFileSync(this.configPath, backupPath);
        console.log(`Backed up corrupted config to ${backupPath}`);
      }
    }
    return defaultConfig;
  }

  private async saveConfig(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    return new Promise((resolve, reject) => {
      this.saveTimeout = setTimeout(async () => {
        try {
          const tempPath = `${this.configPath}.tmp`;
          await fs.promises.writeFile(
            tempPath,
            JSON.stringify(this.config, null, 2)
          );
          await fs.promises.rename(tempPath, this.configPath);
          this.emit("configChanged", this.config);
          resolve();
        } catch (error) {
          console.error("Error saving config:", error);
          reject(error);
        } finally {
          this.saveTimeout = null;
        }
      }, this.SAVE_DELAY);
    });
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public async setConfig(newConfig: Partial<AppConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfig();
  }

  public async updateKeepInBackground(value: boolean): Promise<void> {
    await this.setConfig({ keepInBackground: value });
  }

  public async updateLastReportDate(date: string): Promise<void> {
    await this.setConfig({ lastReportDate: date });
  }

  public onConfigChange(callback: (config: AppConfig) => void): () => void {
    this.on("configChanged", callback);
    return () => this.removeListener("configChanged", callback);
  }
}

const configManager = new ConfigManager();

export const getConfig = () => configManager.getConfig();
export const saveConfig = (config: Partial<AppConfig>) =>
  configManager.setConfig(config);
export const updateKeepInBackground = (value: boolean) =>
  configManager.updateKeepInBackground(value);
export const updateLastReportDate = (date: string) =>
  configManager.updateLastReportDate(date);
export const listenForConfigChanges = (callback: (config: AppConfig) => void) =>
  configManager.onConfigChange(callback);
