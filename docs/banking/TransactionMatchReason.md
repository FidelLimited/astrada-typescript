
# TransactionMatchReason

One scoring factor of a match and what it added to the score.

## Properties

### `type`

`string`, optional

The matching factor type.

One of: `Amount`, `Date`, `Merchant`, `ReferenceId`, `PreAuth`. A value the SDK does not know yet is passed through as a plain string.

### `score`

`number`, optional

The individual score for this factor.

### `cardValue`

`string`, optional, can be `null`

The value from the card transaction used for comparison. May be a string or numeric value.

### `bankValue`

`string`, optional, can be `null`

The value from the bank transaction used for comparison. May be a string or numeric value.

### `diff`

`number`, optional

The numeric difference between the card and bank values.

### `message`

`string`, optional

Human-readable explanation of the score for this factor.

[Back to top](#) · [Back to README](../../README.md)


