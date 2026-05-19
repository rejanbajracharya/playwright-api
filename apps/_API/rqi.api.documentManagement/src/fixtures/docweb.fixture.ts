import { baseTest, BaseFixtures, BaseWorkerFixtures } from "./base.fixture";
import { DocwebSendService } from "../services/docweb-send.service";

export type DocwebFixtures = BaseFixtures & {
  DocwebService: DocwebSendService;
};

export type DocwebWorkerFixtures = BaseWorkerFixtures;

export const test = baseTest.extend<DocwebFixtures, DocwebWorkerFixtures>({
  DocwebService: async ({}, use) => {
    const DocwebService = new DocwebSendService();
    await use(DocwebService);
  },
});

export { expect } from "@playwright/test";
