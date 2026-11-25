
# CardVerificationList

## Properties

### `_links`

[SelfLinks](SelfLinks.md), required

### `_embedded`

[CardVerificationListEmbedded](CardVerificationListEmbedded.md), required

### `totalItems`

`number`, required

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/card-verifications/3ds?cardId=8309b5f8-d5d8-49bb-9001-38bf1bb0f1e4&state=failed"
    }
  },
  "_embedded": {
    "cardVerifications": [
      {
        "_links": {
          "self": {
            "href": "/card-verifications/3ds/9fab1bea-bc1e-4757-bd47-479422e5983b"
          },
          "steps": {
            "href": "/card-verifications/3ds/9fab1bea-bc1e-4757-bd47-479422e5983b/steps"
          }
        },
        "id": "9fab1bea-bc1e-4757-bd47-479422e5983b",
        "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
        "cardId": "8309b5f8-d5d8-49bb-9001-38bf1bb0f1e4",
        "type": "3DS",
        "state": "failed",
        "authenticationFlow": "frictionless",
        "failureReason": {
          "category": "authentication_declined",
          "description": "The card issuer declined the 3-D Secure authentication.",
          "retryable": true,
          "code": "05",
          "providerMessage": "The card issuer declined this authentication attempt."
        },
        "createdAt": "2024-01-04T18:53:32.000Z",
        "updatedAt": "2024-01-04T18:55:12.000Z"
      }
    ]
  },
  "totalItems": 1
}
```

[Back to top](#) · [Back to README](../README.md)


