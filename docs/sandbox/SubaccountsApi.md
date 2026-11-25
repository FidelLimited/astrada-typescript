# SubaccountsApi (sandbox only)

Exported under the `sandbox` namespace: `new sandbox.SubaccountsApi(config)`. These calls exist only
in the sandbox: each one throws `SandboxOnlyError` before any request unless the configuration has
`environment: 'sandbox'` and the sandbox API host (or a `basePath` marked `basePathIsSandbox: true`).

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**deleteSubaccount**](#deletesubaccount) | **DELETE** /subaccounts/{subaccountId} | Delete subaccount (sandbox only) |


<a id="deletesubaccount"></a>
## deleteSubaccount

`deleteSubaccount(params): Promise<void>`

Delete subaccount (sandbox only)

Works in the sandbox only (`https://api.sandbox.astrada.co`), for
clearing test data between runs. Production has no delete call: there
you deactivate card subscriptions with `PATCH`.

Deletes a subaccount and everything under it, and cannot be undone. Its
bank links (with their bank accounts, bank transactions and matches) go
first, then every card subscription, card, cardholder, stored token,
transaction, network bulk feed and webhook of the subaccount.

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
const api = new sandbox.SubaccountsApi(config);

await api.deleteSubaccount({
  subaccountId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
});
```

### Parameters


- **subaccountId** (`string`, required)

### Returns

Nothing (an empty response).

### Scopes

`subaccounts:write`

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

