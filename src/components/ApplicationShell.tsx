import type { ReactNode } from "react";
import { ShellProvider } from "./ShellProvider";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import "./ApplicationShell.css";

interface ApplicationShellProps {
  workspaceId?: string;
  title?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function ApplicationShell({
  workspaceId,
  title,
  headerActions,
  children,
}: ApplicationShellProps) {
  return (
    <ShellProvider>
      <div className="shell">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Sidebar workspaceId={workspaceId} />
        <div className="shell__main">
          <Header title={title} actions={headerActions} />
          <main id="main-content" className="shell__content" role="main">
            {children}
          </main>
        </div>
      </div>
    </ShellProvider>
  );
}
