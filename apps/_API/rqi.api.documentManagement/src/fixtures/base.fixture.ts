import path from "node:path";
import { APIResponse, test as base } from "@playwright/test";

import { EnvironmentPayloadLoader } from "@repo/common-utility/payload-loader";
import { SignedApiClient } from "@repo/common-utility/signed-api-client";
import { defaultEnvironmentProfileLoader } from "@repo/common-utility/env-profile";
import { DatabaseConnection } from "@repo/common-utility/databaseConnection";
import { RQIAPI_APP_NAME } from "../config";

import type { RuntimeEnv } from "@repo/common-utility/env-profile";
import { MssqlStatementExecutor } from "@repo/common-utility/mssqlStatementExecutor";

export type BaseFixtures = {
  runtimeEnv: RuntimeEnv;
  client: SignedApiClient;
  getPayload: <T>(filename: string) => T;
  reportApiResponse: (
    name: string,
    response: APIResponse
  ) => Promise<{ responseHeaders: Record<string, string>; responseText: string }>;
};

export type BaseWorkerFixtures = {
  executor: MssqlStatementExecutor;
};

export const baseTest = base.extend<BaseFixtures, BaseWorkerFixtures>({
  runtimeEnv: async ({}, use) => {
    const envInfo = defaultEnvironmentProfileLoader.loadEnvironmentProfile(
      path.resolve(__dirname, "..")
    );
    console.log(`Loaded env profile '${envInfo.envName}' from ${envInfo.envPath}`);
    await use(envInfo.envName);
  },
  client: async ({ baseURL, runtimeEnv }, use) => {
    // runtimeEnv dependency ensures the env profile is loaded before client setup.
    void runtimeEnv;

    const client = await SignedApiClient.create(RQIAPI_APP_NAME, {
      baseUrl: baseURL,
    });

    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },
  executor: [
    async ({}, use) => {
      const serverName = process.env.DB_SERVER || "sql2008qa.mediconnect.net";
      const databaseName = "Retrieval_Management";
      const db = new DatabaseConnection(serverName, databaseName);
      await db.OpenConnection();
      
      // initialize mssqlStatementExecutor in the fixture context
      const executor = new MssqlStatementExecutor(db);
      await use(executor);
      
      // Cleanup runs once after all tests in the worker
      await db.CloseConnection();
    },
    { scope: "worker" }
  ],
  getPayload: async ({ runtimeEnv }, use) => {
    const payloadLoader = new EnvironmentPayloadLoader(path.resolve(__dirname, ".."));
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