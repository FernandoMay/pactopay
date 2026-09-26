import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/crear-factura");
  await expect(
    page.getByRole("heading", { name: /Crear Factura Inteligente con Custodia/ })
  ).toBeVisible();
});

test("submit with no wallet is blocked with a visible message", async ({ page }) => {
  await page
    .getByRole("button", { name: /Crear custodia real en Testnet/ })
    .click();
  // Exact app string: connect() fails with no Freighter, then the gate sets this.
  // QA FINDING (2026-09-25, verified with a 30s probe): with no Freighter
  // installed this message NEVER appears — submit awaits connect() whose
  // Freighter-API promise never settles without the extension, so the click
  // hangs silently with zero feedback. Generous 15s timeout to rule out slowness.
  await expect(
    page.getByText(/Conectá tu billetera Freighter/)
  ).toBeVisible({ timeout: 15000 });
  // No navigation away and no on-chain artifacts produced.
  await expect(page).toHaveURL(/\/crear-factura/);
  await expect(
    page.getByText(/El enlace real aparece aquí/)
  ).toBeVisible();
});

test("invalid contractor address shows inline validation error", async ({ page }) => {
  await page.getByPlaceholder("G…").fill("INVALID_ADDRESS");
  await expect(
    page.getByText(/Dirección Stellar inválida/)
  ).toBeVisible();
});

test("token selector shows USDC cards and Avanzado reveals the address", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: /USDC/ }).first()
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /TESTUSDC/ })
  ).toBeVisible();
  await page.getByText(/Avanzado/).click();
  const tokenInput = page.getByPlaceholder("C…");
  await expect(tokenInput).toBeVisible();
  expect(await tokenInput.inputValue()).toMatch(/^C/);
});

test("copy button exists but is disabled before creation", async ({ page }) => {
  const copyButton = page.getByRole("button", { name: /Copiar/ });
  await expect(copyButton).toBeVisible();
  await expect(copyButton).toBeDisabled();
});

test("PDF button triggers window.print (browser API stub, not an app mock)", async ({ page }) => {
  await page.evaluate(() => {
    (window as unknown as { __printed: boolean }).__printed = false;
    window.print = () => {
      (window as unknown as { __printed: boolean }).__printed = true;
    };
  });
  await page.getByRole("button", { name: /Descargar PDF/ }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __printed: boolean }).__printed
    )
  ).toBe(true);
});

test("mailto button has a real mailto href", async ({ page }) => {
  const href = await page
    .getByRole("link", { name: /Enviar por Correo/ })
    .getAttribute("href");
  expect(href).toMatch(/^mailto:/);
});
