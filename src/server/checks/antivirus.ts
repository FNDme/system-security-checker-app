import { execPowershell, executeQuery } from "../terminal";
import os from "os";
import { execSync } from "child_process";

const ANTIVIRUS_PROCESSES = "clamav|sophos|eset|comodo|avg|avast|bitdefender";

async function checkMacOsAntivirus() {
  const queries = [
    "SELECT * FROM xprotect_entries;",
    "SELECT * FROM xprotect_meta;",
    "SELECT * FROM launchd WHERE name LIKE '%com.apple.MRT%' OR name LIKE '%com.apple.XProtect%';",
    "SELECT * FROM processes WHERE name LIKE '%MRT%' OR name LIKE '%XProtect%';",
  ];
  for (const q of queries) {
    const result = await executeQuery(q);
    if (result.length > 0) {
      return "XProtect/MRT (Built-in macOS protection)";
    }
  }
  return null;
}

async function checkWindowsAntivirus() {
  try {
    const result = await execPowershell(
      `wmic /node:localhost /namespace:\\\\root\\SecurityCenter2 path AntiVirusProduct Get DisplayName`
    );

    const antivirusNames = result
      .split("\n")
      .filter((s) => s.trim().toLowerCase() !== "displayname")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .join(", ");

    return antivirusNames || null;
  } catch (error) {
    console.error("Error checking Windows antivirus:", error);
    return null;
  }
}

function checkLinuxAntivirus() {
  const processes = execSync(
    `systemctl list-units --type=service --state=running | grep -i -E '${ANTIVIRUS_PROCESSES}' | awk '{ $1=$2=$3=$4=""; print $0 }'`
  )
    .toString()
    .split("\n")
    .map((s) => s.trim())
    .join(", ");

  if (processes) {
    return processes;
  }
  return null;
}

export async function checkAntivirus(): Promise<string | null> {
  const system = os.platform();
  if (system === "darwin") {
    return await checkMacOsAntivirus();
  } else if (system === "win32") {
    return await checkWindowsAntivirus();
  } else if (system === "linux") {
    return checkLinuxAntivirus();
  }
  return null;
}
