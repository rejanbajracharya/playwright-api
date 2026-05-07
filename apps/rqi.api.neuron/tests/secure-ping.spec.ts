import { expect, test } from "../src/fixture";

test.describe("rqi.api.neruon ping status check", () => {
  test("should verify ping", async ({ client, reportApiResponse }) => {
    const response = await test.step("send ping request", async () =>
      client.get("/v1/status/ping/", {secure: false})
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


  test("should verify dbPing", async ({ client, reportApiResponse }) => {
    const response = await test.step("send secure ping request", async () =>
      client.get("/v1/status/ping", {secure: false})
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
      client.get("/v1/status/ping/secure")
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