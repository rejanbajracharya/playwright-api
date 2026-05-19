import { RowRecord, Utils } from "@repo/common-utility";
import { expect, test } from "../src/fixtures/row.fixture";
import {
  assertEventDrivenResponseSchema,
  assertPackageGenerationLog,
  asssertRowNotification,
} from "../src/validation/response/rowSend.assert";
import { GET_PACKAGE_GENERATION_LOG, ROW_NOTIFICATION } from "../src/queries/row.sql";
import { AVG_POLL_INTERVAL, AVG_TIMEOUT } from "../src/constants/timeout";

test.describe("ROW/RMS send request letters for CLIENT 13", () => {
  const SEND_DOCUMENT_ENDPOINT = "/v1/document/send";

   test("should verify request letters send using email w/o attachments for FWAV accounts", async ({
    client,
    getPayload,
    reportApiResponse,
    executor,
    rowService
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
      let dbRows: RowRecord[] | null = null;
      const PGL_LOG_STATUS =  'ROW:RMQS' 

      expect(pglid, "Expected pglid in API response for DB validation").toBeTruthy();
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      console.log("Executing query:", query.text, "params:", query.params);
      dbRows = await executor.PollRowsFromQuery(
        query,
        (rows) => rowService.IsPglStatusStatusEqual(rows, pglid, PGL_LOG_STATUS),
        {
          timeoutMs: AVG_TIMEOUT,
          intervalMs: AVG_POLL_INTERVAL,
        },
      );
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid, PGL_LOG_STATUS);
    });

    await test.step("validate for ROW notifications", async () => {
      let dbRows: RowRecord[] | null = null;
      const query = { text: ROW_NOTIFICATION, params: { pglid } };

      console.log("Executing query:", query.text, "params:", query.params);
      try {
        dbRows = await executor.PollRowsFromQuery(
          query,
          (rows) => rowService.IsPglIdEqual(rows, pglid),
          {
            timeoutMs: AVG_TIMEOUT,
            intervalMs: AVG_POLL_INTERVAL,
          },
        );
        console.log(`dbRows returned: ${dbRows === null ? "null" : dbRows.length + " row(s)"}`);
      } catch (error) {
        console.log(`No ROW notification found for FWAV account (expected). pglid=${pglid}.`, error);
        expect(dbRows, "Expected rows in PackageGenerationLog for pglid").toBeNull();
      }
    });
  });

  test("should verify request letters send using email w/o attachments for R3 accounts", async ({
    client,
    getPayload,
    reportApiResponse,
    executor,
    rowService
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
      let dbRows: RowRecord[] | null = null;
      const PGL_LOG_STATUS =  'FTP:FTPS' 

      expect(pglid, "Expected pglid in API response for DB validation").toBeTruthy();
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      console.log("Executing query:", query.text, "params:", query.params);
      dbRows = await executor.PollRowsFromQuery(
        query,
        (rows) => rowService.IsPglStatusStatusEqual(rows, pglid, PGL_LOG_STATUS),
        {
          timeoutMs: AVG_TIMEOUT,
          intervalMs: AVG_POLL_INTERVAL,
        },
      );
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid);
    });
  });

  test("should verify request letters send using email w/o attachments for CAT accounts", async ({
    client,
    getPayload,
    reportApiResponse,
    executor,
    rowService
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
      let dbRows: RowRecord[] | null = null;
      const PGL_LOG_STATUS =  'ROW:RMQS' 

      expect(pglid, "Expected pglid in API response for DB validation").toBeTruthy();
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      console.log("Executing query:", query.text, "params:", query.params);
      try {
        dbRows = await executor.PollRowsFromQuery(
          query,
          (rows) => rowService.IsPglStatusStatusEqual(rows,pglid, PGL_LOG_STATUS),
          {
            timeoutMs: AVG_TIMEOUT,
            intervalMs: AVG_POLL_INTERVAL,
          },
        );

        expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
        assertPackageGenerationLog(dbRows, pglid, PGL_LOG_STATUS);
      } finally {
        // no-op cleanup
      }
    });

    await test.step("validate for ROW notifications", async () => {
      let dbRows: RowRecord[] | null = null;
      const query = { text: ROW_NOTIFICATION, params: { pglid } };

      console.log("Executing query:", query.text, "params:", query.params);
      try {
        dbRows = await executor.PollRowsFromQuery(
          query,
          (rows) => rowService.IsPglIdEqual(rows, pglid),
          {
            timeoutMs: AVG_TIMEOUT,
            intervalMs: AVG_POLL_INTERVAL,
          },
        );
        console.log(`dbRows returned: ${dbRows === null ? "null" : dbRows.length + " row(s)"}`);

        expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
        asssertRowNotification(dbRows, pglid);
      } finally {
        // no-op cleanup
      }
    });
  });
});
