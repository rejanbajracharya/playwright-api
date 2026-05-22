import { baseTest, BaseFixtures, BaseWorkerFixtures } from "./base.fixture";
import { RowSendService } from "../services/row-send.service";
import { DatabaseConnection, MssqlStatementExecutor } from "@repo/common-utility";

export type RowFixtures = BaseFixtures & {
  rowService: RowSendService;
};

export type RowWorkerFixtures = BaseWorkerFixtures;

export const test = baseTest.extend<RowFixtures, RowWorkerFixtures>({
  executor: [
    async ({}, use) => {
      const serverName = process.env.DB_NAME || "sql2008qa.mediconnect.net";
      const databaseName = "Retrieval_Management";
      const db = new DatabaseConnection(serverName, databaseName);
      await db.OpenConnection();
      
      // initialize mssqlStatementExecutor in the fixture context
      const executor = new MssqlStatementExecutor(db);
      await use(executor);
      
      // Cleanup runs once after all tests in the worker
      await db.CloseConnection();
    },
    { scope: "worker" }
  ],
  rowService: async ({}, use) => {
    const rowService = new RowSendService();
    await use(rowService);
  },
});

export { expect } from "@playwright/test";
