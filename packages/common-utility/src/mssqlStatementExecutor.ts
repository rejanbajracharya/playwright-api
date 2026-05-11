import { DatabaseConnection } from "./databaseConnection";

export type RowRecord = Record<string, unknown>;
export type QueryParams = Record<string, unknown>;

export interface SqlQuery {
	text: string;
	params: QueryParams;
}

export interface PollQueryOptions {
	timeoutMs?: number;
	intervalMs?: number;
}

type ErrorContext = {
	method: string;
	sql?: string;
	params?: QueryParams;
};

export const sqlQuery = (strings: TemplateStringsArray, ...values: unknown[]): SqlQuery => {
	let text = strings[0] ?? "";
	const params: QueryParams = {};

	for (let i = 0; i < values.length; i++) {
		const paramName = `p${i}`;
		params[paramName] = values[i];
		text += `@${paramName}${strings[i + 1] ?? ""}`;
	}

	return { text, params };
};

export class MssqlStatementExecutor {
	private readonly dbConnection: DatabaseConnection;

	constructor(dbConnection: DatabaseConnection) {
		this.dbConnection = dbConnection;
	}

	private getRequest() {
		const connection = this.dbConnection.GetConnection();
		if (!connection) {
			throw new Error("Database connection not established. Call OpenConnection() first.");
		}

		return connection.request();
	}

    public async Query(sqlString: string, params?: QueryParams): Promise<RowRecord[]> {
        try {
            const request = this.getRequest();
            if (params) {
                for (const [key, value] of Object.entries(params)) {
                    request.input(key, value as never);
                }
            }
            return await request.query<RowRecord>(sqlString)
            .then(result => result.recordset ?? []);
        } catch (error) {
            this.logDbError(error, {
                method: "Query",
                sql: sqlString,
                params,
            });
            return [];
        }
    }

	private formatError(error: unknown): { message: string; details: unknown } {
		if (error instanceof Error) {
			return {
				message: error.message,
				details: {
					name: error.name,
					stack: error.stack,
				},
			};
		}

		if (typeof error === "object" && error !== null) {
			return {
				message: "Unknown database error object",
				details: error,
			};
		}

		return {
			message: String(error),
			details: error,
		};
	}

	private logDbError(error: unknown, context: ErrorContext): void {
		const formatted = this.formatError(error);
		console.error("MSSQL execution failed", {
			method: context.method,
			message: formatted.message,
			sql: context.sql,
			params: context.params,
			error: formatted.details,
		});
	}

	public async GetTableSingleColumn(sqlString: string, col = 0): Promise<string[] | null> {
		try {
			const request = this.getRequest();
			const result = await request.query<RowRecord>(sqlString);
			const rows = result.recordset ?? [];

			if (rows.length === 0) {
				return null;
			}

			const values = rows
				.map((row) => Object.values(row)[col])
				.filter((value) => value !== null && value !== undefined)
				.map((value) => String(value));

			return values.length > 0 ? values : null;
		} catch (error) {
			this.logDbError(error, {
				method: "GetTableSingleColumn",
				sql: sqlString,
			});
			return null;
		}
	}

	public async GetSingleValue(sqlString: string): Promise<number> {
		try {
			const request = this.getRequest();
			const result = await request.query<RowRecord>(sqlString);
			const row = result.recordset?.[0];
			if (!row) {
				return 0;
			}

			const firstColumnValue = Object.values(row)[0];
			const numericValue = Number(firstColumnValue);
			return Number.isFinite(numericValue) ? numericValue : 0;
		} catch (error) {
			this.logDbError(error, {
				method: "GetSingleValue",
				sql: sqlString,
			});
			return 0;
		}
	}

	public async GetSingleStringValue(sqlString: string): Promise<string> {
		try {
			const request = this.getRequest();
			const result = await request.query<RowRecord>(sqlString);
			const row = result.recordset?.[0];
			if (!row) {
				return "";
			}

			const firstColumnValue = Object.values(row)[0];
			return firstColumnValue === null || firstColumnValue === undefined
				? ""
				: String(firstColumnValue);
		} catch (error) {
			this.logDbError(error, {
				method: "GetSingleStringValue",
				sql: sqlString,
			});
			return "";
		}
	}

	public async GetCompleteTable(sqlString: string, params?: Record<string, unknown>): Promise<RowRecord[] | null> {
		try {
			const request = this.getRequest();
			if (params) {
				for (const [key, value] of Object.entries(params)) {
					request.input(key, value as never);
				}
			}

			const result = await request.query<RowRecord>(sqlString);
			const rows = result.recordset ?? [];

			if (rows.length === 0) {
				return null;
			}

			return rows.filter((row) => {
				const firstColumnValue = Object.values(row)[0];
				return firstColumnValue !== null && firstColumnValue !== undefined;
			});
		} catch (error) {
			this.logDbError(error, {
				method: "GetCompleteTable",
				sql: sqlString,
				params,
			});
			return null;
		}
	}

	public async GetRows(strings: TemplateStringsArray, ...values: unknown[]): Promise<RowRecord[] | null> {
		const query = sqlQuery(strings, ...values);
		return this.GetRowsFromQuery(query);
	}

	public async GetRowsFromQuery(query: SqlQuery): Promise<RowRecord[] | null> {
		return this.GetCompleteTable(query.text, query.params);
	}

	private async wait(ms: number): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, ms));
	}

	public async PollRowsFromQuery(
		query: SqlQuery,
		predicate: (rows: RowRecord[] | null) => boolean | Promise<boolean>,
		options?: PollQueryOptions
	): Promise<RowRecord[] | null> {
		const timeoutMs = options?.timeoutMs ?? 5000;
		const intervalMs = options?.intervalMs ?? 500;
		const deadline = Date.now() + timeoutMs;

		let rows: RowRecord[] | null = null;
		do {
			rows = await this.GetRowsFromQuery(query);
			if (await predicate(rows)) {
				return rows;
			}

			if (Date.now() >= deadline) {
				break;
			}

			await this.wait(intervalMs);
		} while (true);

		throw new Error(`Polling timed out after ${timeoutMs}ms for query: ${query.text}`);
	}

	public async GetSingleRow(strings: TemplateStringsArray, ...values: unknown[]): Promise<RowRecord | null> {
		const rows = await this.GetRows(strings, ...values);
		if (!rows || rows.length === 0) {
			return null;
		}

		return rows[0];
	}

	public async GetSingleRowFromQuery(query: SqlQuery): Promise<RowRecord | null> {
		const rows = await this.GetRowsFromQuery(query);
		if (!rows || rows.length === 0) {
			return null;
		}

		return rows[0];
	}
}
