
# BankTransactionList

## Properties

### `items`

[Array<BankTransaction>](BankTransaction.md), required

### `pagination`

[CursorPagination](CursorPagination.md), required

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "items": [
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
      "status": "matched",
      "settlement": null,
      "createdAt": "2025-10-15T14:30:00.000Z"
    },
    {
      "_links": {
        "self": {
          "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/2e5f8a1b-4c7d-3e9f-b0a2-8d6c4f1e7b3a"
        },
        "bankAccount": {
          "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
        }
      },
      "id": "2e5f8a1b-4c7d-3e9f-b0a2-8d6c4f1e7b3a",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "bankAccountId": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
      "cardId": null,
      "matchId": null,
      "date": "2025-10-14",
      "amount": 156.23,
      "currency": "USD",
      "description": "AMAZON MARKETPLACE",
      "merchantName": "Amazon",
      "category": [
        "Shopping"
      ],
      "transactionType": "debit",
      "source": "PLAID",
      "status": "posted",
      "settlement": null,
      "createdAt": "2025-10-14T09:15:00.000Z"
    }
  ],
  "pagination": {
    "cursor": "ZXhhbXBsZQ==",
    "hasMore": true
  }
}
```

[Back to top](#) · [Back to README](../../README.md)


