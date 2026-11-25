# CardApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getCard**](#getcard) | **GET** /cards/{cardId} | Retrieve card |
| [**getCardholder**](#getcardholder) | **GET** /cards/{cardId}/cardholder | Retrieve cardholder information |
| [**listCards**](#listcards) | **GET** /cards | List cards |
| [**updateCardholder**](#updatecardholder) | **PATCH** /cards/{cardId}/cardholder | Update cardholder information |


<a id="getcard"></a>
## getCard

`getCard(params): Promise<Card>`

Retrieve card

Returns detailed information about a specific card by its identifier.

Add `expand=cardholder` to embed the cardholder under `_embedded` in the same response instead
of calling `GET /cards/{cardId}/cardholder` separately. The embedded body is the exact body that
endpoint serves and requires its `cardholder:read` scope.


### Example

```ts
import { Configuration, CardApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardApi(config);

const result = await api.getCard({
  cardId: '6d18f5bb-b9d6-4237-97c2-44b1bdb71d6b',
  // expand: ['cardholder'],
});
console.log(result);
```

### Parameters


- **cardId** (`string`, required)
- **expand** (`Array<'cardholder'>`, optional): Embed the card's related `cardholder` resource under `_embedded` so one call returns the card
together with its cardholder instead of a follow-up `GET /cards/{cardId}/cardholder`.

- `cardholder` embeds the cardholder exactly as `GET /cards/{cardId}/cardholder` serves it and
  requires the `cardholder:read` scope.

A request asking to expand a resource its credentials cannot read is refused with `403`
(`Missing scope 'cardholder:read'`). When the card has no cardholder, the `cardholder` key is absent
from `_embedded`; `_links` are unchanged.

Send `expand=cardholder`. A repeated `expand` key, an empty value or an unknown value is refused
with `400`.
 One of: `cardholder`.

### Returns

[Card](Card.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/cards/f744b691-bf05-4f2a-ab89-bb1afe4eb840"
    }
  },
  "id": "f744b691-bf05-4f2a-ab89-bb1afe4eb840",
  "expiryMonth": 11,
  "expiryYear": 2028,
  "network": "mastercard",
  "country": "USA",
  "createdAt": "2024-02-04T18:41:16.142Z",
  "updatedAt": "2024-02-04T18:41:16.142Z",
  "first6digits": "434343",
  "last4digits": "4343",
  "subaccountId": "da6649a8-f0ea-4af0-b342-c0b5c3e024dd"
}
```

### Scopes

`cards:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="getcardholder"></a>
## getCardholder

`getCardholder(params): Promise<Cardholder>`

Retrieve cardholder information

Returns the card's current cardholder information. Answers `404` when the card has no cardholder.

For the company and legal entity the card belonged to at the time of a given transaction, use
`expand=cardholder` on that transaction instead: `GET /transactions/{transactionId}?expand=cardholder`.


### Example

```ts
import { Configuration, CardApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardApi(config);

const result = await api.getCardholder({
  cardId: '6d18f5bb-b9d6-4237-97c2-44b1bdb71d6b',
});
console.log(result);
```

### Parameters


- **cardId** (`string`, required)

### Returns

[Cardholder](Cardholder.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/cards/f744b691-bf05-4f2a-ab89-bb1afe4eb840/cardholder"
    }
  },
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "postalCode": "94105",
  "corporate": {
    "alternativeEmployeeId": "ALT-EMP-12345",
    "employeeId": "bb1afe4eb840",
    "id": "ABC123456789",
    "legalEntity": {
      "id": "FR01",
      "name": "Example Company France SAS"
    }
  },
  "createdAt": "2024-02-04T18:41:16.142Z",
  "updatedAt": "2024-02-04T18:41:16.142Z"
}
```

### Scopes

`cardholder:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="listcards"></a>
## listCards

`listCards(params): Promise<CardList>`

List cards

Returns a list of all cards linked to the account.

By default, `GET /cards` returns cards ordered by the latest updatedAt. You can combine the different filters as documented.

Use `networkBulkFeedId` to filter the list to cards enrolled through a given network bulk feed. An unknown feed id returns an empty page. It combines with `expand=cardholder`.

Use `expand=cardholder` to embed each card's cardholder under `_embedded` in the same response instead of calling `GET /cards/{cardId}/cardholder` per item. The embedded body is the exact body that endpoint serves and requires its `cardholder:read` scope. Pagination links preserve `expand` like any other parameter.

