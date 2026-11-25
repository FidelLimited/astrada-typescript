
# CardholderCorporate

The company the cardholder belongs to, as the bank or card network supplies it in a network bulk feed, unless it was set with `PATCH /cards/{cardId}/cardholder`. See the [Glossary](https://docs.astrada.co/docs/glossary) for the terms used here.

On `GET /cards/{cardId}/cardholder` this is the current value. When the cardholder is embedded on a transaction (`expand=cardholder`, or the transaction webhooks), `corporate` is the value in effect on the transaction's `transactionOccurrenceDate` (through the end of that UTC day), or at the transaction's `createdAt` when that is null; the other cardholder fields stay current. The one exception inside `corporate` is `networkToken`, which is always the card's current value.


## Properties

### `alternativeEmployeeId`

`string`, optional, can be `null`

An alternative employee identifier, typically configured for specific enterprise integrations.

### `employeeId`

`string`, optional, can be `null`

The unique identifier of the employee

### `id`

`string`, optional, can be `null`

The **company ID**: the identifier the bank or card network gives the cardholder's company in the network bulk feed. Every card from the same company carries the same value, so it is the field to group cards by company.

- **Visa (VCF and VBDS)**: the company ID, the `C` in the feed's RPIC network reference (`RegionId_ProcessorId_IssuerId_CompanyId`), always its last segment. For the feed `1_123_45_6789` (or the VCF PIC form `123_45_6789`), `corporate.id` is `6789`.
- **Mastercard (SmartData)**: the company ID from the file, which Mastercard calls the corporation number.
- **American Express**: the company ID, the 6-digit corporate ID (CID), such as `014640`. For a feed whose network reference is the CID, `corporate.id` is that same value.

`null` when the feed does not supply one. The legal entity within the company is in `legalEntity`.


### `legalEntity`

[CardholderCorporateLegalEntity](CardholderCorporateLegalEntity.md), optional

### `networkToken`

`string`, optional, read only

The network token the card network issued for the card, for a tokenized American Express card. It is the same token the network sends you in its own files, so it is a stable identifier for matching the cardholder to your records. On these cards the card's `first6digits` and `last4digits` are the token's digits, not the physical card's. Present only for tokenized American Express cards; absent otherwise, never null. Always the card's current value, also when the cardholder is embedded on a transaction.

[Back to top](#) · [Back to README](../README.md)


