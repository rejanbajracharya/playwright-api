import { expect } from "../../fixture";
import { Utils } from "@repo/common-utility/utils";

type RowRecord = Record<string, unknown>;

const getXmlTagValue = Utils.getXmlTagValue;

const assertEventDrivenResponseSchema = (
    responseText: string
): void => {
    const pglid = getXmlTagValue(responseText, 'long');
    expect(pglid).toBeDefined();
    expect(Number(pglid)).toBeGreaterThan(0);
};

const assertPackageGenerationLog = (dbRows: RowRecord[] | null, pglid: string, isRowNotification = false) => {
    if (dbRows && dbRows?.length > 0) {
        const PGL_LOG_STATUS = isRowNotification ? 'ROW:RMQS' : "FTP:FTPS"
        const packageGenerationLogRow = dbRows[0] as {
            PackageGenerationLogId: number;
            PackageGenerationLogStatusTypeId: string;
            PackageGenerationLogStatusMetadata: string;
        };

        expect(String(packageGenerationLogRow.PackageGenerationLogId)).toBe(pglid);

        expect(packageGenerationLogRow.PackageGenerationLogStatusTypeId).toBe(PGL_LOG_STATUS);

        if(!isRowNotification) {
            expect(packageGenerationLogRow.PackageGenerationLogStatusMetadata).toContain(`File written to `);
            expect(packageGenerationLogRow.PackageGenerationLogStatusMetadata).toContain(`\\requestpackets\\QA\\CCV\\${pglid}_`);
        }
    }
}

const asssertRowNotification = (dbRows: RowRecord[] | null, pglid: string) => {
    if (dbRows && dbRows?.length > 0) {
        const packageGenerationLogRow = dbRows[0] as {
            RMQResponseCode: number;
            Message: string
        };
        const messageObj = JSON.parse(packageGenerationLogRow.Message)

        expect(String(packageGenerationLogRow.RMQResponseCode)).toBe("200");
        expect(String(messageObj.Request.ConfirmationID)).toBe(pglid);
        expect(messageObj.Request.Event.Type).toBe("DeliveryNotification");
        expect(messageObj.Request.Event.Status).toBe("Success");
    }
    }

export { assertEventDrivenResponseSchema, assertPackageGenerationLog, asssertRowNotification };