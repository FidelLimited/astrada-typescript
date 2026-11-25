# WebhooksApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createWebhook**](#createwebhook) | **POST** /webhooks | Create webhook |
| [**deleteWebhook**](#deletewebhook) | **DELETE** /webhooks/{webhookId} | Delete webhook |
| [**getWebhook**](#getwebhook) | **GET** /webhooks/{webhookId} | Retrieve webhook |
| [**listWebhooks**](#listwebhooks) | **GET** /webhooks | List webhooks |
| [**updateWebhook**](#updatewebhook) | **PATCH** /webhooks/{webhookId} | Update webhook |


<a id="createwebhook"></a>
## createWebhook

`createWebhook(params): Promise<WebhookCreateResult>`

Create webhook

Registers a new webhook for capturing event notifications.

A `subaccountId` that is not one of your subaccounts is refused with `400` "Request parameters are invalid", and its `errors` list holds "Given subaccount does not exist".


### Example

```ts
import { Configuration, WebhooksApi } from '@astrada.co/ts-astrada-sdk';
import { WebhookCreateParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new WebhooksApi(config);

const result = await api.createWebhook({
  webhookCreateParams: WebhookCreateParamsFromJSON({
  "url": "https://example-api.com/path",
  "description": "Example of Webhook description",
  "eventTypes": [
    "transactionmessage.created"
  ],
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5"
}),
});
console.log(result);
```

### Parameters


- **webhookCreateParams** ([WebhookCreateParams](WebhookCreateParams.md), required)

### Returns

[WebhookCreateResult](WebhookCreateResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/webhooks/3a45ba7f-8d8f-4f6a-86a5-a17ea0328241"
    }
  },
  "id": "3a45ba7f-8d8f-4f6a-86a5-a17ea0328241",
  "url": "https://example-api.com/path",
  "description": "Example of Webhook description",
  "eventTypes": [
    "transactionmessage.created"
  ],
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "createdAt": "2023-12-19T14:45:00Z",
  "updatedAt": "2023-12-19T14:45:00Z",
  "enabled": true,
  "secret": "ODk4ZDAxYjYtZjM4NC00MzdmLWEzMDMtM2M0NjA1NWY5NTQ5"
}
```

### Scopes

`webhooks:write`

### Responses

| Status | Description |
|--------|-------------|
| **201** | Successful operation |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="deletewebhook"></a>
## deleteWebhook

`deleteWebhook(params): Promise<void>`

Delete webhook

Remove a configured webhook by its identifier. Results in the resource being deleted and no longer available.

### Example

```ts
import { Configuration, WebhooksApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new WebhooksApi(config);

await api.deleteWebhook({
  webhookId: '3c750084-a60f-478c-ab91-c53567d11fac',
});
```

### Parameters


- **webhookId** (`string`, required)

### Returns

Nothing (an empty response).

### Scopes

`webhooks:write`

### Responses

| Status | Description |
|--------|-------------|
| **204** | Successful operation |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="getwebhook"></a>
## getWebhook

`getWebhook(params): Promise<Webhook>`

Retrieve webhook

Returns detailed information about a specific webhook by its identifier, including its configuration and event subscription details.

### Example

```ts
import { Configuration, WebhooksApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new WebhooksApi(config);

const result = await api.getWebhook({
  webhookId: '3c750084-a60f-478c-ab91-c53567d11fac',
});
console.log(result);
```

### Parameters


- **webhookId** (`string`, required)

### Returns

[Webhook](Webhook.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/webhooks/3a45ba7f-8d8f-4f6a-86a5-a17ea0328241"
    }
  },
  "id": "3a45ba7f-8d8f-4f6a-86a5-a17ea0328241",
  "url": "https://example-api.com/path",
  "description": "Example of Webhook description",
  "eventTypes": [
    "transactionmessage.created"
  ],
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "createdAt": "2023-12-19T14:45:00Z",
  "updatedAt": "2023-12-19T14:45:00Z",
  "enabled": true
}
```

### Scopes

`webhooks:read`

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

<a id="listwebhooks"></a>
## listWebhooks

`listWebhooks(params): Promise<WebhookList>`

List webhooks

Returns all webhooks configured under the account, optionally filtered by subaccount, including details on the events each webhook is subscribed to.

This endpoint supports [cursor-based pagination](https://docs.astrada.co/reference/pagination).


### Example

```ts
import { Configuration, WebhooksApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new WebhooksApi(config);

const result = await api.listWebhooks({
  // subaccountId: '2fd4d402-b759-479c-87a6-58d85e345356',
  // limit: 25,
  // cursor: 'ZXhhbXBsZQ==',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, optional)
- **limit** (`number`, optional): Maximum number of items to return
- **cursor** (`string`, optional): The cursor to use for pagination. Identifies your place on the list

### Returns

[WebhookList](WebhookList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/webhooks"
    }
  },
  "_embedded": {
    "webhooks": [
      {
        "_links": {
          "self": {
            "href": "/webhooks/3a45ba7f-8d8f-4f6a-86a5-a17ea0328241"
          }
        },
        "id": "3a45ba7f-8d8f-4f6a-86a5-a17ea0328241",
        "url": "https://example-api.com/path",
        "description": "Example of Webhook description",
        "eventTypes": [
          "transactionmessage.created"
        ],
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "createdAt": "2023-12-19T14:45:00Z",
        "updatedAt": "2023-12-19T14:45:00Z",
        "enabled": true
      },
      {
        "_links": {
          "self": {
            "href": "/webhooks/627f9c6d-ec9f-4118-84f3-97a77f447e32"
          }
        },
        "id": "627f9c6d-ec9f-4118-84f3-97a77f447e32",
        "url": "https://example-api.com/path",
        "description": "Example of Webhook description",
        "eventTypes": [
          "transactionmessage.created"
        ],
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "createdAt": "2023-12-19T14:46:00Z",
        "updatedAt": "2023-12-19T14:46:00Z",
        "enabled": true
      }
    ]
  }
}
```

### Scopes

`webhooks:read`

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

<a id="updatewebhook"></a>
## updateWebhook

`updateWebhook(params): Promise<Webhook>`

Update webhook

Updates the configuration of an existing webhook, allowing changes to the event subscriptions or notification URL.

Only `url`, `description`, `eventTypes` and `enabled` can be sent. Any other field, `subaccountId` included, is refused with `400`: a webhook's subaccount can't be changed.


### Example

```ts
import { Configuration, WebhooksApi } from '@astrada.co/ts-astrada-sdk';
import { WebhookUpdateParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new WebhooksApi(config);

const result = await api.updateWebhook({
  webhookId: '3c750084-a60f-478c-ab91-c53567d11fac',
  webhookUpdateParams: WebhookUpdateParamsFromJSON({}),
});
console.log(result);
```

### Parameters


- **webhookId** (`string`, required)
- **webhookUpdateParams** ([WebhookUpdateParams](WebhookUpdateParams.md), required)

### Returns

[Webhook](Webhook.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/webhooks/3a45ba7f-8d8f-4f6a-86a5-a17ea0328241"
    }
  },
  "id": "3a45ba7f-8d8f-4f6a-86a5-a17ea0328241",
  "url": "https://example-api.com/path",
  "description": "Example of Webhook description",
  "eventTypes": [
    "transactionmessage.created"
  ],
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "createdAt": "2023-12-19T14:45:00Z",
  "updatedAt": "2023-12-19T14:45:00Z",
  "enabled": true
}
```

### Scopes

`webhooks:write`

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

