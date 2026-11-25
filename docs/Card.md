
# Card

## Properties

### `_links`

[CardLinks](CardLinks.md), required

### `_embedded`

[CardEmbedded](CardEmbedded.md), optional

### `id`

`string`, required

The unique identifier of this card entity.

### `subaccountId`

`string`, required

The unique identifier of the subaccount related to this entity.

### `expiryMonth`

`number`, required

The month that the card will expire in MM format.

### `expiryYear`

`number`, required

The year that the card will expire in YYYY format.

### `first6digits`

`string`, optional, can be `null`

The first 6 digits of the card number (PAN). Nullable for bank-derived cards
(created from a bank connection, where the full PAN is never seen); populated when
known (e.g. the SDK captured the BIN before pivoting to the bank flow) and attached
when the card is later PAN-enrolled (upgrade-in-place keeps the same card id).


### `last4digits`

`string`, required

The last 4 digits of the card number (PAN).

### `network`

`string`, optional, can be `null`

The card network that processes payments for this card. `amex` and `null` occur only
on bank-derived cards: Amex-institution connections mint `amex`; other institutions
cannot reveal the network from bank data, so it stays `null` until the card is
PAN-enrolled (upgrade-in-place).


One of: `visa`, `mastercard`, `amex`. A value the SDK does not know yet is passed through as a plain string.

### `country`

`string`, required

The country of issuance for this card following ISO 3166 alpha-3.

One of: `USA`, `CAN`, `GBR`, `SWE`, `ITA`, `AUS`, `NZL`, `PRT`, `BEL`, `SGP`. A value the SDK does not know yet is passed through as a plain string.

### `createdAt`

`Date`, required

Date and time when this resource was created, in UTC, following ISO 8601 format.

### `updatedAt`

`Date`, required

Date and time when this resource was last updated, in UTC, following ISO 8601 format.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/cards/f744b691-bf05-4f2a-ab89-bb1afe4eb840"
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
```

[Back to top](#) · [Back to README](../README.md)


