# Astrada TypeScript SDK

The TypeScript and JavaScript client for the [Astrada API](https://docs.astrada.co/reference): manage subaccounts
and enrollment links for Visa, Mastercard and American Express cards, then read their transactions and receive them
as webhooks. The SDKs have no card-enrollment methods. Card enrollment happens in the browser with the Unified Enrollment SDK v2 or an enrollment link. If you are an approved direct-API partner and send card data through the generic request method, it passes through your server and your PCI scope applies.

**Start here:** [sign up for a sandbox](https://astrada.co/sandbox) ·
[Getting Started](https://docs.astrada.co/docs/getting-started) ·
[Authentication](https://docs.astrada.co/docs/authentication) ·
[API reference](https://docs.astrada.co/reference)

Questions: developer@astrada.co. Bugs and feature requests: [GitHub issues](https://github.com/FidelLimited/astrada-typescript/issues).
Security problems: report them privately as [SECURITY.md](https://github.com/FidelLimited/astrada-typescript/blob/main/SECURITY.md) explains.

[SDK reference (TypeDoc)](https://fidellimited.github.io/astrada-typescript/) · [Changelog](CHANGELOG.md)

## Install

```bash
npm install @astrada.co/ts-astrada-sdk
```

Needs Node.js 20+ (it uses the built-in `fetch`). Every Node.js line its maintainers still support is tested
in CI (now 20, 22 and 24); support for a line is dropped only in a major release. It ships ES modules and CommonJS with types, so
`import` and `require` both work; the types are checked with TypeScript 5.9.

## Upgrading from 1.x

- The package name is unchanged (`@astrada.co/ts-astrada-sdk`). 2.0.0 is published from
  [FidelLimited/astrada-typescript](https://github.com/FidelLimited/astrada-typescript) and needs Node.js 20 or
  later.
- A `Configuration` needs `environment: 'sandbox' | 'production'` (or a `basePath`); it logs in with `accountId`,
  `clientId` and `clientSecret`.
- Methods take the names in the API reference: `getSubaccounts` is `listSubaccounts`, `getTransactions` is
  `listTransactions`, `getTransactionById` is `getTransaction`, `getTransactionMessageById` is
  `getTransactionMessage`, `binLookup` is `lookupBin`, `enrollmentMethods` is `getEnrollmentMethods`,
  `cardVerificationList` is `listCardVerifications` and `cardVerificationAttemptLockoutUnlock` is
  `unlockCardVerificationAttempts`.
- Models are named for what they hold, not for the status code: `GetSubaccounts200Response` is `SubaccountList`,
  `GetTransactions200Response` is `TransactionList` and `CreateWebhook201Response` is `WebhookCreateResult`. Four
  names are reused with a new meaning: `CreateSubaccountRequest`, `CreateWebhookRequest`, `UpdateSubaccountRequest`
  and `UpdateWebhookRequest` were the request bodies in 1.x and are now the argument objects; the bodies are
  `SubaccountCreateParams`, `WebhookCreateParams`, `SubaccountUpdateParams` and `WebhookUpdateParams`, and their
  keys change: `createSubaccount({ createSubaccountRequest: body })` is now `createSubaccount({
  subaccountCreateParams: body })`. An old import still compiles against the new meaning, and plain JavaScript
  passing the old key sends no body, so check these calls by hand. The per-status error models
  (`CreateEnrollmentLink400Response` and the like) are gone: errors are `ResponseError` subclasses.
- `TransactionMessage.dateTime` is a `TransactionDateTime`, not a `Date` (see "Reading transaction times").

Every change is listed in the [releases](https://github.com/FidelLimited/astrada-typescript/releases) and
`CHANGELOG.md`.

## First call

With the sandbox credentials from your sign-up in the environment, list your subaccounts:

```ts
import { Configuration, SubaccountsApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({ environment: 'sandbox', accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!, clientSecret: process.env.ASTRADA_CLIENT_SECRET! });
const page = await new SubaccountsApi(config).listSubaccounts({ limit: 5 });
console.log(page._embedded.subaccounts.map((s) => s.name));
```

## Choose the environment and log in

Every call goes to one environment, `sandbox` or `production`, and the SDK will not guess: a `Configuration`
without `environment` (or a `basePath`) throws. Sandbox and production have separate accounts and separate API
clients, so credentials from one are refused by the other (an `AuthenticationError`).

The SDK logs in with your API client's id and secret (the OAuth2 client-credentials grant, see
[Authentication](https://docs.astrada.co/docs/authentication)), keeps the token until shortly before it
expires, and logs in again by itself. Calls made at the same time while no token is cached share one token
request.

The examples below import this file, `astrada.ts`:

```ts
// file: astrada.ts
import { Configuration } from '@astrada.co/ts-astrada-sdk';

export const config = new Configuration({
  environment: 'sandbox', // or 'production'
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
```

One `Configuration` serves every API class, the Banking API's included, so the whole application shares one
login. `basePath` replaces the environment's host when you need another one, such as a local stand-in server
in tests.

## Mint a token for the browser enrollment SDK

The Unified Enrollment SDK v2 in your page asks your backend for a token (its `getAccessToken` option). Mint it
with your **SDK client**: the separate client id and secret Astrada gives you for the browser. Never hand the
browser a token of your backend client: it would carry every scope the backend holds, writes and `banking:admin`
included, so `mintSdkAccessToken` refuses the configuration's own `clientId` unless the configuration calls the sandbox API.

The token carries every scope the SDK client holds; the login does not narrow a token on request. List in
`allowedScopes` only the scopes the browser calls need, from the [SDK credentials
table](https://docs.astrada.co/docs/authentication#sdk-credentials): the eight in the sample, plus `cards:read`
if you want the card lookup and `network-bulk-enrollments:write` or `network-bulk-feeds:write` for bulk
enrollment requests on admin pages. Never list `banking:admin` or `webhooks:write`, and if your SDK client holds
any scope the browser does not need, ask Astrada to remove it. If you do not offer bank sign-in, leave out the
two banking scopes and have them removed too. With `allowedScopes`, the call throws `UnexpectedScopesError`
instead of returning a token that carries any scope outside the list (the check covers the scopes the login
states in its answer); a token missing a listed scope is still returned.

The token is not tied to one subaccount: for its five minutes it works on every subaccount of your account, for
card enrollment and card lookups, with the banking scopes for bank links and bank data, and with the bulk
enrollment scopes for bulk enrollment requests. Your server decides who gets a token, not what the token reaches,
so check that the signed-in user may use the subaccount the page opens, and remember that a user who copies the
token can call the API with it until it expires.

Sandbox self sign-up only, never in production: that account has one client for both uses, so its token carries
every backend scope. There, leave `allowedScopes` out (or pass it as undefined).

```ts
import { createServer, type IncomingMessage } from 'node:http';
import { config } from './astrada.js';

const sdkClientId = process.env.ASTRADA_SDK_CLIENT_ID;
const sdkClientSecret = process.env.ASTRADA_SDK_CLIENT_SECRET;
if (!sdkClientId || !sdkClientSecret) {
  throw new Error('Set ASTRADA_SDK_CLIENT_ID and ASTRADA_SDK_CLIENT_SECRET');
}

// Replace with your own session check (and the subaccounts the user may use). It refuses everyone
// until you do, so this route never hands a token to an anonymous caller.
function requireSession(_req: IncomingMessage): boolean {
  return false;
}

createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/your-backend/astrada-sdk-token') {
    if (!requireSession(req)) {
      res.writeHead(401).end();
      return;
    }
    try {
      const token = await config.mintSdkAccessToken({
        clientId: sdkClientId,
        clientSecret: sdkClientSecret,
        allowedScopes: ['subaccounts:read', 'card-subscriptions:read', 'card-subscriptions:write',
          'card-verifications:read', 'card-verifications:write', 'enrollment-methods:write',
          'banking:read', 'banking:write'], // Example: replace with the scopes the browser calls need
      });
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }).end(token);
    } catch (error) {
      console.error('could not mint the SDK token', error); // an UnexpectedScopesError names the extra scopes
      res.writeHead(502).end();
    }
    return;
  }
  res.writeHead(404).end();
}).listen(3000);
```

## List your subaccounts

Cards belong to subaccounts. `listSubaccounts` returns one page; `paginate` walks every page for you.

```ts
import { SubaccountsApi, paginate } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const subaccounts = new SubaccountsApi(config);

const firstPage = await subaccounts.listSubaccounts({ limit: 10 });
console.log(firstPage._embedded.subaccounts.map((s) => s.name));

for await (const subaccount of paginate((params) => subaccounts.listSubaccounts(params), { limit: 100 })) {
  console.log(subaccount.id, subaccount.name);
}
```

## Enroll a card

The simplest way to enroll a card is an enrollment link: a hosted page where the cardholder enters their own
card. Create one for a subaccount and send its `url` to the cardholder. (To build enrollment into your own
pages, use the [Unified Enrollment SDK](https://docs.astrada.co/docs/unified-enrollment-sdk-v2) in the browser instead.)

```ts
import { EnrollmentLinksApi } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const links = new EnrollmentLinksApi(config);

const link = await links.createEnrollmentLink({
  enrollmentLinkCreateParams: {
    subaccountId: '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b',
    kind: 'cardholder', // one employee; 'team' for a link to share
    customerReferenceId: '2b7e9d14-5c3a-4f8e-9b21-0d6c4a8e7f35', // your id for the cardholder, a UUID
  },
});
console.log(link.url, 'expires', link.expiresAt.toISOString());
```

`url` holds the link's secret and is returned only by this call, so send it on and do not log it in
production.

## Read why a card failed

When a card's verification fails, the verification carries a `failureReason` you can show or branch on:
`category` is stable across providers, `description` is safe to show the cardholder, and `retryable` says
whether trying again can succeed.

```ts
import { CardVerificationApi, paginate } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const verifications = new CardVerificationApi(config);
const cardId = '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c';

for await (const verification of paginate(
  (params) => verifications.listCardVerifications(params),
  { cardId, state: 'failed' },
)) {
  const reason = verification.failureReason;
  if (reason) {
    console.log(reason.category, reason.retryable ? '(can retry)' : '(do not retry)', reason.description);
  }
}
```

## Simulate a transaction in the sandbox

In the sandbox you can make an enrolled card transact. The transaction arrives a few moments later through the
`transaction.created` webhook and in `listTransactions`. The simulations are under the `sandbox` namespace,
and every one of them throws `SandboxOnlyError` before sending anything (the login included) unless the
configuration has `environment: 'sandbox'` and the sandbox API host. A custom `basePath`, such as a mock
server, passes only when you mark it with `basePathIsSandbox: true`; the production host never passes. See
[Sandbox API](https://docs.astrada.co/docs/sandbox-api) for what each simulation does.

```ts
import { TransactionsApi, sandbox } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const simulations = new sandbox.SandboxSimulationApi(config);
const { messageId } = await simulations.simulateTransaction({
  simulateTransactionRequest: {
    cardId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
    type: 'authorization',
    amount: 4500, // minor units: 45.00
    currency: 'USD',
    merchant: { name: 'Corner Coffee', mcc: '5814', city: 'Austin', country: 'USA' },
  },
});

// Once the message is processed, find the transaction it created.
const found = await new TransactionsApi(config).listTransactions({ transactionMessageId: messageId });
for (const transaction of found._embedded.transactions) {
  console.log(transaction.status, transaction.transactionHoldAmount, transaction.transactionCurrency);
}
```

## Test bulk enrollment in sandbox

With bulk enrollment the card network sends Astrada a file of a company's cards on a schedule. In the sandbox
you play the network: create a bulk feed, then deliver a simulated file for it, and the real pipeline enrolls
the cards and their transactions, with the same webhooks as in production (`networkbulkfeed.statechanged`,
`cardsubscription.created`, then `transaction.*`). `simulateBulkFeedFile` picks the simulation by the feed's
`type`: `GL` (American Express), `SMARTDATA` (Mastercard), `VBDS` or `VCF` (Visa). It is sandbox only, with the
same guard as the other simulations. The walkthrough, with each network's reference format, is
[Testing Bulk Enrollment](https://docs.astrada.co/docs/sandbox-bulk-enrollment).

```ts
import { ConflictError, NetworkBulkFeedsApi, sandbox } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const networkReference = '1_123_45_6789'; // a Visa RPIC
const feeds = new NetworkBulkFeedsApi(config);
try {
  await feeds.createNetworkBulkFeed({
    networkBulkFeedCreateParams: {
      network: 'VISA',
      type: 'VCF',
      networkReference,
      subaccountId: '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b',
    },
  });
} catch (error) {
  if (!(error instanceof ConflictError)) throw error; // 409: the feed exists already, reuse it
}

await new sandbox.SandboxApi(config).simulateBulkFeedFile({
  type: 'VCF',
  networkReference,
  cardCount: 5, // the same sandbox cards every call
  newCardCount: 2, // cards this subaccount has not seen
  transactionsPerCard: 3,
});
```

## Clear test data in the sandbox

`SandboxApi` also has the sandbox-only deletes, for clearing test data between runs: `deleteSubaccount`
(the subaccount and everything under it: bank links, card subscriptions, cards, transactions, bulk feeds and
webhooks), `deleteCardSubscription` and `deleteNetworkBulkFeed`. They cannot be undone. Each answers when the
delete has finished, `204`, or throws `InternalServerError` (`502`) when a step failed; calling it again after
a failure is safe, because finished steps are skipped. The SDK never retries them itself, since a second call
while the first is still running is not safe; the one exception is a `401`, which means the token was refused and
the delete never ran, so it is sent once more with a new token. The SDK waits up to 5 minutes for the answer
(`sandbox.SANDBOX_DELETE_TIMEOUT_MS`, or your `timeoutMs` when it is longer or `0`). Two other limits can end
the wait first: Node's built-in `fetch` waits at most 300 seconds for the response headers (a longer wait needs a
`fetchApi` with its own undici dispatcher), and the sandbox API's gateway answers `504` after 29 seconds while a
longer delete keeps running (the SDK's wait cannot extend that). After a `504`, read the resource (`getSubaccount`,
`getCardSubscription`, `getNetworkBulkFeed`) every few seconds: `404` (`NotFoundError`) means the delete finished. A
delete runs for at most about 5 minutes, so if the resource still answers after 6 minutes, the first delete stopped
part-way and calling it again is safe (finished steps are skipped).
Production has no delete calls, and these throw `SandboxOnlyError` outside the sandbox.

```ts
import { sandbox } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

await new sandbox.SandboxApi(config).deleteSubaccount({ subaccountId: '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b' });
```

## Reading transaction times

A transaction message's `dateTime` is a `TransactionDateTime`, because what it holds depends on the card network:

- Visa and Amex send UTC (`...Z`): an exact moment. `offsetMinutes` is `0` and `toDate()` returns it.
- Mastercard sends the merchant's local date and time with no offset: the wall-clock time where the card was
  used. Astrada does not receive that merchant's time zone, so it is not an exact moment: `offsetMinutes` is
  `null` and `toDate()` returns `null`. Show the local parts as they are, or use `toDateAtOffset(minutes)` if
  you know the merchant's offset. A `Date` would silently read it in your server's zone.
- Some messages carry an end-of-day value rather than the moment they happened: Visa clearings (`FINL_ADVC`,
  `FINL_REQU`) the settlement date at `23:59:59Z`, Visa reversals (`AUTH_ADVC` with a negative amount)
  `23:59:59Z` on the day Astrada received them, Amex clearings the business date at `23:59:59Z`. Use the
  transaction's `transactionOccurrenceDate` for the purchase date.
- For other networks (such as `OPEN_BANKING`) the definition does not say which zone applies: with an offset the
  value is exact, without one it is a wall time of unknown zone.

To order messages across networks, use `createdDateTime` (when Astrada recorded the message, UTC). `raw` and
`JSON.stringify` give back exactly what the API sent. Transaction webhooks carry the transaction's messages under
`_embedded.messages`, each with the same `TransactionDateTime`.

```ts
import { TransactionMessagesApi } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const message = await new TransactionMessagesApi(config).getTransactionMessage({
  transactionMessageId: '3f2b8c1e-6a4d-4e2f-9b7a-1c5d8e9f0a2b',
});
const when = message.dateTime;
console.log(when.hasOffset ? when.toDate()!.toISOString() : `${when.raw} (local time, no zone: the merchant's for Mastercard)`);
console.log('recorded', message.createdDateTime.toISOString());
```

## Receive webhooks

Astrada signs every webhook delivery. Check the signature on the raw body, before parsing it, with the
webhook's secret (returned once when the webhook is created). `constructWebhookEvent` checks it and returns a
typed event; `verifyWebhook` does the same check and returns the parsed body as it is.

```ts
import { createServer } from 'node:http';
import { constructWebhookEvent, WebhookPayloadError, WebhookVerificationError } from '@astrada.co/ts-astrada-sdk';

const secret = process.env.ASTRADA_WEBHOOK_SECRET!;
// After this many unreadable deliveries of one event, answer 2xx and rely on the stored copy.
const MAX_UNREADABLE_DELIVERIES = 3;

// Replace with your own store (a table keyed by the delivery id). It must save the delivery and
// return how many times that id has been saved, counting this one. Until you replace it, it throws,
// so the handler answers 500 and Astrada delivers the event again.
async function storeUnreadable(delivery: { id: string; type: string | null; timestamp: number; body: Buffer; verifiedAt: Date }): Promise<number> {
  throw new Error(`storeUnreadable is not set up (delivery ${delivery.id})`);
}

createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  try {
    // Read the body inside the try: a client that disconnects mid-body must not crash the process.
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const event = constructWebhookEvent(Buffer.concat(chunks), req.headers, secret);
    switch (event.type) {
      case 'transaction.created':
      case 'transaction.updated':
        console.log(event.type, event.data.id, event.data.status);
        break;
      case 'transactionmessage.created':
        console.log('message', event.data.id, event.data.messageType);
        break;
      default:
        console.log('other event', event.type, event.id);
    }
    // Record event.id as handled in your store here, so a replay or a repeated delivery can skip it.
    res.writeHead(204).end();
  } catch (error) {
    if (error instanceof WebhookPayloadError) {
      // Signed by Astrada (the check passed), but not the shape this SDK knows for its type, often
      // because the SDK is older than the event. Store it first; answer 2xx only once it is stored.
      const header = (name: string) => String(req.headers[`webhook-${name}`] ?? req.headers[`svix-${name}`]);
      try {
        const failures = await storeUnreadable({
          id: header('id'),
          type: (req.headers['webhook-event-type'] as string | undefined) ?? null, // null: no type header
          timestamp: Number(header('timestamp')),
          body: Buffer.concat(chunks),
          verifiedAt: new Date(),
        });
        console.error('unreadable webhook stored', header('id'), failures);
        res.writeHead(failures >= MAX_UNREADABLE_DELIVERIES ? 204 : 500).end();
      } catch (storeError) {
        console.error('unreadable webhook not stored', header('id'), storeError);
        res.writeHead(500).end(); // not stored: Astrada must deliver it again
      }
      return;
    }
    if (error instanceof WebhookVerificationError) {
      res.writeHead(400).end(); // not from Astrada, or too old: refuse it
      return;
    }
    console.error(error);
    res.writeHead(500).end();
  }
}).listen(3000);
```

Answer `400` only when the check fails (`WebhookVerificationError`). A `WebhookPayloadError` means the delivery is
signed but this SDK cannot read it: store it, then answer `500` so Astrada delivers it again, and answer `2xx`
once it is stored and has failed `MAX_UNREADABLE_DELIVERIES` times (3 here; choose your own). The stored copy is
how you recover the event: after updating the SDK, read each stored delivery with
`parseStoredWebhookEvent({ body, type, id, timestamp })`. That function checks no signature (the delivery's age
limit would refuse a stored one anyway), so give it only deliveries you stored after the check passed, and keep
the time of that check with them. A row stored without a type (the delivery had no `webhook-event-type` header)
cannot be replayed this way: read its body yourself.
Replay with care: skip a stored delivery whose id you already handled, because a retry can succeed once the SDK
is updated. The stored body is a snapshot: for a transaction, apply it only if its `data.updatedAt` is newer than
your copy's; for other resources, fetch the current state first. (`event.timestamp` is when the delivery was
sent, so a late retry carries a newer one; do not compare it.) Mark the stored row as handled, or delete it, once
it is done.

Deliveries are retried, so the same event can arrive more than once: `event.id` stays the same across retries.
The signature covers the id, timestamp and body but not the `webhook-event-type` header that `event.type` comes
from, so treat `type` as a routing hint and rely on `data`.
`transactionmessage.created`, `transaction.created` and `transaction.updated` carry the generated model as
`data` (dates parsed; a transaction message's `dateTime` is a `TransactionDateTime`, see "Reading transaction
times"); other event types carry the parsed JSON. The payloads of every event type are on the
[Event Types](https://docs.astrada.co/reference/event-types) page.

## Pagination

`paginate(method, params)` calls a list method page by page and yields each item; `listAll` collects them
into an array. It reads the next page from the response (`_links.next`, or `pagination.cursor` on the Banking
API), so it works for cursor and offset lists alike. Other parameters, such as filters and `limit`, are sent
with every page.

```ts
import { TransactionsApi, listAll, paginate } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const transactions = new TransactionsApi(config);

const recent = await listAll(
  (params) => transactions.listTransactions(params),
  { subaccountId: '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b', limit: 100 },
  { maxItems: 500 },
);
console.log(recent.length);

for await (const transaction of paginate((params) => transactions.listTransactions(params))) {
  if (transaction.status === 'SETTLED') break; // stops fetching pages
}
```

## Errors

An answer outside 2xx throws a `ResponseError` with the API's error body already read: `status`, `title`,
`detail`, `code` (a stable name on some refusals, such as `CARD_ENROLLMENT_OFF`) and `errors` (the fields that
failed validation). The message reads like `409 Conflict (CARD_ENROLLMENT_OFF): ...`. Each common status has
its own subclass, and the Banking API throws the same classes.

| Status | Class |
|---|---|
| 400, 422 | `ValidationError` |
| 401 | `AuthenticationError` (also when the login itself is refused) |
| 403 | `PermissionDeniedError` |
| 404 | `NotFoundError` |
| 409 | `ConflictError` |
| 429 | `RateLimitError` (`retryAfterMs` when the API sent `Retry-After`) |
| 500 and above | `InternalServerError` |

No answer at all throws a `FetchError` (DNS, TLS, connection reset), or `TimeoutError`, a `FetchError`, when no
answer came within the timeout. A sandbox simulation outside the sandbox throws `SandboxOnlyError` before any
request.

```ts
import {
  ConflictError,
  EnrollmentLinksApi,
  FetchError,
  NotFoundError,
  ResponseError,
  ValidationError,
} from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

try {
  await new EnrollmentLinksApi(config).createEnrollmentLink({
    enrollmentLinkCreateParams: { subaccountId: '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b', kind: 'team' },
  });
} catch (error) {
  if (error instanceof ConflictError && error.code === 'CARD_ENROLLMENT_OFF') {
    console.log('Turn card enrollment on for this subaccount first');
  } else if (error instanceof NotFoundError) {
    console.log('No such subaccount:', error.detail);
  } else if (error instanceof ValidationError) {
    for (const problem of error.errors) console.log(problem.instance, problem.detail);
  } else if (error instanceof ResponseError) {
    console.log(error.status, error.code, error.detail);
  } else if (error instanceof FetchError) {
    console.log('The API could not be reached:', error.message);
  } else {
    throw error;
  }
}
```

## Retries and timeouts

Each request waits up to 30 seconds for an answer, then throws `TimeoutError`. Network errors, timeouts and
`408`, `429`, `500`, `502`, `503` and `504` answers are retried up to 2 times with exponential backoff and
jitter (from 0.5 seconds, at most 8), waiting as long as a `Retry-After` header asks when there is one (up to
60 seconds; a longer wait throws instead). A timeout or a dropped connection while the body is being read counts
the same as one before the answer, since the SDK reads each body whole before returning. Only requests that are
safe to send twice are retried: `GET`, `PUT`, `DELETE` (except the sandbox deletes) and the login. `POST` and `PATCH` are never retried, because the first attempt may have taken effect.
A `401` is retried once with a new token, in case the cached one was revoked. Your `signal` covers the call, not
the login it may wait for, which has its own timeout and retries. Redirects are followed for API calls (fetch drops
the `Authorization` header when one goes to another origin) but never for the login, which would send the client
secret. A login the API refuses (`400`, `401`, `403`, `404`) throws `AuthenticationError` and is never
retried; a login answered `408`, `429`, `500`, `502`, `503` or `504` is retried like other calls, then throws the usual typed error. The timeout covers reading the whole body, and so does your own `signal`. A retried
`DELETE` can answer `404` when the first attempt worked but its answer was lost: treat that `404` as done. When
an error answer arrives but its body cannot be read, the error keeps its status (a `ConflictError` stays a
`ConflictError`) and has no body.

```ts
import { Configuration, SubaccountsApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'production',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
  timeoutMs: 10_000, // 0 turns the timeout off
  maxRetries: 4, // 0 turns retries off
  retryDelayMs: 250, // first backoff delay
});

// A signal of your own still works, per call:
const page = await new SubaccountsApi(config).listSubaccounts({}, { signal: AbortSignal.timeout(2_000) });
console.log(page._embedded.subaccounts.length);
```

## Banking API

The Banking API (bank links, bank accounts, bank transactions and their matches to card transactions) is
under the `banking` namespace and takes the same `Configuration`.

```ts
import { banking, paginate } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const bankLinks = new banking.BankLinksApi(config);
for await (const link of paginate((params) => bankLinks.listBankLinks(params), { limit: 50 })) {
  console.log(link.id, link.state);
}
```

## Operations that need banking:admin

Some Banking API operations need the `banking:admin` scope. They are in the SDK because the API definition
has them, and their reference pages and TypeDoc entries start with "Needs banking:admin". A `403` from one of
them throws `ScopeRequiredError`, which names the scope. The likely cause is that your API client does not have
the scope (ask Astrada to enable it if you need one of these operations), but as with any `403` the resource may
also not be your account's. It is also a `PermissionDeniedError` and a `ResponseError`.

```ts
import { ScopeRequiredError, banking } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

try {
  await new banking.BankLinksApi(config).syncBankLink({
    bankLinkId: '3f8c2a1e-7b4d-4e9a-9c6f-1d2e3f4a5b6c',
    bankLinkSyncParams: {},
  });
} catch (error) {
  if (error instanceof ScopeRequiredError) {
    console.log(error.requiredScope, error.message); // banking:admin, and how to get it enabled
  } else {
    throw error;
  }
}
```

## Middleware

`withPreMiddleware`, `withPostMiddleware` and `withMiddleware` return a copy of an API class that runs your
functions around each attempt, for logging or tracing. The SDK reads each body whole before your post middleware
runs, so the `response` it gets is complete, and a failure while reading the body reaches your `onError`.

```ts
import { CardApi } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const cards = new CardApi(config).withPostMiddleware(async ({ url, init, response }) => {
  console.log(init.method, url, response.status);
});
const page = await cards.listCards({ limit: 5 });
console.log(page._embedded.cards.length);
```

## Calling an endpoint the SDK doesn't wrap

If the API has an endpoint this version of the SDK has no method for, call it with `RequestApi.send`. It uses the
same configuration as the generated classes, so it logs in, picks the environment, applies the timeout and throws
the same typed errors (`NotFoundError`, `ValidationError` and so on). It retries a GET, PUT or DELETE on the same
rules as the rest of the SDK, and never sends a POST or PATCH twice (except once more after a `401`, with a new
token, as every call does). Every sandbox-only operation (listed from the sandbox API definition when the SDK is
built, such as `DELETE /subaccounts/{id}`) and any `/simulate` path get the same sandbox check as the `sandbox`
module, and the sandbox-only deletes are never retried. The path is normalised once (`.` and `..` resolved,
repeated slashes dropped; a raw `?`, `#`, `\`, space or control character, or an encoded `/`, `\`, `.`, `?`, `#`
or control character, refused), and the checks run on the path that is sent. It returns the parsed JSON body; it
reads JSON only.

```ts
import { RequestApi } from '@astrada.co/ts-astrada-sdk';
import { config } from './astrada.js';

const raw = new RequestApi(config);
const page = await raw.send<{ _embedded: { cards: unknown[] } }>('GET', '/cards', { query: { limit: 5 } });
console.log(page?._embedded.cards.length);
```

## Testing your integration

`@astrada.co/ts-astrada-sdk/testing` has a fake `fetch` that answers every operation (main, Banking and sandbox)
with the example from the API definition, and the login with a fake token. It is regenerated with the SDK, so it
follows the API. Give an operation your own answer by its method name; `calls` records every request.

```ts
import { Configuration, NotFoundError, SubaccountsApi } from '@astrada.co/ts-astrada-sdk';
import { createMockFetch } from '@astrada.co/ts-astrada-sdk/testing';

const fetchApi = createMockFetch({
  overrides: {
    getSubaccount: ({ params }) => ({
      status: 404,
      body: { title: 'Not Found', detail: `No subaccount ${params.subaccountId}` },
    }),
  },
});
const config = new Configuration({
  environment: 'sandbox',
  accountId: 'test-account',
  clientId: 'test-client',
  clientSecret: 'test-secret',
  fetchApi,
});
const subaccounts = new SubaccountsApi(config);

const page = await subaccounts.listSubaccounts(); // the definition's example
console.log(page._embedded.subaccounts[0].name);

await subaccounts.getSubaccount({ subaccountId: '81e7c267-0927-4234-a2bd-78cef799de54' }).catch((error) => {
  console.log(error instanceof NotFoundError, error.detail);
});
console.log(fetchApi.calls.map((call) => call.operationId)); // [ 'login', 'listSubaccounts', 'getSubaccount' ]
```

An answer without `status` gets the operation's own status (such as `201`). When your `basePath` has a path,
pass it too: `createMockFetch({ basePath })`.

To test against an HTTP server instead, run the published API definition under
[Prism](https://github.com/stoplightio/prism), an open-source mock server. It answers from the same examples
and checks your requests against the definition (a request it refuses throws `ValidationError`). Prism does not
serve the login, so give the client a token of your own:

```bash
npx @stoplight/prism-cli mock https://docs.astrada.co/openapi/astrada-api.json
```

```ts
import { Configuration, SubaccountsApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  basePath: 'http://127.0.0.1:4010', // Prism's default address
  accessToken: 'any-token', // no login against the mock
});
const page = await new SubaccountsApi(config).listSubaccounts({ limit: 5 });
console.log(page._embedded.subaccounts.length);
```

The Banking API definition is at `https://docs.astrada.co/openapi/astrada-banking.json`.

## Reference

Every API class and model has a page in [docs/](docs) with an example, and the TypeDoc reference is at
[fidellimited.github.io/astrada-typescript](https://fidellimited.github.io/astrada-typescript/). The SDK is
generated from the Astrada API definition and follows its releases; new endpoints and fields arrive in minor
versions.

| Class | Method | HTTP request | Description |
|---|---|---|---|
| BinLookupApi | [lookupBin](docs/BinLookupApi.md#lookupbin) | `GET /bin-lookup` | Lookup card information by BIN |
| CardApi | [getCard](docs/CardApi.md#getcard) | `GET /cards/{cardId}` | Retrieve card |
| CardApi | [getCardholder](docs/CardApi.md#getcardholder) | `GET /cards/{cardId}/cardholder` | Retrieve cardholder information |
| CardApi | [listCards](docs/CardApi.md#listcards) | `GET /cards` | List cards |
| CardApi | [updateCardholder](docs/CardApi.md#updatecardholder) | `PATCH /cards/{cardId}/cardholder` | Update cardholder information |
| CardSubscriptionApi | [getCardSubscription](docs/CardSubscriptionApi.md#getcardsubscription) | `GET /card-subscriptions/{subscriptionId}` | Retrieve card subscription |
| CardSubscriptionApi | [listCardSubscriptions](docs/CardSubscriptionApi.md#listcardsubscriptions) | `GET /card-subscriptions` | List card subscriptions |
| CardSubscriptionApi | [updateCardSubscription](docs/CardSubscriptionApi.md#updatecardsubscription) | `PATCH /card-subscriptions/{subscriptionId}` | Update card subscription |
| CardVerificationApi | [getCardVerification](docs/CardVerificationApi.md#getcardverification) | `GET /card-verifications/3ds/{verificationId}` | Retrieve 3DS verification |
| CardVerificationApi | [listCardVerifications](docs/CardVerificationApi.md#listcardverifications) | `GET /card-verifications/3ds` | List a card\'s 3DS verifications |
| CardVerificationApi | [unlockCardVerificationAttempts](docs/CardVerificationApi.md#unlockcardverificationattempts) | `POST /card-verifications/unlock` | Unlock a card\'s verification attempt lockout |
| EnrollmentLinksApi | [createEnrollmentLink](docs/EnrollmentLinksApi.md#createenrollmentlink) | `POST /enrollment-links` | Create enrollment link |
| EnrollmentLinksApi | [createTeamLink](docs/EnrollmentLinksApi.md#createteamlink) | `POST /subaccounts/{subaccountId}/team-link` | Create team link |
| EnrollmentLinksApi | [getEnrollmentLink](docs/EnrollmentLinksApi.md#getenrollmentlink) | `GET /enrollment-links/{linkId}` | Retrieve enrollment link |
| EnrollmentLinksApi | [listEnrollmentLinks](docs/EnrollmentLinksApi.md#listenrollmentlinks) | `GET /enrollment-links` | List enrollment links |
| EnrollmentLinksApi | [revokeEnrollmentLink](docs/EnrollmentLinksApi.md#revokeenrollmentlink) | `POST /enrollment-links/{linkId}/revoke` | Revoke enrollment link |
| EnrollmentMethodsApi | [getEnrollmentMethods](docs/EnrollmentMethodsApi.md#getenrollmentmethods) | `POST /enrollment-methods` | List the available enrollment methods given a card BIN |
| NetworkBulkEnrollmentsApi | [createNetworkBulkConfirmation](docs/NetworkBulkEnrollmentsApi.md#createnetworkbulkconfirmation) | `POST /network-bulk-confirmations` | Create network bulk confirmation |
| NetworkBulkEnrollmentsApi | [createNetworkBulkEnrollment](docs/NetworkBulkEnrollmentsApi.md#createnetworkbulkenrollment) | `POST /network-bulk-enrollments` | Create network bulk enrollment |
| NetworkBulkEnrollmentsApi | [getNetworkBulkEnrollment](docs/NetworkBulkEnrollmentsApi.md#getnetworkbulkenrollment) | `GET /network-bulk-enrollments/{networkBulkEnrollmentId}` | Retrieve a network bulk enrollment |
| NetworkBulkEnrollmentsApi | [getOpenNetworkBulkEnrollment](docs/NetworkBulkEnrollmentsApi.md#getopennetworkbulkenrollment) | `GET /network-bulk-enrollments/open` | Check for an open network bulk enrollment |
| NetworkBulkFeedsApi | [createNetworkBulkFeed](docs/NetworkBulkFeedsApi.md#createnetworkbulkfeed) | `POST /network-bulk-feeds` | Create network bulk feed |
| NetworkBulkFeedsApi | [getNetworkBulkFeed](docs/NetworkBulkFeedsApi.md#getnetworkbulkfeed) | `GET /network-bulk-feeds/{networkBulkFeedId}` | Retrieve a network bulk feed |
| NetworkBulkFeedsApi | [listNetworkBulkFeeds](docs/NetworkBulkFeedsApi.md#listnetworkbulkfeeds) | `GET /network-bulk-feeds` | List network bulk feed |
| NetworkBulkFeedsApi | [updateNetworkBulkFeed](docs/NetworkBulkFeedsApi.md#updatenetworkbulkfeed) | `PATCH /network-bulk-feeds/{networkBulkFeedId}` | Update a network bulk feed |
| SubaccountsApi | [createSubaccount](docs/SubaccountsApi.md#createsubaccount) | `POST /subaccounts` | Create subaccount |
| SubaccountsApi | [getSubaccount](docs/SubaccountsApi.md#getsubaccount) | `GET /subaccounts/{subaccountId}` | Retrieve subaccount |
| SubaccountsApi | [listSubaccounts](docs/SubaccountsApi.md#listsubaccounts) | `GET /subaccounts` | List subaccounts |
| SubaccountsApi | [updateSubaccount](docs/SubaccountsApi.md#updatesubaccount) | `PATCH /subaccounts/{subaccountId}` | Update subaccount configurations |
| TransactionMessagesApi | [getRawTransactionMessage](docs/TransactionMessagesApi.md#getrawtransactionmessage) | `GET /transaction-messages/{transactionMessageId}/raw` | Retrieve the raw transaction message |
| TransactionMessagesApi | [getTransactionMessage](docs/TransactionMessagesApi.md#gettransactionmessage) | `GET /transaction-messages/{transactionMessageId}` | Retrieve transaction message |
| TransactionsApi | [getTransaction](docs/TransactionsApi.md#gettransaction) | `GET /transactions/{transactionId}` | Retrieve transaction |
| TransactionsApi | [listTransactions](docs/TransactionsApi.md#listtransactions) | `GET /transactions` | List transactions |
| WebhooksApi | [createWebhook](docs/WebhooksApi.md#createwebhook) | `POST /webhooks` | Create webhook |
| WebhooksApi | [deleteWebhook](docs/WebhooksApi.md#deletewebhook) | `DELETE /webhooks/{webhookId}` | Delete webhook |
| WebhooksApi | [getWebhook](docs/WebhooksApi.md#getwebhook) | `GET /webhooks/{webhookId}` | Retrieve webhook |
| WebhooksApi | [listWebhooks](docs/WebhooksApi.md#listwebhooks) | `GET /webhooks` | List webhooks |
| WebhooksApi | [updateWebhook](docs/WebhooksApi.md#updatewebhook) | `PATCH /webhooks/{webhookId}` | Update webhook |


Banking API pages are in [docs/banking](docs/banking). The sandbox simulations are in
[docs/sandbox/SandboxSimulationApi.md](docs/sandbox/SandboxSimulationApi.md) and the sandbox deletes in
[SubaccountsApi](docs/sandbox/SubaccountsApi.md), [CardSubscriptionApi](docs/sandbox/CardSubscriptionApi.md) and
[NetworkBulkFeedsApi](docs/sandbox/NetworkBulkFeedsApi.md) under docs/sandbox. Models:
[AmexCountriesOrWildcard](docs/AmexCountriesOrWildcard.md) · [BankLinkingPolicy](docs/BankLinkingPolicy.md) · [BinLookup](docs/BinLookup.md) · [BinLookupValidationProblem](docs/BinLookupValidationProblem.md) · [BinLookupValidationProblemItem](docs/BinLookupValidationProblemItem.md) · [BinLookupWarning](docs/BinLookupWarning.md) · [Card](docs/Card.md) · [CardEmbedded](docs/CardEmbedded.md) · [CardLinks](docs/CardLinks.md) · [CardList](docs/CardList.md) · [CardListEmbedded](docs/CardListEmbedded.md) · [CardSubscription](docs/CardSubscription.md) · [CardSubscriptionDeactivationReason](docs/CardSubscriptionDeactivationReason.md) · [CardSubscriptionEmbedded](docs/CardSubscriptionEmbedded.md) · [CardSubscriptionLinks](docs/CardSubscriptionLinks.md) · [CardSubscriptionList](docs/CardSubscriptionList.md) · [CardSubscriptionListEmbedded](docs/CardSubscriptionListEmbedded.md) · [CardSubscriptionUpdateParams](docs/CardSubscriptionUpdateParams.md) · [CardVerification](docs/CardVerification.md) · [CardVerificationLinks](docs/CardVerificationLinks.md) · [CardVerificationList](docs/CardVerificationList.md) · [CardVerificationListEmbedded](docs/CardVerificationListEmbedded.md) · [CardVerificationUnlockParams](docs/CardVerificationUnlockParams.md) · [CardVerificationUnlockResult](docs/CardVerificationUnlockResult.md) · [Cardholder](docs/Cardholder.md) · [CardholderCorporate](docs/CardholderCorporate.md) · [CardholderCorporateLegalEntity](docs/CardholderCorporateLegalEntity.md) · [CardholderUpdateParams](docs/CardholderUpdateParams.md) · [CardholderUpdateParamsCorporate](docs/CardholderUpdateParamsCorporate.md) · [Conflict](docs/Conflict.md) · [ConsentPolicy](docs/ConsentPolicy.md) · [CreateSubaccountConfigurations](docs/CreateSubaccountConfigurations.md) · [CreateSubaccountConfigurationsAMEX](docs/CreateSubaccountConfigurationsAMEX.md) · [CreateSubaccountConfigurationsAMEXBulkEnrollment](docs/CreateSubaccountConfigurationsAMEXBulkEnrollment.md) · [CreateSubaccountConfigurationsAMEXSingleEnrollment](docs/CreateSubaccountConfigurationsAMEXSingleEnrollment.md) · [CreateSubaccountConfigurationsMASTERCARD](docs/CreateSubaccountConfigurationsMASTERCARD.md) · [CreateSubaccountConfigurationsMASTERCARDBulkEnrollment](docs/CreateSubaccountConfigurationsMASTERCARDBulkEnrollment.md) · [CreateSubaccountConfigurationsMASTERCARDSingleEnrollment](docs/CreateSubaccountConfigurationsMASTERCARDSingleEnrollment.md) · [CreateSubaccountConfigurationsVISA](docs/CreateSubaccountConfigurationsVISA.md) · [CreateSubaccountConfigurationsVISABulkEnrollment](docs/CreateSubaccountConfigurationsVISABulkEnrollment.md) · [CreateSubaccountConfigurationsVISASingleEnrollment](docs/CreateSubaccountConfigurationsVISASingleEnrollment.md) · [CustomerEnrollmentPolicy](docs/CustomerEnrollmentPolicy.md) · [EnrollmentLink](docs/EnrollmentLink.md) · [EnrollmentLinkConflictProblem](docs/EnrollmentLinkConflictProblem.md) · [EnrollmentLinkCreateParams](docs/EnrollmentLinkCreateParams.md) · [EnrollmentLinkCreateResult](docs/EnrollmentLinkCreateResult.md) · [EnrollmentLinkCreateValidationProblem](docs/EnrollmentLinkCreateValidationProblem.md) · [EnrollmentLinkCreatedBy](docs/EnrollmentLinkCreatedBy.md) · [EnrollmentLinkDetail](docs/EnrollmentLinkDetail.md) · [EnrollmentLinkForbiddenProblem](docs/EnrollmentLinkForbiddenProblem.md) · [EnrollmentLinkList](docs/EnrollmentLinkList.md) · [EnrollmentLinkListEmbedded](docs/EnrollmentLinkListEmbedded.md) · [EnrollmentLinkListValidationProblem](docs/EnrollmentLinkListValidationProblem.md) · [EnrollmentLinkNotFoundProblem](docs/EnrollmentLinkNotFoundProblem.md) · [EnrollmentLinkRateLimitedProblem](docs/EnrollmentLinkRateLimitedProblem.md) · [EnrollmentLinkSession](docs/EnrollmentLinkSession.md) · [EnrollmentLinkSessionOutcome](docs/EnrollmentLinkSessionOutcome.md) · [EnrollmentLinkSubaccountNotFoundProblem](docs/EnrollmentLinkSubaccountNotFoundProblem.md) · [EnrollmentMethodsParams](docs/EnrollmentMethodsParams.md) · [EnrollmentMethodsResult](docs/EnrollmentMethodsResult.md) · [EnrollmentMethodsResultBinInfo](docs/EnrollmentMethodsResultBinInfo.md) · [EnrollmentMethodsResultSingleDecision](docs/EnrollmentMethodsResultSingleDecision.md) · [EnrollmentPolicy](docs/EnrollmentPolicy.md) · [FailureReason](docs/FailureReason.md) · [FailureReasonAcsReferences](docs/FailureReasonAcsReferences.md) · [Link](docs/Link.md) · [MastercardCountriesOrWildcard](docs/MastercardCountriesOrWildcard.md) · [NetworkBlockedCardRule](docs/NetworkBlockedCardRule.md) · [NetworkBulkBankContact](docs/NetworkBulkBankContact.md) · [NetworkBulkBankContactParams](docs/NetworkBulkBankContactParams.md) · [NetworkBulkCompanyParams](docs/NetworkBulkCompanyParams.md) · [NetworkBulkConfirmation](docs/NetworkBulkConfirmation.md) · [NetworkBulkConfirmationBinInfo](docs/NetworkBulkConfirmationBinInfo.md) · [NetworkBulkConfirmationCardAdmin](docs/NetworkBulkConfirmationCardAdmin.md) · [NetworkBulkConfirmationCompany](docs/NetworkBulkConfirmationCompany.md) · [NetworkBulkConfirmationCreateParams](docs/NetworkBulkConfirmationCreateParams.md) · [NetworkBulkConfirmationCreateParamsBinInfo](docs/NetworkBulkConfirmationCreateParamsBinInfo.md) · [NetworkBulkConfirmationCreateParamsCardAdmin](docs/NetworkBulkConfirmationCreateParamsCardAdmin.md) · [NetworkBulkConfirmationCreateResult](docs/NetworkBulkConfirmationCreateResult.md) · [NetworkBulkConfirmationSummary](docs/NetworkBulkConfirmationSummary.md) · [NetworkBulkEnrollment](docs/NetworkBulkEnrollment.md) · [NetworkBulkEnrollmentBinInfo](docs/NetworkBulkEnrollmentBinInfo.md) · [NetworkBulkEnrollmentCardAdmin](docs/NetworkBulkEnrollmentCardAdmin.md) · [NetworkBulkEnrollmentCompany](docs/NetworkBulkEnrollmentCompany.md) · [NetworkBulkEnrollmentConsent](docs/NetworkBulkEnrollmentConsent.md) · [NetworkBulkEnrollmentCreateParams](docs/NetworkBulkEnrollmentCreateParams.md) · [NetworkBulkEnrollmentCreateParamsBinInfo](docs/NetworkBulkEnrollmentCreateParamsBinInfo.md) · [NetworkBulkEnrollmentCreateParamsCardAdmin](docs/NetworkBulkEnrollmentCreateParamsCardAdmin.md) · [NetworkBulkEnrollmentCreateParamsConsent](docs/NetworkBulkEnrollmentCreateParamsConsent.md) · [NetworkBulkEnrollmentCreateResult](docs/NetworkBulkEnrollmentCreateResult.md) · [NetworkBulkEnrollmentLinks](docs/NetworkBulkEnrollmentLinks.md) · [NetworkBulkEnrollmentOpen](docs/NetworkBulkEnrollmentOpen.md) · [NetworkBulkEnrollmentSummary](docs/NetworkBulkEnrollmentSummary.md) · [NetworkBulkEnrollmentSummaryLinks](docs/NetworkBulkEnrollmentSummaryLinks.md) · [NetworkBulkFeedCreateAmex](docs/NetworkBulkFeedCreateAmex.md) · [NetworkBulkFeedCreateCommon](docs/NetworkBulkFeedCreateCommon.md) · [NetworkBulkFeedCreateMastercard](docs/NetworkBulkFeedCreateMastercard.md) · [NetworkBulkFeedCreateParams](docs/NetworkBulkFeedCreateParams.md) · [NetworkBulkFeedCreateVisa](docs/NetworkBulkFeedCreateVisa.md) · [NetworkBulkFeedList](docs/NetworkBulkFeedList.md) · [NetworkBulkFeedListEmbedded](docs/NetworkBulkFeedListEmbedded.md) · [NetworkBulkFeedUpdateParams](docs/NetworkBulkFeedUpdateParams.md) · [NetworkBulkFeeds](docs/NetworkBulkFeeds.md) · [OffsetPageLinks](docs/OffsetPageLinks.md) · [PageLinks](docs/PageLinks.md) · [PlaidEndCustomer](docs/PlaidEndCustomer.md) · [Problem](docs/Problem.md) · [RawTransactionMessage](docs/RawTransactionMessage.md) · [RawTransactionMessageLinks](docs/RawTransactionMessageLinks.md) · [SelfLinks](docs/SelfLinks.md) · [Subaccount](docs/Subaccount.md) · [SubaccountAmexProduct](docs/SubaccountAmexProduct.md) · [SubaccountAmexProductClearing](docs/SubaccountAmexProductClearing.md) · [SubaccountAmexProductRealTimeAuth](docs/SubaccountAmexProductRealTimeAuth.md) · [SubaccountConfiguration](docs/SubaccountConfiguration.md) · [SubaccountConfigurationAMEX](docs/SubaccountConfigurationAMEX.md) · [SubaccountConfigurationAMEXBulkEnrollment](docs/SubaccountConfigurationAMEXBulkEnrollment.md) · [SubaccountConfigurationAMEXSingleEnrollment](docs/SubaccountConfigurationAMEXSingleEnrollment.md) · [SubaccountConfigurationMASTERCARD](docs/SubaccountConfigurationMASTERCARD.md) · [SubaccountConfigurationMASTERCARDBulkEnrollment](docs/SubaccountConfigurationMASTERCARDBulkEnrollment.md) · [SubaccountConfigurationMASTERCARDSingleEnrollment](docs/SubaccountConfigurationMASTERCARDSingleEnrollment.md) · [SubaccountConfigurationVISA](docs/SubaccountConfigurationVISA.md) · [SubaccountConfigurationVISABulkEnrollment](docs/SubaccountConfigurationVISABulkEnrollment.md) · [SubaccountConfigurationVISASingleEnrollment](docs/SubaccountConfigurationVISASingleEnrollment.md) · [SubaccountCreateParams](docs/SubaccountCreateParams.md) · [SubaccountEnrollmentPolicy](docs/SubaccountEnrollmentPolicy.md) · [SubaccountLinks](docs/SubaccountLinks.md) · [SubaccountList](docs/SubaccountList.md) · [SubaccountListEmbedded](docs/SubaccountListEmbedded.md) · [SubaccountNetworkBlockedCardsValue](docs/SubaccountNetworkBlockedCardsValue.md) · [SubaccountUpdateParams](docs/SubaccountUpdateParams.md) · [SubaccountUpdateResult](docs/SubaccountUpdateResult.md) · [TeamLink](docs/TeamLink.md) · [Transaction](docs/Transaction.md) · [TransactionAcceptor](docs/TransactionAcceptor.md) · [TransactionEmbedded](docs/TransactionEmbedded.md) · [TransactionLinks](docs/TransactionLinks.md) · [TransactionList](docs/TransactionList.md) · [TransactionListEmbedded](docs/TransactionListEmbedded.md) · [TransactionMessage](docs/TransactionMessage.md) · [TransactionMessageAcceptor](docs/TransactionMessageAcceptor.md) · [TransactionMessageBankData](docs/TransactionMessageBankData.md) · [TransactionMessageBankDataPersonalFinanceCategory](docs/TransactionMessageBankDataPersonalFinanceCategory.md) · [TransactionMessageLinks](docs/TransactionMessageLinks.md) · [UnprocessableEntity](docs/UnprocessableEntity.md) · [ValidationProblem](docs/ValidationProblem.md) · [ValidationProblemItem](docs/ValidationProblemItem.md) · [VerificationPolicy](docs/VerificationPolicy.md) · [VisaCountriesOrWildcard](docs/VisaCountriesOrWildcard.md) · [Webhook](docs/Webhook.md) · [WebhookCreateParams](docs/WebhookCreateParams.md) · [WebhookCreateResult](docs/WebhookCreateResult.md) · [WebhookList](docs/WebhookList.md) · [WebhookListEmbedded](docs/WebhookListEmbedded.md) · [WebhookListLinks](docs/WebhookListLinks.md) · [WebhookUpdateParams](docs/WebhookUpdateParams.md)

## Support

Questions and problems: [support@astrada.co](mailto:support@astrada.co), or open an issue on
[GitHub](https://github.com/FidelLimited/astrada-typescript/issues).

## License

MIT, see [LICENSE](LICENSE).
