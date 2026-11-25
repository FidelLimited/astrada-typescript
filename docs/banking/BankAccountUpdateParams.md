
# BankAccountUpdateParams

## Properties

### `cardIds`

`Array<string>`, required

The identifiers of cards to link to this bank account for transaction matching. Send an empty array to unlink all cards. Each card must belong to the same subaccount.

### `backfill`

[BankAccountCardsUpdateBackfill](BankAccountCardsUpdateBackfill.md), optional

### `state`

`string`, required

Set to `disconnected` to stop this account's feed and remove its card links while keeping the account, its transactions and its matches readable. With `cardId`, see that field: the account can keep feeding its other cards. This endpoint cannot set it back: a new bank link to the same bank creates a new bank account, and this one stays `disconnected`. When this is the connection's last active account, the connection at the bank is ended too. Disconnecting an account that is already disconnected, or one that was deleted, answers `200` and sends no webhook (an id that never existed still answers `404`). Use `DELETE /bank-accounts/{bankAccountId}` to remove the account and its transactions.

One of: `disconnected`. A value the SDK does not know yet is passed through as a plain string.

### `reason`

`string`, optional

Optional free-text reason recorded with the disconnect. Sent as `reason` on `bankaccount.state_changed`. Default `subscription_deactivated`.

### `cardId`

`string`, optional

Optional SCOPE for the disconnect. Omit for the historical account-scoped behaviour: the whole account is torn down and every card on it loses the feed. Supply the card that was deactivated to scope it to that card: its link is removed and the account keeps feeding any other cards attached to it. Disconnecting the last remaining card still tears the account down, so a single-card account behaves identically either way.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "cardIds": [
    "5dec2c49-0aa5-4683-a317-427eb5d115f3"
  ]
}
```

[Back to top](#) · [Back to README](../../README.md)


