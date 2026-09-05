import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import { Snippet } from "./snippet";

describe("Snippet", () => {
  it("renders the command text", () => {
    render(<Snippet text="npm install" />);
    expect(screen.getByText("npm install")).toBeInTheDocument();
  });

  it("renders multiple lines", () => {
    render(<Snippet text={["line one", "line two"]} />);
    expect(screen.getByText("line one")).toBeInTheDocument();
    expect(screen.getByText("line two")).toBeInTheDocument();
  });

  it("explains how to copy when the clipboard API is unavailable", async () => {
    const user = userEvent.setup();
    render(<Snippet text="npm install" />);

    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Select and copy the command manually.");
  });

  it("reports denied clipboard access and allows a retry", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockRejectedValueOnce(new DOMException("Permission denied", "NotAllowedError"))
      .mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<Snippet text={["npm ci", "npm run dev"]} />);

    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy.");
    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(writeText).toHaveBeenLastCalledWith("npm ci\nnpm run dev");
    expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard.");
  });

  it("copies text to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<Snippet text="npm install" />);

    await user.click(screen.getByRole("button", { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith("npm install");
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });
});
