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
import { useState } from "react";

export default function Settings() {
  const { userSettings, appSettings, setUserSettings, setAppSettings } =
    useSettingsStore();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const handleUserSettingsSave = () => {
    setUserSettings({ email, fullName });
  };

  const handleAppSettingsSave = () => {
    setAppSettings({
      darkMode: appSettings.darkMode,
    });
  };

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
              placeholder={userSettings.email || "Enter your email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder={userSettings.fullName || "Enter your full name"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <Button
            onClick={handleUserSettingsSave}
            disabled={
              !email ||
              !fullName ||
              (email === userSettings.email &&
                fullName === userSettings.fullName)
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
          <Button onClick={handleAppSettingsSave}>Save App Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
