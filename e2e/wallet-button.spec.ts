import { expect, test } from "@playwright/test";

// Fresh Playwright profile => no Freighter extension installed.
test("header shows install prompt, never a connect dead-end", async ({ page }) => {
  await page.goto("/");

  const installLink = page
    .locator("header")
    .getByRole("link", { name: /Instalar Freighter/ });
  await expect(installLink).toBeVisible();
  expect(await installLink.getAttribute("href")).toBe("https://freighter.app");

  // The "Conectar Billetera" button only renders when Freighter IS detected,
  // so with no extension it must not exist (no dead-end button).
  await expect(
    page.locator("header").getByRole("button", { name: /Conectar Billetera/ })
  ).toHaveCount(0);
});
