# TransactionsApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getTransaction**](#gettransaction) | **GET** /transactions/{transactionId} | Retrieve transaction |
| [**listTransactions**](#listtransactions) | **GET** /transactions | List transactions |


<a id="gettransaction"></a>
## getTransaction

`getTransaction(params): Promise<Transaction>`

Retrieve transaction

Returns a transaction by its unique identifier, including details about the transaction's state and relevant transactional data.

Add `expand` to embed related resources under `_embedded` in the same response, for example
`expand=cardSubscription,card,cardholder`. Each embedded resource is the exact body its own endpoint
serves, shows its current values (not those at the time of the transaction) except
`cardholder.corporate`, which is resolved as of the transaction's date (see the `expand` parameter), and
requires that endpoint's scope: `card-subscriptions:read` for `cardSubscription`, `cards:read` for `card`,
`cardholder:read` for `cardholder`.

For the company and legal entity a card belonged to when the transaction happened, use `expand=cardholder`
and read `cardholder.corporate.id` and `cardholder.corporate.legalEntity`. They are the values in effect on
the transaction's `transactionOccurrenceDate` (through the end of that UTC day), or at the transaction's
`createdAt` when that is null, so a card that later moved to another company or legal entity keeps its
historical attribution on past transactions.
Transactions themselves do not carry a company identifier.


### Example

```ts
import { Configuration, TransactionsApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new TransactionsApi(config);

const result = await api.getTransaction({
  transactionId: '9340721f-bdce-4afa-bd9d-26cceb9d2176',
  // expand: ['cardSubscription'],
});
console.log(result);
```

### Parameters


- **transactionId** (`string`, required)
- **expand** (`Array<'cardSubscription' | 'card' | 'cardholder'>`, optional): Comma-separated list of related resources to embed on the transaction under `_embedded`, so one call
returns the transaction together with its card subscription, card and cardholder instead of follow-up
calls to `GET /card-subscriptions?cardId=`, `GET /cards/{cardId}` and `GET /cards/{cardId}/cardholder`.

- `cardSubscription` embeds the card subscription exactly as `GET /card-subscriptions/{subscriptionId}`
  serves it (without its own `_embedded`) and requires the `card-subscriptions:read` scope.
- `card` embeds the transaction's card exactly as `GET /cards/{cardId}` serves it (without its own
  `_embedded`) and requires the `cards:read` scope.
- `cardholder` embeds the card's cardholder as `GET /cards/{cardId}/cardholder` serves it, with one
  difference: `corporate` is the cardholder's corporate as of the transaction (see below). Requires the
  `cardholder:read` scope.

Each value is checked separately: a request asking to expand a resource its credentials cannot read is
refused with `403`.

The embedded subscription is the card's subscription in the transaction's sub-account: the one from
the transaction's network bulk feed when the transaction has a `networkBulkFeedId`, otherwise the
card's current subscription, otherwise its most recent one.

`cardSubscription` and `card` show their **current** values, not the values they had when the transaction
happened. So does the cardholder, except for `cardholder.corporate`: its `id`, `employeeId`,
`alternativeEmployeeId` and `legalEntity` are the values in effect on the transaction's
`transactionOccurrenceDate` (through the end of that UTC day), or at the transaction's `createdAt` when
`transactionOccurrenceDate` is null. A card that moved to another company or legal entity after the
transaction therefore still shows the one it belonged to at the time. `firstName`, `lastName`, `email`,
`postalCode`, `corporate.networkToken`, `createdAt` and `updatedAt` are the cardholder's current values. Changes
are dated by when Astrada received them from the card network or through the API. For a transaction
dated before Astrada started recording the card's corporate history, the earliest recorded values are
returned instead. Either way, a value that was not set in the values returned is null, or for
`legalEntity` absent.

A key is present only when it was requested and the related resource exists, and it is never null.
A transaction with no card (`cardId` is null, for example a bank-sourced transaction with no linked
card) has no `cardSubscription`, `card` or `cardholder`. A card without cardholder data has no
`cardholder`. A card that `GET /cards/{cardId}` no longer returns (it responds `404`, for example
because all of its card subscriptions were deleted) is not embedded: both `card` and `cardholder` are
absent. `_links` are unchanged. Without `expand`, `_embedded` is absent. Whether `cardholder` is embedded
is decided on the card and cardholder as they are now, not as of the transaction's date.

