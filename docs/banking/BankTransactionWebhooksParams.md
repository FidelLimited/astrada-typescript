
# BankTransactionWebhooksParams

## Properties

### `ids`

`Array<string>`, required

List of bank transaction identifiers to emit webhooks for. Must contain at least one ID.

### `webhooks`

`Array<string>`, optional

The types of webhook events to emit. Leave it out and only `banktransaction.created` is sent.

One of: `banktransaction.created`, `transaction.match.created`. A value the SDK does not know yet is passed through as a plain string.

### `forceRematch`

`boolean`, optional

Set to `true` to re-run the matching algorithm for the named transactions before emitting webhooks. Transactions that already have a match are genuinely re-scored: the existing match id is preserved when the pairing survives, updated when a better pairing exists, and removed when the movement no longer matches.

### `dispatchUnmatched`

`boolean`, optional

After the re-match, emit the standalone bank-only feed entry for each named transaction the matcher left unmatched (idempotent per transaction; already-emitted standalones are skipped). Requires `forceRematch: true` and `webhooks` to include `transaction.match.created`; the request is rejected with `400` otherwise, because only a same-run re-match can distinguish a genuinely unmatched movement from a duplicate of an already-settled purchase.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "ids": [
    "7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c"
  ],
  "webhooks": [
    "banktransaction.created",
    "transaction.match.created"
  ],
  "forceRematch": false
}
```

[Back to top](#) · [Back to README](../../README.md)


