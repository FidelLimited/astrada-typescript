
# CardholderCorporateLegalEntity

The legal entity the card belongs to in the card network's company hierarchy. Visa VCF: the hierarchy node directly under the root. Mastercard SmartData: the corporation the card is filed under. American Express: the legal company the card is issued under (the Basic Control Account is a division within a company, not a legal entity, and is not used here). Present only when the card network supplies one; absent otherwise, never null. `id` and `name` are each present only when the network supplies them, and at least one of them is always present. Once set it is kept until the network sends a new one. The same entity sent again with a field left out keeps that field: entities match on `id` when both have one, otherwise on `name`; a different entity replaces the stored one entirely. When the cardholder is embedded on a transaction, this is the value as of the transaction's date (see `corporate`).

## Properties

### `id`

`string`, optional

The network's identifier for the legal entity, an opaque string. Present only when the network supplies one (Visa VCF currently always does; Mastercard SmartData files usually carry none and American Express files never do); absent otherwise, never null. Filter by `legalEntityName` when it is absent.

### `name`

`string`, optional

The legal entity's name as provided by the card network. Present only when the network supplies a name (Visa VCF and Mastercard SmartData currently always do; American Express sends the legal company name; when the file leaves it blank, `legalEntity` is omitted entirely); absent otherwise, never null. Filter by `legalEntityId` when it is absent.

[Back to top](#) · [Back to README](../README.md)


