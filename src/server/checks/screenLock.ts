import os from "os";
import { execPowershell } from "../terminal";
import { execSync } from "child_process";

const getDisplaySleep = (mode: "Battery Power" | "AC Power") => {
  const output = execSync(
    `pmset -g custom | awk '/${mode}/,/displaysleep/ {if ($1 == "displaysleep") print $2}'`
  )
    .toString()
    .trim();
  return parseInt(output);
};
function checkMacOsScreenLock() {
  try {
    const output = execSync("sysadminctl -screenLock status 2>&1")
      .toString()
      .trim();

    if (output.includes("screenLock is off")) {
      return null;
    }

    const screenSaver =
      parseInt(
        execSync("defaults -currentHost read com.apple.screensaver idleTime")
          .toString()
          .trim()
      ) / 60;
    const displaySleepOnBattery = getDisplaySleep("Battery Power");
    const displaySleepOnAC = getDisplaySleep("AC Power");

    const maxTimeoutMinutes = Math.max(
      screenSaver,
      displaySleepOnAC,
      displaySleepOnBattery
    );

    if (output.includes("screenLock delay is immediate")) {
      return maxTimeoutMinutes || null;
    }

    const match = output.match(/screenLock delay is (\d+) seconds/);

    if (match && match[1]) {
      const screenLockMinutesDelay = parseInt(match[1], 10) / 60;
      return maxTimeoutMinutes + screenLockMinutesDelay || null;
    }
  } catch (error) {
    console.error("Error checking screen lock status:", error);
  }

  return null;
}

async function getPreferredLanguage() {
  try {
    return (await execPowershell("(Get-WinUserLanguageList).LocalizedName"))
      .split(" ")[0]
      .toLowerCase();
  } catch (error) {
    console.error("Error getting preferred language:", error);
    return "english"; // Default to English if there's an error
  }
}

function getPowerConfigCommand(pattern: string) {
  return `powercfg -q SCHEME_CURRENT SUB_VIDEO VIDEOIDLE | Select-String -Pattern "${pattern}"`;
}

async function checkWindowsScreenLock() {
  try {
    let timeout;

    const preferredLanguage = await getPreferredLanguage();
    const acPowerSettings =
      preferredLanguage === "spanish"
        ? "Índice de configuración de corriente alterna actual"
        : "Current AC Power Setting Index";
    const dcPowerSettings =
      preferredLanguage === "spanish"
        ? "Índice de configuración de corriente continua actual"
        : "Current DC Power Setting Index";

    const pluggedIn = await execPowershell(
      getPowerConfigCommand(acPowerSettings)
    );
    const pluggedInTimeout = pluggedIn.split(":")[1].trim();

    const haveBattery =
      (await execPowershell(
        "Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue"
      )) !== "";

    if (haveBattery) {
      const onBattery = await execPowershell(
        getPowerConfigCommand(dcPowerSettings)
      );
      const onBatteryTimeout = onBattery.split(":")[1].trim();

      timeout = Math.max(
        parseInt(onBatteryTimeout, 16),
        parseInt(pluggedInTimeout, 16)
      );
    } else {
      timeout = parseInt(pluggedInTimeout, 16);
    }

    if (timeout === 0) {
      return null;
    }
    return timeout / 60;
  } catch (error) {
    console.error("Error checking Windows screen lock:", error);
    return null;
  }
}

function checkLinuxScreenLock() {
  let linuxDesktop = execSync("env | grep XDG_SESSION_DESKTOP")
    .toString()
    .split("=")?.[1]
    .trim();

  if (linuxDesktop === "ubuntu") {
    linuxDesktop = "gnome";
  }

  if (linuxDesktop === "awesome") {
    const sessions = execSync("ls /usr/bin/*session");
    if (sessions.includes("gnome")) {
      linuxDesktop = "gnome";
    }
  }

  const lockEnabled = execSync(
    `gsettings get org.${linuxDesktop}.desktop.screensaver lock-enabled`
  )
    .toString()
    .trim();

  if (lockEnabled === "true") {
    // Get the idle time before the screen saver activates
    const idleDelaySeconds = execSync(
      `gsettings get org.${linuxDesktop}.desktop.session idle-delay`
    )
      .toString()
      .split(" ")?.[1];
    // Get the time before the screen is locked (this applies after the idle delay)
    const lockDelaySeconds = execSync(
      `gsettings get org.${linuxDesktop}.desktop.screensaver lock-delay`
    )
      .toString()
      .split(" ")?.[1];
    return (
      parseInt(idleDelaySeconds, 10) / 60 + parseInt(lockDelaySeconds, 10) / 60
    );
  }
  return null;
}

export async function checkScreenLock(): Promise<number | null> {
  const system = os.platform();
  if (system === "darwin") {
    return checkMacOsScreenLock();
  } else if (system === "win32") {
    return await checkWindowsScreenLock();
  } else if (system === "linux") {
    return checkLinuxScreenLock();
  }
  return null;
}
