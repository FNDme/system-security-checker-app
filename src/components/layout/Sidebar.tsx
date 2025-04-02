import { Link, useLocation } from "react-router-dom";
import { PlayIcon, GearIcon } from "@radix-ui/react-icons";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useScan } from "@/context/ScanContext";

export default function Sidebar() {
  const location = useLocation();
  const { status } = useScan();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getScanIcon = () => {
    switch (status) {
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <PlayIcon className="h-5 w-5" />;
    }
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col border-r border-sidebar-border">
      <div className="py-4 border-b border-sidebar-border mb-4">
        <h2 className="text-xl font-semibold m-0">Actions</h2>
      </div>
      <nav className="flex-1">
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          <li>
            <Link
              to="/scan"
              className={`text-sidebar-foreground no-underline px-4 py-2 rounded-md transition-colors duration-200 hover:bg-sidebar-accent flex items-center gap-2 ${
                isActive("/scan") ? "bg-sidebar-accent" : ""
              }`}
            >
              {getScanIcon()}
              Scan
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <Link
          to="/settings"
          className={`text-sidebar-foreground no-underline px-4 py-2 rounded-md transition-colors duration-200 hover:bg-sidebar-accent flex items-center gap-2 ${
            isActive("/settings") ? "bg-sidebar-accent" : ""
          }`}
        >
          <GearIcon className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
