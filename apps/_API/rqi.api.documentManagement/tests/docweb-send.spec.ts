import { test, expect } from '../src/fixtures/docweb.fixture';
import { DocSendPayload } from '../src/modal/docSend.modal';
import { assertAttachmentLimitExceededResponseSchema, assertEmailTargetLimitExceededResponseSchema, assertEventDrivenResponseSchema, assertLargeAttachmentResponseSchema, assertMissingFieldsResponseSchema } from '../src/validation/response/docwebSend.assert';


test.describe("Docweb 2.0 send request letters", () => {
    const SEND_DOCUMENT_ENDPOINT = '/v1/document/sendDocument';

    test("should verify request letters send using email w/o attachments", async ({ client, getPayload, reportApiResponse }) => {
        const SEND_DOCUMENT_PAYLOAD_FILE = 'docweb-2.0/email.json';
        const payload = getPayload<DocSendPayload>(SEND_DOCUMENT_PAYLOAD_FILE);

        const response = await test.step("send sendDocument request", async () =>
            client.post(SEND_DOCUMENT_ENDPOINT, {
                body: payload
            })
        );

        const { responseText } = await test.step("attach response details", async () =>
            reportApiResponse("sendDocument", response)
        );

        await test.step("validate sendDocument response", async () => {
            expect(response.ok()).toBe(true);
            expect(response.status()).toBe(202);
            expect(responseText.trim().length).toBeGreaterThan(0);
            assertEventDrivenResponseSchema(responseText, payload);
        });
    });

    test("should verify request letters send using email with attachments", async ({ client, getPayload, reportApiResponse }) => {
        const SEND_DOCUMENT_PAYLOAD_FILE = 'docweb-2.0/email-with-attachments.json';
        const payload = getPayload<DocSendPayload>(SEND_DOCUMENT_PAYLOAD_FILE);

        const response = await test.step("send sendDocument request", async () =>
            client.post(SEND_DOCUMENT_ENDPOINT, {
                body: payload
            })
        );

        const { responseText } = await test.step("attach response details", async () =>
            reportApiResponse("sendDocument", response)
        );

        await test.step("validate sendDocument response", async () => {
            expect(response.ok()).toBe(true);
            expect(response.status()).toBe(202);
            expect(responseText.trim().length).toBeGreaterThan(0);
            assertEventDrivenResponseSchema(responseText, payload);
        });
    });


    test("should verify request letters send using print", async ({ client, getPayload, reportApiResponse }) => {
        const SEND_DOCUMENT_PAYLOAD_FILE = 'docweb-2.0/print.json';
        const payload = getPayload<DocSendPayload>(SEND_DOCUMENT_PAYLOAD_FILE);

        const response = await test.step("send sendDocument request", async () =>
            client.post(SEND_DOCUMENT_ENDPOINT, {
                body: payload
            })
        );

        const { responseText } = await test.step("attach response details", async () =>
            reportApiResponse("sendDocument", response)
        );

        await test.step("validate sendDocument response", async () => {
            expect(response.ok()).toBe(true);
            expect(response.status()).toBe(202);
            expect(responseText.trim().length).toBeGreaterThan(0);
            assertEventDrivenResponseSchema(responseText, payload);
        });
    });

    test("should verify missing required fields for empty payload", async ({ client, getPayload, reportApiResponse }) => {
        const response = await test.step("send sendDocument request", async () =>
            client.post(SEND_DOCUMENT_ENDPOINT, {
                body: {}
            })
        );

        const { responseText } = await test.step("attach response details", async () =>
            reportApiResponse("sendDocument", response)
        );

        await test.step("validate sendDocument response", async () => {
            expect(response.ok()).toBe(false);
            expect(response.status()).toBe(400);
            expect(responseText.trim().length).toBeGreaterThan(0);
            assertMissingFieldsResponseSchema(responseText);
        });
    });

    test("should verify request letters send using large attachment", async ({ client, getPayload, reportApiResponse }) => {
        const SEND_DOCUMENT_PAYLOAD_FILE = 'docweb-2.0/large-email-attachment.json';
        const payload = getPayload<DocSendPayload>(SEND_DOCUMENT_PAYLOAD_FILE);
        const response = await test.step("send sendDocument request", async () =>
            client.post(SEND_DOCUMENT_ENDPOINT, {
                body: payload
            })
        );

        const { responseText } = await test.step("attach response details", async () =>
            reportApiResponse("sendDocument", response)
        );

        await test.step("validate sendDocument response", async () => {
            expect(response.ok()).toBe(false);
            expect(response.status()).toBe(400);
            expect(responseText.trim().length).toBeGreaterThan(0);
            assertLargeAttachmentResponseSchema(responseText);
        });
    });

     test("should verify request letters send using attachment limit exceeded", async ({ client, getPayload, reportApiResponse }) => {
        const SEND_DOCUMENT_PAYLOAD_FILE = 'docweb-2.0/max-email-attachments.json';
        const payload = getPayload<DocSendPayload>(SEND_DOCUMENT_PAYLOAD_FILE);
        const response = await test.step("send sendDocument request", async () =>
            client.post(SEND_DOCUMENT_ENDPOINT, {
                body: payload
            })
        );

        const { responseText } = await test.step("attach response details", async () =>
            reportApiResponse("sendDocument", response)
        );

        await test.step("validate sendDocument response", async () => {
            expect(response.ok()).toBe(false);
            expect(response.status()).toBe(400);
            expect(responseText.trim().length).toBeGreaterThan(0);
            assertAttachmentLimitExceededResponseSchema(responseText);
        });
    });

      test("should verify request letters send using email target limit exceeded", async ({ client, getPayload, reportApiResponse }) => {
        const SEND_DOCUMENT_PAYLOAD_FILE = 'docweb-2.0/senders-email-target-exceed.json';
        const payload = getPayload<DocSendPayload>(SEND_DOCUMENT_PAYLOAD_FILE);
        const response = await test.step("send sendDocument request", async () =>
            client.post(SEND_DOCUMENT_ENDPOINT, {
                body: payload
            })
        );

        const { responseText } = await test.step("attach response details", async () =>
            reportApiResponse("sendDocument", response)
        );

        await test.step("validate sendDocument response", async () => {
            expect(response.ok()).toBe(false);
            expect(response.status()).toBe(400);
            expect(responseText.trim().length).toBeGreaterThan(0);
            assertEmailTargetLimitExceededResponseSchema(responseText);
        });
    });
});