# CardSubscriptionApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getCardSubscription**](#getcardsubscription) | **GET** /card-subscriptions/{subscriptionId} | Retrieve card subscription |
| [**listCardSubscriptions**](#listcardsubscriptions) | **GET** /card-subscriptions | List card subscriptions |
| [**updateCardSubscription**](#updatecardsubscription) | **PATCH** /card-subscriptions/{subscriptionId} | Update card subscription |


<a id="getcardsubscription"></a>
## getCardSubscription

`getCardSubscription(params): Promise<CardSubscription>`

Retrieve card subscription

Returns detailed information about a specific card subscription by its identifier, including its data-sharing state.

Add `expand=card,cardholder` to embed the card and cardholder under `_embedded` in the same response instead of fetching them separately. Each embedded resource is the exact body its own endpoint serves and requires that endpoint's scope (`cards:read` for `card`, `cardholder:read` for `cardholder`).


### Example

```ts
import { Configuration, CardSubscriptionApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardSubscriptionApi(config);

const result = await api.getCardSubscription({
  subscriptionId: 'eb2ded7e-11fa-46fc-bd3e-f5b1d56fd3b3',
  // expand: ['card'],
});
console.log(result);
```

### Parameters


- **subscriptionId** (`string`, required)
- **expand** (`Array<'card' | 'cardholder'>`, optional): Comma-separated list of related resources to embed on each card subscription under `_embedded`, so one call returns
the subscription together with its card and cardholder instead of a `GET /cards/{cardId}` and a
`GET /cards/{cardId}/cardholder` per item.

- `card` embeds the card exactly as `GET /cards/{cardId}` serves it and requires the `cards:read` scope.
- `cardholder` embeds the cardholder exactly as `GET /cards/{cardId}/cardholder` serves it and requires the
  `cardholder:read` scope.

A request naming a resource its credentials cannot read is refused with `403`. When a related resource does not
exist (for example a card without cardholder data), its key is absent from `_embedded`; `_links` are unchanged.

Send one comma-separated value (`expand=card,cardholder`). A repeated `expand` key, an empty value or an unknown
value is refused with `400`.
 One of: `card`, `cardholder`.

### Returns

[CardSubscription](CardSubscription.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/card-subscriptions/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
    },
    "card": {
      "href": "/cards/5dec2c49-0aa5-4683-a317-427eb5d115f3"
    }
  },
  "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "cardId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
  "customerReferenceId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
  "networkBulkFeedId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "enrollmentType": "cardholder-single",
  "state": "active",
  "effectiveDate": "2024-12-20T14:45:00Z",
  "expirationDate": "2025-06-19T14:45:00Z",
  "createdAt": "2024-12-19T14:45:00Z",
  "updatedAt": "2024-12-19T14:45:00Z"
}
```

### Scopes

`card-subscriptions:read`

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

<a id="listcardsubscriptions"></a>
## listCardSubscriptions

`listCardSubscriptions(params): Promise<CardSubscriptionList>`

List card subscriptions

Returns all card subscriptions under the account, ordered by `createdAt` descending (most recently created first).

The `subaccountId`, `cardId`, `bankAccountId`, `state`, `networkBulkFeedId`, `companyId`, `legalEntityId` and `legalEntityName` filters are independent and combine additively; supplying more than one narrows the result set to subscriptions matching **all** of them.

`companyId`, `legalEntityId` and `legalEntityName` filter on the card's cardholder as it is now: `corporate.id`, `corporate.legalEntity.id` and `corporate.legalEntity.name` (see the [Glossary](https://docs.astrada.co/docs/glossary)). Each is an exact match; `legalEntityName` is case-sensitive, and each of `legalEntityId` and `legalEntityName` never matches a cardholder whose legal entity lacks that field, so copy it from the cardholder (`expand=cardholder` shows each cardholder's company and legal entity in the same response). For example, this returns the active subscriptions of one legal entity on one feed:

`GET /card-subscriptions?networkBulkFeedId=<feed>&legalEntityId=<id>&state=active`

These three filters read cardholder data, so they need the `cardholder:read` scope, like `expand=cardholder`. Without it the request returns `403`.

Filtering by `state` accepts any of the states a card subscription reports in its response payload:

- `pending`: enrolled from a network roster while the card is still inactive at the network. The subscription is fully enrolled and billable, but has not yet transacted.
- `active`: also returns subscriptions still completing activation, which already report their own `state` as `active`.
- `deactivated`, `expired`, `reqSCA`, `failed-to-create`: matched exactly.

This endpoint supports [offset-based pagination](https://docs.astrada.co/reference/pagination). Pagination links preserve any filters applied to the original request.

Use `expand` to embed each subscription's card and cardholder in the same response (`?expand=card,cardholder`) instead of calling `GET /cards/{cardId}` and `GET /cards/{cardId}/cardholder` per item. Each embedded resource appears under the item's `_embedded` with the exact body its own endpoint serves, and requires that endpoint's scope (`cards:read` for `card`, `cardholder:read` for `cardholder`). Pagination links preserve `expand` like any other parameter.


### Example

```ts
import { Configuration, CardSubscriptionApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardSubscriptionApi(config);

const result = await api.listCardSubscriptions({
  // subaccountId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // cardId: '8164683a-8d23-4421-9694-1a81fc9b9c37',
  // bankAccountId: '2b9c1e77-5a3d-4c8b-9f21-6d0e4a7b8c90',
  // state: 'pending',
  // networkBulkFeedId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // companyId: '10021528',
  // legalEntityId: '1000001',
  // legalEntityName: 'Astrada Life',
  // limit: 25,
  // offset: 20,
  // expand: ['card'],
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, optional)
- **cardId** (`string`, optional)
- **bankAccountId** (`string`, optional): Filter to subscriptions whose card materialized from this bank account (bank-derived subscriptions).
- **state** (`'pending' | 'active' | 'deactivated' | 'expired' | 'reqSCA' | 'failed-to-create'`, optional) One of: `pending`, `active`, `deactivated`, `expired`, `reqSCA`, `failed-to-create`.
- **networkBulkFeedId** (`string`, optional)
- **companyId** (`string`, optional): Only subscriptions whose card's cardholder currently has this company ID (`corporate.id`), not the value it had when the subscription was created. Exact match. Requires the `cardholder:read` scope.

- **legalEntityId** (`string`, optional): Only subscriptions whose card's cardholder currently belongs to this legal entity (`corporate.legalEntity.id`), not the one it belonged to when the subscription was created. Exact match. A cardholder whose legal entity has no id never matches this filter; filter by `legalEntityName` instead. Requires the `cardholder:read` scope.

- **legalEntityName** (`string`, optional): Only subscriptions whose card's cardholder currently belongs to a legal entity with this name (`corporate.legalEntity.name`), not the one it belonged to when the subscription was created. Exact, case-sensitive match. A cardholder whose legal entity has no name never matches this filter; filter by `legalEntityId` instead. URL-encode the value: a space is `%20` (or `+`), for example `legalEntityName=Astrada%20Life`. Requires the `cardholder:read` scope.

- **limit** (`number`, optional): Maximum number of items to return
- **offset** (`number`, optional): The offset to use for pagination. Identifies the position of the first item returned in the collection
- **expand** (`Array<'card' | 'cardholder'>`, optional): Comma-separated list of related resources to embed on each card subscription under `_embedded`, so one call returns
the subscription together with its card and cardholder instead of a `GET /cards/{cardId}` and a
`GET /cards/{cardId}/cardholder` per item.

- `card` embeds the card exactly as `GET /cards/{cardId}` serves it and requires the `cards:read` scope.
- `cardholder` embeds the cardholder exactly as `GET /cards/{cardId}/cardholder` serves it and requires the
  `cardholder:read` scope.

A request naming a resource its credentials cannot read is refused with `403`. When a related resource does not
exist (for example a card without cardholder data), its key is absent from `_embedded`; `_links` are unchanged.

Send one comma-separated value (`expand=card,cardholder`). A repeated `expand` key, an empty value or an unknown
value is refused with `400`.
 One of: `card`, `cardholder`.

### Returns

[CardSubscriptionList](CardSubscriptionList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/card-subscriptions"
    }
  },
  "_embedded": {
    "cardSubscriptions": [
      {
        "_links": {
          "self": {
            "href": "/card-subscriptions/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
          },
          "card": {
            "href": "/cards/5dec2c49-0aa5-4683-a317-427eb5d115f3"
          },
          "networkBulkFeed": {
            "href": "/network-bulk-feeds/7b3e4f12-9a8c-4d5e-b6f1-2c3d4e5f6a7b"
          }
        },
        "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "cardId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
        "customerReferenceId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
        "networkBulkFeedId": "7b3e4f12-9a8c-4d5e-b6f1-2c3d4e5f6a7b",
        "enrollmentType": "network-bulk",
        "state": "active",
        "effectiveDate": "2024-12-20T14:45:00Z",
        "expirationDate": "2025-06-19T14:45:00Z",
        "createdAt": "2024-12-19T14:45:00Z",
        "updatedAt": "2024-12-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/card-subscriptions/c73f2da7-aa1f-4775-ad38-864b1b6f3162"
          },
          "card": {
            "href": "/cards/0457c83a-8eb7-4526-b05a-dc9fb1854fe8"
          }
        },
        "id": "c73f2da7-aa1f-4775-ad38-864b1b6f3162",
        "subaccountId": "29cb4277-b812-4137-b008-e0befa8c6a47",
        "cardId": "0457c83a-8eb7-4526-b05a-dc9fb1854fe8",
        "customerReferenceId": "0457c83a-8eb7-4526-b05a-dc9fb1854fe8",
        "networkBulkFeedId": "d4e5f6a7-b8c9-4d0e-a1b2-c3d4e5f6a7b8",
        "enrollmentType": "cardholder-single",
        "state": "active",
        "effectiveDate": "2024-10-20T14:45:00Z",
        "expirationDate": "2025-05-19T14:45:00Z",
        "createdAt": "2024-10-19T14:45:00Z",
        "updatedAt": "2024-10-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/card-subscriptions/5f8e6832-97d3-4ab5-8144-9fbbbcd2b285"
          },
          "card": {
            "href": "/cards/24595efb-4fe5-4c76-a7d3-8bd9d44a96cc"
          },
          "networkBulkFeed": {
            "href": "/network-bulk-feeds/0a20c636-b445-4a95-a3ea-621306ed685c"
          }
        },
        "id": "5f8e6832-97d3-4ab5-8144-9fbbbcd2b285",
        "subaccountId": "29cb4277-b812-4137-b008-e0befa8c6a47",
        "cardId": "24595efb-4fe5-4c76-a7d3-8bd9d44a96cc",
        "customerReferenceId": "0457c83a-8eb7-4526-b05a-dc9fb1854fe8",
        "networkBulkFeedId": "0a20c636-b445-4a95-a3ea-621306ed685c",
        "enrollmentType": "network-bulk",
        "state": "active",
        "effectiveDate": "2025-03-20T14:45:00Z",
        "expirationDate": "2029-05-19T14:45:00Z",
        "createdAt": "2025-03-19T14:45:00Z",
        "updatedAt": "2025-03-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/card-subscriptions/9c1d0b47-3e5a-4f28-9d6b-71a4c8e2f503"
          },
          "card": {
            "href": "/cards/e8b45f19-2c76-4a83-b5d1-9f0e3a7c64d2"
          },
          "networkBulkFeed": {
            "href": "/network-bulk-feeds/0a20c636-b445-4a95-a3ea-621306ed685c"
          }
        },
        "id": "9c1d0b47-3e5a-4f28-9d6b-71a4c8e2f503",
        "subaccountId": "29cb4277-b812-4137-b008-e0befa8c6a47",
        "cardId": "e8b45f19-2c76-4a83-b5d1-9f0e3a7c64d2",
        "customerReferenceId": "e8b45f19-2c76-4a83-b5d1-9f0e3a7c64d2",
        "networkBulkFeedId": "0a20c636-b445-4a95-a3ea-621306ed685c",
        "enrollmentType": "network-bulk",
        "state": "pending",
        "effectiveDate": "2025-04-02T09:15:00Z",
        "expirationDate": "2029-05-19T14:45:00Z",
        "createdAt": "2025-04-01T09:15:00Z",
        "updatedAt": "2025-04-01T09:15:00Z"
      }
    ]
  },
  "totalItems": 4
}
```

### Scopes

`card-subscriptions:read`

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

<a id="updatecardsubscription"></a>
## updateCardSubscription

`updateCardSubscription(params): Promise<CardSubscription>`

Update card subscription

Updates an existing card subscription, allowing changes to its data-sharing state. Subscriptions that were enrolled in bulk, and where `enrollmentType = 'network-bulk'` cannot be updated.

**Note:** setting a card subscription to a `deactivated` state is a final action that cannot be undone.

If the card also has a linked bank account, deactivating it stops that bank account's feed for the card too; to stop only the card network data, ask your Astrada contact.

When deactivating, you can send an optional `deactivationReason` to record why the card was deactivated.


### Example

```ts
import { Configuration, CardSubscriptionApi } from '@astrada.co/ts-astrada-sdk';
import { CardSubscriptionUpdateParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardSubscriptionApi(config);

const result = await api.updateCardSubscription({
  subscriptionId: 'eb2ded7e-11fa-46fc-bd3e-f5b1d56fd3b3',
  cardSubscriptionUpdateParams: CardSubscriptionUpdateParamsFromJSON({
  "state": "deactivated",
  "deactivationReason": "cardholder_offboarded"
}),
});
console.log(result);
```

### Parameters


- **subscriptionId** (`string`, required)
- **cardSubscriptionUpdateParams** ([CardSubscriptionUpdateParams](CardSubscriptionUpdateParams.md), required)

### Returns

[CardSubscription](CardSubscription.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/card-subscriptions/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
    },
    "card": {
      "href": "/cards/5dec2c49-0aa5-4683-a317-427eb5d115f3"
    }
  },
  "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "cardId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
  "customerReferenceId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
  "enrollmentType": "cardholder-single",
  "state": "deactivated",
  "deactivationReason": "cardholder_offboarded",
  "effectiveDate": "2024-12-20T14:45:00Z",
  "expirationDate": "2025-06-19T14:45:00Z",
  "createdAt": "2024-12-19T14:45:00Z",
  "updatedAt": "2025-02-03T09:12:00Z"
}
```

### Scopes

`card-subscriptions:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **409** | Request conflict with the current state of the target resource |
| **422** | The request is well formatted but it fails some business logic validation |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

