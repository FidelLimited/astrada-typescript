
# BankLinkList

## Properties

### `items`

[Array<BankLink>](BankLink.md), required

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
          "href": "/bank-links/enrollment_792dcb7d"
        },
        "bankAccounts": [
          {
            "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
          }
        ]
      },
      "id": "enrollment_792dcb7d",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "state": "completed",
      "provider": "plaid",
      "hostedLink": null,
      "linkExpiresAt": null,
      "completedAt": "2025-10-03T10:55:42.000Z",
      "bankAccounts": [
        {
          "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
          "name": "Checking"
        }
      ],
      "createdAt": "2025-10-03T10:25:27.069Z"
    },
    {
      "_links": {
        "self": {
          "href": "/bank-links/enrollment_a1b2c3d4"
        }
      },
      "id": "enrollment_a1b2c3d4",
      "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
      "state": "pending",
      "provider": "plaid",
      "hostedLink": "https://hosted.plaid.com/link/abc123",
      "linkExpiresAt": "2025-10-04T14:25:27.000Z",
      "createdAt": "2025-10-04T10:25:27.069Z"
    }
  ],
  "pagination": {
    "cursor": "ZXhhbXBsZQ==",
    "hasMore": false
  }
}
```

[Back to top](#) · [Back to README](../../README.md)


