
# NetworkBulkFeedList

## Properties

### `_links`

[OffsetPageLinks](OffsetPageLinks.md), required

### `_embedded`

[NetworkBulkFeedListEmbedded](NetworkBulkFeedListEmbedded.md), required

### `totalItems`

`number`, required

Total number of network bulk feeds

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/network-bulk-feeds"
    }
  },
  "_embedded": {
    "networkBulkFeeds": [
      {
        "_links": {
          "self": {
            "href": "/network-bulk-feeds/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
          }
        },
        "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "network": "MASTERCARD",
        "networkReference": "G1234567",
        "state": "submitted",
        "type": "SMARTDATA",
        "panFormat": "encrypted",
        "createdAt": "2024-12-19T14:45:00Z",
        "updatedAt": "2024-12-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/network-bulk-feeds/c73f2da7-aa1f-4775-ad38-864b1b6f3162"
          }
        },
        "id": "c73f2da7-aa1f-4775-ad38-864b1b6f3162",
        "subaccountId": "29cb4277-b812-4137-b008-e0befa8c6a47",
        "network": "MASTERCARD",
        "networkReference": "G1234567",
        "state": "submitted",
        "type": "SMARTDATA",
        "panFormat": "encrypted",
        "createdAt": "2024-10-19T14:45:00Z",
        "updatedAt": "2024-10-19T14:45:00Z"
      },
      {
        "_links": {
          "self": {
            "href": "/network-bulk-feeds/a3b1c2d4-5e6f-7890-abcd-ef1234567890"
          }
        },
        "id": "a3b1c2d4-5e6f-7890-abcd-ef1234567890",
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "network": "VISA",
        "networkReference": "1_123_45_6789",
        "state": "failed",
        "type": "VBDS",
        "panFormat": "encrypted",
        "errorReason": "Starter data ingestion failed: invalid RPIC configuration",
        "createdAt": "2024-12-19T14:45:00Z",
        "updatedAt": "2024-12-20T10:30:00Z"
      }
    ]
  },
  "totalItems": 3
}
```

[Back to top](#) · [Back to README](../README.md)


