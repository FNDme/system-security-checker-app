import { createContext, useContext, useState, ReactNode } from "react";

export type CheckStatus = "idle" | "running" | "success" | "failed";
export type ReportStatus = "idle" | "sending" | "sent" | "failed";

interface ScanResults {
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

  const startScan = async () => {
    setStatus("running");
    setReportStatus("idle");
    // Reset results
    setResults({
      antivirus: { exists: false, name: "", status: "running" },
      encryption: { exists: false, name: "", status: "running" },
      screenLock: { value: 0, status: "running" },
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResults((prev) => ({
        ...prev,
        antivirus: {
          exists: true,
          name: "Antivirus",
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResults((prev) => ({
        ...prev,
        encryption: { exists: true, name: "Encryption", status: "success" },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        encryption: { exists: false, name: "", status: "failed" },
      }));
      setStatus("failed");
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResults((prev) => ({
        ...prev,
        screenLock: { value: 5, status: "success" },
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

  const sendReport = async () => {
    setReportStatus("sending");
    try {
      // Simulate sending report
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setReportStatus("sent");
    } catch (error) {
      setReportStatus("failed");
    }
  };

  return (
    <ScanContext.Provider
      value={{ status, reportStatus, startScan, sendReport, results }}
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
