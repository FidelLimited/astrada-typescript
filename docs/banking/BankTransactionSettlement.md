
# BankTransactionSettlement

Settlement outcome on the unified transaction feed. Present when the movement has settled live; null otherwise (unmatched, connector off, or shadow-only).

## Properties

### `state`

`string`, required

One of: `settled`, `early_cleared`, `superseded`. A value the SDK does not know yet is passed through as a plain string.

### `emissionType`

`string`, required

One of: `early_clearing`, `bank_only`. A value the SDK does not know yet is passed through as a plain string.

### `emittedAt`

`Date`, required, can be `null`

When the settlement was emitted to the feed.

### `supersededAt`

`Date`, required, can be `null`

When the settlement was superseded or corrected, if applicable.

[Back to top](#) · [Back to README](../../README.md)


