
# BankAccountBackfillResult

## Properties

### `id`

`string`, required

The bank account identifier.

### `transactionsProcessed`

`number`, required

Unmatched bank transactions in the window that matching looked at, whether imported by this call or already stored.

### `matchesFound`

`number`, required

Matches found against the account's linked cards during the backfill.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "transactionsProcessed": 118,
  "matchesFound": 27
}
```

[Back to top](#) · [Back to README](../../README.md)