Send one comma-separated value (`expand=cardSubscription,card,cardholder`). A repeated `expand` key,
an empty value or an unknown value is refused with `400`.
 One of: `cardSubscription`, `card`, `cardholder`.

### Returns

[Transaction](Transaction.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "card": {
      "href": "/cards/4d1ff59f-4286-4209-9662-92e174193562"
    },
    "subaccount": {
      "href": "/subaccounts/c6d5e036-361e-4773-a514-b9496cf2d2b5"
    },
    "self": {
      "href": "/transactions/8697df0c-9011-47ca-a52b-8d2a7a4ad903"
    },
    "messages": [
      {
        "href": "/transaction-messages/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b4"
      },
      {
        "href": "/transaction-messages/934f8701-53e3-4a2b-a000-6bb52195d2ea"
      }
    ]
  },
  "acceptor": {
    "city": "LONDON",
    "country": "GBR",
    "mcc": "5734",
    "state": "LND"
  },
  "cardId": "4d1ff59f-4286-4209-9662-92e174193562",
  "cardholderBillingCurrency": "GBP",
  "cardholderBillingHoldAmount": 0,
  "cardholderBillingSettledAmount": 0.81,
  "createdAt": "2024-05-01T06:41:43.810Z",
  "descriptor": "Uber",
  "id": "8697df0c-9011-47ca-a52b-8d2a7a4ad903",
  "network": "MASTERCARD",
  "status": "SETTLED",
  "subaccountId": "c6d5e036-361e-4773-a514-b9496cf2d2b5",
  "supersededMessageIds": [],
  "transactionCurrency": "USD",
  "transactionHoldAmount": 0,
  "transactionOccurrenceDate": "2024-05-01",
  "transactionSettledAmount": 1,
  "updatedAt": "2024-05-02T08:41:43.810Z"
}
```

### Scopes

`transactions:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Transaction retrieved successfully |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="listtransactions"></a>
## listTransactions

`listTransactions(params): Promise<TransactionList>`

List transactions

Returns a list of all transactions under the account.

By default, `GET /transactions` returns transactions ordered by the latest `createdAt`. You can combine the different filters as documented.

