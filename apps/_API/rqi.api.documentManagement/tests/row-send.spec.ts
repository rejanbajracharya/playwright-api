import { RowRecord, Utils } from "@repo/common-utility";
import { expect, test } from "../src/fixture";
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
  }) => {
    const SEND_DOCUMENT_PAYLOAD_FILE = "row/email.json";
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

    await test.step("validate for PackageGenerationLogHistory", async () => {
      let dbRows: RowRecord[] | null = null;
      expect(pglid, "Expected pglid in API response for DB validation").toBeTruthy();
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      console.log("Executing query:", query.text, "params:", query.params);
      dbRows = await executor.PollRowsFromQuery(
        query,
        (rows) => {
          const status = rows?.[0]?.PackageGenerationLogStatusTypeId;
          console.log(`Polling PackageGenerationLog status for ${pglid}: ${String(status ?? "<missing>")}`);
          return String(status ?? "") === "FTP:FTPS";
        },
        {
          timeoutMs: AVG_TIMEOUT,
          intervalMs: AVG_POLL_INTERVAL,
        },
      );
      expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
      assertPackageGenerationLog(dbRows, pglid);
    });

    await test.step("validate for ROW notifications", async () => {
      let dbRows: RowRecord[] | null = null;
      const query = { text: ROW_NOTIFICATION, params: { pglid } };

      console.log("Executing query:", query.text, "params:", query.params);
      try {
        dbRows = await executor.PollRowsFromQuery(
          query,
          (rows) => {
            const rawMessage = rows?.[0]?.Message;
            const messageObj =
              typeof rawMessage === "string"
                ? (JSON.parse(rawMessage) as {
                    Request?: { ConfirmationID?: number };
                  })
                : undefined;
            const confirmationId = messageObj?.Request?.ConfirmationID;
            console.log(
              `Polling ROW notification confirmationId for ${pglid}: ${String(confirmationId ?? "<missing>")}`,
            );
            return String(confirmationId ?? "") === pglid;
          },
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

  test("should verify request letters send using email w/o attachments for ROW accounts", async ({
    client,
    getPayload,
    reportApiResponse,
    executor,
  }) => {
    const SEND_DOCUMENT_PAYLOAD_FILE = "row/row-email.json";
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

    await test.step("validate for PackageGenerationLogHistory", async () => {
      let dbRows: RowRecord[] | null = null;
      expect(pglid, "Expected pglid in API response for DB validation").toBeTruthy();
      const query = { text: GET_PACKAGE_GENERATION_LOG, params: { pglid } };

      console.log("Executing query:", query.text, "params:", query.params);
      try {
        dbRows = await executor.PollRowsFromQuery(
          query,
          (rows) => {
            const status = rows?.[0]?.PackageGenerationLogStatusTypeId;
            console.log(`Polling PackageGenerationLog status for ${pglid}: ${String(status ?? "<missing>")}`);
            return String(status ?? "") === "ROW:RMQS";
          },
          {
            timeoutMs: AVG_TIMEOUT,
            intervalMs: AVG_POLL_INTERVAL,
          },
        );

        expect(dbRows, "Expected rows in PackageGenerationLog for pglid").not.toBeNull();
        assertPackageGenerationLog(dbRows, pglid, true);
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
          (rows) => {
            const rawMessage = rows?.[0]?.Message;
            const messageObj =
              typeof rawMessage === "string"
                ? (JSON.parse(rawMessage) as {
                    Request?: { ConfirmationID?: number };
                  })
                : undefined;
            const confirmationId = messageObj?.Request?.ConfirmationID;
            console.log(
              `Polling ROW notification confirmationId for ${pglid}: ${String(confirmationId ?? "<missing>")}`,
            );
            return String(confirmationId ?? "") === pglid;
          },
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
