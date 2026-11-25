
# BankAccountList

## Properties

### `items`

[Array<BankAccount>](BankAccount.md), required

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
          "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
        },
        "transactions": {
          "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11?bankAccountId=3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
        },
        "bankLink": {
          "href": "/bank-links/enrollment_792dcb7d"
        }
      },
      "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "bankLinkId": "enrollment_792dcb7d",
      "externalId": "plaid_acc_792dcb7d",
      "cardIds": [
        "5dec2c49-0aa5-4683-a317-427eb5d115f3"
      ],
      "cards": [],
      "institutionName": "Chase",
      "name": "Checking",
      "mask": "1234",
      "type": "checking",
      "currency": "USD",
      "state": "active",
      "subscriptionState": "active",
      "lastSyncedAt": "2025-10-03T11:12:07.000Z",
      "createdAt": "2025-10-03T10:55:42.000Z",
      "updatedAt": "2025-10-03T10:55:42.000Z"
    },
    {
      "_links": {
        "self": {
          "href": "/bank-accounts/9b7e4d2f-8a3c-1e6f-d5b0-2c4a6e8f0d1b"
        },
        "transactions": {
          "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11?bankAccountId=9b7e4d2f-8a3c-1e6f-d5b0-2c4a6e8f0d1b"
        },
        "bankLink": {
          "href": "/bank-links/enrollment_792dcb7d"
        }
      },
      "id": "9b7e4d2f-8a3c-1e6f-d5b0-2c4a6e8f0d1b",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "bankLinkId": "enrollment_792dcb7d",
      "externalId": "plaid_acc_792dcb7e",
      "cardIds": [],
      "cards": [],
      "institutionName": "Chase",
      "name": "Savings",
      "mask": "5678",
      "type": "checking",
      "currency": "USD",
      "state": "active",
      "subscriptionState": "active",
      "lastSyncedAt": "2025-10-03T11:12:07.000Z",
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


