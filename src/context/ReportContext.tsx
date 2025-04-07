import { createContext, useContext, useState, ReactNode } from "react";
import { useSettingsStore } from "@/lib/settings";
import { useDeviceData } from "./DeviceDataContext";
import { securityReport } from "@/types/supabase";
import { mapResultsToReport } from "@/lib/utils";
import { ScanResults } from "./ScanContext";

export type ReportStatus = "idle" | "sending" | "sent" | "failed";

interface ReportPrerequisites {
  hasUserSettings: boolean;
  hasSupabaseCredentials: boolean;
  missingFields: string[];
}

interface ReportContextType {
  reportStatus: ReportStatus;
  sendReport: (results: ScanResults) => Promise<void>;
  getLastReport: () => Promise<securityReport | null>;
  checkReportPrerequisites: () => Promise<ReportPrerequisites>;
  resetReportStatus: () => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function useReport() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
}

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reportStatus, setReportStatus] = useState<ReportStatus>("idle");
  const { userSettings } = useSettingsStore();
  const { osName, osVersion, serial } = useDeviceData();

  const checkReportPrerequisites = async (): Promise<ReportPrerequisites> => {
    const missingFields: string[] = [];

    if (!userSettings.email) {
      missingFields.push("email");
    }
    if (!userSettings.fullName) {
      missingFields.push("full name");
    }

    const hasUserSettings = missingFields.length === 0;
    const hasSupabaseCredentials =
      await window.electronAPI.hasSupabaseCredentials();

    return {
      hasUserSettings,
      hasSupabaseCredentials,
      missingFields,
    };
  };

  const sendReport = async (results: ScanResults) => {
    setReportStatus("sending");
    const report = mapResultsToReport(
      results,
      osName,
      osVersion,
      new Date().toISOString()
    );
    try {
      const success = await window.electronAPI.sendReport(
        userSettings.email,
        userSettings.fullName,
        serial,
        report
      );
      if (success) {
        setReportStatus("sent");
        await window.electronAPI.configUpdateLastReportDate(
          new Date().toISOString()
        );
      } else {
        setReportStatus("failed");
      }
    } catch (error) {
      console.error("Error sending report:", error);
      setReportStatus("failed");
    }
  };

  const getLastReport = async () => {
    try {
      const lastReport = await window.electronAPI.getLastReport(
        userSettings.email,
        serial
      );
      return lastReport;
    } catch (error) {
      console.error("Error getting last report:", error);
      return null;
    }
  };

  const resetReportStatus = () => {
    setReportStatus("idle");
  };

  return (
    <ReportContext.Provider
      value={{
        reportStatus,
        sendReport,
        getLastReport,
        checkReportPrerequisites,
        resetReportStatus,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}
