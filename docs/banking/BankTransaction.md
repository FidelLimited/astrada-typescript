
# BankTransaction

## Properties

### `_links`

[BankTransactionLinks](BankTransactionLinks.md), required

### `id`

`string`, required

The unique identifier of the bank transaction.

### `accountId`

`string`, required

The unique identifier of the account that owns this transaction.

### `subaccountId`

`string`, required

The unique identifier of the subaccount associated with this transaction.

### `bankAccountId`

`string`, required

The unique identifier of the bank account this transaction belongs to.

### `cardId`

`string`, required, can be `null`

The card whose card transaction this bank transaction is matched to. Stamped when a match is persisted and cleared if a later forced rematch supersedes that match, so it is only ever non-null alongside `matchId`. Null while unmatched, including on accounts with linked cards: linking alone never attributes individual bank transactions.


### `matchId`

`string`, required, can be `null`

The identifier of the transaction match, if this bank transaction has been matched to a card transaction.

### `date`

`Date`, required

The date the transaction was posted, in YYYY-MM-DD format.

### `amount`

`number`, required

The transaction amount.

### `currency`

`string`, required

The currency of the transaction following ISO 4217 format.

### `description`

`string`, required, can be `null`

The transaction description provided by the financial institution.

### `merchantName`

`string`, required, can be `null`

The name of the merchant.

### `category`

`Array<string>`, required, can be `null`

The transaction categories assigned by the provider.

### `transactionType`

`string`, required

The type of transaction.
- `debit`: Money sent (outflow).
- `credit`: Money received (inflow).


One of: `debit`, `credit`. A value the SDK does not know yet is passed through as a plain string.

### `source`

`string`, required

The source of this transaction.
- `PLAID`: Synced from a connected financial institution via Plaid.
- `UPLOAD`: Imported from a manually uploaded bank statement.
- `MASTERCARD_US`: Synced from a connected financial institution via Mastercard Open Finance US. Sandbox only.
- `MASTERCARD_EU`: Synced from a connected financial institution via Mastercard Open Finance Europe. Sandbox only.


One of: `PLAID`, `UPLOAD`, `MASTERCARD_US`, `MASTERCARD_EU`. A value the SDK does not know yet is passed through as a plain string.

### `status`

`string`, required

The lifecycle stage of the bank movement, derived from its match pointer and settlement state.
- `posted`: Synced, not yet matched.
- `matched`: Paired to a card transaction without an early settlement of its own (e.g. connector off, or a below-HIGH match): the movement is represented by the card transaction's network settlement, and any standalone it previously emitted is netted to zero.
- `settled`: A bank-only movement settled standalone on the unified feed.
- `early_cleared`: A matched movement settled its card transaction early.
- `superseded`: A previously bank-only movement was retracted or corrected.


One of: `posted`, `matched`, `settled`, `early_cleared`, `superseded`. A value the SDK does not know yet is passed through as a plain string.

### `settlement`

[BankTransactionSettlement](BankTransactionSettlement.md), required, can be `null`

### `createdAt`

`Date`, required

Date and time when this resource was created, in UTC, following ISO 8601 format.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c"
    },
    "bankAccount": {
      "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
    },
    "card": {
      "href": "/cards/5dec2c49-0aa5-4683-a317-427eb5d115f3"
    },
    "match": {
      "href": "/transaction-matches/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e"
    }
  },
  "id": "7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "bankAccountId": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "cardId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
  "matchId": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
  "date": "2025-10-15",
  "amount": 42.5,
  "currency": "USD",
  "description": "UBER TRIP",
  "merchantName": "Uber",
  "category": [
    "Travel"
  ],
  "transactionType": "debit",
  "source": "PLAID",
  "status": "early_cleared",
  "settlement": {
    "state": "early_cleared",
    "emissionType": "early_clearing",
    "emittedAt": "2025-10-15T15:00:00.000Z",
    "supersededAt": null
  },
  "createdAt": "2025-10-15T14:30:00.000Z"
}
```

[Back to top](#) · [Back to README](../../README.md)


