
# TransactionMatchList

## Properties

### `items`

[Array<TransactionMatch>](TransactionMatch.md), required

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
          "href": "/transaction-matches/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e"
        },
        "cardTransaction": {
          "href": "/transactions/a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d"
        },
        "bankTransaction": {
          "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11/7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c"
        }
      },
      "id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "cardTransactionId": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
      "bankTransactionId": "7f2a9c4e-3b1d-4e8f-a5c7-6d0e2f9b8a3c",
      "confidence": "HIGH",
      "score": 0.85,
      "cardTransaction": {
        "date": "2025-10-15",
        "amount": 42.5,
        "currency": "USD",
        "descriptor": "UBER TRIP"
      },
      "bankTransaction": {
        "date": "2025-10-15",
        "amount": 42.5,
        "currency": "USD",
        "description": "UBER TRIP",
        "merchantName": "Uber"
      },
      "reasons": [
        {
          "type": "Amount",
          "score": 1,
          "cardValue": "42.50",
          "bankValue": "42.50",
          "diff": 0,
          "message": "Exact amount match ($42.50)"
        },
        {
          "type": "Date",
          "score": 0.9,
          "cardValue": "2025-10-15",
          "bankValue": "2025-10-15",
          "diff": 0,
          "message": "Transaction dates within 1 day"
        },
        {
          "type": "Merchant",
          "score": 0.85,
          "cardValue": "UBER TRIP",
          "bankValue": "Uber",
          "diff": 0,
          "message": "Merchant name contains match (Uber)"
        }
      ],
      "createdAt": "2025-10-15T14:31:00.000Z"
    }
  ],
  "pagination": {
    "hasMore": false
  }
}
```

[Back to top](#) · [Back to README](../../README.md)


