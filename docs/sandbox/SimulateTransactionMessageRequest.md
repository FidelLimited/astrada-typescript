
# SimulateTransactionMessageRequest

Publishes one more transaction message on an existing sandbox transaction.
The message reuses the transaction's card, network, currency, merchant and
network reference, so the new message joins the same transaction.


## Properties

### `type`

`string`, required

The message to publish. `amount` is in minor units of the transaction's
currency; whether it is required depends on the type:
- `authorization`: an additional authorization that increases the hold.
  `amount` is required.
- `adjustment`: replaces the current hold with `amount` (the new total).
  `amount` is required. Rejected with `409` when nothing is on hold.
- `reversal`: releases `amount` from the hold. Defaults to the full
  remaining hold. Rejected with `409` when nothing is on hold or when
  `amount` exceeds the hold.
- `settlement`: clears `amount`, moving it from the hold to the settled
  amount. Defaults to the remaining hold; required when nothing is on
  hold.
- `refund`: negative settlement linked to this transaction. Nets into it
  while it is still PENDING or on accounts that correlate refunds;
  otherwise (the default for API-created accounts) a SETTLED transaction
  gets a separate refund transaction with its own `transaction.created`.
  Defaults to the settled amount; required when nothing has been settled.


One of: `authorization`, `adjustment`, `reversal`, `settlement`, `refund`. A value the SDK does not know yet is passed through as a plain string.

### `amount`

`number`, optional

Amount in minor units of the transaction's currency. See `type` for
which types require it and what it defaults to otherwise.


### `dateTime`

`Date`, optional

Timestamp of the message, ISO 8601 with a timezone offset. Must not be in
the future. Defaults to one second after the transaction's latest
message, or to the time of the request if that is later; when the latest
message is already ahead of the clock (an end-of-day message, see below),
the time of the request. Set an earlier value to backdate a message (for
example an authorization that joins a settlement-first transaction).

As in production, Visa settlements and reversals and Amex settlements
are published with an end-of-day `dateTime`: the UTC date of this value
at `23:59:59Z`.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "type": "settlement"
}
```

[Back to top](#) · [Back to README](../../README.md)


