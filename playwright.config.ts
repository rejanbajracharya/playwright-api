import { defineConfig } from "@playwright/test";

declare const process: {
  env: Record<string, string | undefined>;
};

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "neuron-api",
      testDir: "./apps/_API/rqi.api.neuron/tests",
      outputDir: "./apps/_API/rqi.api.neuron/test-results",
    },
    {
      name: "document-management-api",
      testDir: "./apps/_API/rqi.api.documentManagement/tests",
      outputDir: "./apps/_API/rqi.api.documentManagement/test-results",
    },
  ],
});