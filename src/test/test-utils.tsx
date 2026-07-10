import { render } from "@testing-library/react";
import { StrictMode } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

interface RenderOptions {
  route?: string;
}

export function renderWithProviders(
  ui: ReactNode,
  options: RenderOptions = {},
) {
  const { route = "/" } = options;

  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </StrictMode>,
  );
}

export function renderWithRouter(ui: ReactNode) {
  return render(
    <StrictMode>
      <BrowserRouter>{ui}</BrowserRouter>
    </StrictMode>,
  );
}

export { render, screen, waitFor, fireEvent } from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
