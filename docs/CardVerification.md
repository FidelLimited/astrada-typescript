
# CardVerification

## Properties

### `_links`

[CardVerificationLinks](CardVerificationLinks.md), required

### `id`

`string`, required

The unique identifier of the Verification entity.

### `subaccountId`

`string`, required

The unique identifier of the subaccount related to this entity.

### `cardId`

`string`, required

The unique identifier of the card related to this entity.

### `type`

`string`, required

Verification Step Type

One of: `3DS`. A value the SDK does not know yet is passed through as a plain string.

### `currentStepId`

`string`, optional, can be `null`

The identifier of the next step the client should execute. `null` when
the verification has no follow-up step; typically because the issuer
supports frictionless authentication, or because the card did not
require interactive 3DS. When `null`, `state` will be `completed` on the
creation response and clients should not call any `/steps/...` endpoint.

On retrieved/listed verifications, `currentStepId` is also `null` with
`state: failed` when the card was declined synchronously at creation
(the creation call returned `400`, and the attempt is persisted as a
failed verification with its `failureReason`).

For the HIGHEST tier, a frictionless 3DS outcome does NOT complete the
verification: it returns `stripe-holds-pending` (the cardholder must
initiate two small verification holds via `/steps/place-holds`), which
then advances to `stripe-amount-confirm` (the cardholder reads the two
amounts back via `/steps/amount-confirm`).


One of: `fingerprint`, `challenge`, `stripe-3ds`, `stripe-holds-pending`, `stripe-amount-confirm`, ``. A value the SDK does not know yet is passed through as a plain string.

### `state`

`string`, required

Current Verification state

One of: `completed`, `failed`, `in-progress`. A value the SDK does not know yet is passed through as a plain string.

### `clientSecret`

`string`, optional

Stripe SetupIntent or PaymentIntent client secret, used by the client to run `stripe.handleNextAction`. Returned whenever the verification is on the Stripe 3DS step; on the creation response (`POST /card-verifications/3ds`) and on the retrieve response (`GET /card-verifications/3ds/{verificationId}`) while `currentStepId` is `stripe-3ds`.

### `stripePublishableKey`

`string`, optional

Stripe publishable key to initialize Stripe.js on the client. Returned alongside `clientSecret` (creation response and retrieve response while `currentStepId` is `stripe-3ds`).

### `authenticationFlow`

`string`, optional, can be `null`

The 3DS authentication flow attested by the issuer, surfaced at the terminal state.
`challenge` = the cardholder actively authenticated; `frictionless` = the issuer approved
without interaction; `null` = 3DS was not engaged (e.g. a low-risk automatic skip).


One of: `challenge`, `frictionless`, ``. A value the SDK does not know yet is passed through as a plain string.

### `failureReason`

[FailureReason](FailureReason.md), optional

Normalized, customer-facing reason the verification failed. Present only when
`state` is `failed`; read it to triage the failure (category, retryability,
and the issuer's message). See the `FailureReason` schema.


### `createdAt`

`Date`, required

Date and time when this resource was created, in UTC, following ISO 8601 format.

### `updatedAt`

`Date`, required

Date and time when this resource was last updated, in UTC, following ISO 8601 format.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

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

[Back to top](#) · [Back to README](../README.md)


