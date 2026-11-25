# BankSubscriptionsApi (Banking API)

Exported under the `banking` namespace: `new banking.BankSubscriptionsApi(config)`. It takes the same
`Configuration` as the main API, so both share one login.

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getBankSubscription**](#getbanksubscription) | **GET** /bank-subscriptions/{bankSubscriptionId} | Needs banking:admin. Retrieve bank subscription |
| [**getBankSubscriptionByConnection**](#getbanksubscriptionbyconnection) | **GET** /bank-subscriptions/by-connection/{connectionId} | Needs banking:admin. Retrieve bank subscription by connection |
| [**listBankSubscriptions**](#listbanksubscriptions) | **GET** /bank-subscriptions | Needs banking:admin. List bank subscriptions |


<a id="getbanksubscription"></a>
## getBankSubscription (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`getBankSubscription(params): Promise<BankSubscription>`

Retrieve bank subscription

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Returns detailed information about a specific bank subscription by its identifier, including the connection state and webhook configuration.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankSubscriptionsApi(config);

const result = await api.getBankSubscription({
  bankSubscriptionId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
});
console.log(result);
```

### Parameters


- **bankSubscriptionId** (`string`, required)

### Returns

[BankSubscription](BankSubscription.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "id": "e4b7c9a2-1d3f-4e8a-9c6b-5f2d7a0e8b1c",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "connectionId": "conn_abc123def456",
  "provider": "PLAID",
  "institutionName": "Chase",
  "state": "active",
  "webhook": {
    "url": "https://example.com/webhooks/banking",
    "status": "confirmed"
  },
  "syncCursor": null,
  "createdAt": "2025-10-03T10:55:42.000Z",
  "updatedAt": "2025-10-03T10:55:42.000Z"
}
```

### Scopes

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **404** | The resource was not found for this account. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="getbanksubscriptionbyconnection"></a>
## getBankSubscriptionByConnection (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`getBankSubscriptionByConnection(params): Promise<BankSubscription>`

Retrieve bank subscription by connection

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Returns a bank subscription by its provider connection identifier (e.g. Plaid item ID).

This is useful when you have the provider's connection ID and need to look up the corresponding subscription.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankSubscriptionsApi(config);

const result = await api.getBankSubscriptionByConnection({
  connectionId: 'conn_abc123def456',
});
console.log(result);
```

### Parameters


- **connectionId** (`string`, required)

### Returns

[BankSubscription](BankSubscription.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "id": "e4b7c9a2-1d3f-4e8a-9c6b-5f2d7a0e8b1c",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "connectionId": "conn_abc123def456",
  "provider": "PLAID",
  "institutionName": "Chase",
  "state": "active",
  "webhook": {
    "url": "https://example.com/webhooks/banking",
    "status": "confirmed"
  },
  "syncCursor": null,
  "createdAt": "2025-10-03T10:55:42.000Z",
  "updatedAt": "2025-10-03T10:55:42.000Z"
}
```

### Scopes

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **404** | The resource was not found for this account. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="listbanksubscriptions"></a>
## listBankSubscriptions (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`listBankSubscriptions(params): Promise<BankSubscriptionList>`

List bank subscriptions

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Returns a list of bank subscriptions (active connections to financial institutions) under the account.

Bank subscriptions are created automatically when a bank link enrollment is completed. Each subscription represents a connection to a single financial institution.

By default, `GET /bank-subscriptions` returns subscriptions ordered by the latest `createdAt`.

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
const api = new banking.BankSubscriptionsApi(config);

const result = await api.listBankSubscriptions({
  // subaccountId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // state: 'active',
  // limit: 250,
  // cursor: 'ZXhhbXBsZQ==',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, optional)
- **state** (`'active' | 'error' | 'auth_required' | 'disconnected'`, optional): Filter subscriptions by state One of: `active`, `error`, `auth_required`, `disconnected`.
- **connectionId** (`string`, optional): Filter subscriptions by provider connection identifier
- **limit** (`number`, optional): Maximum number of items to return
- **cursor** (`string`, optional): The cursor to use for pagination. Identifies your place on the list

### Returns

[BankSubscriptionList](BankSubscriptionList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "items": [
    {
      "id": "e4b7c9a2-1d3f-4e8a-9c6b-5f2d7a0e8b1c",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "connectionId": "conn_abc123def456",
      "provider": "PLAID",
      "institutionName": "Chase",
      "state": "active",
      "webhook": {
        "url": "https://example.com/webhooks/banking",
        "status": "confirmed"
      },
      "syncCursor": null,
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

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

