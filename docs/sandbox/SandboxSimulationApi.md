# SandboxSimulationApi (sandbox only)

Exported under the `sandbox` namespace: `new sandbox.SandboxSimulationApi(config)`. These calls exist only
in the sandbox: each one throws `SandboxOnlyError` before any request unless the configuration has
`environment: 'sandbox'` and the sandbox API host (or a `basePath` marked `basePathIsSandbox: true`).

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**simulateBulkFeedFileGl**](#simulatebulkfeedfilegloperation) | **POST** /simulate/ingestion/amex-gl | Simulate an American Express bulk file (sandbox only) |
| [**simulateBulkFeedFileSmartdata**](#simulatebulkfeedfilesmartdataoperation) | **POST** /simulate/ingestion/smartdata | Simulate a Mastercard bulk file (sandbox only) |
| [**simulateBulkFeedFileVbds**](#simulatebulkfeedfilevbdsoperation) | **POST** /simulate/ingestion/vbds | Simulate a pulled Visa bulk feed delivery (sandbox only) |
| [**simulateBulkFeedFileVcf**](#simulatebulkfeedfilevcfoperation) | **POST** /simulate/ingestion/vcf | Simulate a Visa bulk file (sandbox only) |
| [**simulateTransaction**](#simulatetransactionoperation) | **POST** /simulate/transactions | Simulate a transaction (sandbox only) |
| [**simulateTransactionMessage**](#simulatetransactionmessageoperation) | **POST** /simulate/transactions/{transactionId} | Simulate a transaction message (sandbox only) |
| [**simulateTransactionScenario**](#simulatetransactionscenariooperation) | **POST** /simulate/transaction/scenario | Simulate a transaction scenario (sandbox only) |


<a id="simulatebulkfeedfilegloperation"></a>
## simulateBulkFeedFileGl

`simulateBulkFeedFileGl(params): Promise<void>`

Simulate an American Express bulk file (sandbox only)

Works in the sandbox only (`https://api.sandbox.astrada.co`). Production
has no such call.

Creates a simulated American Express bulk-enrollment file, plus a
companion settlement file when `transactionsPerCard` is above `0`, and
processes it as if American Express had delivered it. The call returns
`202 Accepted` at once; enrolled cards appear as card subscriptions when
processing finishes, and their settlements follow shortly after.

A bulk feed must already exist for the `networkReference`, created with
`POST /network-bulk-feeds`.

`cardCount` replays the fixed head of the sandbox account pool (encrypted
feeds; for tokenized feeds see below): the same accounts every call, so once
enrolled in a subaccount they deduplicate (no new
`cardsubscription.created`), exactly like a file that is delivered twice.
`newCardCount` draws accounts the subaccount has never seen from a
reserved pool, so every call enrolls that many new cards. All included
cards get `transactionsPerCard` transactions with fresh ids and recent
dates, so repeat calls always produce `transaction.*` webhooks.

For a feed registered `tokenized` (see `panFormat` on
`POST /network-bulk-feeds`), `cardCount` draws American Express network
tokens instead of raw card numbers, and `newCardCount` is not supported
(there is no tokenized new-card pool).


### Example

```ts
import { Configuration, sandbox } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new sandbox.SandboxSimulationApi(config);

await api.simulateBulkFeedFileGl({
  simulateBulkFeedFileGlRequest: sandbox.SimulateBulkFeedFileGlRequestFromJSON({
  "networkReference": "R12345",
  "cardCount": 5
}),
});
```

### Parameters


- **simulateBulkFeedFileGlRequest** ([SimulateBulkFeedFileGlRequest](SimulateBulkFeedFileGlRequest.md), required)

### Returns

Nothing (an empty response).

### Scopes

`simulation:write`

### Responses

| Status | Description |
|--------|-------------|
| **202** | Accepted. The simulated file was created and is processed asynchronously. The response has no body.  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **413** | Content Too Large |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="simulatebulkfeedfilesmartdataoperation"></a>
## simulateBulkFeedFileSmartdata

`simulateBulkFeedFileSmartdata(params): Promise<void>`

Simulate a Mastercard bulk file (sandbox only)

Works in the sandbox only (`https://api.sandbox.astrada.co`). Production
has no such call.

Creates a simulated Mastercard bulk-enrollment file and processes it as if
Mastercard had delivered it. The call returns `202 Accepted` at once;
enrolled cards appear as card subscriptions when processing finishes.

A bulk feed must already exist for the `networkReference`, created with
`POST /network-bulk-feeds`.

`cardCount` replays the fixed head of the sandbox test-card pool: the same
cards every call, so once enrolled in a subaccount they deduplicate (no new
`cardsubscription.created`), exactly like a file that is delivered twice.
`newCardCount` draws cards the subaccount has never seen from a reserved
pool, so every call enrolls that many new cards. All included cards get
`transactionsPerCard` transactions with fresh references and recent dates,
so repeat calls always produce `transaction.*` webhooks.


### Example

```ts
import { Configuration, sandbox } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new sandbox.SandboxSimulationApi(config);

await api.simulateBulkFeedFileSmartdata({
  simulateBulkFeedFileSmartdataRequest: sandbox.SimulateBulkFeedFileSmartdataRequestFromJSON({
  "networkReference": "G1234567",
  "cardCount": 5
}),
});
```

### Parameters


- **simulateBulkFeedFileSmartdataRequest** ([SimulateBulkFeedFileSmartdataRequest](SimulateBulkFeedFileSmartdataRequest.md), required)

### Returns

Nothing (an empty response).

### Scopes

`simulation:write`

### Responses

| Status | Description |
|--------|-------------|
| **202** | Accepted. The simulated file was created and is processed asynchronously. The response has no body.  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **413** | Content Too Large |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="simulatebulkfeedfilevbdsoperation"></a>
## simulateBulkFeedFileVbds

`simulateBulkFeedFileVbds(params): Promise<void>`

Simulate a pulled Visa bulk feed delivery (sandbox only)

Works in the sandbox only (`https://api.sandbox.astrada.co`). Production
has no such call.

Simulates one delivery on a Visa bulk feed of `type: VBDS`, the kind
Astrada pulls from Visa instead of receiving a file. The delivery enrolls
cards and, when `transactionsPerCard` is above `0`, adds settlements for
them. The call returns `202 Accepted` at once; enrolled cards appear as
card subscriptions when processing finishes.

A bulk feed must already exist for the `networkReference`, created with
`POST /network-bulk-feeds`; otherwise the call returns `400`.

`cardCount` replays the fixed head of the sandbox card pool: the same
cards every call, so once enrolled in a subaccount they deduplicate (no
new `cardsubscription.created`), exactly like a delivery that arrives
twice. `newCardCount` draws cards the subaccount has never seen from a
reserved pool, so every call enrolls that many new cards. All included
cards get `transactionsPerCard` transactions with fresh ids and recent
dates, so repeat calls always produce `transaction.*` webhooks.


### Example

```ts
import { Configuration, sandbox } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new sandbox.SandboxSimulationApi(config);

await api.simulateBulkFeedFileVbds({
  simulateBulkFeedFileVbdsRequest: sandbox.SimulateBulkFeedFileVbdsRequestFromJSON({
  "networkReference": "1_12345_67890_54321",
  "cardCount": 5
}),
});
```

### Parameters


- **simulateBulkFeedFileVbdsRequest** ([SimulateBulkFeedFileVbdsRequest](SimulateBulkFeedFileVbdsRequest.md), required)

### Returns

Nothing (an empty response).

### Scopes

`simulation:write`

### Responses

| Status | Description |
|--------|-------------|
| **202** | Accepted. The simulated delivery was queued and is processed asynchronously. The response has no body.  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **413** | Content Too Large |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="simulatebulkfeedfilevcfoperation"></a>
## simulateBulkFeedFileVcf

`simulateBulkFeedFileVcf(params): Promise<void>`

Simulate a Visa bulk file (sandbox only)

Works in the sandbox only (`https://api.sandbox.astrada.co`). Production
has no such call.

Creates a simulated Visa bulk-enrollment file (a feed of `type: VCF`) and
processes it as if Visa had delivered it. The call returns
`202 Accepted` at once; enrolled cards appear as card subscriptions when
processing finishes.

A bulk feed must already exist for the `networkReference`, created with
`POST /network-bulk-feeds`.

`cardCount` replays the fixed head of the sandbox test-card pool: the same
cards every call, so once enrolled in a subaccount they deduplicate (no new
`cardsubscription.created`), exactly like a file that is delivered twice.
`newCardCount` draws cards the subaccount has never seen from a reserved
pool, so every call enrolls that many new cards. All included cards get
`transactionsPerCard` transactions with fresh references and recent dates,
so repeat calls always produce `transaction.*` webhooks.


### Example

```ts
import { Configuration, sandbox } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new sandbox.SandboxSimulationApi(config);

await api.simulateBulkFeedFileVcf({
  simulateBulkFeedFileVcfRequest: sandbox.SimulateBulkFeedFileVcfRequestFromJSON({
  "networkReference": "1_123_45_6789",
  "cardCount": 5
}),
});
```

### Parameters


- **simulateBulkFeedFileVcfRequest** ([SimulateBulkFeedFileVcfRequest](SimulateBulkFeedFileVcfRequest.md), required)

### Returns

Nothing (an empty response).

### Scopes

`simulation:write`

### Responses

| Status | Description |
|--------|-------------|
| **202** | Accepted. The simulated file was created and is processed asynchronously. The response has no body.  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **413** | Content Too Large |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="simulatetransactionoperation"></a>
## simulateTransaction

`simulateTransaction(params): Promise<SimulateTransactionAccepted>`

Simulate a transaction (sandbox only)

Works in the sandbox only (`https://api.sandbox.astrada.co`). Production
has no such call.

Starts a new simulated transaction on an enrolled card by publishing one
transaction message, an authorization or a settlement, as if a card
network had sent it. Follow it with
`POST /simulate/transactions/{transactionId}` to add further messages to
the transaction.

Besides `simulation:write`, the access token needs `cards:read`: the card
is read from the public API to resolve its subaccount and network.


### Example

```ts
import { Configuration, sandbox } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new sandbox.SandboxSimulationApi(config);

const result = await api.simulateTransaction({
  simulateTransactionRequest: sandbox.SimulateTransactionRequestFromJSON({
  "cardId": "24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c",
  "type": "authorization",
  "amount": 4500
}),
});
console.log(result);
```

### Parameters


- **simulateTransactionRequest** ([SimulateTransactionRequest](SimulateTransactionRequest.md), required)

### Returns

[SimulateTransactionAccepted](SimulateTransactionAccepted.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "messageId": "9b2e6c4a-1f3d-4e8b-9a7c-2d5f8e1b4c6a"
}
```

### Scopes

`simulation:write`

### Responses

| Status | Description |
|--------|-------------|
| **202** | Accepted. The transaction message was published and is processed asynchronously. The transaction it creates is delivered through the `transaction.created` webhook and can be found with `GET /transactions?transactionMessageId=`.  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |
| **502** | The card could not be read from the sandbox API. Retry the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="simulatetransactionmessageoperation"></a>
## simulateTransactionMessage

`simulateTransactionMessage(params): Promise<SimulateTransactionAccepted>`

Simulate a transaction message (sandbox only)

Works in the sandbox only (`https://api.sandbox.astrada.co`). Production
has no such call.

Publishes one more transaction message (authorization, adjustment,
reversal, settlement or refund) on an existing sandbox transaction. The
transaction can have been created by `POST /simulate/transactions` or by
the scenario endpoint; take its id from the `transaction.created` webhook
or from `GET /transactions?transactionMessageId=`.

Besides `simulation:write`, the access token needs `transactions:read`
and `transaction-messages:read`: the transaction and its messages are read
from the public API to carry over the network reference and the current
hold and settled amounts.

`adjustment` and `reversal` are checked against the hold Astrada has
processed so far and rejected with `409` when there is nothing to adjust
or reverse. The check is best effort: a step published immediately after
another may see the earlier state.


### Example

```ts
import { Configuration, sandbox } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new sandbox.SandboxSimulationApi(config);

const result = await api.simulateTransactionMessage({
  transactionId: '9340721f-bdce-4afa-bd9d-26cceb9d2176',
  simulateTransactionMessageRequest: sandbox.SimulateTransactionMessageRequestFromJSON({
  "type": "settlement"
}),
});
console.log(result);
```

### Parameters


- **transactionId** (`string`, required)
- **simulateTransactionMessageRequest** ([SimulateTransactionMessageRequest](SimulateTransactionMessageRequest.md), required)

### Returns

[SimulateTransactionAccepted](SimulateTransactionAccepted.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "messageId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
}
```

### Scopes

`simulation:write`

### Responses

| Status | Description |
|--------|-------------|
| **202** | Accepted. The transaction message was published and is processed asynchronously. The updated transaction is delivered through the `transaction.updated` webhook.  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **409** | Request conflict with the current state of the target resource |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |
| **502** | The transaction could not be read from the sandbox API. Retry the request. |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

<a id="simulatetransactionscenariooperation"></a>
## simulateTransactionScenario

`simulateTransactionScenario(params): Promise<SimulateTransactionScenarioAccepted>`

Simulate a transaction scenario (sandbox only)

Works in the sandbox only (`https://api.sandbox.astrada.co`). Production
has no such call.

Runs a predefined transaction scenario, such as a purchase followed by a
refund, on an enrolled card. The call publishes every transaction message
of the scenario as if a card network had sent them and returns `202
Accepted` with their ids. The transactions arrive asynchronously through
the `transaction.created` and `transaction.updated` webhooks.

The call does not look the card up first: well-formed ids return `202`
even when they do not name an enrolled card of your account. If no
transaction appears, check that `cardId` is enrolled in `subaccountId`.


### Example

```ts
import { Configuration, sandbox } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new sandbox.SandboxSimulationApi(config);

const result = await api.simulateTransactionScenario({
  simulateTransactionScenarioRequest: sandbox.SimulateTransactionScenarioRequestFromJSON({
  "scenario": "simple_purchase",
  "cardId": "24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c",
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "amount": 1500,
  "currency": "USD"
}),
});
console.log(result);
```

### Parameters


- **simulateTransactionScenarioRequest** ([SimulateTransactionScenarioRequest](SimulateTransactionScenarioRequest.md), required)

### Returns

[SimulateTransactionScenarioAccepted](SimulateTransactionScenarioAccepted.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "transactions": [
    {
      "messageIds": [
        "9b2e6c4a-1f3d-4e8b-9a7c-2d5f8e1b4c6a",
        "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
      ]
    }
  ]
}
```

### Scopes

`simulation:write`

### Responses

| Status | Description |
|--------|-------------|
| **202** | Accepted. The transaction messages were published and are processed asynchronously.  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../../README.md#errors).

[Back to top](#) · [Back to README](../../README.md)

