
# BankAccountMaintenanceParams

## Properties

### `subaccountId`

`string`, required

The subaccount to run maintenance over.

### `mint`

`boolean`, optional

After the mask pass, also mint a bank-feed card for each of the subaccount's eligible credit bank accounts that holds no card. Accounts that already hold a minted card are skipped.


### `backfillJunctionLast4`

`boolean`, optional

After the mask pass, also fill each of the subaccount's card links with the last 4 it answers to, where still unknown, from the cards directory.


### `createCardholderCards`

`boolean`, optional

After the mask pass, also create and name the bank-feed cards of the cardholders behind the subaccount's pooled American Express billing accounts, as the scheduled job does. Does nothing unless Astrada has switched the feature on for the subaccount.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5"
}
```

[Back to top](#) · [Back to README](../../README.md)


