# CardVerificationApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getCardVerification**](#getcardverification) | **GET** /card-verifications/3ds/{verificationId} | Retrieve 3DS verification |
| [**listCardVerifications**](#listcardverifications) | **GET** /card-verifications/3ds | List a card\'s 3DS verifications |
| [**unlockCardVerificationAttempts**](#unlockcardverificationattempts) | **POST** /card-verifications/unlock | Unlock a card\'s verification attempt lockout |


<a id="getcardverification"></a>
## getCardVerification

`getCardVerification(params): Promise<CardVerification>`

Retrieve 3DS verification

Returns the current status and detailed information of a specific 3DS verification by its identifier.

### Example

```ts
import { Configuration, CardVerificationApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardVerificationApi(config);

const result = await api.getCardVerification({
  verificationId: '9cac38a2-6584-4c1f-92fd-85223774979b',
});
console.log(result);
```

### Parameters


- **verificationId** (`string`, required)

### Returns

[CardVerification](CardVerification.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/card-verifications/3ds/9fab1bea-bc1e-4757-bd47-479422e5983b"
    },
    "steps": {
      "href": "/card-verifications/3ds/9fab1bea-bc1e-4757-bd47-479422e5983b/steps"
    },
    "currentStep": {
      "href": "/card-verifications/3ds/9fab1bea-bc1e-4757-bd47-479422e5983b/steps/fingerprint"
    }
  },
  "id": "9fab1bea-bc1e-4757-bd47-479422e5983b",
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "cardId": "8309b5f8-d5d8-49bb-9001-38bf1bb0f1e4",
  "type": "3DS",
  "currentStepId": "fingerprint",
  "state": "in-progress",
  "createdAt": "2024-01-04T18:53:32.000Z",
  "updatedAt": "2023-01-04T10:55:12.000Z"
}
```

### Scopes

`card-verifications:read`

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

<a id="listcardverifications"></a>
## listCardVerifications

`listCardVerifications(params): Promise<CardVerificationList>`

List a card\'s 3DS verifications

List the 3DS verifications for a card, most recent first. Use the optional `state`
filter (e.g. `state=failed`) to retrieve only failed verifications; each failed
verification carries a `failureReason` explaining why it failed. This includes
cards declined synchronously at creation (the `POST` returned `400`): those
attempts are persisted as failed verifications with `currentStepId: null`.


### Example

```ts
import { Configuration, CardVerificationApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardVerificationApi(config);

const result = await api.listCardVerifications({
  cardId: '8164683a-8d23-4421-9694-1a81fc9b9c37',
  // state: 'completed',
});
console.log(result);
```

### Parameters


- **cardId** (`string`, required)
- **state** (`'completed' | 'failed' | 'in-progress'`, optional): Optional filter to retrieve only verifications in the given state. One of: `completed`, `failed`, `in-progress`.

### Returns

[CardVerificationList](CardVerificationList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/card-verifications/3ds?cardId=8309b5f8-d5d8-49bb-9001-38bf1bb0f1e4&state=failed"
    }
  },
  "_embedded": {
    "cardVerifications": [
      {
        "_links": {
          "self": {
            "href": "/card-verifications/3ds/9fab1bea-bc1e-4757-bd47-479422e5983b"
          },
          "steps": {
            "href": "/card-verifications/3ds/9fab1bea-bc1e-4757-bd47-479422e5983b/steps"
          }
        },
        "id": "9fab1bea-bc1e-4757-bd47-479422e5983b",
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "cardId": "8309b5f8-d5d8-49bb-9001-38bf1bb0f1e4",
        "type": "3DS",
        "state": "failed",
        "authenticationFlow": "frictionless",
        "failureReason": {
          "category": "authentication_declined",
          "description": "The card issuer declined the 3-D Secure authentication.",
          "retryable": true,
          "code": "05",
          "providerMessage": "The card issuer declined this authentication attempt."
        },
        "createdAt": "2024-01-04T18:53:32.000Z",
        "updatedAt": "2024-01-04T18:55:12.000Z"
      }
    ]
  },
  "totalItems": 1
}
```

### Scopes

`card-verifications:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="unlockcardverificationattempts"></a>
## unlockCardVerificationAttempts

`unlockCardVerificationAttempts(params): Promise<CardVerificationUnlockResult>`

Unlock a card\'s verification attempt lockout

Clear the cross-network verification **attempt lockout** for a card,
identified by its `cardId`. This re-enables verification attempts for the
card after it has been throttled by too many recent hard failures; the
account-scoped, cross-network throttle that protects the non-HIGHEST tiers
(Visa/Stripe, Mastercard/TNS). Idempotent: unlocking a card that has no
active lock succeeds and clears nothing. The HIGHEST per-fingerprint lockout
is **not** affected by this endpoint.


### Example

```ts
import { Configuration, CardVerificationApi } from '@astrada.co/ts-astrada-sdk';
import { CardVerificationUnlockParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new CardVerificationApi(config);

const result = await api.unlockCardVerificationAttempts({
  cardVerificationUnlockParams: CardVerificationUnlockParamsFromJSON({
  "cardId": "00cdba2d-01f0-46bb-b34a-c76d9699e991"
}),
});
console.log(result);
```

### Parameters


- **cardVerificationUnlockParams** ([CardVerificationUnlockParams](CardVerificationUnlockParams.md), required)

### Returns

[CardVerificationUnlockResult](CardVerificationUnlockResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "unlocked": true,
  "cleared": true
}
```

### Scopes

`subaccounts:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | The card\'s attempt lockout was cleared, or the card had no active lock (idempotent).  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

