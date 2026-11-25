
# Cardholder

The person a card belongs to: their name, email address and postal code, and their company details in
`corporate`. A card has at most one cardholder, and not every card has one. Which fields are filled depends
on how the card was enrolled:

- **Card entered by number** (the card form, or `POST /card-subscriptions`): since 10 November 2026,
  created with the card subscription, before the bank's check, from the `cardholderName` sent. When created it
  holds only `firstName` and `lastName`; `email`, `postalCode` and the ids in `corporate` (`id`,
  `employeeId`, `alternativeEmployeeId`) are `null`. A blank `cardholderName` gives no cardholder, and a
  card entered by number before 10 November 2026 got none when it was entered.
- **Network bulk feed**: created from the network's file when it carries cardholder data, with the fields
  that file carries. Which fields those are differs by network.
- **Bank sign-in**: the cardholders a bank sign-in creates are on some American Express cards only, and
  hold no company details when created. See
  [American Express cards](https://docs.astrada.co/docs/bank-linking#which-kind-of-account-is-it).

Read it with `GET /cards/{cardId}/cardholder` (scope `cardholder:read`), or inline with `expand=cardholder`
on a card, a card subscription or a transaction. A card that has a cardholder carries a `cardholder` link
in its `_links`. For a card without one, `GET /cards/{cardId}/cardholder` answers `404`, and `expand` on the
card or its card subscription leaves the `cardholder` key out; for a transaction, see `expand` on
`GET /transactions/{transactionId}`. In the sandbox, once a card's card subscriptions are deleted, the
cardholder answers `404` too. [Cards](https://docs.astrada.co/docs/cards#cardholder) lists the fields and
what each way of enrolling fills.


## Properties

### `_links`

[SelfLinks](SelfLinks.md), required

### `corporate`

[CardholderCorporate](CardholderCorporate.md), required

### `firstName`

`string`, optional, can be `null`

The first name of the cardholder. When created for a card entered by number, every word of the `cardholderName` sent but the last; `null` when that name is one word.

### `lastName`

`string`, optional, can be `null`

The last name of the cardholder. When created for a card entered by number, the last word of the `cardholderName` sent.

### `email`

`string`, optional, can be `null`

Cardholder email address

### `postalCode`

`string`, optional, can be `null`

Cardholder postal code as provided by the card network. Format varies by country; no validation or normalization is applied.

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
      "href": "/cards/f744b691-bf05-4f2a-ab89-bb1afe4eb840/cardholder"
    }
  },
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "postalCode": "94105",
  "corporate": {
    "alternativeEmployeeId": "ALT-EMP-12345",
    "employeeId": "bb1afe4eb840",
    "id": "ABC123456789",
    "legalEntity": {
      "id": "FR01",
      "name": "Example Company France SAS"
    }
  },
  "createdAt": "2024-02-04T18:41:16.142Z",
  "updatedAt": "2024-02-04T18:41:16.142Z"
}
```

[Back to top](#) · [Back to README](../README.md)


