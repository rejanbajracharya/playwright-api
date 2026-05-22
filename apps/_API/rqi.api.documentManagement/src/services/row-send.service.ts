import { MssqlStatementExecutor, RowRecord, SqlQuery } from "@repo/common-utility";
import { AVG_POLL_INTERVAL, AVG_TIMEOUT } from "../constants/timeout";

class RowSendService {
  private readonly executor: MssqlStatementExecutor;

  constructor(executor: MssqlStatementExecutor) {
    this.executor = executor;
  }

  async GetPglLog(query: SqlQuery, pollPglStatus: string): Promise<RowRecord[] | null> {
    const pglid = query?.params?.pglid;

    console.log("Executing query:", query.text, "params:", query.params);
    return this.executor.PollRowsFromQuery(
      query,
      (rows) => {
        const status = rows?.[0]?.PackageGenerationLogStatusTypeId;
        console.log(`Polling PackageGenerationLog status for ${pglid}: ${String(status ?? "<missing>")}`);
        return String(status ?? "") === pollPglStatus;
      },
      {
        timeoutMs: AVG_TIMEOUT,
        intervalMs: AVG_POLL_INTERVAL,
      },
    );
  }

  async GetRowNotificaitonLog(query: SqlQuery): Promise<RowRecord[] | null> {
    console.log("Executing query:", query.text, "params:", query.params);
    const pglid = query?.params?.pglid;
    try {
      const dbRows = await this.executor.PollRowsFromQuery(
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
          console.log(`Polling ROW notification confirmationId for ${pglid}: ${String(confirmationId ?? "<missing>")}`);
          return String(confirmationId ?? "") === pglid;
        },
        {
          timeoutMs: AVG_TIMEOUT,
          intervalMs: AVG_POLL_INTERVAL,
        },
      );
      console.log(`dbRows returned: ${dbRows === null ? "null" : dbRows.length + " row(s)"}`);
      return dbRows;
    } catch (error) {
      console.log(`No ROW notification found for FWAV account (expected). pglid=${pglid}.`, error);
      return null;
    }
  }

  async GetFaxLogId(query: SqlQuery): Promise<string | null> {
    const row = await this.executor.GetSingleRowFromQuery(query);
    return (row?.FaxLogId as string | undefined) ?? null;
  }
}

export { RowSendService };
