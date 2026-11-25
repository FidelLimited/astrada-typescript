
# SimulateTransactionRequest

Starts a new simulated transaction on an enrolled sandbox card by publishing
a single transaction message. Every field other than `cardId` and `type` is
optional and falls back to a default.


## Properties

### `cardId`

`string`, required

The identifier of the enrolled card to transact against. The card must
belong to the account of the access token; the subaccount and, unless
`network` is given, the network are read from the card.


### `type`

`string`, required

The first message of the new transaction.
- `authorization`: publishes an authorization request, creating a
  `PENDING` transaction with `amount` on hold.
- `settlement`: publishes a clearing with no prior authorization,
  creating a `SETTLED` transaction with `amount` settled and nothing on
  hold. A later `authorization` step on the transaction joins it.


One of: `authorization`, `settlement`. A value the SDK does not know yet is passed through as a plain string.

### `amount`

`number`, optional

Transaction amount in minor units of `currency` (for example `4500` for
45.00 USD). Defaults to `4500`.


### `currency`

`string`, optional

ISO 4217 three-letter currency code of the transaction, case
insensitive. Must be a currency transactions can be made in; fund codes
and precious metals are rejected with `400`. Defaults to `USD`.


### `network`

`string`, optional

Card network the message is published on. Defaults to the card's own
network; the request is rejected with `400` when this field is omitted
and the card has no network or one outside this list.


One of: `VISA`, `MASTERCARD`, `AMEX`. A value the SDK does not know yet is passed through as a plain string.

### `merchant`

[SimulateTransactionRequestMerchant](SimulateTransactionRequestMerchant.md), optional

### `dateTime`

`Date`, optional

Timestamp of the message, ISO 8601 with a timezone offset. Must not be in
the future. Defaults to the time of the request.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "cardId": "24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c",
  "type": "authorization",
  "amount": 4500
}
```

[Back to top](#) · [Back to README](../../README.md)


