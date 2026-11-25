
# BankSubscriptionList

## Properties

### `items`

[Array<BankSubscription>](BankSubscription.md), required

### `pagination`

[CursorPagination](CursorPagination.md), required

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "items": [
    {
      "id": "e4b7c9a2-1d3f-4e8a-9c6b-5f2d7a0e8b1c",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "connectionId": "conn_abc123def456",
      "provider": "PLAID",
      "institutionName": "Chase",
      "state": "active",
      "webhook": {
        "url": "https://example.com/webhooks/banking",
        "status": "confirmed"
      },
      "syncCursor": null,
      "createdAt": "2025-10-03T10:55:42.000Z",
      "updatedAt": "2025-10-03T10:55:42.000Z"
    }
  ],
  "pagination": {
    "hasMore": false
  }
}
```

[Back to top](#) · [Back to README](../../README.md)


