import { securityReport } from "@/types/supabase";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getSupabaseClient(supabaseUrl: string, supabaseKey: string) {
  let client: SupabaseClient | null = null;
  return () => {
    if (client !== null) {
      return client;
    }
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase URL or anonymous key in .env file.");
    }
    client = createClient(supabaseUrl, supabaseKey);
    return client;
  };
}

export async function sendReportToSupabase(
  supabaseSettings: {
    supabaseUrl: string;
    supabaseKey: string;
  },
  userEmail: string,
  userFullName: string,
  deviceId: string,
  report: securityReport
) {
  try {
    const supabaseClient = getSupabaseClient(
      supabaseSettings.supabaseUrl,
      supabaseSettings.supabaseKey
    );
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
      )
      .select();

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
