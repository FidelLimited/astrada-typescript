
# BankLinkCreateParams

## Properties

### `id`

`string`, required

A client-provided identifier for the bank link. Must be alphanumeric with hyphens and underscores only.

### `subaccountId`

`string`, required

The subaccount identifier to associate with this bank link. A subaccount that does not belong to the account is rejected with `404` (`SUBACCOUNT_NOT_FOUND`).

### `filters`

[BankLinkCreateParamsFilters](BankLinkCreateParamsFilters.md), optional

### `bin6`

`string`, optional

First 6 digits captured client-side before an institution pivot (e.g. an American Express BIN typed into the card form before the SDK pivots to bank linking). Persisted with the link. Attached as the completion-time bank-derived card's `first6digits` when the completion has exactly one eligible candidate account.


### `provider`

`string`, optional

Open-banking provider to create the link on. Omitted, the subaccount's configured default applies (system default: `plaid`). A provider outside the subaccount's configured allowlist, or one not enabled on the platform, is rejected with `400`. The provider is fixed at creation: every later operation on the link uses the value it was created with.


One of: `plaid`, `mastercard`. A value the SDK does not know yet is passed through as a plain string.

### `countryCode`

`string`, optional

ISO 3166-1 alpha-3 country of the institution to connect (e.g. `USA`, `DEU`). Omitted, the subaccount's configured default applies (system default: `USA`). Combined with `provider` to select the concrete integration; a country the selected provider does not support is rejected with `400`.


### `language`

`string`, optional

Language of the hosted bank-linking screens, as a BCP 47 tag such as `en`, `en-US` or `fr-CA`. A tag that matches the pattern is accepted; any other value is rejected with `400`. For a Plaid link, the language part of the tag (`fr` for `fr-CA`) is used when Plaid supports it, Astrada has turned that language on, and no Link customization applies to the link (one it asks for, one from the bank-linking policy, or one Astrada sets for the environment). Otherwise the screens are in English and the request still succeeds. Plaid Link supports `da`, `nl`, `en`, `et`, `fr`, `de`, `hi`, `it`, `lv`, `lt`, `no`, `pl`, `pt`, `ro`, `es`, `sv` and `vi`. Plaid's Norwegian is `no`, so `nb` and `nb-NO` fall back to English. Other providers ignore this field. The language is kept with the link, so a refreshed hosted link uses it again.


### `persona`

`string`, optional

Who the bank login belongs to. `cardholder`: a page for one person, such as an employee, who links their own bank login. `admin`: the company. Omitted, the link is a company link, as with `admin`, which is how every link behaved before this field existed.

The link's owner decides which cards its accounts can join: two bank accounts can count as the same card only when their links have the same owner. Cardholder links sent with the same `cardholderKey` share an owner, a cardholder link without a key is its own owner, and every company link has the company as its owner, so a cardholder link never joins a company link's card.


One of: `admin`, `cardholder`. A value the SDK does not know yet is passed through as a plain string.

### `cardholderKey`

`string`, optional

Your stable id for the person on the page, used only with `persona: cardholder`, so that all of their links share one owner. Optional: without it, each cardholder link is its own owner. A key sent with `persona: admin`, or with no `persona`, is ignored. Surrounding whitespace is trimmed, and 1 to 256 characters must remain. Astrada stores only a keyed hash of the key, never the key itself.

The key must be one that no other user can guess: an opaque value your backend issues for that person and gives only to their page, such as a random id, or an HMAC of their employee id made with your own secret. Never send an email address, an employee number or anything else another user could guess. A guessed key can join another person's card.


### `consent`

[BankLinkConsent](BankLinkConsent.md), optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "id": "enrollment_abc123",
  "subaccountId": "50cced63-ee4e-4ff7-a469-aaa989f220f2"
}
```

[Back to top](#) · [Back to README](../../README.md)


