import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { RuntimeEnv } from "./env-profile";

class EnvironmentPayloadLoader {
  private readonly appRoot: string;

  constructor(appRoot: string) {
    this.appRoot = appRoot;
  }

  getPayloadByEnv<T>(env: RuntimeEnv, name: string): T {
    const envPayloadPath = path.join(this.appRoot, "payloads", env, `${name}.json`);
    const commonPayloadPath = path.join(
      this.appRoot,
      "payloads",
      "common",
      `${name}.json`
    );

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
  }
}

export { EnvironmentPayloadLoader };
