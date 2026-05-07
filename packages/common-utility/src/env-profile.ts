import dotenv from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";

type RuntimeEnv = "dev" | "qa" | "uat" | "prod";

type LoadedEnvInfo = {
  envName: RuntimeEnv;
  envPath: string;
};

type LoadEnvironmentProfileOptions = {
  defaultEnv?: RuntimeEnv;
  envVarName?: string;
  displayName?: string;
};

const SUPPORTED_ENVS: RuntimeEnv[] = ["dev", "qa", "uat", "prod"];

const normalizeRuntimeEnv = (
  value?: string,
  defaultEnv: RuntimeEnv = "qa"
): RuntimeEnv => {
  const normalized = (value || defaultEnv).trim().toLowerCase();

  if (normalized === "production") {
    return "prod";
  }

  if (SUPPORTED_ENVS.includes(normalized as RuntimeEnv)) {
    return normalized as RuntimeEnv;
  }

  throw new Error(
    `Unsupported TEST_ENV '${value}'. Use one of: ${SUPPORTED_ENVS.join(", ")}.`
  );
};

const loadEnvironmentProfile = (
  appRoot: string,
  options: LoadEnvironmentProfileOptions = {}
): LoadedEnvInfo => {
  const envVarName = options.envVarName || "TEST_ENV";
  const envName = normalizeRuntimeEnv(
    process.env[envVarName] || process.env.NODE_ENV,
    options.defaultEnv
  );
  const envPath = path.join(appRoot, `.env.${envName}`);

  if (!existsSync(envPath)) {
    const locationLabel = options.displayName || appRoot;
    throw new Error(
      `Environment file not found: ${envPath}. Create .env.${envName} in ${locationLabel}.`
    );
  }

  dotenv.config({
    override: true,
    path: envPath,
  });

  return {
    envName,
    envPath,
  };
};

export { loadEnvironmentProfile };
export type { LoadedEnvInfo, LoadEnvironmentProfileOptions, RuntimeEnv };