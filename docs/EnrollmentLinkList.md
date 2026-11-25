
# EnrollmentLinkList

## Properties

### `_embedded`

[EnrollmentLinkListEmbedded](EnrollmentLinkListEmbedded.md), required

### `_links`

[PageLinks](PageLinks.md), required

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_embedded": {
    "enrollmentLinks": [
      {
        "_links": {
          "self": {
            "href": "/enrollment-links/8e2f4a6c-1b3d-4e5f-9a7b-2c4d6e8f0a1b"
          }
        },
        "id": "8e2f4a6c-1b3d-4e5f-9a7b-2c4d6e8f0a1b",
        "kind": "team",
        "subaccountId": "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
        "startingPoint": "card",
        "state": "active",
        "expiresAt": "2026-11-19T10:00:00.000Z",
        "maxUses": 50,
        "uses": 12,
        "starts": 12,
        "createdBy": {
          "via": "sdk",
          "clientId": "5a7c9e1b-3d5f-4a6c-8e0b-2d4f6a8c0e1f"
        },
        "createdAt": "2026-11-05T10:00:00.000Z",
        "updatedAt": "2026-11-06T16:41:05.000Z"
      },
      {
        "_links": {
          "self": {
            "href": "/enrollment-links/1d0a6c52-8f3e-4b7a-9c21-5e4d3b2a1f09"
          }
        },
        "id": "1d0a6c52-8f3e-4b7a-9c21-5e4d3b2a1f09",
        "kind": "cardholder",
        "subaccountId": "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
        "startingPoint": "card",
        "state": "used",
        "expiresAt": "2026-11-11T18:00:00.000Z",
        "maxUses": 1,
        "uses": 1,
        "starts": 2,
        "customerReferenceId": "2b7e9d14-5c3a-4f8e-9b21-0d6c4a8e7f35",
        "platformName": "Ledgerly",
        "organizationName": "Vertex Industries",
        "createdBy": {
          "via": "api",
          "clientId": "3f9c1e7a-2b4d-4c6e-8f0a-1b3d5e7f9a2c"
        },
        "createdAt": "2026-11-04T18:00:00.000Z",
        "updatedAt": "2026-11-05T09:14:22.000Z",
        "usedAt": "2026-11-05T09:14:22.000Z"
      }
    ]
  },
  "_links": {
    "self": {
      "href": "/enrollment-links?subaccountId=6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b&limit=2"
    },
    "next": {
      "href": "/enrollment-links?subaccountId=6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b&limit=2&cursor=eyJwayI6ImxpbmsjMWQwYTZjNTIifQ"
    }
  }
}
```

[Back to top](#) · [Back to README](../README.md)


