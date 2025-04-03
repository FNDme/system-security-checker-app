import { ScanResults } from "@/context/ScanContext";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  let client: SupabaseClient | null = null;
  return () => {
    if (client !== null) {
      return client;
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase URL or anonymous key in .env file.");
    }
    client = createClient(supabaseUrl, supabaseKey);
    return client;
  };
}

interface Report {
  disk_encrypted: boolean;
  encryption_type: string | null;
  antivirus_detected: boolean;
  antivirus_name: string | null;
  screen_lock_active: boolean;
  screen_lock_time: number | null;
  operating_system: string;
  os_version: string;
  last_check: string;
}

export function mapResultsToReport(
  results: ScanResults,
  operatingSystem: string,
  osVersion: string,
  lastCheck: string
): Report {
  return {
    disk_encrypted: results.encryption.exists,
    encryption_type: results.encryption.name,
    antivirus_detected: results.antivirus.exists,
    antivirus_name: results.antivirus.name,
    screen_lock_active: results.screenLock.value > 0,
    screen_lock_time: results.screenLock.value,
    operating_system: operatingSystem,
    os_version: osVersion,
    last_check: lastCheck,
  };
}

export async function sendReportToSupabase(
  userEmail: string,
  userFullName: string,
  deviceId: string,
  report: Report
) {
  try {
    const supabaseClient = getSupabaseClient();
    const { error } = await supabaseClient()
      .from("security_reports")
      .upsert(
        {
          device_id: deviceId,
          user_email: userEmail,
          user_full_name: userFullName,
          ...report,
        },
        { onConflict: "user_email,device_id" }
      );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error sending report to Supabase:", error.message);
    if (error.details) {
      console.error("Error details:", error.details);
    }
    if (error.hint) {
      console.error("Hint:", error.hint);
    }
    return false;
  }
}
