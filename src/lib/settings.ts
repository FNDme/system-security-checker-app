import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserSettings {
  email: string;
  fullName: string;
}

interface AppSettings {
  supabaseUrl: string;
  supabaseKey: string;
  darkMode: boolean;
}

interface SettingsState {
  userSettings: UserSettings;
  appSettings: AppSettings;
  setUserSettings: (settings: Partial<UserSettings>) => void;
  setAppSettings: (settings: Partial<AppSettings>) => void;
}

const defaultUserSettings: UserSettings = {
  email: "",
  fullName: "",
};

const defaultAppSettings: AppSettings = {
  darkMode: true,
  supabaseUrl: "",
  supabaseKey: "",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      userSettings: defaultUserSettings,
      appSettings: defaultAppSettings,
      setUserSettings: (settings) =>
        set((state) => ({
          userSettings: { ...state.userSettings, ...settings },
        })),
      setAppSettings: (settings) =>
        set((state) => ({
          appSettings: { ...state.appSettings, ...settings },
        })),
    }),
    {
      name: "settings-storage",
    }
  )
);
