import { expect, test } from "../src/fixtures/fixture";

test.describe("rqi.api.documentManagement ping status check", () => {
  const PING_ENDPOINT = "/v1/status/ping/";
  const SECURE_PING_ENDPOINT = "/v1/status/ping/secure";
  const DB_PING_ENDPOINT = "/v1/status/dbPing";
  const DETAILS_ENDPOINT = "/v1/status/details/";
  const HEALTHCHECK_ENDPOINT = "/v1/status/healthcheck/";

  test("should verify ping", async ({ client, reportApiResponse }) => {
    const response = await test.step("send ping request", async () =>
      client.get(PING_ENDPOINT, {secure: false})
    );

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("ping", response)
    );

    await test.step("validate ping response", async () => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
    });
  });

  test("should verify healthcheck", async ({ client, reportApiResponse }) => {
    const response = await test.step("send healthcheck request", async () =>
      client.get(HEALTHCHECK_ENDPOINT)
    );

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("healthcheck", response)
    );

    await test.step("validate healthcheck response", async () => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
    });
  });
  test("should verify details", async ({ client, reportApiResponse }) => {
    const response = await test.step("send details request", async () =>
      client.get(DETAILS_ENDPOINT, {secure: false})
    );

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("details", response)
    );

    await test.step("validate details response", async () => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
    });
  });


  test("should verify dbPing", async ({ client, reportApiResponse }) => {
    const response = await test.step("send secure ping request", async () =>
      client.get(DB_PING_ENDPOINT, {secure: false})
    );

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("secure-ping", response)
    );

    await test.step("validate ping response", async () => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
    });
  });

  test("should verify secure-ping", async ({ client, reportApiResponse }) => {
    const response = await test.step("send secure ping request", async () =>
      client.get(SECURE_PING_ENDPOINT)
    );

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("secure-ping", response)
    );

    await test.step("validate secure ping response", async () => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
    });
  });
});