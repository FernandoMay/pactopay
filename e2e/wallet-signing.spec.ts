import { test } from "@playwright/test";

// SCAFFOLD ONLY: full wallet-signing flow against Stellar Testnet.
// Requires a persistent Chromium profile with the Freighter extension
// installed and a funded testnet account, then run with:
//   npx playwright test wallet-signing --headed
// after setting the PACTOPAY_E2E_PROFILE directory in the Playwright config
// (launchOptions / launchPersistentContext with that userDataDir).
test.describe.skip("wallet signing: create -> fund -> approve -> release", () => {
  test("create escrow signs createEscrow + addMilestone in Freighter", async () => {
    // requires persistent profile with Freighter + funded testnet account, run with `npx playwright test wallet-signing --headed` after setting `PACTOPAY_E2E_PROFILE` dir in config.
  });

  test("fund escrow signs fundEscrow deposit in Freighter", async () => {
    // requires persistent profile with Freighter + funded testnet account, run with `npx playwright test wallet-signing --headed` after setting `PACTOPAY_E2E_PROFILE` dir in config.
  });

  test("approve milestone signs approveMilestone in Freighter", async () => {
    // requires persistent profile with Freighter + funded testnet account, run with `npx playwright test wallet-signing --headed` after setting `PACTOPAY_E2E_PROFILE` dir in config.
  });

  test("release milestone signs releaseMilestone in Freighter", async () => {
    // requires persistent profile with Freighter + funded testnet account, run with `npx playwright test wallet-signing --headed` after setting `PACTOPAY_E2E_PROFILE` dir in config.
  });
});
