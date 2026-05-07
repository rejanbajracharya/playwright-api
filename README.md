# Playwright API Turborepo

This repository is set up as a Turborepo monorepo for API testing with Playwright.

## Workspace layout

- `packages/common-utility`: shared helpers for env loading, service config, auth signing, and signed API clients
- `apps/rqi-api`: one microservice test app with its own Playwright config, env file, fixtures, and specs

## Commands

- `npm run test`: run all workspace tests through Turbo
- `npm run test:rqi`: run only the RQI API test workspace
- `npm run typecheck`: run type-checking across all workspaces

## Per-service setup

Each microservice should have its own app workspace under `apps/`.

Typical app structure:

```text
apps/<service>-api/
  package.json
  playwright.config.ts
  .env
  .env.example
  src/config.ts
  src/fixture.ts
  tests/
```

Each app keeps its own credentials in a local `.env` file. Example for RQI:

```dotenv
BASE_URL=https://service-host:52207
API_USERNAME=your-username
API_KEY=your-api-key
IGNORE_HTTPS_ERRORS=true
```

For `apps/rqi.api.neuron`, environment profiles are supported via separate files:

- `.env.dev`
- `.env.qa`
- `.env.uat`
- `.env.prod`

Set `TEST_ENV` to choose which profile to load (defaults to `qa`).

Windows examples:

```powershell
$env:TEST_ENV = "dev"; npm run test
$env:TEST_ENV = "qa"; npm run test
$env:TEST_ENV = "uat"; npm run test
$env:TEST_ENV = "prod"; npm run test
```

Or use app scripts in `apps/rqi.api.neuron/package.json`:

- `npm run test:dev`
- `npm run test:qa`
- `npm run test:uat`
- `npm run test:prod`

## Environment-specific payloads for POST APIs

For `apps/rqi.api.neuron`, keep per-environment request bodies in:

```text
apps/rqi.api.neuron/payloads/
  dev/
  qa/
  uat/
  prod/
  common/
```

In tests, use the fixture helper `getPayload`:

```ts
test("create session", async ({ client, getPayload, reportApiResponse }) => {
  const payload = getPayload<Record<string, unknown>>("create-secure-session");
  const response = await client.post("/v1/session/secure", { data: payload });
  await reportApiResponse("create-secure-session", response);
});
```

Lookup order is `payloads/<TEST_ENV>/<name>.json`, then fallback to `payloads/common/<name>.json`.

## Adding another microservice

1. Copy `apps/rqi-api` to a new workspace like `apps/patient-api`.
2. Rename the service constant and env variable prefix in `src/config.ts`.
3. Update `.env.example` with that service's credentials.
4. Add or replace tests under `tests/`.

## Shared framework usage

Apps import common helpers from `@repo/common-utility`.

Example:

```ts
import { createSignedApiClient, hasServiceConfig } from "@repo/common-utility";
```