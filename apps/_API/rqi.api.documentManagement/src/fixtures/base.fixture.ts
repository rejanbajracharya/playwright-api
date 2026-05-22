import path from "node:path";
import { APIResponse, test as base } from "@playwright/test";

import { defaultEnvironment } from "@repo/common-utility";
import type { ServiceConfig } from "@repo/common-utility";
import { EnvironmentPayloadLoader } from "@repo/common-utility/payload-loader";
import { SignedApiClient } from "@repo/common-utility/signed-api-client";
import { defaultEnvironmentProfileLoader } from "@repo/common-utility/env-profile";
import { getAircomServiceConfig, getRqiApiServiceConfig, RQIAPI_APP_NAME } from "../config";

import type { RuntimeEnv } from "@repo/common-utility/env-profile";
import { MssqlStatementExecutor } from "@repo/common-utility/mssqlStatementExecutor";

const APP_ROOT = path.resolve(__dirname, "..", "..");

export type BaseFixtures = {
  runtimeEnv: RuntimeEnv;
  client: SignedApiClient;
  aircomClient: SignedApiClient;
  getPayload: <T>(filename: string) => T;
  reportApiResponse: (
    name: string,
    response: APIResponse,
  ) => Promise<{ responseHeaders: Record<string, string>; responseText: string }>;
};

export type BaseWorkerFixtures = {
  executor: MssqlStatementExecutor;
};

export const baseTest = base.extend<BaseFixtures, BaseWorkerFixtures>({
  runtimeEnv: async ({}, use) => {
    const envInfo = defaultEnvironmentProfileLoader.loadEnvironmentProfile(APP_ROOT);
    console.log(`Loaded env profile '${envInfo.envName}' from ${envInfo.envPath}`);
    await use(envInfo.envName);
  },
  client: async ({ runtimeEnv }, use) => {
    // runtimeEnv dependency ensures the env profile is loaded before client setup.
    void runtimeEnv;
    const client = await SignedApiClient.create(getRqiApiServiceConfig());
    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },
  aircomClient: async ({ runtimeEnv }, use) => {
    // runtimeEnv dependency ensures the env profile is loaded before client setup.
    void runtimeEnv;
    const client = await SignedApiClient.create(getAircomServiceConfig());
    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },
  getPayload: async ({ runtimeEnv }, use) => {
    const payloadLoader = new EnvironmentPayloadLoader(APP_ROOT);
    await use(<T>(name: string): T => payloadLoader.getPayloadByEnv<T>(runtimeEnv, name));
  },
  reportApiResponse: async ({}, use, testInfo) => {
    await use(async (name, response) => {
      const responseText = await response.text();
      const responseHeaders = response.headers();
      const responseSummary = {
        ok: response.ok(),
        status: response.status(),
        statusText: response.statusText(),
        headers: responseHeaders,
      };

      console.log(`${name} response summary:`, responseSummary);
      console.log(`${name} response body:`, responseText);

      await testInfo.attach(`${name}-response-summary`, {
        body: JSON.stringify(responseSummary, null, 2),
        contentType: "application/json",
      });

      await testInfo.attach(`${name}-response-body`, {
        body: responseText,
        contentType: "text/plain",
      });

      return {
        responseHeaders,
        responseText,
      };
    });
  },
});
