import { expect, test } from '../src/fixture';

type SendDocumentPayload = {
    CorrelationId: string;
    RequestedBy: string;
};


const getXmlTagValue = (xml: string, tagName: string): string | undefined => {
    const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`));
    return match?.[1]?.trim();
};

const assertEventDrivenResponseSchema = (
    responseText: string,
    payload: SendDocumentPayload
): void => {
    expect(responseText).toContain('<EventDrivenResponse>');
    expect(responseText).toContain('</EventDrivenResponse>');

    const correlationId = getXmlTagValue(responseText, 'CorrelationId');
    const requestedBy = getXmlTagValue(responseText, 'RequestedBy');
    const success = getXmlTagValue(responseText, 'Success');
    const statusCode = getXmlTagValue(responseText, 'StatusCode');

    expect(correlationId).toBeDefined();
    expect(requestedBy).toBeDefined();
    expect(success).toBeDefined();
    expect(statusCode).toBeDefined();

    expect(correlationId).toBe(payload.CorrelationId);
    expect(requestedBy).toBe(payload.RequestedBy);
    expect(success?.toLowerCase()).toBe('true');
    expect(Number(statusCode)).toBe(202);
};

test.describe("Docweb 2.0 send request letters", () => {
    const SEND_DOCUMENT_ENDPOINT = '/v1/document/sendDocument';

    test("should verify request letters send using email", async ({ client, getPayload, reportApiResponse }) => {
        const SEND_DOCUMENT_PAYLOAD_FILE = 'docweb-2.0/email.json';
        const payload = getPayload<SendDocumentPayload>(SEND_DOCUMENT_PAYLOAD_FILE);

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
            assertEventDrivenResponseSchema(responseText, { CorrelationId: payload.CorrelationId, RequestedBy: payload.RequestedBy });
        });

    });
});