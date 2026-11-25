
# BankAccountMaintenanceResult

## Properties

### `linked`

`{ [key: string]: Array<string>; }`, required

bankAccountId -> cardIds linked in THIS run.

### `minted`

[{ [key: string]: BankAccountMaintenanceResultMintedValue; }](BankAccountMaintenanceResultMintedValue.md), optional

Present whenever `mint: true` was sent (`{}` when nothing was minted). bankAccountId -> the card minted for it in THIS run. `linkedHere` is false when the card is held by a sibling account instead (a re-link of the same bank; the background re-home converges it).


### `skipped`

`{ [key: string]: string; }`, optional

Present whenever `mint: true` was sent (`{}` when nothing was skipped). bankAccountId -> why the mint pass did not mint for it: `already_materialized` (the account already holds a minted card), `existing_enrolled_card` (its last 4 belongs to a card the customer enrolled directly) or `no_institution_id` (the connection never recorded its institution).


### `failures`

`{ [key: string]: string; }`, optional

Present whenever `mint: true` was sent (`{}` when no mint failed). bankAccountId -> the failure. The pass is idempotent, so the request can simply be repeated.


### `junctionLast4`

[BankAccountMaintenanceResultJunctionLast4](BankAccountMaintenanceResultJunctionLast4.md), optional

### `cardholderCards`

[BankAccountMaintenanceResultCardholderCards](BankAccountMaintenanceResultCardholderCards.md), optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "linked": {
    "059d5e6a-cfb1-46e6-ab84-6586582b6b58": [
      "da28e1b8-c7a4-4575-b72f-3a88d6fe34df"
    ]
  }
}
```

[Back to top](#) · [Back to README](../../README.md)


