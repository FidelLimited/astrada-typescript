# NetworkBulkFeedsApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createNetworkBulkFeed**](#createnetworkbulkfeed) | **POST** /network-bulk-feeds | Create network bulk feed |
| [**getNetworkBulkFeed**](#getnetworkbulkfeed) | **GET** /network-bulk-feeds/{networkBulkFeedId} | Retrieve a network bulk feed |
| [**listNetworkBulkFeeds**](#listnetworkbulkfeeds) | **GET** /network-bulk-feeds | List network bulk feed |
| [**updateNetworkBulkFeed**](#updatenetworkbulkfeed) | **PATCH** /network-bulk-feeds/{networkBulkFeedId} | Update a network bulk feed |


<a id="createnetworkbulkfeed"></a>
## createNetworkBulkFeed

`createNetworkBulkFeed(params): Promise<NetworkBulkFeeds>`

Create network bulk feed

Registers a new feed for network bulk.


### Example

```ts
import { Configuration, NetworkBulkFeedsApi } from '@astrada.co/ts-astrada-sdk';
import { NetworkBulkFeedCreateParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new NetworkBulkFeedsApi(config);

const result = await api.createNetworkBulkFeed({
  networkBulkFeedCreateParams: NetworkBulkFeedCreateParamsFromJSON({
  "networkReference": "R123456",
  "network": "AMEX",
  "subaccountId": "24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c"
}),
});
console.log(result);
```

### Parameters


- **networkBulkFeedCreateParams** ([NetworkBulkFeedCreateParams](NetworkBulkFeedCreateParams.md), required)

### Returns

[NetworkBulkFeeds](NetworkBulkFeeds.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/network-bulk-feeds/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
    }
  },
  "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "network": "MASTERCARD",
  "networkReference": "G1234567",
  "state": "submitted",
  "type": "SMARTDATA",
  "panFormat": "encrypted",
  "createdAt": "2024-12-19T14:45:00Z",
  "updatedAt": "2024-12-19T14:45:00Z"
}
```

### Scopes

`network-bulk-feeds:write`

### Responses

| Status | Description |
|--------|-------------|
| **201** | Resource created |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **409** | The network bulk feed already exists. |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="getnetworkbulkfeed"></a>
## getNetworkBulkFeed

`getNetworkBulkFeed(params): Promise<NetworkBulkFeeds>`

Retrieve a network bulk feed

Returns detailed information about a specific network bulk feed by its identifier.

### Example

```ts
import { Configuration, NetworkBulkFeedsApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new NetworkBulkFeedsApi(config);

const result = await api.getNetworkBulkFeed({
  networkBulkFeedId: 'eb2ded7e-11fa-46fc-bd3e-f5b1d56fd3b3',
});
console.log(result);
```

### Parameters


- **networkBulkFeedId** (`string`, required)

### Returns

[NetworkBulkFeeds](NetworkBulkFeeds.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/network-bulk-feeds/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
    }
  },
  "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "network": "MASTERCARD",
  "networkReference": "G1234567",
  "state": "submitted",
  "type": "SMARTDATA",
  "panFormat": "encrypted",
  "createdAt": "2024-12-19T14:45:00Z",
  "updatedAt": "2024-12-19T14:45:00Z"
}
```

### Scopes

`network-bulk-feeds:read`

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

<a id="listnetworkbulkfeeds"></a>
## listNetworkBulkFeeds

`listNetworkBulkFeeds(params): Promise<NetworkBulkFeedList>`

List network bulk feed

Returns all network bulk feeds under the account.

By default, `GET /network-bulk-feeds` returns network bulk feeds ordered by the latest `createdAt`.

This endpoint supports [offset-based pagination](https://docs.astrada.co/reference/pagination).


### Example

```ts
import { Configuration, NetworkBulkFeedsApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new NetworkBulkFeedsApi(config);

const result = await api.listNetworkBulkFeeds({
  // networkReference: 'G1234567',
  // subaccountId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // limit: 50,
  // offset: 20,
});
console.log(result);
```

### Parameters


- **networkReference** (`string`, optional): Filters the returned feeds to an exact match on the feed's network reference. The network reference format depends on the card network (see the schema below).

- **subaccountId** (`string`, optional)
- **limit** (`number`, optional): Maximum number of items to return
- **offset** (`number`, optional): The offset to use for pagination. Identifies the position of the first item returned in the collection

### Returns

[NetworkBulkFeedList](NetworkBulkFeedList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/network-bulk-feeds"
    }
  },
  "_embedded": {
    "networkBulkFeeds": [
      {
        "_links": {
          "self": {
            "href": "/network-bulk-feeds/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
          }
        },
        "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "network": "MASTERCARD",
        "networkReference": "G1234567",
        "state": "submitted",
        "type": "SMARTDATA",
        "panFormat": "encrypted",
        "createdAt": "2024-12-19T14:45:00Z",
        "updatedAt": "2024-12-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/network-bulk-feeds/c73f2da7-aa1f-4775-ad38-864b1b6f3162"
          }
        },
        "id": "c73f2da7-aa1f-4775-ad38-864b1b6f3162",
        "subaccountId": "29cb4277-b812-4137-b008-e0befa8c6a47",
        "network": "MASTERCARD",
        "networkReference": "G1234567",
        "state": "submitted",
        "type": "SMARTDATA",
        "panFormat": "encrypted",
        "createdAt": "2024-10-19T14:45:00Z",
        "updatedAt": "2024-10-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/network-bulk-feeds/a3b1c2d4-5e6f-7890-abcd-ef1234567890"
          }
        },
        "id": "a3b1c2d4-5e6f-7890-abcd-ef1234567890",
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "network": "VISA",
        "networkReference": "1_123_45_6789",
        "state": "failed",
        "type": "VBDS",
        "panFormat": "encrypted",
        "errorReason": "Starter data ingestion failed: invalid RPIC configuration",
        "createdAt": "2024-12-19T14:45:00Z",
        "updatedAt": "2024-12-20T10:30:00Z"
      }
    ]
  },
  "totalItems": 3
}
```

### Scopes

`network-bulk-feeds:read`

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

<a id="updatenetworkbulkfeed"></a>
## updateNetworkBulkFeed

`updateNetworkBulkFeed(params): Promise<NetworkBulkFeeds>`

Update a network bulk feed

Updates a network bulk feed. Supports setting `transactionStartDate`
(currently for `SMARTDATA` feeds only; other feed types are rejected with
a 422) and `expectedCardCount`. At least one field must be provided;
`transactionStartDate` cannot be unset (`null` is rejected).

Setting `transactionStartDate` widens the feed's ingestion window:
transactions posted on or after the date are ingested for the feed's
deliveries, replacing the default 15-day window.


### Example

```ts
import { Configuration, NetworkBulkFeedsApi } from '@astrada.co/ts-astrada-sdk';
import { NetworkBulkFeedUpdateParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new NetworkBulkFeedsApi(config);

const result = await api.updateNetworkBulkFeed({
  networkBulkFeedId: 'eb2ded7e-11fa-46fc-bd3e-f5b1d56fd3b3',
  networkBulkFeedUpdateParams: NetworkBulkFeedUpdateParamsFromJSON({
  "transactionStartDate": "2026-07-01"
}),
});
console.log(result);
```

### Parameters


- **networkBulkFeedId** (`string`, required)
- **networkBulkFeedUpdateParams** ([NetworkBulkFeedUpdateParams](NetworkBulkFeedUpdateParams.md), required)

### Returns

[NetworkBulkFeeds](NetworkBulkFeeds.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/network-bulk-feeds/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
    }
  },
  "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "network": "MASTERCARD",
  "networkReference": "G1234567",
  "state": "submitted",
  "type": "SMARTDATA",
  "panFormat": "encrypted",
  "createdAt": "2024-12-19T14:45:00Z",
  "updatedAt": "2024-12-19T14:45:00Z"
}
```

### Scopes

`network-bulk-feeds:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **422** | The request is well formatted but it fails some business logic validation |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

