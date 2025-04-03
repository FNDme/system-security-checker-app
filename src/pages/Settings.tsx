import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/lib/settings";
import { useEffect, useState } from "react";

export default function Settings() {
  const { userSettings, appSettings, setUserSettings, setAppSettings } =
    useSettingsStore();
  const [email, setEmail] = useState(userSettings.email);
  const [fullName, setFullName] = useState(userSettings.fullName);
  const [systemInfo, setSystemInfo] = useState({
    osName: "",
    osVersion: "",
    serial: "",
  });

  const handleUserSettingsSave = () => {
    const fullNameValue = fullName.trim();
    const emailValue = email.trim();
    if (
      fullNameValue !== "" &&
      emailValue !== "" &&
      (fullNameValue !== userSettings.fullName.trim() ||
        email.trim() !== userSettings.email.trim())
    ) {
      setUserSettings({
        email: email.trim(),
        fullName: fullName.trim(),
      });
    }
  };

  useEffect(() => {
    const getSystemInfo = async () => {
      const info = await window.electronAPI.getSystemInfo();
      setSystemInfo({
        ...systemInfo,
        ...info,
      });
    };
    getSystemInfo();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your application preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
          <CardDescription>
            Manage your personal information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={"Enter your email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder={"Enter your full name"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <Button
            onClick={handleUserSettingsSave}
            disabled={
              !email.trim() ||
              !fullName.trim() ||
              (email.trim() === userSettings.email &&
                fullName.trim() === userSettings.fullName)
            }
          >
            Save User Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
          <CardDescription>
            Customize how the application looks and behaves.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable dark mode for the application
              </p>
            </div>
            <Switch
              checked={appSettings.darkMode}
              onCheckedChange={(checked) =>
                setAppSettings({ darkMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Info</CardTitle>
          <CardDescription>View information about your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Operating System: {systemInfo.osName}
            </p>
            <p className="text-sm text-muted-foreground">
              Version: {systemInfo.osVersion}
            </p>
            <p className="text-sm text-muted-foreground">
              Serial Number: {systemInfo.serial}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
