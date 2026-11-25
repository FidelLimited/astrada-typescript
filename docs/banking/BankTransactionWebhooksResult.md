
# BankTransactionWebhooksResult

## Properties

### `message`

`string`, required

Human-readable summary of the operation.

### `emitted`

`number`, required

Number of webhook events emitted.

### `resent`

`number`, required

Number of webhooks resent.

### `matched`

`number`, required

Number of transactions that were matched.

### `skipped`

`number`, required

Number of transactions that were skipped.

### `failed`

[Array<BankTransactionWebhookFailure>](BankTransactionWebhookFailure.md), required

Transactions that failed to process.

### `dispatched`

`number`, optional

Number of standalone bank-only emissions dispatched for still-unmatched transactions. Only present when `dispatchUnmatched` was requested (and on service versions that support the flag).

### `dispatchError`

`string`, optional

Present when the standalone dispatch step failed after a successful re-match; the matching results above still stand.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "message": "Processed 1 transactions",
  "emitted": 2,
  "resent": 0,
  "matched": 1,
  "skipped": 0,
  "failed": []
}
```

[Back to top](#) · [Back to README](../../README.md)


