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
  scanDuration: number | null;
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
  const [scanDuration, setScanDuration] = useState<number | null>(null);
  const [results, setResults] = useState<ScanResults>({
    antivirus: { exists: false, name: "", status: "idle" },
    encryption: { exists: false, name: "", status: "idle" },
    screenLock: { value: 0, status: "idle" },
  });

  const startScan = async () => {
    setStatus("running");
    resetReportStatus();
    setScanDuration(null);

    // Start the timer
    const startTime = performance.now();

    setResults({
      antivirus: { exists: false, name: "", status: "running" },
      encryption: { exists: false, name: "", status: "running" },
      screenLock: { value: 0, status: "running" },
    });

    try {
      const antivirusPromise = window.electronAPI
        .checkAntivirus()
        .then((result) => {
          setResults((prev) => ({
            ...prev,
            antivirus: {
              exists: result !== null,
              name: result || "",
              status: result !== null ? "success" : "failed",
            },
          }));
          return result;
        });

      const encryptionPromise = window.electronAPI
        .checkDiskEncryption()
        .then((result) => {
          setResults((prev) => ({
            ...prev,
            encryption: {
              exists: result !== null,
              name: result || "",
              status: result !== null ? "success" : "failed",
            },
          }));
          return result;
        });

      const screenLockPromise = window.electronAPI
        .checkScreenLock()
        .then((result) => {
          setResults((prev) => ({
            ...prev,
            screenLock: {
              value: result || 0,
              status: result !== null ? "success" : "failed",
            },
          }));
          return result;
        });

      const [antivirus, encryption, screenLock] = await Promise.all([
        antivirusPromise,
        encryptionPromise,
        screenLockPromise,
      ]);

      const endTime = performance.now();
      setScanDuration(Math.round(endTime - startTime));
      setStatus(
        !!antivirus && !!encryption && !!screenLock ? "success" : "failed"
      );
    } catch (error) {
      console.error("Error during security scan:", error);

      const endTime = performance.now();
      setScanDuration(Math.round(endTime - startTime));

      setStatus("failed");
    }
  };

  return (
    <ScanContext.Provider
      value={{
        status,
        startScan,
        results,
        scanDuration,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}
