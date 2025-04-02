import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import Scan from "./pages/Scan";
import Settings from "./pages/Settings";
import { ScanProvider } from "./context/ScanContext";
import { useSettingsStore } from "@/lib/settings";
import { useEffect } from "react";

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
    <Router>
      <ScanProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/scan" />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </ScanProvider>
    </Router>
  );
}