This endpoint supports [cursor-based pagination](https://docs.astrada.co/reference/pagination).

Add `expand` to embed each transaction's related resources under `_embedded` in the same response,
for example `expand=cardSubscription,card,cardholder`. Each embedded resource is the exact body its own
endpoint serves, shows its current values (not those at the time of the transaction) except
`cardholder.corporate`, which is resolved as of the transaction's date (see the `expand` parameter), and
requires that endpoint's scope: `card-subscriptions:read` for `cardSubscription`, `cards:read` for `card`,
`cardholder:read` for `cardholder`. Transactions without a given related resource simply omit that key.
Pagination links preserve `expand`.

For the company and legal entity a card belonged to when the transaction happened, use `expand=cardholder`
and read `cardholder.corporate.id` and `cardholder.corporate.legalEntity`. They are the values in effect on
the transaction's `transactionOccurrenceDate` (through the end of that UTC day), or at the transaction's
`createdAt` when that is null, so a card that later moved to another company or legal entity keeps its
historical attribution on past transactions.
Transactions themselves do not carry a company identifier.

To list the transactions of one company or legal entity, filter with `companyId`, `legalEntityId` or
`legalEntityName`. They match the cardholder's `corporate.id`, `corporate.legalEntity.id` and
`corporate.legalEntity.name` on the transaction date: the values `expand=cardholder` returns on each
transaction, not the cardholder's current ones (see the [Glossary](https://docs.astrada.co/docs/glossary)).
Each is an exact, case-sensitive match, so copy the value from a transaction's `expand=cardholder`.
The filters use the same as-of resolution as `expand=cardholder`, including the earliest recorded values
for a transaction dated before Astrada started recording the card's corporate history. A transaction
whose card has no cardholder data, or whose card `GET /cards/{cardId}` no longer returns, does not match, just
as `expand` embeds no `cardholder` for it.
They combine with each other and with `transactionMessageId`, `cardId`, `subaccountId` and
`networkBulkFeedId`: supplying more than one returns only the transactions matching **all** of them.
The one exception: `cardId` and `networkBulkFeedId` cannot be sent together, and the request answers `400`.
Transactions without a card never match. For example, this returns one legal entity's transactions on
one feed:

`GET /transactions?networkBulkFeedId=<feed>&legalEntityId=<id>`

URL-encode the values. In `legalEntityName` a space is `%20` (or `+`), and a literal `+` is read as a
space, so send a `+` in the name as `%2B`. Send each filter once. Leading and trailing spaces are
ignored. A value that is empty or only spaces, or longer than 255 characters, is refused with `400`.

With any of these filters a page can hold fewer than `limit` transactions, even none, while
`_links.next` is present. Keep following `_links.next` until it is absent.

These three filters read cardholder data, so they need the `cardholder:read` scope, like
`expand=cardholder`. Without it the request returns `403`.


### Example

```ts
import { Configuration, TransactionsApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new TransactionsApi(config);

const result = await api.listTransactions({
  // transactionMessageId: '9a88aa0e-c1d3-4e70-b5e1-45ab64eb5aac',
  // subaccountId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // cursor: 'ZXhhbXBsZQ==',
  // cardId: '8164683a-8d23-4421-9694-1a81fc9b9c37',
  // networkBulkFeedId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // companyId: '10021528',
  // legalEntityId: '1000001',
  // legalEntityName: 'Astrada Life',
  // limit: 25,
  // order: 'asc',
  // expand: ['cardSubscription'],
});
console.log(result);
```

### Parameters


- **transactionMessageId** (`string`, optional)
- **subaccountId** (`string`, optional)
- **cursor** (`string`, optional): The cursor to use for pagination. Identifies your place on the list
- **cardId** (`string`, optional)
- **networkBulkFeedId** (`string`, optional)
- **companyId** (`string`, optional): Only transactions whose card's cardholder had this company ID (`corporate.id`) on the transaction date (the value `expand=cardholder` returns on that transaction; the `expand` parameter defines the date), not the cardholder's current company. Exact, case-sensitive match. Requires the `cardholder:read` scope.

- **legalEntityId** (`string`, optional): Only transactions whose card's cardholder belonged to this legal entity (`corporate.legalEntity.id`) on the transaction date (the value `expand=cardholder` returns on that transaction; the `expand` parameter defines the date), not the legal entity it belongs to now. Exact, case-sensitive match. Requires the `cardholder:read` scope.

- **legalEntityName** (`string`, optional): Only transactions whose card's cardholder belonged to a legal entity with this name (`corporate.legalEntity.name`) on the transaction date (the value `expand=cardholder` returns on that transaction; the `expand` parameter defines the date), not the legal entity it belongs to now. Exact, case-sensitive match. URL-encode the value: a space is `%20` (or `+`), for example `legalEntityName=Astrada%20Life`. A literal `+` is read as a space, so send a `+` in the name as `%2B`. Requires the `cardholder:read` scope.

- **limit** (`number`, optional): Maximum number of items to return
- **order** (`'asc' | 'desc'`, optional) One of: `asc`, `desc`.
- **expand** (`Array<'cardSubscription' | 'card' | 'cardholder'>`, optional): Comma-separated list of related resources to embed on the transaction under `_embedded`, so one call
returns the transaction together with its card subscription, card and cardholder instead of follow-up
calls to `GET /card-subscriptions?cardId=`, `GET /cards/{cardId}` and `GET /cards/{cardId}/cardholder`.

- `cardSubscription` embeds the card subscription exactly as `GET /card-subscriptions/{subscriptionId}`
  serves it (without its own `_embedded`) and requires the `card-subscriptions:read` scope.
- `card` embeds the transaction's card exactly as `GET /cards/{cardId}` serves it (without its own
  `_embedded`) and requires the `cards:read` scope.
