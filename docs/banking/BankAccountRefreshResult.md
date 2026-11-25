
# BankAccountRefreshResult

## Properties

### `id`

`string`, required

The bank account identifier.

### `hostedLink`

`string`, required

A hosted URL for the user to complete re-authentication.

### `expiresAt`

`Date`, required

When the hosted link expires.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "hostedLink": "https://hosted.plaid.com/link/refresh123",
  "expiresAt": "2025-10-03T14:55:42.000Z"
}
```

[Back to top](#) · [Back to README](../../README.md)


