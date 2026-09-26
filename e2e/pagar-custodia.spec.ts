import { expect, test } from "@playwright/test";

test("bogus escrow ID shows a real error state, no crash, no fake success", async ({ page }) => {
  await page.goto("/pagar-custodia");
  await page.getByPlaceholder("ESC_0").fill("NOPE_99");
  await page.getByRole("button", { name: /Cargar escrow/ }).click();

  // Without a wallet the gate reports it; with a wallet testnet reports
  // "not found". Either way a visible error must appear...
  await expect(
    page
      .getByText(/Conectá tu billetera Freighter|No se encontró el escrow/)
      .first()
  ).toBeVisible();

  // ...and no success UI may leak through.
  await expect(
    page.getByText(/Depósito en Custodia Confirmado/)
  ).toHaveCount(0);
  await expect(page.getByText(/CUSTODIA #/)).toHaveCount(0);
});
