
# TransactionAcceptor

The details relating to the acceptor (merchant) from the latest transaction message.

## Properties

### `city`

`string`, required, can be `null`

The acceptor's registered city. Defined by the acquirer/processor.

### `country`

`string`, required, can be `null`

The acceptor's registered country following ISO 3166 alpha-3.

### `mcc`

`string`, required, can be `null`

The Merchant Category Code provided by the acquirer/processor. Used to classify businesses by the types of goods provided or services rendered.

### `state`

`string`, required, can be `null`

The acceptor's registered state (e.g. Michigan) as assigned by the acquirer/processor.

[Back to top](#) · [Back to README](../README.md)