- `cardholder` embeds the card's cardholder as `GET /cards/{cardId}/cardholder` serves it, with one
  difference: `corporate` is the cardholder's corporate as of the transaction (see below). Requires the
  `cardholder:read` scope.

Each value is checked separately: a request asking to expand a resource its credentials cannot read is
refused with `403`.

The embedded subscription is the card's subscription in the transaction's sub-account: the one from
the transaction's network bulk feed when the transaction has a `networkBulkFeedId`, otherwise the
card's current subscription, otherwise its most recent one.

`cardSubscription` and `card` show their **current** values, not the values they had when the transaction
happened. So does the cardholder, except for `cardholder.corporate`: its `id`, `employeeId`,
`alternativeEmployeeId` and `legalEntity` are the values in effect on the transaction's
`transactionOccurrenceDate` (through the end of that UTC day), or at the transaction's `createdAt` when
`transactionOccurrenceDate` is null. A card that moved to another company or legal entity after the
transaction therefore still shows the one it belonged to at the time. `firstName`, `lastName`, `email`,
`postalCode`, `corporate.networkToken`, `createdAt` and `updatedAt` are the cardholder's current values. Changes
are dated by when Astrada received them from the card network or through the API. For a transaction
dated before Astrada started recording the card's corporate history, the earliest recorded values are
returned instead. Either way, a value that was not set in the values returned is null, or for
`legalEntity` absent.

A key is present only when it was requested and the related resource exists, and it is never null.
A transaction with no card (`cardId` is null, for example a bank-sourced transaction with no linked
card) has no `cardSubscription`, `card` or `cardholder`. A card without cardholder data has no
`cardholder`. A card that `GET /cards/{cardId}` no longer returns (it responds `404`, for example
because all of its card subscriptions were deleted) is not embedded: both `card` and `cardholder` are
absent. `_links` are unchanged. Without `expand`, `_embedded` is absent. Whether `cardholder` is embedded
is decided on the card and cardholder as they are now, not as of the transaction's date.

Send one comma-separated value (`expand=cardSubscription,card,cardholder`). A repeated `expand` key,
an empty value or an unknown value is refused with `400`.
 One of: `cardSubscription`, `card`, `cardholder`.

### Returns

[TransactionList](TransactionList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/transactions"
    }
  },
  "_embedded": {
    "transactions": [
      {
        "_links": {
          "messages": [
            {
              "href": "/transaction-messages/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b4"
            },
            {
              "href": "/transaction-messages/934f8701-53e3-4a2b-a000-6bb52195d2ea"
            }
          ],
          "card": {
            "href": "/subaccounts/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b6"
          },
          "subaccount": {
            "href": "/subaccounts/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b5"
          },
          "self": {
            "href": "/transactions/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b4"
          }
        },
        "acceptor": {
          "city": "LONDON",
          "country": "GBR",
          "mcc": "5734",
          "state": "LND"
        },
        "cardId": "4d1ff59f-4286-4209-9662-92e174193562",
        "cardholderBillingCurrency": "GBP",
        "cardholderBillingHoldAmount": 0,
        "cardholderBillingSettledAmount": 0.81,
        "createdAt": "2024-05-01T06:41:43.810Z",
        "descriptor": "Uber",
        "id": "8697df0c-9011-47ca-a52b-8d2a7a4ad903",
        "network": "MASTERCARD",
        "networkBulkFeedId": "2fd4d402-b759-479c-87a6-58d85e345356",
        "status": "SETTLED",
        "subaccountId": "c6d5e036-361e-4773-a514-b9496cf2d2b5",
        "supersededMessageIds": [],
        "transactionCurrency": "USD",
        "transactionHoldAmount": 0,
        "transactionOccurrenceDate": "2024-05-01",
        "transactionSettledAmount": 1,
        "transactionType": "DEBIT_01",
        "updatedAt": "2024-05-02T08:41:43.810Z"
      }
    ]
  }
}
```

### Scopes

`transactions:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Transactions retrieved successfully |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

