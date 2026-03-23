import { expect, test } from "@playwright/test";

test("home page renders and copy flow works", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error);
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: /build faster/i })).toBeVisible();
  await expect(page.getByText("toolchain.")).toBeVisible();
  await expect(page.getByRole("link", { name: /github/i })).toBeVisible();

  const copyButton = page.getByRole("button", { name: "Copy to clipboard" });
  await copyButton.click();

  await expect(copyButton).toBeVisible();
  expect(pageErrors).toHaveLength(0);
});
