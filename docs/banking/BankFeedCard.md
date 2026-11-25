
# BankFeedCard

A card created from a bank account at bank-link completion (a `bank-feed` enrollment), with its subscription.

## Properties

### `id`

`string`, required

The minted card's identifier on the cards platform.

### `subscriptionId`

`string`, required

The bank-feed card subscription created by the mint.

### `last4digits`

`string`, required

The card number's last 4; equals this account's mask by construction.

### `network`

`string`, required, can be `null`

The card network when the institution implies it (e.g. `amex`); null until a PAN enrollment upgrades the card in place.

### `enrollmentType`

`string`, required

Always `bank-feed`; the enrollment transport this card was materialized through.

One of: `bank-feed`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../../README.md)


