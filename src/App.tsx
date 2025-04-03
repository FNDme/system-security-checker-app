import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Scan from "./pages/Scan";
import Settings from "./pages/Settings";
import { ScanProvider } from "./context/ScanContext";
import { useSettingsStore } from "@/lib/settings";
import { useEffect } from "react";
import { DeviceDataProvider } from "./context/DeviceDataContext";

export default function App() {
  const { appSettings } = useSettingsStore();

  useEffect(() => {
    if (appSettings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [appSettings.darkMode]);

  return (
    <HashRouter>
      <DeviceDataProvider>
        <ScanProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/scan" />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </ScanProvider>
      </DeviceDataProvider>
    </HashRouter>
  );
}
