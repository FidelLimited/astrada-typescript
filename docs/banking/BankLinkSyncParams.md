
# BankLinkSyncParams

## Properties

### `webhooks`

`Array<string>`, optional

The events this sync sends. Default (field left out) is both. An empty array sends neither; transactions are still stored and matched. Names outside this list are ignored, not refused.

One of: `banktransaction.created`, `transaction.match.created`. A value the SDK does not know yet is passed through as a plain string.

### `force`

`boolean`, optional

Set to `true` to force a full sync even if no new transactions are detected. With `true`:

- Stored transactions: every transaction already stored for the link is gone over again, and `banktransaction.created` is sent again for each when `webhooks` allows it.
- Existing matches: scored again, and `transaction.match.created` sent again, only when `webhooks` lists `transaction.match.created`. With `webhooks` left out they are kept and not sent again.
- Unmatched transactions: whatever `webhooks` lists, a stored transaction with no match yet goes through matching, and a new match is sent when `webhooks` allows it.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "webhooks": [
    "banktransaction.created"
  ],
  "force": false
}
```

[Back to top](#) · [Back to README](../../README.md)