This endpoint supports [offset-based pagination](https://docs.astrada.co/reference/pagination).


### Example

```ts
import { Configuration, CardApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardApi(config);

const result = await api.listCards({
  // country: 'USA',
  // expiryMonth: 6,
  // expiryYear: 2024,
  // subaccountId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // networkBulkFeedId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // expand: ['cardholder'],
  // limit: 25,
  // offset: 20,
});
console.log(result);
```

### Parameters


- **country** (`'USA' | 'CAN' | 'AUS' | 'NZL' | 'PRT' | 'BEL' | 'SGP'`, optional): The card country of issuance following ISO 3166 alpha-3 One of: `USA`, `CAN`, `AUS`, `NZL`, `PRT`, `BEL`, `SGP`.
- **expiryMonth** (`number`, optional): The card expiration month
- **expiryYear** (`number`, optional): The card expiration year
- **subaccountId** (`string`, optional)
- **networkBulkFeedId** (`string`, optional)
- **expand** (`Array<'cardholder'>`, optional): Embed the card's related `cardholder` resource under `_embedded` so one call returns the card
together with its cardholder instead of a follow-up `GET /cards/{cardId}/cardholder`.

- `cardholder` embeds the cardholder exactly as `GET /cards/{cardId}/cardholder` serves it and
  requires the `cardholder:read` scope.

A request asking to expand a resource its credentials cannot read is refused with `403`
(`Missing scope 'cardholder:read'`). When the card has no cardholder, the `cardholder` key is absent
from `_embedded`; `_links` are unchanged.

Send `expand=cardholder`. A repeated `expand` key, an empty value or an unknown value is refused
with `400`.
 One of: `cardholder`.
- **limit** (`number`, optional): Maximum number of items to return
- **offset** (`number`, optional): The offset to use for pagination. Identifies the position of the first item returned in the collection

### Returns

[CardList](CardList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/cards"
    }
  },
  "_embedded": {
    "cards": [
      {
        "_links": {
          "self": {
            "href": "/cards/8309b5f8-d5d8-49bb-9001-38bf1bb0f1e4"
          }
        },
        "id": "8309b5f8-d5d8-49bb-9001-38bf1bb0f1e4",
        "expiryMonth": 12,
        "expiryYear": 2026,
        "network": "mastercard",
        "country": "USA",
        "createdAt": "2024-02-04T18:41:16.142Z",
        "updatedAt": "2024-02-04T18:41:16.142Z",
        "first6digits": "424242",
        "last4digits": "4242",
        "subaccountId": "da6649a8-f0ea-4af0-b342-c0b5c3e024dd"
      },
      {
        "_links": {
          "self": {
            "href": "/cards/f744b691-bf05-4f2a-ab89-bb1afe4eb840"
          },
          "cardholder": {
            "href": "/cards/f744b691-bf05-4f2a-ab89-bb1afe4eb840/cardholder"
          }
        },
        "id": "f744b691-bf05-4f2a-ab89-bb1afe4eb840",
        "expiryMonth": 11,
        "expiryYear": 2028,
        "network": "mastercard",
        "country": "USA",
        "createdAt": "2024-02-04T18:41:16.142Z",
        "updatedAt": "2024-02-04T18:41:16.142Z",
        "first6digits": "434343",
        "last4digits": "4343",
        "subaccountId": "da6649a8-f0ea-4af0-b342-c0b5c3e024dd"
      }
    ]
  },
  "totalItems": 2
}
```

### Scopes

`cards:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="updatecardholder"></a>
## updateCardholder

`updateCardholder(params): Promise<Cardholder>`

Update cardholder information

Updates cardholder information for a specific card. Use this endpoint to simulate cardholder data that would typically be received through a Network Bulk Feed. This is useful for testing your integration against bulk-enrolled cards without waiting for actual network feed data.

**Note:** This endpoint requires the `cardholder:write` scope and must be directly enabled by Astrada.


### Example

```ts
import { Configuration, CardApi } from '@astrada.co/ts-astrada-sdk';
import { CardholderUpdateParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardApi(config);

const result = await api.updateCardholder({
  cardId: '6d18f5bb-b9d6-4237-97c2-44b1bdb71d6b',
  cardholderUpdateParams: CardholderUpdateParamsFromJSON({}),
});
console.log(result);
```

### Parameters


- **cardId** (`string`, required)
- **cardholderUpdateParams** ([CardholderUpdateParams](CardholderUpdateParams.md), required)

### Returns

[Cardholder](Cardholder.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/cards/f744b691-bf05-4f2a-ab89-bb1afe4eb840/cardholder"
    }
  },
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "postalCode": "94105",
  "corporate": {
    "alternativeEmployeeId": "ALT-EMP-12345",
    "employeeId": "bb1afe4eb840",
    "id": "ABC123456789",
    "legalEntity": {
      "id": "FR01",
      "name": "Example Company France SAS"
    }
  },
  "createdAt": "2024-02-04T18:41:16.142Z",
  "updatedAt": "2024-02-04T18:41:16.142Z"
}
```

### Scopes

`cardholder:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

