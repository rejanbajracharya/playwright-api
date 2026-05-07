class Environment {
  getEnvValue(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
  }

  getRequiredEnv(name: string): string {
    const value = this.getEnvValue(name);

    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
  }

  getBooleanEnv(name: string, defaultValue = false): boolean {
    const value = this.getEnvValue(name);

    if (!value) {
      return defaultValue;
    }

    return value.toLowerCase() === "true";
  }
}

const defaultEnvironment = new Environment();

export { defaultEnvironment, Environment };