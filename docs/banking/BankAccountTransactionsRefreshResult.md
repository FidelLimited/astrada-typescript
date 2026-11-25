
# BankAccountTransactionsRefreshResult

## Properties

### `id`

`string`, required

The bank account identifier.

### `requestedAt`

`Date`, required

When the check was requested.

### `durationMs`

`number`, required

How long the provider took to run the check.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "requestedAt": "2026-10-05T00:59:10Z",
  "durationMs": 4210
}
```

[Back to top](#) · [Back to README](../../README.md)


