import { expect, test } from "@playwright/test";

test("all footer links navigate to real routes", async ({ page }) => {
  await page.goto("/");

  const footer = page.locator("footer");
  const cases: Array<{ name: string; url: RegExp }> = [
    { name: "Inicio", url: /\/$/ },
    { name: "Crear Factura", url: /\/crear-factura/ },
    { name: "Pagar Custodia", url: /\/pagar-custodia/ },
    { name: "Panel de Control", url: /\/panel-de-control/ },
  ];
  for (const { name, url } of cases) {
    await footer.getByRole("link", { name }).click();
    await expect(page).toHaveURL(url);
  }

  // No dead "#" links or non-link spans in the footer nav.
  for (const href of await footer.locator("a").evaluateAll((as) =>
    as.map((a) => a.getAttribute("href"))
  )) {
    expect(href).not.toBe("#");
    expect(href).toBeTruthy();
  }

  // External explorer link points at the real site.
  expect(
    await footer
      .getByRole("link", { name: /Stellar Explorer/ })
      .getAttribute("href")
  ).toBe("https://stellar.expert");
});
