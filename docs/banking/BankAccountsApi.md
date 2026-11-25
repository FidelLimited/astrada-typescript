# BankAccountsApi (Banking API)

Exported under the `banking` namespace: `new banking.BankAccountsApi(config)`. It takes the same
`Configuration` as the main API, so both share one login.

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**backfillBankAccount**](#backfillbankaccount) | **POST** /bank-accounts/{bankAccountId}/backfill | Needs banking:admin. Backfill bank account history |
| [**deleteBankAccount**](#deletebankaccount) | **DELETE** /bank-accounts/{bankAccountId} | Needs banking:admin. Delete bank account |
| [**getBankAccount**](#getbankaccount) | **GET** /bank-accounts/{bankAccountId} | Retrieve bank account |
| [**linkEnrolledCards**](#linkenrolledcards) | **POST** /bank-accounts/link-enrolled-cards | Link enrolled cards to bank accounts (admin backfill) |
| [**listBankAccounts**](#listbankaccounts) | **GET** /bank-accounts | List bank accounts |
| [**refreshBankAccount**](#refreshbankaccount) | **POST** /bank-accounts/{bankAccountId}/refresh | Refresh bank account |
| [**refreshBankAccountTransactions**](#refreshbankaccounttransactions) | **POST** /bank-accounts/{bankAccountId}/transactions/refresh | Needs banking:admin. Refresh transactions |
| [**runBankAccountMaintenance**](#runbankaccountmaintenance) | **POST** /bank-accounts/maintenance | Needs banking:admin. Bank account maintenance for a subaccount |
| [**updateBankAccount**](#updatebankaccount) | **PATCH** /bank-accounts/{bankAccountId} | Update bank account |


<a id="backfillbankaccount"></a>
## backfillBankAccount (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`backfillBankAccount(params): Promise<BankAccountBackfillResult>`

Backfill bank account history

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Imports historical bank transactions for this account from the provider over a date range, then runs matching against the account's full current card set. Unlike the `backfill` object on `PATCH /bank-accounts/{bankAccountId}` (which imports history for cards being added in that same request), this endpoint recovers a date window without touching card links. Each imported bank transaction sends `banktransaction.created` and each new match `transaction.match.created`.

Requires a backing connection. Starting a backfill while another sync already holds the account's connection returns `409 Conflict`; retry shortly.

For Mastercard accounts at US banks (`provider: mastercard`, `countryCode: USA`), `loadHistoric: true` additionally asks the provider to generate deep history (up to 2 years) for this account before the import runs. This is a billable provider operation and generation is asynchronous on the provider side: if the immediate import returns few rows, re-run the same window without the flag once generation completes (typically within minutes). Providers without a deep-history operation reject the flag with `400 Bad Request`.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankAccountsApi(config);

const result = await api.backfillBankAccount({
  bankAccountId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  bankAccountBackfillParams: banking.BankAccountBackfillParamsFromJSON({
  "startDate": "2026-06-13",
  "endDate": "2026-06-27"
}),
});
console.log(result);
```

### Parameters


- **bankAccountId** (`string`, required)
- **bankAccountBackfillParams** ([BankAccountBackfillParams](BankAccountBackfillParams.md), required)

### Returns

[BankAccountBackfillResult](BankAccountBackfillResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "transactionsProcessed": 118,
  "matchesFound": 27
}
```

### Scopes

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **201** | Backfill completed |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **404** | The resource was not found for this account. |
| **409** | The resource is not in a state that allows this request. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="deletebankaccount"></a>
## deleteBankAccount (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`deleteBankAccount(params): Promise<void>`

Delete bank account

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Deletes a bank account and all associated bank transactions, transaction matches, and card links.

Cards are not deleted. A `bank-feed` subscription created from this account is deactivated; a card enrolled by its number only loses its bank account. The account sends `bankaccount.state_changed` with reason `deleted`.

**Note:** This action is irreversible. Deleting the last account of a bank connection also removes the connection at the bank.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankAccountsApi(config);

await api.deleteBankAccount({
  bankAccountId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
});
```

### Parameters


- **bankAccountId** (`string`, required)

### Returns

Nothing (an empty response).

### Scopes

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **204** | Bank account deleted |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **404** | The resource was not found for this account. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="getbankaccount"></a>
## getBankAccount

`getBankAccount(params): Promise<BankAccount>`

Retrieve bank account

Returns detailed information about a specific bank account by its identifier.

### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankAccountsApi(config);

const result = await api.getBankAccount({
  bankAccountId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
});
console.log(result);
```

### Parameters


- **bankAccountId** (`string`, required)

### Returns

[BankAccount](BankAccount.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
    },
    "transactions": {
      "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11?bankAccountId=3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
    },
    "bankLink": {
      "href": "/bank-links/enrollment_792dcb7d"
    }
  },
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "bankLinkId": "enrollment_792dcb7d",
  "externalId": "plaid_acc_792dcb7d",
  "cardIds": [
    "5dec2c49-0aa5-4683-a317-427eb5d115f3"
  ],
  "cards": [],
  "institutionName": "Chase",
  "name": "Checking",
  "mask": "1234",
  "type": "checking",
  "currency": "USD",
  "state": "active",
  "subscriptionState": "active",
  "lastSyncedAt": "2025-10-03T11:12:07.000Z",
  "createdAt": "2025-10-03T10:55:42.000Z",
  "updatedAt": "2025-10-03T10:55:42.000Z"
}
```

### Scopes

`banking:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token does not hold the `banking:read` scope this route needs. |
| **404** | The resource was not found for this account. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="linkenrolledcards"></a>
## linkEnrolledCards

`linkEnrolledCards(params): Promise<BankAccountLinkCardsResult>`

Link enrolled cards to bank accounts (admin backfill)

Admin backfill/retry for immediate mask-linking: matches the subaccount's ENROLLED cards against its credit bank accounts by mask (an enrolled card's last 4 digits) and links each exact match. The same exactly-one-or-skip rules as completion-time linking apply: a mask matching multiple cards, or multiple accounts claiming a mask, links nothing (the scheduled mask sweep retries this every few hours). Idempotent: already-linked pairs are skipped. Intended for onboarding backfills (cards enrolled before the bank link) and recovery after a transient directory failure at completion. Emits no webhook; linked cardIds appear on subsequent bank-account reads.

The body takes `subaccountId` only; any other field is a `400`. The admin actions (minting cards for cardless accounts, the cardholder backfill) are on `POST /bank-accounts/maintenance` at `banking:admin`.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankAccountsApi(config);

const result = await api.linkEnrolledCards({
  bankAccountLinkCardsParams: banking.BankAccountLinkCardsParamsFromJSON({
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5"
}),
});
console.log(result);
```

### Parameters


- **bankAccountLinkCardsParams** ([BankAccountLinkCardsParams](BankAccountLinkCardsParams.md), required)

### Returns

[BankAccountLinkCardsResult](BankAccountLinkCardsResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "linked": {
    "059d5e6a-cfb1-46e6-ab84-6586582b6b58": [
      "da28e1b8-c7a4-4575-b72f-3a88d6fe34df"
    ]
  }
}
```

### Scopes

`banking:write`

### Responses

| Status | Description |
|--------|-------------|
| **201** | Backfill executed. Maps each bank account that gained links to the card ids linked in this run (empty object when nothing matched). |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token does not hold the `banking:write` scope this route needs. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="listbankaccounts"></a>
## listBankAccounts

`listBankAccounts(params): Promise<BankAccountList>`

List bank accounts

Returns a list of bank accounts under the account. Bank accounts are created automatically when a bank link enrollment is completed.

By default, `GET /bank-accounts` returns bank accounts ordered by the latest `createdAt`.

This endpoint supports cursor-based pagination.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankAccountsApi(config);

const result = await api.listBankAccounts({
  // subaccountId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // state: 'active',
  // cardId: '8164683a-8d23-4421-9694-1a81fc9b9c37',
  // limit: 250,
  // cursor: 'ZXhhbXBsZQ==',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, optional)
- **state** (`'active' | 'auth_required' | 'disconnected'`, optional): Filter bank accounts by state One of: `active`, `auth_required`, `disconnected`.
- **cardId** (`string`, optional)
- **limit** (`number`, optional): Maximum number of items to return
- **cursor** (`string`, optional): The cursor to use for pagination. Identifies your place on the list

### Returns

[BankAccountList](BankAccountList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "items": [
    {
      "_links": {
        "self": {
          "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
        },
        "transactions": {
          "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11?bankAccountId=3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
        },
        "bankLink": {
          "href": "/bank-links/enrollment_792dcb7d"
        }
      },
      "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "bankLinkId": "enrollment_792dcb7d",
      "externalId": "plaid_acc_792dcb7d",
      "cardIds": [
        "5dec2c49-0aa5-4683-a317-427eb5d115f3"
      ],
      "cards": [],
      "institutionName": "Chase",
      "name": "Checking",
      "mask": "1234",
      "type": "checking",
      "currency": "USD",
      "state": "active",
      "subscriptionState": "active",
      "lastSyncedAt": "2025-10-03T11:12:07.000Z",
      "createdAt": "2025-10-03T10:55:42.000Z",
      "updatedAt": "2025-10-03T10:55:42.000Z"
    },
    {
      "_links": {
        "self": {
          "href": "/bank-accounts/9b7e4d2f-8a3c-1e6f-d5b0-2c4a6e8f0d1b"
        },
        "transactions": {
          "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11?bankAccountId=9b7e4d2f-8a3c-1e6f-d5b0-2c4a6e8f0d1b"
        },
        "bankLink": {
          "href": "/bank-links/enrollment_792dcb7d"
        }
      },
      "id": "9b7e4d2f-8a3c-1e6f-d5b0-2c4a6e8f0d1b",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "bankLinkId": "enrollment_792dcb7d",
      "externalId": "plaid_acc_792dcb7e",
      "cardIds": [],
      "cards": [],
      "institutionName": "Chase",
      "name": "Savings",
      "mask": "5678",
      "type": "checking",
      "currency": "USD",
      "state": "active",
      "subscriptionState": "active",
      "lastSyncedAt": "2025-10-03T11:12:07.000Z",
      "createdAt": "2025-10-03T10:55:42.000Z",
      "updatedAt": "2025-10-03T10:55:42.000Z"
    }
  ],
  "pagination": {
    "hasMore": false
  }
}
```

### Scopes

`banking:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token does not hold the `banking:read` scope this route needs. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="refreshbankaccount"></a>
## refreshBankAccount

`refreshBankAccount(params): Promise<BankAccountRefreshResult>`

Refresh bank account

Creates a new hosted link URL for the user to re-authenticate an account in `auth_required`. Any other state answers `400`. To ask the bank for new transactions, use `POST /bank-accounts/{bankAccountId}/transactions/refresh`.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankAccountsApi(config);

const result = await api.refreshBankAccount({
  bankAccountId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
});
console.log(result);
```

### Parameters


- **bankAccountId** (`string`, required)

### Returns

[BankAccountRefreshResult](BankAccountRefreshResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "hostedLink": "https://hosted.plaid.com/link/refresh123",
  "expiresAt": "2025-10-03T14:55:42.000Z"
}
```

### Scopes

`banking:write`

### Responses

| Status | Description |
|--------|-------------|
| **201** | Refresh triggered |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token does not hold the `banking:write` scope this route needs. |
| **404** | The resource was not found for this account. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="refreshbankaccounttransactions"></a>
## refreshBankAccountTransactions (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`refreshBankAccountTransactions(params): Promise<BankAccountTransactionsRefreshResult>`

Refresh transactions

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Asks the data provider to check this account's institution **now**, instead of waiting for its own schedule (typically one to four checks a day). The call returns once the check has run, usually within seconds but occasionally 30 seconds or more. It imports nothing itself: anything the check finds arrives through the normal update path within moments.

**Billable per successful call.** Use it at moments that matter, not on a timer. Returns `400 Bad Request` when the account has no backing connection, or when its provider or institution doesn't support an on-demand refresh (e.g. some card issuers), and `502 Bad Gateway` when the provider's check fails.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankAccountsApi(config);

const result = await api.refreshBankAccountTransactions({
  bankAccountId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
});
console.log(result);
```

### Parameters


- **bankAccountId** (`string`, required)

### Returns

[BankAccountTransactionsRefreshResult](BankAccountTransactionsRefreshResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "requestedAt": "2026-10-05T00:59:10Z",
  "durationMs": 4210
}
```

### Scopes

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **202** | The provider has run its check of the institution. `durationMs` is how long that check took, not an import; any changes it found arrive through the normal update path. |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **404** | The resource was not found for this account. |
| **500** | The service failed while handling the request. |
| **502** | The bank data provider failed to complete the request. Try again later. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="runbankaccountmaintenance"></a>
## runBankAccountMaintenance (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`runBankAccountMaintenance(params): Promise<BankAccountMaintenanceResult>`

Bank account maintenance for a subaccount

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Admin maintenance over one subaccount. It first runs the same mask pass as `POST /bank-accounts/link-enrolled-cards`, then each action the request asks for. The actions create cards on the cards platform or rewrite stored rows, so this route needs `banking:admin`, while the mask pass alone stays on `link-enrolled-cards` at `banking:write`. The caller's account comes from its token: it can run maintenance on any subaccount of its own account, and a subaccount of another account simply matches nothing (an empty result, not a `403`).

Three optional actions, each off by default:

- `mint: true` runs the completion-time mint pass over the subaccount's credit bank accounts that a completed link left without a card (the same-last-4 American Express case), so each gains a bank-feed card. Idempotent: an account that already holds a minted card is skipped.
- `backfillJunctionLast4: true` fills, for the subaccount's card links, the last 4 each link answers to where it is still unknown, from the cards directory. Idempotent.
- `createCardholderCards: true` runs, now and for this subaccount only, what a scheduled job does every 30 minutes: it gives each cardholder behind a pooled American Express billing account (a supplementary card that is not its own Plaid account) a bank-feed card of their own, with the cardholder's name, so their transactions can be emitted on that card. It does nothing unless Astrada has switched the feature on for the subaccount; the switches are set by Astrada only, from inside the platform, and no request can set them. Idempotent: a cardholder who already has a card is never given another.

The actions run in the order above, after the mask pass. If the cards directory cannot be read, the mask pass links nothing and still returns `201`; each action then reads the directory again on its own and says so in its result (`directoryUnavailable`), or, for `mint` with accounts to screen, fails rather than mint unscreened. Any step that fails returns `400` and runs nothing after it (steps before it have done their work, and every step is idempotent, so the request can simply be repeated). Emits no webhook from banking; a card created here produces the cards platform's usual card-subscription events.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankAccountsApi(config);

const result = await api.runBankAccountMaintenance({
  bankAccountMaintenanceParams: banking.BankAccountMaintenanceParamsFromJSON({
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5"
}),
});
console.log(result);
```

### Parameters


- **bankAccountMaintenanceParams** ([BankAccountMaintenanceParams](BankAccountMaintenanceParams.md), required)

### Returns

[BankAccountMaintenanceResult](BankAccountMaintenanceResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "linked": {
    "059d5e6a-cfb1-46e6-ab84-6586582b6b58": [
      "da28e1b8-c7a4-4575-b72f-3a88d6fe34df"
    ]
  }
}
```

### Scopes

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **201** | Maintenance executed. Maps each bank account that gained links to the card ids linked in this run (empty object when nothing matched). The other fields appear only for the actions the request asked for. |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="updatebankaccount"></a>
## updateBankAccount

`updateBankAccount(params): Promise<BankAccountUpdateResult>`

Update bank account

Updates a bank account. Card links are detected automatically: a scheduled sweep re-checks each cardless credit account every few hours and links an enrolled card whose last 4 digits match the account's mask, without any API call. This endpoint is the manual override: use it to pre-link a card immediately, correct an assignment, or import history.

Each card in `cardIds` must belong to the same subaccount as the bank account. A card can only be linked to one bank account at a time; attempting to link a card that is already associated with another bank account will return a `409 Conflict` error.

A card that cannot take a bank-account link is also rejected with `409 Conflict` before any change is applied: one whose only enrollment is a bulk feed, or whose subscriptions are all in a dead, non-attachable state. The `message` names the card and says whether it is bulk-enrolled or has no live subscription. This body, like the "already linked" `409`, has no `code`. If the cards directory cannot be consulted, this screen is skipped (fail-open) rather than blocking the update.

`cardIds` is a full replacement. Send `cardIds: []` to clear explicit links (the scheduled mask sweep can re-link a matching card on its next run).

Cards Astrada created for the individual cardholders of a pooled American Express billing account are managed by the platform: a `cardIds` list without them does not remove them (they leave when the card is deactivated or the account is disconnected or deleted). An enrolled card that was linked for one such cardholder can be removed here, and stays removed: it is not linked again automatically.

Optionally include a `backfill` object with `startDate` and/or `endDate` to trigger a backfill of historical bank transactions for the specified date range. An automatically detected link re-matches the account's already-synced unmatched transactions around the new card's activity on its own; IMPORTING bank history from before the link (pulling older transactions from the provider) still happens only through this endpoint's `backfill`.

The current card set is always readable at `GET /bank-accounts/{bankAccountId}` (`cardIds`), and `GET /bank-accounts?cardId=` finds the account a card is linked to.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankAccountsApi(config);

const result = await api.updateBankAccount({
  bankAccountId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  bankAccountUpdateParams: banking.BankAccountUpdateParamsFromJSON({
  "cardIds": [
    "5dec2c49-0aa5-4683-a317-427eb5d115f3"
  ]
}),
});
console.log(result);
```

### Parameters


- **bankAccountId** (`string`, required)
- **bankAccountUpdateParams** ([BankAccountUpdateParams](BankAccountUpdateParams.md), required)

### Returns

[BankAccountUpdateResult](BankAccountUpdateResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "cardIds": [
    "5dec2c49-0aa5-4683-a317-427eb5d115f3"
  ],
  "state": "active",
  "updatedAt": "2025-10-03T11:00:00.000Z"
}
```

### Scopes

`banking:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Bank account updated |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token does not hold the `banking:write` scope this route needs. |
| **404** | The resource was not found for this account. |
| **409** | The resource is not in a state that allows this request. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

