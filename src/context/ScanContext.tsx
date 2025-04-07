import { mapResultsToReport } from "@/lib/utils";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useDeviceData } from "./DeviceDataContext";
import { useSettingsStore } from "@/lib/settings";
import { securityReport } from "@/types/supabase";

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
  getLastReport: () => Promise<securityReport | null>;
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
  const { userSettings, appSettings } = useSettingsStore();

  useEffect(() => {
    window.electronAPI.onRunScan(() => {
      console.log("run-scan");
      startScan();
    });
  }, []);

  const startScan = async () => {
    setStatus("running");
    setReportStatus("idle");
    setResults({
      antivirus: { exists: false, name: "", status: "running" },
      encryption: { exists: false, name: "", status: "running" },
      screenLock: { value: 0, status: "running" },
    });

    const antivirus = await window.electronAPI.checkAntivirus();
    setResults((prev) => ({
      ...prev,
      antivirus: {
        exists: antivirus !== null,
        name: antivirus || "",
        status: antivirus !== null ? "success" : "failed",
      },
    }));

    const encryption = await window.electronAPI.checkDiskEncryption();
    setResults((prev) => ({
      ...prev,
      encryption: {
        exists: encryption !== null,
        name: encryption || "",
        status: encryption !== null ? "success" : "failed",
      },
    }));

    const screenLock = await window.electronAPI.checkScreenLock();
    setResults((prev: ScanResults) => ({
      ...prev,
      screenLock: {
        value: screenLock || 0,
        status: screenLock !== null ? "success" : "failed",
      },
    }));

    setStatus(
      !!antivirus && !!encryption && !!screenLock ? "success" : "failed"
    );
  };

  const canStartScan = Boolean(
    userSettings.email &&
      userSettings.fullName &&
      serial &&
      appSettings.supabaseUrl &&
      appSettings.supabaseKey
  );

  const sendReport = async () => {
    setReportStatus("sending");
    const report = mapResultsToReport(
      results,
      osName,
      osVersion,
      new Date().toISOString()
    );
    const success = await window.electronAPI.sendReport(
      {
        supabaseUrl: appSettings.supabaseUrl,
        supabaseKey: appSettings.supabaseKey,
      },
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
  };

  const getLastReport = async () => {
    const lastReport = await window.electronAPI.getLastReport(
      {
        supabaseUrl: appSettings.supabaseUrl,
        supabaseKey: appSettings.supabaseKey,
      },
      userSettings.email,
      serial
    );
    return lastReport;
  };

  return (
    <ScanContext.Provider
      value={{
        status,
        reportStatus,
        canStartScan,
        startScan,
        sendReport,
        getLastReport,
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
