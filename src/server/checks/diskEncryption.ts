import { execSync } from "child_process";
import { execPowershell, executeQuery } from "../terminal";
import os from "os";

async function checkMacOsDiskEncryption() {
  const result = await executeQuery("SELECT * FROM disk_encryption;");
  if (
    result.some((disk: { encrypted: string }) => parseInt(disk.encrypted) === 1)
  ) {
    return "FileVault";
  }
  return null;
}

const BITLOCKER_STATUS = {
  unencryptable: 0,
  encrypted: 1,
  not_encrypted: 2,
  encryption_in_progress: 3,
  encrypted_only_space_used: 7,
};

async function checkWindowsDiskEncryption() {
  try {
    const result = await execPowershell(
      `(New-Object -ComObject Shell.Application).NameSpace('C:').Self.ExtendedProperty('System.Volume.BitLockerProtection')`
    );
    if (result === BITLOCKER_STATUS["encrypted"].toString()) {
      return "BitLocker";
    } else if (
      result === BITLOCKER_STATUS["encrypted_only_space_used"].toString()
    ) {
      return "Bitlocker: only space used";
    }
    return null;
  } catch (error) {
    console.error("Error checking Windows disk encryption:", error);
    return null;
  }
}

function checkLinuxDiskEncryption() {
  // Check for ecryptfs
  const ecryptfsCheck = execSync("mount | grep ecryptfs | cat").toString();
  if (ecryptfsCheck.includes("ecryptfs")) {
    return "ecryptfs";
  }

  // Check for LUKS
  const result = execSync("lsblk -o TYPE").toString();
  if (result.includes("crypt")) {
    return "LUKS";
  }

  return null;
}

export async function checkDiskEncryption(): Promise<string | null> {
  const system = os.platform();
  if (system === "darwin") {
    return await checkMacOsDiskEncryption();
  } else if (system === "win32") {
    return await checkWindowsDiskEncryption();
  } else if (system === "linux") {
    return checkLinuxDiskEncryption();
  }
  return null;
}
