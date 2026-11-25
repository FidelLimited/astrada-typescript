
# BankAccountUpdateResult

## Properties

### `id`

`string`, required

The bank account identifier.

### `cardIds`

`Array<string>`, required

The linked card identifiers.

### `state`

`string`, required

The current state of the bank account.

### `updatedAt`

`Date`, required

When the bank account was last updated.

### `backfill`

[BankAccountUpdateResultBackfill](BankAccountUpdateResultBackfill.md), optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "cardIds": [
    "5dec2c49-0aa5-4683-a317-427eb5d115f3"
  ],
  "state": "active",
  "updatedAt": "2025-10-03T11:00:00.000Z"
}
```

[Back to top](#) · [Back to README](../../README.md)


