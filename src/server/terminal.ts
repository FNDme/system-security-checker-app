import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function executeQuery(query: string) {
  try {
    const { stdout } = await execAsync(`osqueryi --json "${query}"`);
    return JSON.parse(stdout);
  } catch (error) {
    console.error(`Error executing query: ${error.message}`);
    return [];
  }
}

export async function execPowershell(command: string) {
  const hasPwsh = await checkHasExecutable("pwsh");
  const hasPowershell = await checkHasExecutable("powershell");
  if (!hasPwsh && !hasPowershell) throw "No Powershell detected";
  const shell = hasPwsh ? "pwsh" : "powershell";
  const { stdout } = await execAsync(command, { shell });
  return stdout.trim();
}

export async function checkHasExecutable(name: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `where ${name} > nul 2> nul && echo true || echo false`,
      {
        shell: "cmd",
      }
    );
    return stdout.trim() === "true";
  } catch (error) {
    return false;
  }
}
