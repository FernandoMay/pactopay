import { expect, test } from "@playwright/test";

// Every app route serves the SPA shell (HTTP 200) and renders its page.
// The bogus route must render the NotFound page (also HTTP 200 shell).

const ROUTES: Array<{ path: string; marker: RegExp }> = [
  { path: "/", marker: /Crear Factura Segura Gratis/ },
  { path: "/crear-factura", marker: /Crear Factura Inteligente con Custodia/ },
  { path: "/pagar-custodia", marker: /Cargar custodia desde Testnet/ },
  { path: "/panel-de-control", marker: /Gesti.n de Custodia Activa/ },
  { path: "/cumplimiento-fiscal", marker: /Matriz Regulatoria por Pa.s/ },
  { path: "/pagar/ESC_0", marker: /ESC_0/ },
  { path: "/ruta-que-no-existe-xyz", marker: /404 — P.gina no encontrada/ },
];

for (const { path, marker } of ROUTES) {
  test(`route ${path} loads with HTTP 200 shell and expected content`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByText(marker).first()).toBeVisible();
  });
}

test("header nav clicks navigate to all 4 sections", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator("header nav");
  await nav.getByRole("link", { name: "Crear Factura" }).click();
  await expect(page).toHaveURL(/\/crear-factura/);
  await nav.getByRole("link", { name: "Pagar Custodia" }).click();
  await expect(page).toHaveURL(/\/pagar-custodia/);
  await nav.getByRole("link", { name: "Panel de Control" }).click();
  await expect(page).toHaveURL(/\/panel-de-control/);
  // Looser text match: the label contains an ampersand ("Cumplimiento & Fiscal").
  await nav.getByRole("link", { name: /Cumplimiento/ }).click();
  await expect(page).toHaveURL(/\/cumplimiento-fiscal/);
});
