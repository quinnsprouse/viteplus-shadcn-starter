import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Snippet } from "./snippet";

describe("Snippet", () => {
  it("renders the command text", () => {
    render(<Snippet text="npm install" />);
    expect(screen.getByText("npm install")).toBeDefined();
  });

  it("renders multiple lines", () => {
    render(<Snippet text={["line one", "line two"]} />);
    expect(screen.getByText("line one")).toBeDefined();
    expect(screen.getByText("line two")).toBeDefined();
  });

  it("has a copy button", async () => {
    const user = userEvent.setup();
    render(<Snippet text="npm install" />);

    const button = screen.getByRole("button", { name: /copy/i });
    expect(button).toBeDefined();
    // Click should not throw even without clipboard API
    await user.click(button);
  });
});
