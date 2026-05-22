import { applyTemplateValues, Utils } from "@repo/common-utility";
import { expect, test } from "../src/fixtures/row.fixture";
import {
  assertEventDrivenResponseSchema,
  assertPackageGenerationLog,
  asssertRowNotification,
} from "../src/validation/response/rowSend.assert";
import { GET_FAX_LOG_ID, GET_PACKAGE_GENERATION_LOG, ROW_NOTIFICATION } from "../src/queries/row.sql";

test.describe("Send request letter with Email delivery for Client 13", () => {
  const SEND_DOCUMENT_ENDPOINT = "/v1/document/send";

  test("should verify request letters send using email w/o attachments for FWAV accounts", async ({
    client,
    runtimeEnv,
    getPayload,
    reportApiResponse,
    rowService,
  }) => {
    const SEND_DOCUMENT_PAYLOAD_FILE = "row/FWAV/email.json";
    const payload = getPayload<any>(SEND_DOCUMENT_PAYLOAD_FILE);

    const response = await test.step("send sendDocument request", async () =>
      client.post(SEND_DOCUMENT_ENDPOINT, {
        body: payload,
      }));

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("sendDocument", response));
    const pglid = Utils.getXmlTagValue(responseText, "long") as string;

    await test.step("validate sendDocument response", async () => {
      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
      assertEventDrivenResponseSchema(responseText);
    });

    await test.step("validate for PackageGenerationLog", async () => {
      const PGL_LOG_STATUS = "ROW:RMQS";
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };
      const dbRows = await rowService.GetPglLog(query, PGL_LOG_STATUS);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid, PGL_LOG_STATUS, runtimeEnv);
    });

    await test.step("validate for ROW notifications", async () => {
      const query = { text: ROW_NOTIFICATION, params: { pglid } };
      const dbRows = await rowService.GetRowNotificaitonLog(query);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      asssertRowNotification(dbRows, pglid);
    });
  });

  test("should verify request letters send using email w/o attachments for R3 accounts", async ({
    client,
    runtimeEnv,
    getPayload,
    reportApiResponse,
    rowService,
  }) => {
    const SEND_DOCUMENT_PAYLOAD_FILE = "row/R3/email.json";
    const payload = getPayload<any>(SEND_DOCUMENT_PAYLOAD_FILE);

    const response = await test.step("send sendDocument request", async () =>
      client.post(SEND_DOCUMENT_ENDPOINT, {
        body: payload,
      }));

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("sendDocument", response));
    const pglid = Utils.getXmlTagValue(responseText, "long") as string;

    await test.step("validate sendDocument response", async () => {
      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
      assertEventDrivenResponseSchema(responseText);
    });

    await test.step("validate for PackageGenerationLog", async () => {
      const PGL_LOG_STATUS = "FTP:FTPS";
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      const dbRows = await rowService.GetPglLog(query, PGL_LOG_STATUS);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid, PGL_LOG_STATUS, runtimeEnv, "CCV");
    });
  });

  test("should verify request letters send using email w/o attachments for CAT accounts", async ({
    client,
    runtimeEnv,
    getPayload,
    reportApiResponse,
    rowService,
  }) => {
    const SEND_DOCUMENT_PAYLOAD_FILE = "row/CAT/email.json";
    const payload = getPayload<any>(SEND_DOCUMENT_PAYLOAD_FILE);

    const response = await test.step("send sendDocument request", async () =>
      client.post(SEND_DOCUMENT_ENDPOINT, {
        body: payload,
      }));

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("sendDocument", response));
    const pglid = Utils.getXmlTagValue(responseText, "long") as string;

    await test.step("validate sendDocument response", async () => {
      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
      assertEventDrivenResponseSchema(responseText);
    });

    await test.step("validate for PackageGenerationLog", async () => {
      const PGL_LOG_STATUS = "ROW:RMQS";
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      const dbRows = await rowService.GetPglLog(query, PGL_LOG_STATUS);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid, PGL_LOG_STATUS, runtimeEnv, "CAT");
    });

    await test.step("validate for ROW notifications", async () => {
      const query = { text: ROW_NOTIFICATION, params: { pglid } };

      const dbRows = await rowService.GetRowNotificaitonLog(query);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      asssertRowNotification(dbRows, pglid);
    });
  });
});

