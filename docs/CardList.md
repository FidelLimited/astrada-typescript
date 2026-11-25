
# CardList

## Properties

### `_links`

[OffsetPageLinks](OffsetPageLinks.md), required

### `_embedded`

[CardListEmbedded](CardListEmbedded.md), required

### `totalItems`

`number`, required

Total number of cards matching the search criteria

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/cards"
    }
  },
  "_embedded": {
    "cards": [
      {
        "_links": {
          "self": {
            "href": "/cards/8309b5f8-d5d8-49bb-9001-38bf1bb0f1e4"
          }
        },
        "id": "8309b5f8-d5d8-49bb-9001-38bf1bb0f1e4",
        "expiryMonth": 12,
        "expiryYear": 2026,
        "network": "mastercard",
        "country": "USA",
        "createdAt": "2024-02-04T18:41:16.142Z",
        "updatedAt": "2024-02-04T18:41:16.142Z",
        "first6digits": "424242",
        "last4digits": "4242",
        "subaccountId": "da6649a8-f0ea-4af0-b342-c0b5c3e024dd"
      },
      {
        "_links": {
          "self": {
            "href": "/cards/f744b691-bf05-4f2a-ab89-bb1afe4eb840"
          },
          "cardholder": {
            "href": "/cards/f744b691-bf05-4f2a-ab89-bb1afe4eb840/cardholder"
          }
        },
        "id": "f744b691-bf05-4f2a-ab89-bb1afe4eb840",
        "expiryMonth": 11,
        "expiryYear": 2028,
        "network": "mastercard",
        "country": "USA",
        "createdAt": "2024-02-04T18:41:16.142Z",
        "updatedAt": "2024-02-04T18:41:16.142Z",
        "first6digits": "434343",
        "last4digits": "4343",
        "subaccountId": "da6649a8-f0ea-4af0-b342-c0b5c3e024dd"
      }
    ]
  },
  "totalItems": 2
}
```

[Back to top](#) · [Back to README](../README.md)


