
# BankSubscription

## Properties

### `id`

`string`, required

The unique identifier of the bank subscription.

### `accountId`

`string`, required

The unique identifier of the account that owns this subscription.

### `subaccountId`

`string`, required

The unique identifier of the subaccount associated with this subscription.

### `connectionId`

`string`, required

The provider's unique connection identifier (e.g. Plaid item ID).

### `provider`

`string`, required

The banking data provider for this subscription.
- `PLAID`: Connected through Plaid.
- `MASTERCARD_US`: Connected through Mastercard Open Finance US. Sandbox only.
- `MASTERCARD_EU`: Connected through Mastercard Open Finance Europe. Sandbox only.


One of: `PLAID`, `MASTERCARD_US`, `MASTERCARD_EU`. A value the SDK does not know yet is passed through as a plain string.

### `institutionName`

`string`, required

The name of the connected financial institution.

### `state`

`string`, required

Current state of the subscription.
- `active`: The connection is functioning normally.
- `error`: The connection has encountered an error.
- `auth_required`: The connection requires user re-authentication.
- `disconnected`: The connection has been disconnected.


One of: `active`, `error`, `auth_required`, `disconnected`. A value the SDK does not know yet is passed through as a plain string.

### `webhook`

[BankSubscriptionWebhook](BankSubscriptionWebhook.md), required

### `syncCursor`

`string`, required, can be `null`

The current transaction sync cursor for this subscription.

### `lastSyncedAt`

`Date`, optional, can be `null`

Last successful sync of this connection, in UTC, following ISO 8601 format. Null until the first sync.

### `authErrorFirstSeenAt`

`Date`, optional, can be `null`

When a sync first found that the bank needs the user to sign in again, in UTC, following ISO 8601 format. Null when no such error is open.

### `institutionLastCheckedAt`

`Date`, optional, can be `null`

When the bank data provider last reached the bank for this connection, in UTC, following ISO 8601 format. Null when the provider gives no such time.

### `institutionLastFailedAt`

`Date`, optional, can be `null`

When the bank data provider last failed to reach the bank for this connection, in UTC, following ISO 8601 format. Null when the provider gives no such time.

### `institutionHealth`

[BankSubscriptionInstitutionHealth](BankSubscriptionInstitutionHealth.md), optional, can be `null`

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
  "id": "e4b7c9a2-1d3f-4e8a-9c6b-5f2d7a0e8b1c",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "connectionId": "conn_abc123def456",
  "provider": "PLAID",
  "institutionName": "Chase",
  "state": "active",
  "webhook": {
    "url": "https://example.com/webhooks/banking",
    "status": "confirmed"
  },
  "syncCursor": null,
  "createdAt": "2025-10-03T10:55:42.000Z",
  "updatedAt": "2025-10-03T10:55:42.000Z"
}
```

[Back to top](#) · [Back to README](../../README.md)