test.describe("Send request letter with Print delivery for Client 13", () => {
  const SEND_DOCUMENT_ENDPOINT = "/v1/document/send";

  test("should verify request letters send using print w/o attachments for FWAV accounts", async ({
    client,
    runtimeEnv,
    getPayload,
    reportApiResponse,
    rowService,
  }) => {
    const SEND_DOCUMENT_PAYLOAD_FILE = "row/FWAV/print.json";
    const payload = getPayload<any>(SEND_DOCUMENT_PAYLOAD_FILE);

    const response = await test.step("send sendDocument request", async () =>
      client.post(SEND_DOCUMENT_ENDPOINT, {
        body: payload,
      }));

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("sendDocument", response));
    const pglid = Utils.getXmlTagValue(responseText, "long") as string;

    await test.step("validate sendDocument response", async () => {
      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
      assertEventDrivenResponseSchema(responseText);
    });

    await test.step("validate for PackageGenerationLog", async () => {
      const PGL_LOG_STATUS = "ROW:RMQS";
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      const dbRows = await rowService.GetPglLog(query, PGL_LOG_STATUS);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid, PGL_LOG_STATUS, runtimeEnv);
    });

    await test.step("validate for ROW notifications", async () => {
      const query = { text: ROW_NOTIFICATION, params: { pglid } };
      const dbRows = await rowService.GetRowNotificaitonLog(query);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      asssertRowNotification(dbRows, pglid);
    });
  });

  test("should verify request letters send using print w/o attachments for R3 accounts", async ({
    client,
    runtimeEnv,
    getPayload,
    reportApiResponse,
    rowService,
  }) => {
    const SEND_DOCUMENT_PAYLOAD_FILE = "row/R3/print.json";
    const payload = getPayload<any>(SEND_DOCUMENT_PAYLOAD_FILE);

    const response = await test.step("send sendDocument request", async () =>
      client.post(SEND_DOCUMENT_ENDPOINT, {
        body: payload,
      }));

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("sendDocument", response));
    const pglid = Utils.getXmlTagValue(responseText, "long") as string;

    await test.step("validate sendDocument response", async () => {
      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
      assertEventDrivenResponseSchema(responseText);
    });

    await test.step("validate for PackageGenerationLog", async () => {
      const PGL_LOG_STATUS = "FTP:FTPS";
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      const dbRows = await rowService.GetPglLog(query, PGL_LOG_STATUS);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid, PGL_LOG_STATUS, runtimeEnv, "CCV");
    });
  });

  test("should verify request letters send using print w/o attachments for CAT accounts", async ({
    client,
    runtimeEnv,
    getPayload,
    reportApiResponse,
    rowService,
  }) => {
    const SEND_DOCUMENT_PAYLOAD_FILE = "row/CAT/print.json";
    const payload = getPayload<any>(SEND_DOCUMENT_PAYLOAD_FILE);

    const response = await test.step("send sendDocument request", async () =>
      client.post(SEND_DOCUMENT_ENDPOINT, {
        body: payload,
      }));

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("sendDocument", response));
    const pglid = Utils.getXmlTagValue(responseText, "long") as string;

    await test.step("validate sendDocument response", async () => {
      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
      assertEventDrivenResponseSchema(responseText);
    });

    await test.step("validate for PackageGenerationLog", async () => {
      const PGL_LOG_STATUS = "ROW:RMQS";
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      const dbRows = await rowService.GetPglLog(query, PGL_LOG_STATUS);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid, PGL_LOG_STATUS, runtimeEnv, "CAT");
    });

    await test.step("validate for ROW notifications", async () => {
      const query = { text: ROW_NOTIFICATION, params: { pglid } };

      const dbRows = await rowService.GetRowNotificaitonLog(query);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      asssertRowNotification(dbRows, pglid);
    });
  });
});

test.describe("Send request letter using FAX delivery for Client 13", () => {
  const SEND_DOCUMENT_ENDPOINT = "/v1/document/send";
  const AIRCOM_ENDPOINT = "/api/fax/statusupdate";
  const AIRCOM_PAYLOAD_FILE = "row/aircom.json";

  test("should verify request letters send using FAX for FWAV accounts", async ({
    client,
    aircomClient,
    runtimeEnv,
    getPayload,
    reportApiResponse,
    rowService,
  }) => {
    const SEND_DOCUMENT_PAYLOAD_FILE = "row/FWAV/fax.json";
    const payload = getPayload<any>(SEND_DOCUMENT_PAYLOAD_FILE);
    const aircomPayload = getPayload<any>(AIRCOM_PAYLOAD_FILE);

    const response = await test.step("send sendDocument request", async () =>
      client.post(SEND_DOCUMENT_ENDPOINT, {
        body: payload,
      }));

    const { responseText } = await test.step("attach response details", async () =>
      reportApiResponse("sendDocument", response));
    const pglid = Utils.getXmlTagValue(responseText, "long") as string;

    await test.step("validate sendDocument response", async () => {
      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);
      expect(responseText.trim().length).toBeGreaterThan(0);
      assertEventDrivenResponseSchema(responseText);
    });

    const flid = await rowService.GetFaxLogId({ text: GET_FAX_LOG_ID, params: { pglid } });
    const aircomRequestBody = applyTemplateValues(aircomPayload, {
      Pglid: pglid,
      Flid: String(flid ?? ""),
    });

    const aircomResponse = await test.step("send aircom repsonse", async () =>
      aircomClient.post(AIRCOM_ENDPOINT, {
        body: aircomRequestBody,
      }));

    await test.step("validate aircom response", async () => {
      expect(aircomResponse.ok()).toBe(true);
      expect(aircomResponse.status()).toBe(200);
    });

    await test.step("validate for PackageGenerationLog", async () => {
      const PGL_LOG_STATUS = "ROW:RMQS";
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      const dbRows = await rowService.GetPglLog(query, PGL_LOG_STATUS);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid, PGL_LOG_STATUS, runtimeEnv);
    });

    await test.step("validate for ROW notifications", async () => {
      const query = { text: ROW_NOTIFICATION, params: { pglid } };
      const dbRows = await rowService.GetRowNotificaitonLog(query);
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      asssertRowNotification(dbRows, pglid);
    });
  });
});
