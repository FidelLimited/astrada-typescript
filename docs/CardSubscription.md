
# CardSubscription

## Properties

### `_links`

[CardSubscriptionLinks](CardSubscriptionLinks.md), required

### `_embedded`

[CardSubscriptionEmbedded](CardSubscriptionEmbedded.md), optional

### `id`

`string`, required

The unique identifier of this subscription entity.

### `accountId`

`string`, optional

The unique identifier of the account related to this entity.

### `subaccountId`

`string`, required

The unique identifier of the subaccount related to this entity.

### `cardId`

`string`, required

The unique identifier of the card related to this entity.

### `customerReferenceId`

`string`, optional, can be `null`

An optional id in UUID format passed by the customer to associate a context with the subscription.

### `state`

`string`, required

State of the subscription. `active` and `pending` subscriptions are both considered enrolled in Astrada's
platform. A `pending` subscription is enrolled from a network roster while the card is still inactive at the
network (e.g. Mastercard Smart Data `I` status): it is customer-visible but has not yet received a
transaction. It exits only by promotion to `active` (a later roster `active` record or the card's first
clearing transaction), explicit deactivation, or expiry. Virtual cards are excluded from `pending` enrollment.


One of: `pending`, `active`, `deactivated`, `expired`, `reqSCA`, `failed-to-create`. A value the SDK does not know yet is passed through as a plain string.

### `deactivationReason`

[CardSubscriptionDeactivationReason](CardSubscriptionDeactivationReason.md), optional

The reason given when this subscription was deactivated. Only present on a deactivated subscription
that was given a reason; the field is left out otherwise. New values may be added, so treat an
unknown value as `other`.


### `effectiveDate`

`Date`, required

Date and time when this card subscription will be activated and start receiving data, in UTC, following ISO 8601 format.

### `expirationDate`

`Date`, required

Date and time when this card subscription will become expired and stop receiving data, in UTC, following ISO 8601 format.

### `networkBulkFeedId`

`string`, optional, can be `null`

The unique identifier of the network bulk feed associated with this card subscription. Present when the `enrollmentType` is `network-bulk`, null otherwise.

### `bankAccountId`

`string`, optional, can be `null`

The bank account this subscription's card was originally materialized from; present only when `enrollmentType` is `bank-feed` (the analog of `networkBulkFeedId` for bank-connected enrollments). This is provenance and does not re-point if a re-link later attaches the card to a successor account; the current link surface is the bank account's `cardIds`.

### `enrollmentType`

`string`, required

The flow that led to the creation of the card subscription. `cardholder-single` refers to enrollments where cardholders themselves are responsible for inputting card data and where a single card is attempted at a time. `network-bulk` refers to enrollments where card data will be captured by Astrada using network data sources (eg Mastercard Smart Data) and where many cards may be attempted at once. `bank-feed` refers to cards materialized from a bank connection (e.g. American Express via the hosted bank-linking flow); the bank-side analog of `network-bulk`, with `bankAccountId` as the back-reference.

One of: `cardholder-single`, `network-bulk`, `bank-feed`. A value the SDK does not know yet is passed through as a plain string.

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

[Back to top](#) · [Back to README](../README.md)


