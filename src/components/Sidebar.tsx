import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useShell } from "./ShellContext";
import { IconButton } from "./IconButton";
import "./Sidebar.css";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  workspaceId?: string;
}

const defaultNavItems: NavItem[] = [];

function getNavItems(workspaceId: string): NavItem[] {
  return [
    {
      to: `/workspace/${workspaceId}`,
      label: "Overview",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      to: `/workspace/${workspaceId}/library`,
      label: "Library",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      to: `/workspace/${workspaceId}/compare`,
      label: "Compare",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
        </svg>
      ),
    },
    {
      to: `/workspace/${workspaceId}/concepts`,
      label: "Concepts",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ),
    },
    {
      to: `/workspace/${workspaceId}/assistant`,
      label: "Assistant",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];
}

export function Sidebar({ workspaceId }: SidebarProps) {
  const { isSidebarOpen, toggleSidebar } = useShell();
  const items = workspaceId ? getNavItems(workspaceId) : defaultNavItems;

  return (
    <aside
      className={`sidebar ${isSidebarOpen ? "sidebar--open" : "sidebar--closed"}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="sidebar__header">
        <NavLink to="/" className="sidebar__logo">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="24"
            height="24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="sidebar__logo-text">Synthora Nano</span>
        </NavLink>
        <IconButton
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          }
          label="Collapse sidebar"
          onClick={toggleSidebar}
          className="sidebar__toggle"
        />
      </div>

      <nav className="sidebar__nav">
        {items.length > 0 ? (
          <ul className="sidebar__list" role="list">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === `/workspace/${workspaceId}`}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                  }
                >
                  <span className="sidebar__link-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="sidebar__link-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="sidebar__empty">
            <p>No workspace selected</p>
          </div>
        )}
      </nav>

      <div className="sidebar__footer">
        <NavLink to="/settings" className="sidebar__link">
          <span className="sidebar__link-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="sidebar__link-label">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
