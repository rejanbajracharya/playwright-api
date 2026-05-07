import { APIResponse, expect, test as base } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { SignedApiClient } from "@repo/common-utility/signed-api-client";
import { loadEnvironmentProfile } from "@repo/common-utility/env-profile";
import type { RuntimeEnv } from "@repo/common-utility/env-profile";
import { RQIAPI_SERVICE_NAME } from "./config";

type RqiFixtures = {
  runtimeEnv: RuntimeEnv;
  client: SignedApiClient;
  getPayload: <T>(name: string) => T;
  reportApiResponse: (
    name: string,
    response: APIResponse
  ) => Promise<{ responseHeaders: Record<string, string>; responseText: string }>;
};

const getPayloadByEnv = <T>(env: RuntimeEnv, name: string): T => {
  const appRoot = path.resolve(__dirname, "..");
  const envPayloadPath = path.join(appRoot, "payloads", env, `${name}.json`);
  const commonPayloadPath = path.join(appRoot, "payloads", "common", `${name}.json`);

  const targetPath = existsSync(envPayloadPath)
    ? envPayloadPath
    : existsSync(commonPayloadPath)
      ? commonPayloadPath
      : undefined;

  if (!targetPath) {
    throw new Error(
      `Payload '${name}' not found. Create either ${envPayloadPath} or ${commonPayloadPath}.`
    );
  }

  try {
    return JSON.parse(readFileSync(targetPath, "utf8")) as T;
  } catch (error) {
    throw new Error(
      `Invalid JSON in payload file '${targetPath}': ${(error as Error).message}`
    );
  }
};

const test = base.extend<RqiFixtures>({
  runtimeEnv: async ({}, use) => {
    const envInfo = loadEnvironmentProfile(path.resolve(__dirname, ".."), {
      displayName: "apps/rqi.api.neuron",
    });
    console.log(`Loaded env profile '${envInfo.envName}' from ${envInfo.envPath}`);
    await use(envInfo.envName);
  },
  client: async ({ baseURL, runtimeEnv }, use) => {
    // runtimeEnv dependency ensures the env profile is loaded before client setup.
    void runtimeEnv;

    const client = await SignedApiClient.create(RQIAPI_SERVICE_NAME, {
      baseUrl: baseURL,
    });

    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },
  getPayload: async ({ runtimeEnv }, use) => {
    await use(<T>(name: string): T => getPayloadByEnv<T>(runtimeEnv, name));
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

export { expect, test };