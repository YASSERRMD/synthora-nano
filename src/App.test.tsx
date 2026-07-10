import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the application title", () => {
    render(<App />);
    expect(screen.getByText("Synthora Nano")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<App />);
    expect(
      screen.getByText("Private research synthesis, directly in your browser."),
    ).toBeInTheDocument();
  });
});
