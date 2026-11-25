# BankLinksApi (Banking API)

Exported under the `banking` namespace: `new banking.BankLinksApi(config)`. It takes the same
`Configuration` as the main API, so both share one login.

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createBankLink**](#createbanklink) | **POST** /bank-links | Create bank link |
| [**deleteBankLink**](#deletebanklink) | **DELETE** /bank-links/{bankLinkId} | Needs banking:admin. Delete bank link |
| [**getBankLink**](#getbanklink) | **GET** /bank-links/{bankLinkId} | Retrieve bank link |
| [**listBankLinks**](#listbanklinks) | **GET** /bank-links | List bank links |
| [**syncBankLink**](#syncbanklink) | **POST** /bank-links/{bankLinkId}/sync | Needs banking:admin. Sync bank link |
| [**updateBankLink**](#updatebanklink) | **PATCH** /bank-links/{bankLinkId} | Complete bank link |


<a id="createbanklink"></a>
## createBankLink

`createBankLink(params): Promise<BankLink>`

Create bank link

Creates a new bank link to initiate a bank enrollment. The response includes a `hostedLink` URL where the user can connect their bank account via Plaid.

The hosted link expires after 4 hours. If the link expires before the user completes enrollment, retrieve the bank link via `GET /bank-links/{bankLinkId}` to get a refreshed URL.

Creating a bank link with an ID that already exists for the account will return a `409 Conflict` error, unless the existing link has expired.

A refused create returns a JSON body with `statusCode` and `message`. These errors also carry a `code`, a stable name to branch on so that you never match on `message` text (the `409` above has no `code`):

- `404` `SUBACCOUNT_NOT_FOUND`: `subaccountId` is not one of the account's subaccounts. Nothing is created. The message is `Subaccount not found for this account`.
- `403` `BANK_ENROLLMENT_DISABLED`: a create is refused when the account has locked bank enrollment (`enrollmentPolicy.bankEnrollmentLocked` is `true` on the subaccount) and the subaccount's `enrollmentPolicy.bankEnrollment` value does not allow a bank link for this card. Otherwise the check does not refuse. Nothing is created. The message is `Bank linking is not enabled for this card on this account`. The body also has a `reason`: `bank-enrollment-off` when the setting is `off`, `network-not-allowed` when it does not allow the card's network, and `network-unknown` when it limits the networks and the request does not show the card's network. The card's network comes from the request: American Express when the link uses the `amex_only` customization, otherwise `bin6` (a first digit of `4` is Visa, `2` or `5` is Mastercard, and any other digit, a `3` included, is unknown). Without `bin6` it is unknown.
- `403` `MASTERCARD_CLIENT_NOT_PROVISIONED` and `PLAID_EC_NOT_PROVISIONED`: the account is not set up for bank linking on that provider yet. The messages are `This account is not set up for Mastercard bank linking yet` and `This account is not set up for Plaid bank linking yet`.
- `403` `PLAID_CUSTOMIZATION_NOT_PROVISIONED`: Plaid refused the Link customization this link asked for, because the account's Plaid client cannot use it, and no fallback applied. Nothing is created. The message is `This account is not fully set up for Plaid bank linking yet`. A customization other than `amex_only` (one set by the bank-linking policy's `plaidLinkCustomizationName`) answers this at once. When Plaid refuses `amex_only`, from `filters.linkCustomizationName` or from the policy, the create is retried once with the environment's pinned customization in its place, or with no customization when the environment pins none. If Plaid accepts the retry, the link is created as usual: its hosted session opens without the `amex_only` customization, and its completion is still held to American Express institutions. For `amex_only`, only a refused retry answers this error. Astrada fixes it in the account's Plaid setup, so sending the same request again does not help.
- `400` `INVALID_LINK_FILTERS`: `filters` asks for more than the account's bank-linking policy allows, or for a customization that is not allowed.
- `400` `PROVIDER_NOT_ENABLED_FOR_ACCOUNT`: `provider` is not enabled for the account.
- `400` `PROVIDER_NOT_SUPPORTED_FOR_COUNTRY`: no provider supports `countryCode` for the chosen `provider`.
- `503` `BANK_FEED_OWNER_NOT_CONFIGURED`: `persona: cardholder` in an environment where cardholder links are not set up yet. Nothing is created; a link without `persona: cardholder` still works. The message is `Cardholder bank linking is not available yet`.

A body that breaks the field formats (for example an empty `accountTypes` or a lower-case `countryCode`) answers `400` with message `Bad Request` and an `errors` list naming each field, and no `code`.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankLinksApi(config);

const result = await api.createBankLink({
  bankLinkCreateParams: banking.BankLinkCreateParamsFromJSON({
  "id": "enrollment_abc123",
  "subaccountId": "50cced63-ee4e-4ff7-a469-aaa989f220f2"
}),
});
console.log(result);
```

### Parameters


- **bankLinkCreateParams** ([BankLinkCreateParams](BankLinkCreateParams.md), required)

### Returns

[BankLink](BankLink.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/bank-links/enrollment_abc123"
    }
  },
  "id": "enrollment_abc123",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "50cced63-ee4e-4ff7-a469-aaa989f220f2",
  "state": "pending",
  "provider": "plaid",
  "hostedLink": "https://hosted.plaid.com/link/abc123",
  "linkExpiresAt": "2025-10-03T14:25:27.000Z",
  "createdAt": "2025-10-03T10:25:27.069Z"
}
```

### Scopes

`banking:write`

### Responses

| Status | Description |
|--------|-------------|
| **201** | Bank link created |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The request was refused for one of two reasons: - The token does not hold the `banking:write` scope. The message names the scope, and there is no `code`. - The account is not set up for this bank link. The answer carries one of the `403` codes in this operation\'s description, and its message names no scope.  |
| **404** | The resource was not found for this account. |
| **409** | The resource is not in a state that allows this request. |
| **500** | The service failed while handling the request. |
| **503** | Cardholder bank links are not set up in this environment yet (`BANK_FEED_OWNER_NOT_CONFIGURED`). Nothing was created. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="deletebanklink"></a>
## deleteBankLink (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`deleteBankLink(params): Promise<void>`

Delete bank link

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Deletes a bank link and all associated resources, including the bank subscription, bank accounts, and bank transactions.

Cards are not deleted. A `bank-feed` subscription created at completion is deactivated; a card enrolled by its number only loses its bank account. Each still-active account sends `bankaccount.state_changed`, and each changed subscription sends `cardsubscription.updated`.

**Note:** This action is irreversible and will revoke access to the connected financial institution.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankLinksApi(config);

await api.deleteBankLink({
  bankLinkId: 'enrollment_792dcb7d',
});
```

### Parameters


- **bankLinkId** (`string`, required): The client-provided identifier of the bank link.

### Returns

Nothing (an empty response).

### Scopes

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **204** | Bank link deleted |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **404** | The resource was not found for this account. |
| **409** | The resource is not in a state that allows this request. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="getbanklink"></a>
## getBankLink

`getBankLink(params): Promise<BankLink>`

Retrieve bank link

Returns detailed information about a specific bank link by its identifier.

If the bank link is in `pending` state and the hosted link URL has expired, this endpoint will automatically refresh the URL and return the updated link.

Once the user has finished the hosted flow, a read of the link answers `completed`: the link completes without a `PATCH` from you.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankLinksApi(config);

const result = await api.getBankLink({
  bankLinkId: 'enrollment_792dcb7d',
});
console.log(result);
```

### Parameters


- **bankLinkId** (`string`, required): The client-provided identifier of the bank link.

### Returns

[BankLink](BankLink.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/bank-links/enrollment_792dcb7d"
    },
    "bankAccounts": [
      {
        "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
      }
    ]
  },
  "id": "enrollment_792dcb7d",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "state": "completed",
  "hostedLink": null,
  "linkExpiresAt": null,
  "completedAt": "2025-10-03T10:55:42.000Z",
  "bankAccounts": [
    {
      "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
      "name": "Credit Card",
      "mask": "4001",
      "type": "credit",
      "cardIds": [
        "5dec2c49-0aa5-4683-a317-427eb5d115f3"
      ]
    }
  ],
  "createdAt": "2025-10-03T10:25:27.069Z"
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
| **404** | The resource was not found for this account. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="listbanklinks"></a>
## listBankLinks

`listBankLinks(params): Promise<BankLinkList>`

List bank links

Returns a list of bank links under the account.

By default, `GET /bank-links` returns bank links ordered by the latest `createdAt`.

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
const api = new banking.BankLinksApi(config);

const result = await api.listBankLinks({
  // subaccountId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // state: 'pending',
  // limit: 250,
  // cursor: 'ZXhhbXBsZQ==',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, optional)
- **state** (`'pending' | 'completed' | 'expired'`, optional): Filter bank links by state One of: `pending`, `completed`, `expired`.
- **limit** (`number`, optional): Maximum number of items to return
- **cursor** (`string`, optional): The cursor to use for pagination. Identifies your place on the list

### Returns

[BankLinkList](BankLinkList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "items": [
    {
      "_links": {
        "self": {
          "href": "/bank-links/enrollment_792dcb7d"
        },
        "bankAccounts": [
          {
            "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
          }
        ]
      },
      "id": "enrollment_792dcb7d",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "state": "completed",
      "provider": "plaid",
      "hostedLink": null,
      "linkExpiresAt": null,
      "completedAt": "2025-10-03T10:55:42.000Z",
      "bankAccounts": [
        {
          "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
          "name": "Checking"
        }
      ],
      "createdAt": "2025-10-03T10:25:27.069Z"
    },
    {
      "_links": {
        "self": {
          "href": "/bank-links/enrollment_a1b2c3d4"
        }
      },
      "id": "enrollment_a1b2c3d4",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "state": "pending",
      "provider": "plaid",
      "hostedLink": "https://hosted.plaid.com/link/abc123",
      "linkExpiresAt": "2025-10-04T14:25:27.000Z",
      "createdAt": "2025-10-04T10:25:27.069Z"
    }
  ],
  "pagination": {
    "cursor": "ZXhhbXBsZQ==",
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

<a id="syncbanklink"></a>
## syncBankLink (needs banking:admin)

> **Needs banking:admin.** If your API client does not have the `banking:admin` scope, the API answers 403 and
> the SDK throws `ScopeRequiredError`; ask Astrada to enable it if you need this operation
> (see [Operations that need banking:admin](../../README.md#operations-that-need-bankingadmin)).

`syncBankLink(params): Promise<BankLinkSyncResult>`

Sync bank link

Needs the `banking:admin` scope. If your API client does not have it, the API answers `403 Forbidden`; ask Astrada to enable it if you need this operation.

Triggers a manual sync of transactions for the bank link's associated subscription. This fetches the latest transactions from the financial institution.

Transaction syncs also occur automatically via provider webhooks and scheduled jobs. Use this endpoint to force an immediate sync when needed.

While another sync of the same connection is running, this call answers `200` and syncs nothing; send it again shortly. When the bank is temporarily unavailable it answers `503`.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankLinksApi(config);

const result = await api.syncBankLink({
  bankLinkId: 'enrollment_792dcb7d',
  bankLinkSyncParams: banking.BankLinkSyncParamsFromJSON({
  "webhooks": [
    "banktransaction.created"
  ],
  "force": false
}),
});
console.log(result);
```

### Parameters


- **bankLinkId** (`string`, required): The client-provided identifier of the bank link.
- **bankLinkSyncParams** ([BankLinkSyncParams](BankLinkSyncParams.md), optional)

### Returns

[BankLinkSyncResult](BankLinkSyncResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "message": "Transactions synced successfully"
}
```

### Scopes

`banking:admin`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Sync triggered |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Needs the `banking:admin` scope. Your API client does not have it; ask Astrada to enable it if you need this operation.  |
| **404** | The resource was not found for this account. |
| **409** | The resource is not in a state that allows this request. |
| **500** | The service failed while handling the request. |
| **503** | The bank is temporarily unavailable. Nothing was synced; try again later. The message comes from the bank data provider and can change, so do not parse it.  |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="updatebanklink"></a>
## updateBankLink

`updateBankLink(params): Promise<BankLink>`

Complete bank link

Completes a bank link enrollment, transitioning it from `pending` to `completed` state. The request body must contain `state: "completed"`.

When a bank link is completed, the system exchanges the enrollment credentials with the provider, creates a bank subscription (connection), and discovers the associated bank accounts.

A link that is no longer `pending` answers `409`; read it with `GET /bank-links/{bankLinkId}`.

The PATCH response echoes the bank link record only. The discovered `bankAccounts` (with each account's `cardIds` and any minted `cards`) are returned by `GET /bank-links/{bankLinkId}`, not by this PATCH.


### Example

```ts
import { Configuration, banking } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new banking.BankLinksApi(config);

const result = await api.updateBankLink({
  bankLinkId: 'enrollment_792dcb7d',
  bankLinkUpdateParams: banking.BankLinkUpdateParamsFromJSON({
  "state": "completed"
}),
});
console.log(result);
```

### Parameters


- **bankLinkId** (`string`, required): The client-provided identifier of the bank link.
- **bankLinkUpdateParams** ([BankLinkUpdateParams](BankLinkUpdateParams.md), required)

### Returns

[BankLink](BankLink.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/bank-links/enrollment_792dcb7d"
    },
    "bankAccounts": [
      {
        "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
      }
    ]
  },
  "id": "enrollment_792dcb7d",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "state": "completed",
  "hostedLink": null,
  "linkExpiresAt": null,
  "completedAt": "2025-10-03T10:55:42.000Z",
  "bankAccounts": [
    {
      "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
      "name": "Credit Card",
      "mask": "4001",
      "type": "credit",
      "cardIds": [
        "5dec2c49-0aa5-4683-a317-427eb5d115f3"
      ]
    }
  ],
  "createdAt": "2025-10-03T10:25:27.069Z"
}
```

### Scopes

`banking:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Bank link completed |
| **400** | The request was refused. `message`, and `code` where present, say why. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token does not hold the `banking:write` scope this route needs. |
| **404** | The resource was not found for this account. |
| **409** | The resource is not in a state that allows this request. |
| **500** | The service failed while handling the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

