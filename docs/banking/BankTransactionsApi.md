# BankTransactionsApi (Banking API)

Exported under the `banking` namespace: `new banking.BankTransactionsApi(config)`. It takes the same
`Configuration` as the main API, so both share one login.

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getBankTransaction**](#getbanktransaction) | **GET** /bank-transactions/{subaccountId}/{transactionId} | Retrieve bank transaction |
| [**listBankTransactions**](#listbanktransactions) | **GET** /bank-transactions/{subaccountId} | List bank transactions |
| [**triggerBankTransactionWebhooks**](#triggerbanktransactionwebhooks) | **POST** /bank-transactions/{subaccountId}/webhooks | Needs banking:admin. Trigger bank transaction webhooks |


<a id="getbanktransaction"></a>
## getBankTransaction

`getBankTransaction(params): Promise<BankTransaction>`

Retrieve bank transaction

Returns detailed information about a specific bank transaction by its identifier, including match status and transaction metadata.

### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankTransactionsApi(config);

const result = await api.getBankTransaction({
  subaccountId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
  transactionId: '9340721f-bdce-4afa-bd9d-26cceb9d2176',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, required)
- **transactionId** (`string`, required)

### Returns

[BankTransaction](BankTransaction.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c"
    },
    "bankAccount": {
      "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
    },
    "card": {
      "href": "/cards/5dec2c49-0aa5-4683-a317-427eb5d115f3"
    },
    "match": {
      "href": "/transaction-matches/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e"
    }
  },
  "id": "7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "bankAccountId": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "cardId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
  "matchId": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
  "date": "2025-10-15",
  "amount": 42.5,
  "currency": "USD",
  "description": "UBER TRIP",
  "merchantName": "Uber",
  "category": [
    "Travel"
  ],
  "transactionType": "debit",
  "source": "PLAID",
  "status": "early_cleared",
  "settlement": {
    "state": "early_cleared",
    "emissionType": "early_clearing",
    "emittedAt": "2025-10-15T15:00:00.000Z",
    "supersededAt": null
  },
  "createdAt": "2025-10-15T14:30:00.000Z"
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

<a id="listbanktransactions"></a>
## listBankTransactions

`listBankTransactions(params): Promise<BankTransactionList>`

List bank transactions

Returns a list of bank transactions for a subaccount. Bank transactions are synced from connected financial institutions. A movement may briefly appear as its pending posting until the posted transaction replaces it (the pending row is then removed from the feed).

By default, `GET /bank-transactions/{subaccountId}` returns transactions ordered by the latest `date`.

This endpoint supports cursor-based pagination and various filters including date range, amount range, and match status.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankTransactionsApi(config);

const result = await api.listBankTransactions({
  subaccountId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
  // bankAccountId: '2b9c1e77-5a3d-4c8b-9f21-6d0e4a7b8c90',
  // cardId: '8164683a-8d23-4421-9694-1a81fc9b9c37',
  // startDate: new Date('2025-10-01'),
  // endDate: new Date('2025-10-31'),
  // minAmount: 10,
  // maxAmount: 500,
  // transactionType: 'debit',
  // matched: 'true',
  // source: 'PLAID',
  // limit: 250,
  // cursor: 'ZXhhbXBsZQ==',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, required)
- **bankAccountId** (`string`, optional): Filter to subscriptions whose card materialized from this bank account (bank-derived subscriptions).
- **cardId** (`string`, optional)
- **startDate** (`Date`, optional): Filter results from this date (inclusive), in YYYY-MM-DD format
- **endDate** (`Date`, optional): Filter results up to this date (inclusive), in YYYY-MM-DD format
- **minAmount** (`number`, optional): Filter transactions with an amount greater than or equal to this value
- **maxAmount** (`number`, optional): Filter transactions with an amount less than or equal to this value
- **transactionType** (`'debit' | 'credit'`, optional): Filter bank transactions by transaction type One of: `debit`, `credit`.
- **matched** (`'true' | 'false'`, optional): Filter bank transactions by match status. Set to `true` to return only matched transactions, or `false` for unmatched. One of: `true`, `false`.
- **source** (`'PLAID' | 'UPLOAD' | 'MASTERCARD_US' | 'MASTERCARD_EU'`, optional): Filter transactions by source. One of: `PLAID`, `UPLOAD`, `MASTERCARD_US`, `MASTERCARD_EU`.
- **limit** (`number`, optional): Maximum number of items to return
- **cursor** (`string`, optional): The cursor to use for pagination. Identifies your place on the list

### Returns

[BankTransactionList](BankTransactionList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "items": [
    {
      "_links": {
        "self": {
          "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c"
        },
        "bankAccount": {
          "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
        },
        "card": {
          "href": "/cards/5dec2c49-0aa5-4683-a317-427eb5d115f3"
        },
        "match": {
          "href": "/transaction-matches/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e"
        }
      },
      "id": "7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "bankAccountId": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
      "cardId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
      "matchId": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
      "date": "2025-10-15",
      "amount": 42.5,
      "currency": "USD",
      "description": "UBER TRIP",
      "merchantName": "Uber",
      "category": [
        "Travel"
      ],
      "transactionType": "debit",
      "source": "PLAID",
      "status": "matched",
      "settlement": null,
      "createdAt": "2025-10-15T14:30:00.000Z"
    },
    {
      "_links": {
        "self": {
          "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/2e5f8a1b-4c7d-3e9f-b0a2-8d6c4f1e7b3a"
        },
        "bankAccount": {
          "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
        }
      },
      "id": "2e5f8a1b-4c7d-3e9f-b0a2-8d6c4f1e7b3a",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "bankAccountId": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
      "cardId": null,
      "matchId": null,
      "date": "2025-10-14",
      "amount": 156.23,
      "currency": "USD",
      "description": "AMAZON MARKETPLACE",
      "merchantName": "Amazon",
      "category": [
        "Shopping"
      ],
      "transactionType": "debit",
      "source": "PLAID",
      "status": "posted",
      "settlement": null,
      "createdAt": "2025-10-14T09:15:00.000Z"
    }
  ],
  "pagination": {
    "cursor": "ZXhhbXBsZQ==",
    "hasMore": true
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

<a id="triggerbanktransactionwebhooks"></a>
## triggerBankTransactionWebhooks (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`triggerBankTransactionWebhooks(params): Promise<BankTransactionWebhooksResult>`

Trigger bank transaction webhooks

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Manually triggers webhook delivery for specified bank transactions. This can be used to re-emit webhooks that may have been missed or to force re-matching of transactions.

You can specify which webhook event types to emit: `banktransaction.created` for transaction data or `transaction.match.created` for match results.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankTransactionsApi(config);

const result = await api.triggerBankTransactionWebhooks({
  subaccountId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
  bankTransactionWebhooksParams: banking.BankTransactionWebhooksParamsFromJSON({
  "ids": [
    "7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c"
  ],
  "webhooks": [
    "banktransaction.created",
    "transaction.match.created"
  ],
  "forceRematch": false
}),
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, required)
- **bankTransactionWebhooksParams** ([BankTransactionWebhooksParams](BankTransactionWebhooksParams.md), required)

### Returns

[BankTransactionWebhooksResult](BankTransactionWebhooksResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "message": "Processed 1 transactions",
  "emitted": 2,
  "resent": 0,
  "matched": 1,
  "skipped": 0,
  "failed": []
}
```

### Scopes

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Webhooks triggered |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

