import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <MainContent>{children}</MainContent>
    </div>
  );
}
