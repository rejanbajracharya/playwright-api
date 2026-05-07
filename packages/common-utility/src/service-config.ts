import { defaultEnvironment, Environment } from "./env";

type ServiceConfig = {
  serviceName: string;
  baseUrl: string;
  username: string;
  apiKey: string;
  ignoreHTTPSErrors: boolean;
};

class ServiceConfigProvider {
  private readonly environment: Environment;

  constructor(environment: Environment = defaultEnvironment) {
    this.environment = environment;
  }

  normalizeServiceName(serviceName: string): string {
    return serviceName.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  }

  getServiceConfig(serviceName: string): ServiceConfig {
    const prefix = this.normalizeServiceName(serviceName);

    return {
      serviceName: prefix,
      baseUrl: this.stripTrailingSlash(this.environment.getRequiredEnv("BASE_URL")),
      username: this.environment.getRequiredEnv("API_USERNAME"),
      apiKey: this.environment.getRequiredEnv("API_KEY"),
      ignoreHTTPSErrors: this.environment.getBooleanEnv(
        "IGNORE_HTTPS_ERRORS",
        true
      ),
    };
  }

  hasServiceConfig(_serviceName: string): boolean {
  
    return Boolean(
      this.environment.getEnvValue("BASE_URL") &&
         this.environment.getEnvValue("API_USERNAME") &&
        this.environment.getEnvValue("API_KEY")
    );
  }

  private stripTrailingSlash(value: string): string {
    return value.replace(/\/+$/, "");
  }
}

const defaultServiceConfigProvider = new ServiceConfigProvider();

export { defaultServiceConfigProvider, ServiceConfigProvider };
export type { ServiceConfig };