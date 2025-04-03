import { mapResultsToReport, sendReportToSupabase } from "@/lib/supabase";
import { createContext, useContext, useState, ReactNode } from "react";
import { useDeviceData } from "./DeviceDataContext";
import { useSettingsStore } from "@/lib/settings";

export type CheckStatus = "idle" | "running" | "success" | "failed";
export type ReportStatus = "idle" | "sending" | "sent" | "failed";

export interface ScanResults {
  antivirus: {
    exists: boolean;
    name: string;
    status: CheckStatus;
  };
  encryption: {
    exists: boolean;
    name: string;
    status: CheckStatus;
  };
  screenLock: {
    value: number;
    status: CheckStatus;
  };
}

interface ScanContextType {
  status: CheckStatus;
  reportStatus: ReportStatus;
  canStartScan: boolean;
  startScan: () => Promise<void>;
  sendReport: () => Promise<void>;
  results: ScanResults;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [reportStatus, setReportStatus] = useState<ReportStatus>("idle");
  const [results, setResults] = useState<ScanResults>({
    antivirus: { exists: false, name: "", status: "idle" },
    encryption: { exists: false, name: "", status: "idle" },
    screenLock: { value: 0, status: "idle" },
  });
  const { osName, osVersion, serial } = useDeviceData();
  const { userSettings } = useSettingsStore();

  const startScan = async () => {
    setStatus("running");
    setReportStatus("idle");
    setResults({
      antivirus: { exists: false, name: "", status: "running" },
      encryption: { exists: false, name: "", status: "running" },
      screenLock: { value: 0, status: "running" },
    });

    try {
      const antivirus = await window.electronAPI.checkAntivirus();
      setResults((prev) => ({
        ...prev,
        antivirus: {
          exists: true,
          name: antivirus,
          status: "success",
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        antivirus: { exists: false, name: "", status: "failed" },
      }));
      setStatus("failed");
    }

    try {
      const encryption = await window.electronAPI.checkDiskEncryption();
      setResults((prev) => ({
        ...prev,
        encryption: { exists: true, name: encryption, status: "success" },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        encryption: { exists: false, name: "", status: "failed" },
      }));
      setStatus("failed");
    }

    try {
      const screenLock = await window.electronAPI.checkScreenLock();
      setResults((prev) => ({
        ...prev,
        screenLock: { value: screenLock, status: "success" },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        screenLock: { value: 5, status: "failed" },
      }));
      setStatus("failed");
    }

    setStatus("success");
  };

  const canStartScan = Boolean(
    userSettings.email && userSettings.fullName && serial
  );

  const sendReport = async () => {
    setReportStatus("sending");
    const report = mapResultsToReport(
      results,
      osName,
      osVersion,
      new Date().toISOString()
    );
    const success = await sendReportToSupabase(
      userSettings.email,
      userSettings.fullName,
      serial,
      report
    );
    if (success) {
      setReportStatus("sent");
    } else {
      setReportStatus("failed");
    }
  };

  return (
    <ScanContext.Provider
      value={{
        status,
        reportStatus,
        canStartScan,
        startScan,
        sendReport,
        results,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error("useScan must be used within a ScanProvider");
  }
  return context;
}
