# NetworkBulkFeedsApi (sandbox only)

Exported under the `sandbox` namespace: `new sandbox.NetworkBulkFeedsApi(config)`. These calls exist only
in the sandbox: each one throws `SandboxOnlyError` before any request unless the configuration has
`environment: 'sandbox'` and the sandbox API host (or a `basePath` marked `basePathIsSandbox: true`).

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**deleteNetworkBulkFeed**](#deletenetworkbulkfeed) | **DELETE** /network-bulk-feeds/{networkBulkFeedId} | Delete network bulk feed (sandbox only) |


<a id="deletenetworkbulkfeed"></a>
## deleteNetworkBulkFeed

`deleteNetworkBulkFeed(params): Promise<void>`

Delete network bulk feed (sandbox only)

Works in the sandbox only (`https://api.sandbox.astrada.co`), for
clearing test data between runs. Production has no delete call.

Deletes a network bulk feed and the data it owns, and cannot be undone.
The feed stops first, then every card subscription enrolled through it
is removed, along with the cards, cardholders, stored tokens and
transactions that only those subscriptions used.

The call returns when the delete has finished: `204` when it is done,
`502` when a step failed. Retrying a failed delete is always safe:
completed steps are skipped on replay.


### Example

```ts
import { Configuration, sandbox } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new sandbox.NetworkBulkFeedsApi(config);

await api.deleteNetworkBulkFeed({
  networkBulkFeedId: 'eb2ded7e-11fa-46fc-bd3e-f5b1d56fd3b3',
});
```

### Parameters


- **networkBulkFeedId** (`string`, required)

### Returns

Nothing (an empty response).

### Scopes

`network-bulk-feeds:write`

### Responses

| Status | Description |
|--------|-------------|
| **204** | The request has been successfully processed and there is no content to return |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |
| **502** | The cascade delete did not complete; retrying the request resumes it |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

