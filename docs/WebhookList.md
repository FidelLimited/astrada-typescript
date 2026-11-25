
# WebhookList

Astrada's Webhook resources.

## Properties

### `_links`

[WebhookListLinks](WebhookListLinks.md), required

### `_embedded`

[WebhookListEmbedded](WebhookListEmbedded.md), required

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/webhooks"
    }
  },
  "_embedded": {
    "webhooks": [
      {
        "_links": {
          "self": {
            "href": "/webhooks/3a45ba7f-8d8f-4f6a-86a5-a17ea0328241"
          }
        },
        "id": "3a45ba7f-8d8f-4f6a-86a5-a17ea0328241",
        "url": "https://example-api.com/path",
        "description": "Example of Webhook description",
        "eventTypes": [
          "transactionmessage.created"
        ],
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "createdAt": "2023-12-19T14:45:00Z",
        "updatedAt": "2023-12-19T14:45:00Z",
        "enabled": true
      },
      {
        "_links": {
          "self": {
            "href": "/webhooks/627f9c6d-ec9f-4118-84f3-97a77f447e32"
          }
        },
        "id": "627f9c6d-ec9f-4118-84f3-97a77f447e32",
        "url": "https://example-api.com/path",
        "description": "Example of Webhook description",
        "eventTypes": [
          "transactionmessage.created"
        ],
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "createdAt": "2023-12-19T14:46:00Z",
        "updatedAt": "2023-12-19T14:46:00Z",
        "enabled": true
      }
    ]
  }
}
```

[Back to top](#) · [Back to README](../README.md)


