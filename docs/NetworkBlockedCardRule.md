
# NetworkBlockedCardRule

A platform rule that blocks enrollment of matching cards on one network.

## Properties

### `cardType`

`string`, required

The BIN `type` this rule blocks.

One of: `COMMERCIAL`, `CORPORATE`, `CONSUMER`, `SMALL_BUSINESS`. A value the SDK does not know yet is passed through as a plain string.

### `fundingTypes`

`Array<string>`, optional

The BIN `fundingType` values this rule blocks. Omitted or empty means every funding type.

One of: `CREDIT`, `DEBIT`, `PREPAID`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../README.md)


