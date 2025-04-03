import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface DeviceData {
  osName: string;
  osVersion: string;
  serial: string;
}

const DeviceDataContext = createContext<DeviceData>({
  osName: "",
  osVersion: "",
  serial: "",
});

export const DeviceDataProvider = ({ children }: { children: ReactNode }) => {
  const [deviceData, setDeviceData] = useState<DeviceData>({
    osName: "",
    osVersion: "",
    serial: "",
  });

  useEffect(() => {
    window.electronAPI.getSystemInfo().then((data: DeviceData) => {
      setDeviceData(data);
    });
  }, []);

  return (
    <DeviceDataContext.Provider value={deviceData}>
      {children}
    </DeviceDataContext.Provider>
  );
};

export const useDeviceData = () => {
  const deviceData = useContext(DeviceDataContext);
  if (!deviceData) {
    throw new Error("useDeviceData must be used within a DeviceDataProvider");
  }
  return deviceData;
};
