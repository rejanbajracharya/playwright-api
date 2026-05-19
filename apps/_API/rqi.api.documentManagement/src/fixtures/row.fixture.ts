import { baseTest, BaseFixtures, BaseWorkerFixtures } from "./base.fixture";
import { RowSendService } from "../services/row-send.service";

export type RowFixtures = BaseFixtures & {
  rowService: RowSendService;
};

export type RowWorkerFixtures = BaseWorkerFixtures;

export const test = baseTest.extend<RowFixtures, RowWorkerFixtures>({
  rowService: async ({}, use) => {
    const rowService = new RowSendService();
    await use(rowService);
  },
});

export { expect } from "@playwright/test";
