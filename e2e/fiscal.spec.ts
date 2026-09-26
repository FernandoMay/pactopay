import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.goto("/cumplimiento-fiscal");
  await expect(
    page.getByRole("heading", { name: /Matriz Regulatoria por Pa.s/ })
  ).toBeVisible();
});

test("year select changes value", async ({ page }) => {
  // Looser selector: the year <select> is the first of two selects on the page.
  const yearSelect = page.locator("select").first();
  await yearSelect.selectOption("2024");
  await expect(yearSelect).toHaveValue("2024");
  await yearSelect.selectOption("2025");
  await expect(yearSelect).toHaveValue("2025");
});

test("certificate checkboxes toggle", async ({ page }) => {
  const first = page.getByRole("checkbox").first();
  const initial = await first.isChecked();
  await first.click();
  expect(await first.isChecked()).toBe(!initial);
  await first.click();
  expect(await first.isChecked()).toBe(initial);
});

test("matrix CSV button produces a real non-empty download", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /matriz fiscal \(CSV\)/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  const path = await download.path();
  expect(path).toBeTruthy();
  const content = await readFile(path as string, "utf-8");
  expect(content.length).toBeGreaterThan(0);
  expect(content).toContain("Pais");
});

test("certificate button produces a real non-empty download", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: /Generar Certificado Fiscal/ })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  const path = await download.path();
  expect(path).toBeTruthy();
  const content = await readFile(path as string, "utf-8");
  expect(content.length).toBeGreaterThan(0);
});

test("audit-table PDF buttons trigger window.print", async ({ page }) => {
  await page.evaluate(() => {
    (window as unknown as { __printed: boolean }).__printed = false;
    window.print = () => {
      (window as unknown as { __printed: boolean }).__printed = true;
    };
  });
  // Looser text match: the button's accessible name includes the icon ligature text.
  await page.getByRole("button", { name: /PDF/ }).first().click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __printed: boolean }).__printed
    )
  ).toBe(true);
});
