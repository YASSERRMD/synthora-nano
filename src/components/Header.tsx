import type { ReactNode } from "react";
import { IconButton } from "./IconButton";
import { useShell } from "./ShellContext";
import "./Header.css";

interface HeaderProps {
  title?: string;
  actions?: ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const { toggleSidebar } = useShell();

  return (
    <header className="header" role="banner">
      <div className="header__left">
        <IconButton
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          }
          label="Toggle sidebar"
          onClick={toggleSidebar}
          className="header__menu-btn"
        />
        {title && <h1 className="header__title">{title}</h1>}
      </div>
      <div className="header__right">{actions}</div>
    </header>
  );
}
