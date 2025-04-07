import { createContext, useContext, useState, ReactNode } from "react";
import { useReport } from "./ReportContext";

export type CheckStatus = "idle" | "running" | "success" | "failed";

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
  startScan: () => Promise<void>;
  results: ScanResults;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function useScan() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error("useScan must be used within a ScanProvider");
  }
  return context;
}

export function ScanProvider({ children }: { children: ReactNode }) {
  const { resetReportStatus } = useReport();
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [results, setResults] = useState<ScanResults>({
    antivirus: { exists: false, name: "", status: "idle" },
    encryption: { exists: false, name: "", status: "idle" },
    screenLock: { value: 0, status: "idle" },
  });

  const startScan = async () => {
    setStatus("running");
    resetReportStatus();
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

  return (
    <ScanContext.Provider
      value={{
        status,
        startScan,
        results,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}
