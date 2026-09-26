import { defineConfig } from "@playwright/test";

// NOTE: `npm run build` must run before the suite (parent builds first);
// the webServer below only serves the last build output via `vite preview`.
export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    // ENV WORKAROUND: the Playwright headless-shell binary could not be
    // downloaded (ENOSPC on C:), so force headless runs through the full
    // Chromium binary (chromium-1243/chrome-win64) which is installed.
    launchOptions: { channel: "chromium" },
  },
  webServer: {
    // `--host 127.0.0.1`: on this Windows box `localhost` resolves to ::1
    // only, so the default preview bind is unreachable via the 127.0.0.1
    // baseURL/url below. Binding IPv4 loopback keeps the suite green.
    command: "npx vite preview --port 4173 --strictPort --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
