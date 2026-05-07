import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { RuntimeEnv } from "./env-profile";

class EnvironmentPayloadLoader {
  private readonly appRoot: string;

  constructor(appRoot: string) {
    this.appRoot = appRoot;
  }

  private resolveDynamicValue(value: string): string {
    switch (value) {
      case "<<RequestedDt>>":
      case "__NOW_ISO__":
        return new Date().toISOString();
      default:
        return value;
    }
  }

  private resolveDynamicValues<T>(value: T): T {
    if (typeof value === "string") {
      return this.resolveDynamicValue(value) as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.resolveDynamicValues(item)) as T;
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
          key,
          this.resolveDynamicValues(nested),
        ])
      ) as T;
    }

    return value;
  }

  getPayloadByEnv<T>(env: RuntimeEnv, name: string): T {
    const jsonPath = path.join(this.appRoot, "test-data", `${name}`);
    const targetPath = existsSync(jsonPath)

    if (!targetPath) {
      throw new Error(
        `JSON file not found at location ${jsonPath}.`
      );
    }

    try {
      const parsed = JSON.parse(readFileSync(jsonPath, "utf8")) as Record<
        string,
        unknown
      >;
      const envPayload =
        parsed[env] || parsed[env.toUpperCase()] || parsed[env.toLowerCase()];

      if (!envPayload) {
        throw new Error(
          `Environment key '${env}' not found in payload '${jsonPath}'.`
        );
      }

      return this.resolveDynamicValues(envPayload as T);
    } catch (error) {
      throw new Error(
        `Invalid JSON in payload file '${jsonPath}': ${(error as Error).message}`
      );
    }
  }
}

export { EnvironmentPayloadLoader };
