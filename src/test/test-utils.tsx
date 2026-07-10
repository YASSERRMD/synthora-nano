import { render } from "@testing-library/react";
import { StrictMode } from "react";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

export function renderWithProviders(ui: ReactNode) {
  return render(
    <StrictMode>
      <BrowserRouter>{ui}</BrowserRouter>
    </StrictMode>,
  );
}

export { render, screen, waitFor, fireEvent } from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
