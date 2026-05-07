import {
  APIRequestContext,
  APIResponse,
  request as playwrightRequest,
} from "@playwright/test";

import { RapidAuthSignature } from "./rapid-auth-signature";
import {
  defaultServiceConfigProvider,
  ServiceConfig,
  ServiceConfigProvider,
} from "./service-config";

type RequestData = string | Record<string, unknown> | unknown[] | undefined | JSON;

type SignedRequestOptions = {
  body?: RequestData;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  secure?: boolean;
};

class SignedApiClient {
  private readonly requestContext: APIRequestContext;

  private readonly serviceConfig: ServiceConfig;
  
  private readonly authSignature: RapidAuthSignature;
  
  constructor(serviceConfig: ServiceConfig, requestContext: APIRequestContext) {
    this.serviceConfig = serviceConfig;
    this.requestContext = requestContext;
    this.authSignature = new RapidAuthSignature(serviceConfig.baseUrl);
  }

  private buildUrl(endpoint: string): string {
    return new URL(endpoint, `${this.serviceConfig.baseUrl}/`).toString();
  }
  
  private buildHeaders(
    requestUrl: string,
    data?: RequestData,
    headers?: Record<string, string>
  ): Record<string, string> {
    const authorization = this.authSignature.generateAuthHeaderEncodedUserSignature(
      requestUrl,
      this.serviceConfig.username,
      this.serviceConfig.apiKey,
      data
    );

    return {
      Authorization: `${authorization}`,
      ...headers,
    };
  }

  async get(
    endpoint: string,
    options: Omit<SignedRequestOptions, "data"> = {
      secure: true
    }
  ): Promise<APIResponse> {
    const requestUrl = this.buildUrl(endpoint);

    return this.requestContext.get(requestUrl, {
      headers: options.secure ? this.buildHeaders(requestUrl, undefined, options.headers) : options.headers,
      params: options.params,
    });
  }

  async post(
    endpoint: string,
    options: SignedRequestOptions = {}
  ): Promise<APIResponse> {
    const requestUrl = this.buildUrl(endpoint);

    return this.requestContext.post(requestUrl, {
      data: options.body,
      headers: this.buildHeaders(requestUrl, options.body, options.headers),
      params: options.params,
    });
  }

  async dispose(): Promise<void> {
    await this.requestContext.dispose();
  }
  static async create(
    serviceNameOrConfig: string | ServiceConfig,
    options: SignedApiClientCreateOptions = {}
  ): Promise<SignedApiClient> {
    const serviceConfigProvider =
      options.serviceConfigProvider || defaultServiceConfigProvider;

    const resolvedServiceConfig =
      typeof serviceNameOrConfig === "string"
        ? serviceConfigProvider.getServiceConfig(serviceNameOrConfig)
        : serviceNameOrConfig;

    const serviceConfig: ServiceConfig = {
      ...resolvedServiceConfig,
      baseUrl:
        options.baseUrl?.replace(/\/+$/, "") || resolvedServiceConfig.baseUrl,
    };

    const requestContext = await playwrightRequest.newContext({
      baseURL: serviceConfig.baseUrl,
      ignoreHTTPSErrors: serviceConfig.ignoreHTTPSErrors,
    });

    return new SignedApiClient(serviceConfig, requestContext);
  }
}

type SignedApiClientCreateOptions = {
  baseUrl?: string;
  serviceConfigProvider?: ServiceConfigProvider;
};

export { SignedApiClient };
export type { SignedApiClientCreateOptions, SignedRequestOptions };