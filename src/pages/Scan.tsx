import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckStatus, useScan } from "@/context/ScanContext";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  Lock,
  Key,
  LucideIcon,
  Send,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { securityReport } from "@/types/supabase";

function SecurityCheck({
  icon: Icon,
  title,
  status,
  details,
}: {
  icon: LucideIcon;
  title: string;
  status: CheckStatus;
  details: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border">
      <div
        className={cn(
          "p-2 rounded-full",
          status === "success" && "bg-green-100 dark:bg-green-900/30",
          status === "failed" && "bg-red-100 dark:bg-red-900/30",
          status === "running" && "bg-muted"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            status === "success" && "text-green-600",
            status === "failed" && "text-red-600",
            status === "running" && "text-muted-foreground"
          )}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {status === "running" ? "Checking..." : details}
        </p>
      </div>
      {status === "running" ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : status === "success" ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
    </div>
  );
}

export default function Scan() {
  const {
    status,
    reportStatus,
    canStartScan,
    startScan,
    sendReport,
    results,
    getLastReport,
  } = useScan();
  const [lastReport, setLastReport] = useState<securityReport | null>(null);

  useEffect(() => {
    const fetchLastReport = async () => {
      const report = await getLastReport();
      if (report) {
        setLastReport(report);
      }
    };
    fetchLastReport();
  }, [getLastReport]);

  const isReportOld = (report: securityReport) => {
    const reportDate = new Date(report.last_check);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return reportDate < oneMonthAgo;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Scan</h1>
        <p className="text-muted-foreground mt-2">
          Perform a security check without making any changes to your system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Security Check</CardTitle>
          <CardDescription>
            This will analyze your system for potential security issues without
            making any modifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <Button onClick={startScan} disabled={status === "running"}>
              {status === "running" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : status === "idle" ? (
                "Start Scan"
              ) : (
                "Retry Scan"
              )}
            </Button>

            {lastReport && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                {isReportOld(lastReport) ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <span>
                  Last report sent:{" "}
                  {new Date(lastReport.last_check).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {status !== "idle" && (
            <div className="space-y-4 mt-6">
              <SecurityCheck
                icon={Shield}
                title="Antivirus Protection"
                status={results.antivirus.status}
                details={
                  results.antivirus.status === "success"
                    ? `Active antivirus detected: ${results.antivirus.name}`
                    : results.antivirus.status === "failed"
                    ? "No active antivirus detected"
                    : "Checking..."
                }
              />

              <SecurityCheck
                icon={Lock}
                title="Disk Encryption"
                status={results.encryption.status}
                details={
                  results.encryption.status === "success"
                    ? `Encryption active: ${results.encryption.name}`
                    : results.encryption.status === "failed"
                    ? "No disk encryption detected"
                    : "Checking..."
                }
              />

              <SecurityCheck
                icon={Key}
                title="Screen Lock"
                status={results.screenLock.status}
                details={
                  results.screenLock.status === "success"
                    ? `Screen lock timeout: ${results.screenLock.value} minutes`
                    : results.screenLock.status === "failed"
                    ? "No screen lock timeout configured"
                    : "Checking..."
                }
              />
            </div>
          )}
          {status !== "idle" && status !== "running" && (
            <>
              <div className="h-px bg-border my-6" />
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    reportStatus === "sent" &&
                      "bg-green-100 dark:bg-green-900/30",
                    reportStatus === "failed" &&
                      "bg-red-100 dark:bg-red-900/30",
                    reportStatus === "sending" &&
                      "bg-blue-200 dark:bg-blue-800/30",
                    reportStatus === "idle" && "bg-blue-200 dark:bg-blue-800/30"
                  )}
                >
                  <Send
                    className={cn(
                      "h-5 w-5",
                      reportStatus === "sent" && "text-green-600",
                      reportStatus === "failed" && "text-red-600",
                      reportStatus === "sending" &&
                        "text-blue-600 dark:text-blue-300",
                      reportStatus === "idle" &&
                        "text-blue-600 dark:text-blue-300"
                    )}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Send Report</h3>
                  <p className="text-sm text-muted-foreground">
                    {reportStatus === "sent" && canStartScan
                      ? "Report sent successfully"
                      : !canStartScan
                      ? "Please fill in your email, full name and supabase settings"
                      : reportStatus === "failed"
                      ? "Failed to send report"
                      : reportStatus === "sending"
                      ? "Sending report..."
                      : "Share the security check results with your administrator"}
                  </p>
                </div>
                <Button
                  onClick={sendReport}
                  disabled={
                    !canStartScan ||
                    reportStatus === "sending" ||
                    reportStatus === "sent"
                  }
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {reportStatus === "sending" ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Sending...
                    </>
                  ) : reportStatus === "sent" ? (
                    <>
                      <CheckCircle2 />
                      Sent
                    </>
                  ) : reportStatus === "failed" ? (
                    <>
                      <ReloadIcon />
                      Retry
                    </>
                  ) : (
                    "Send Report"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
