import React, { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 bg-background p-8 overflow-y-auto">{children}</main>
  );
};

export default MainContent;
