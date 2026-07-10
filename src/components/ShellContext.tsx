import { createContext, useContext } from "react";

interface ShellContextValue {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("useShell must be used within a ShellProvider");
  }
  return context;
}
