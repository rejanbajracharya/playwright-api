import { RowRecord } from "@repo/common-utility";

class RowSendService {
    constructor() {}

    IsPglStatusStatusEqual(rows: RowRecord[] | null,pglid: string, pglStatus: string): boolean {
          const status = rows?.[0]?.PackageGenerationLogStatusTypeId;
          console.log(`Polling PackageGenerationLog status for ${pglid}: ${String(status ?? "<missing>")}`);
          return String(status ?? "") === pglStatus;
    }

    IsPglIdEqual(rows: RowRecord[] | null, pglid: string) {
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
          }
}

const rowService = new RowSendService();
export {rowService as default, RowSendService} 