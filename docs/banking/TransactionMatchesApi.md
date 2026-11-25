# TransactionMatchesApi (Banking API)

Exported under the `banking` namespace: `new banking.TransactionMatchesApi(config)`. It takes the same
`Configuration` as the main API, so both share one login.

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getTransactionMatch**](#gettransactionmatch) | **GET** /transaction-matches/{subaccountId}/{transactionMatchId} | Retrieve transaction match |
| [**listTransactionMatches**](#listtransactionmatches) | **GET** /transaction-matches/{subaccountId} | List transaction matches |


<a id="gettransactionmatch"></a>
## getTransactionMatch

`getTransactionMatch(params): Promise<TransactionMatch>`

Retrieve transaction match

Returns detailed information about a specific transaction match, including the confidence level, numeric score, and a breakdown of the scoring factors.

### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.TransactionMatchesApi(config);

const result = await api.getTransactionMatch({
  subaccountId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
  transactionMatchId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, required)
- **transactionMatchId** (`string`, required)

### Returns

[TransactionMatch](TransactionMatch.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/transaction-matches/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e"
    },
    "cardTransaction": {
      "href": "/transaction-messages/a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d"
    },
    "bankTransaction": {
      "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c"
    },
    "card": {
      "href": "/cards/5dec2c49-0aa5-4683-a317-427eb5d115f3"
    }
  },
  "id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "cardTransactionId": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
  "bankTransactionId": "7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c",
  "confidence": "HIGH",
  "score": 0.85,
  "cardTransaction": {
    "cardId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
    "date": "2025-10-15",
    "amount": 42.5,
    "currency": "USD",
    "descriptor": "UBER TRIP"
  },
  "bankTransaction": {
    "date": "2025-10-15",
    "amount": 42.5,
    "currency": "USD",
    "description": "UBER TRIP",
    "merchantName": "Uber"
  },
  "reasons": [
    {
      "type": "Amount",
      "score": 1,
      "cardValue": "42.50",
      "bankValue": "42.50",
      "diff": 0,
      "message": "Exact amount match ($42.50)"
    },
    {
      "type": "Date",
      "score": 0.9,
      "cardValue": "2025-10-15",
      "bankValue": "2025-10-15",
      "diff": 0,
      "message": "Transaction dates within 1 day"
    },
    {
      "type": "Merchant",
      "score": 0.85,
      "cardValue": "UBER TRIP",
      "bankValue": "Uber",
      "diff": 0,
      "message": "Merchant name contains match (Uber)"
    }
  ],
  "createdAt": "2025-10-15T14:31:00.000Z"
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

<a id="listtransactionmatches"></a>
## listTransactionMatches

`listTransactionMatches(params): Promise<TransactionMatchList>`

List transaction matches

Returns a list of transaction matches for a subaccount. Each match represents a link between a bank transaction and a card transaction, along with a confidence score and the reasoning behind the match.

By default, matches are filtered to `MEDIUM` confidence and above. Use the `minConfidence` parameter to adjust the threshold.

By default, `GET /transaction-matches/{subaccountId}` returns matches ordered by the latest `createdAt`.

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
const api = new banking.TransactionMatchesApi(config);

const result = await api.listTransactionMatches({
  subaccountId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
  // bankAccountId: '2b9c1e77-5a3d-4c8b-9f21-6d0e4a7b8c90',
  // cardId: '8164683a-8d23-4421-9694-1a81fc9b9c37',
  // bankTransactionId: '7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c',
  // cardTransactionId: 'a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d',
  // minConfidence: 'HIGH',
  // startDate: new Date('2025-10-01'),
  // endDate: new Date('2025-10-31'),
  // limit: 250,
  // cursor: 'ZXhhbXBsZQ==',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, required)
- **bankAccountId** (`string`, optional): Filter to subscriptions whose card materialized from this bank account (bank-derived subscriptions).
- **cardId** (`string`, optional)
- **bankTransactionId** (`string`, optional): Filter by bank transaction identifier
- **cardTransactionId** (`string`, optional): Filter by card transaction identifier
- **minConfidence** (`'HIGH' | 'MEDIUM' | 'LOW'`, optional): Filter transaction matches by minimum confidence level. Defaults to `MEDIUM`, which returns HIGH and MEDIUM matches. One of: `HIGH`, `MEDIUM`, `LOW`.
- **startDate** (`Date`, optional): Filter results from this date (inclusive), in YYYY-MM-DD format
- **endDate** (`Date`, optional): Filter results up to this date (inclusive), in YYYY-MM-DD format
- **limit** (`number`, optional): Maximum number of items to return
- **cursor** (`string`, optional): The cursor to use for pagination. Identifies your place on the list

### Returns

[TransactionMatchList](TransactionMatchList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "items": [
    {
      "_links": {
        "self": {
          "href": "/transaction-matches/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e"
        },
        "cardTransaction": {
          "href": "/transactions/a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d"
        },
        "bankTransaction": {
          "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c"
        }
      },
      "id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "cardTransactionId": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
      "bankTransactionId": "7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c",
      "confidence": "HIGH",
      "score": 0.85,
      "cardTransaction": {
        "date": "2025-10-15",
        "amount": 42.5,
        "currency": "USD",
        "descriptor": "UBER TRIP"
      },
      "bankTransaction": {
        "date": "2025-10-15",
        "amount": 42.5,
        "currency": "USD",
        "description": "UBER TRIP",
        "merchantName": "Uber"
      },
      "reasons": [
        {
          "type": "Amount",
          "score": 1,
          "cardValue": "42.50",
          "bankValue": "42.50",
          "diff": 0,
          "message": "Exact amount match ($42.50)"
        },
        {
          "type": "Date",
          "score": 0.9,
          "cardValue": "2025-10-15",
          "bankValue": "2025-10-15",
          "diff": 0,
          "message": "Transaction dates within 1 day"
        },
        {
          "type": "Merchant",
          "score": 0.85,
          "cardValue": "UBER TRIP",
          "bankValue": "Uber",
          "diff": 0,
          "message": "Merchant name contains match (Uber)"
        }
      ],
      "createdAt": "2025-10-15T14:31:00.000Z"
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
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token does not hold the `banking:read` scope this route needs. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

