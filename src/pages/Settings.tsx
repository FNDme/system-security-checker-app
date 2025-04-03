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
  const [userData, setUserData] = useState({
    email: "",
    fullName: "",
  });
  const [supabaseData, setSupabaseData] = useState({
    supabaseUrl: "",
    supabaseKey: "",
  });
  const [systemInfo, setSystemInfo] = useState({
    osName: "",
    osVersion: "",
    serial: "",
  });

  const handleUserSettingsSave = () => {
    const fullNameValue = userData.fullName.trim();
    const emailValue = userData.email.trim();
    if (
      fullNameValue !== "" &&
      emailValue !== "" &&
      (fullNameValue !== userData.fullName.trim() ||
        emailValue !== userData.email.trim())
    ) {
      setUserSettings({
        email: emailValue,
        fullName: fullNameValue,
      });
    }
  };

  const handleSupabaseSettingsSave = () => {
    setAppSettings({
      supabaseUrl: supabaseData.supabaseUrl,
      supabaseKey: supabaseData.supabaseKey,
    });
  };

  useEffect(() => {
    const setSystemData = async () => {
      const info = await window.electronAPI.getSystemInfo();
      setSystemInfo({
        ...systemInfo,
        ...info,
      });
    };
    setSystemData();
    setUserData({
      email: userSettings.email,
      fullName: userSettings.fullName,
    });
    setSupabaseData({
      supabaseUrl: appSettings.supabaseUrl,
      supabaseKey: appSettings.supabaseKey,
    });
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
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder={"Enter your full name"}
              value={userData.fullName}
              onChange={(e) =>
                setUserData({ ...userData, fullName: e.target.value })
              }
            />
          </div>
          <Button
            onClick={handleUserSettingsSave}
            disabled={
              !userData.email.trim() ||
              !userData.fullName.trim() ||
              (userData.email.trim() === userSettings.email.trim() &&
                userData.fullName.trim() === userSettings.fullName.trim())
            }
          >
            Save User Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase Settings</CardTitle>
          <CardDescription>Configure your Supabase settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="supabaseUrl"
            type="text"
            placeholder={"Enter your Supabase URL"}
            value={supabaseData.supabaseUrl}
            onChange={(e) =>
              setSupabaseData({ ...supabaseData, supabaseUrl: e.target.value })
            }
          />
          <Input
            id="supabaseKey"
            type="text"
            placeholder={"Enter your Supabase Key"}
            value={supabaseData.supabaseKey}
            onChange={(e) =>
              setSupabaseData({ ...supabaseData, supabaseKey: e.target.value })
            }
          />
          <div className="w-full flex justify-between">
            <Button
              onClick={handleSupabaseSettingsSave}
              disabled={!supabaseData.supabaseUrl || !supabaseData.supabaseKey}
            >
              Save Supabase Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSupabaseData({
                  supabaseUrl: "",
                  supabaseKey: "",
                });
              }}
            >
              Remove Supabase Settings
            </Button>
          </div>
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
