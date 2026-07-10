import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";
import { renderWithProviders } from "./test/test-utils";

describe("App", () => {
  it("renders the onboarding page at root", async () => {
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByText("Synthora Nano")).toBeInTheDocument();
    });
  });

  it("renders 404 for unknown routes", async () => {
    renderWithProviders(<App />, { route: "/unknown-route" });
    await waitFor(() => {
      expect(screen.getByText("404")).toBeInTheDocument();
    });
  });

  it("has proper heading hierarchy on onboarding", async () => {
    renderWithProviders(<App />);
    await waitFor(() => {
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
    });
  });
});
