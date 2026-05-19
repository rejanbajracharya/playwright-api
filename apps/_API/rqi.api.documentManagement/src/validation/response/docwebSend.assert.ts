import { expect } from "@playwright/test";
import { Utils } from "@repo/common-utility/utils";


export type DocwebSendPayload = {
    CorrelationId: string;
    RequestedBy: string;
    Target: string;
};

const getXmlTagValue = Utils.getXmlTagValue;

const assertEventDrivenResponseSchema = (
    responseText: string,
    payload: DocwebSendPayload
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


const assertMissingFieldsResponseSchema = (
    responseText: string
): void => {
    expect(responseText).toContain('<ErrorResponseMessage>');
    expect(responseText).toContain('</ErrorResponseMessage>');

    const success = getXmlTagValue(responseText, 'Success');
    const message = getXmlTagValue(responseText, 'Message');
    const errorCode = getXmlTagValue(responseText, 'ErrorCode');
    const errorDetails = getXmlTagValue(responseText, 'ErrorDetails');

    expect(success).toBeDefined();
    expect(message).toBeDefined();
    expect(errorCode).toBeDefined();
    expect(errorDetails).toBeDefined();

    expect(success).toBe('false');
    expect(message).toBe('validation error(s)');
    expect(errorCode).toBe('VH1001');
    expect(errorDetails).toContain('<string>The BusinessUnitId field is required.</string><string>The DeliveryMethod field is required.</string><string>The DocumentType field is required.</string><string>The RequestedBy field is required.</string><string>The RequestedDT field is required.</string><string>The Target field is required.</string><string>The CorrelationId field is required.</string><string>The Requests field is required.</string>')
};


const assertLargeAttachmentResponseSchema = (
    responseText: string
): void => {
    expect(responseText).toContain('<ErrorResponseMessage>');
    expect(responseText).toContain('</ErrorResponseMessage>');

    const success = getXmlTagValue(responseText, 'Success');
    const message = getXmlTagValue(responseText, 'Message');
    const errorCode = getXmlTagValue(responseText, 'ErrorCode');
    const errorDetails = getXmlTagValue(responseText, 'ErrorDetails');

    expect(success).toBeDefined();
    expect(message).toBeDefined();
    expect(errorCode).toBeDefined();
    expect(errorDetails).toBeDefined();

    expect(success).toBe('false');
    expect(message).toBe('validation error(s)');
    expect(errorCode).toBe('VH1001');
    expect(errorDetails).toContain('<string>Combined attachments can\'t exceed 15MB total size.</string>')
};

const assertEmailTargetLimitExceededResponseSchema = (
    responseText: string
): void => {
    expect(responseText).toContain('<ErrorResponseMessage>');
    expect(responseText).toContain('</ErrorResponseMessage>');

    const success = getXmlTagValue(responseText, 'Success');
    const message = getXmlTagValue(responseText, 'Message');
    const errorCode = getXmlTagValue(responseText, 'ErrorCode');
    const errorDetails = getXmlTagValue(responseText, 'ErrorDetails');

    expect(success).toBeDefined();
    expect(message).toBeDefined();
    expect(errorCode).toBeDefined();
    expect(errorDetails).toBeDefined();

    expect(success).toBe('false');
    expect(message).toBe('validation error(s)');
    expect(errorCode).toBe('VH1001');
    expect(errorDetails).toContain('<string>Limit of 5 email addresses per email</string>')
};


const assertAttachmentLimitExceededResponseSchema = (
    responseText: string
): void => {
    expect(responseText).toContain('<ErrorResponseMessage>');
    expect(responseText).toContain('</ErrorResponseMessage>');

    const success = getXmlTagValue(responseText, 'Success');
    const message = getXmlTagValue(responseText, 'Message');
    const errorCode = getXmlTagValue(responseText, 'ErrorCode');
    const errorDetails = getXmlTagValue(responseText, 'ErrorDetails');

    expect(success).toBeDefined();
    expect(message).toBeDefined();
    expect(errorCode).toBeDefined();
    expect(errorDetails).toBeDefined();

    expect(success).toBe('false');
    expect(message).toBe('validation error(s)');
    expect(errorCode).toBe('VH1001');
    expect(errorDetails).toContain('<string>Limit of 5 added attachments per email.</string>')
};


export  {
    assertEventDrivenResponseSchema,
    assertMissingFieldsResponseSchema,
    assertLargeAttachmentResponseSchema,
    assertEmailTargetLimitExceededResponseSchema,
    assertAttachmentLimitExceededResponseSchema 
};