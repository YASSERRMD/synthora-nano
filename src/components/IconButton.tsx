import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./IconButton.css";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { icon, label, variant = "ghost", size = "md", className = "", ...props },
    ref,
  ) => {
    const classes = [
      "icon-btn",
      `icon-btn--${variant}`,
      `icon-btn--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        aria-label={label}
        title={label}
        {...props}
      >
        <span className="icon-btn__icon" aria-hidden="true">
          {icon}
        </span>
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
