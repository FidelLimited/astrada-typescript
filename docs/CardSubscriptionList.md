
# CardSubscriptionList

## Properties

### `_links`

[OffsetPageLinks](OffsetPageLinks.md), required

### `_embedded`

[CardSubscriptionListEmbedded](CardSubscriptionListEmbedded.md), required

### `totalItems`

`number`, required

Total number of card subscriptions matching the search criteria

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/card-subscriptions"
    }
  },
  "_embedded": {
    "cardSubscriptions": [
      {
        "_links": {
          "self": {
            "href": "/card-subscriptions/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
          },
          "card": {
            "href": "/cards/5dec2c49-0aa5-4683-a317-427eb5d115f3"
          },
          "networkBulkFeed": {
            "href": "/network-bulk-feeds/7b3e4f12-9a8c-4d5e-b6f1-2c3d4e5f6a7b"
          }
        },
        "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "cardId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
        "customerReferenceId": "5dec2c49-0aa5-4683-a317-427eb5d115f3",
        "networkBulkFeedId": "7b3e4f12-9a8c-4d5e-b6f1-2c3d4e5f6a7b",
        "enrollmentType": "network-bulk",
        "state": "active",
        "effectiveDate": "2024-12-20T14:45:00Z",
        "expirationDate": "2025-06-19T14:45:00Z",
        "createdAt": "2024-12-19T14:45:00Z",
        "updatedAt": "2024-12-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/card-subscriptions/c73f2da7-aa1f-4775-ad38-864b1b6f3162"
          },
          "card": {
            "href": "/cards/0457c83a-8eb7-4526-b05a-dc9fb1854fe8"
          }
        },
        "id": "c73f2da7-aa1f-4775-ad38-864b1b6f3162",
        "subaccountId": "29cb4277-b812-4137-b008-e0befa8c6a47",
        "cardId": "0457c83a-8eb7-4526-b05a-dc9fb1854fe8",
        "customerReferenceId": "0457c83a-8eb7-4526-b05a-dc9fb1854fe8",
        "networkBulkFeedId": "d4e5f6a7-b8c9-4d0e-a1b2-c3d4e5f6a7b8",
        "enrollmentType": "cardholder-single",
        "state": "active",
        "effectiveDate": "2024-10-20T14:45:00Z",
        "expirationDate": "2025-05-19T14:45:00Z",
        "createdAt": "2024-10-19T14:45:00Z",
        "updatedAt": "2024-10-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/card-subscriptions/5f8e6832-97d3-4ab5-8144-9fbbbcd2b285"
          },
          "card": {
            "href": "/cards/24595efb-4fe5-4c76-a7d3-8bd9d44a96cc"
          },
          "networkBulkFeed": {
            "href": "/network-bulk-feeds/0a20c636-b445-4a95-a3ea-621306ed685c"
          }
        },
        "id": "5f8e6832-97d3-4ab5-8144-9fbbbcd2b285",
        "subaccountId": "29cb4277-b812-4137-b008-e0befa8c6a47",
        "cardId": "24595efb-4fe5-4c76-a7d3-8bd9d44a96cc",
        "customerReferenceId": "0457c83a-8eb7-4526-b05a-dc9fb1854fe8",
        "networkBulkFeedId": "0a20c636-b445-4a95-a3ea-621306ed685c",
        "enrollmentType": "network-bulk",
        "state": "active",
        "effectiveDate": "2025-03-20T14:45:00Z",
        "expirationDate": "2029-05-19T14:45:00Z",
        "createdAt": "2025-03-19T14:45:00Z",
        "updatedAt": "2025-03-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/card-subscriptions/9c1d0b47-3e5a-4f28-9d6b-71a4c8e2f503"
          },
          "card": {
            "href": "/cards/e8b45f19-2c76-4a83-b5d1-9f0e3a7c64d2"
          },
          "networkBulkFeed": {
            "href": "/network-bulk-feeds/0a20c636-b445-4a95-a3ea-621306ed685c"
          }
        },
        "id": "9c1d0b47-3e5a-4f28-9d6b-71a4c8e2f503",
        "subaccountId": "29cb4277-b812-4137-b008-e0befa8c6a47",
        "cardId": "e8b45f19-2c76-4a83-b5d1-9f0e3a7c64d2",
        "customerReferenceId": "e8b45f19-2c76-4a83-b5d1-9f0e3a7c64d2",
        "networkBulkFeedId": "0a20c636-b445-4a95-a3ea-621306ed685c",
        "enrollmentType": "network-bulk",
        "state": "pending",
        "effectiveDate": "2025-04-02T09:15:00Z",
        "expirationDate": "2029-05-19T14:45:00Z",
        "createdAt": "2025-04-01T09:15:00Z",
        "updatedAt": "2025-04-01T09:15:00Z"
      }
    ]
  },
  "totalItems": 4
}
```

[Back to top](#) · [Back to README](../README.md)


