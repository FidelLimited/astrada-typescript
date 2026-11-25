
# TransactionMessageAcceptor

The details relating to the acceptor (merchant) that initiated the transaction message.

## Properties

### `acquirerId`

`string`, required, can be `null`

The identifier of the acquirer/processor used by the acceptor as assigned by the network.

### `city`

`string`, required, can be `null`

The acceptor's registered city. Defined by the acquirer/processor.

### `country`

`string`, optional, can be `null`

The acceptor's registered country following ISO 3166 alpha-3.

### `id`

`string`, required, can be `null`

The identifier of the payment acceptor (merchant) as assigned by the acquirer/processor.

### `mcc`

`string`, required, can be `null`

The Merchant Category Code provided by the acquirer/processor. Used to classify businesses by the types of goods provided or services rendered.

### `name`

`string`, required, can be `null`

The acceptor (merchant) name.

### `state`

`string`, required, can be `null`

The acceptor's registered state (e.g. Michigan) as assigned by the acquirer/processor.

[Back to top](#) · [Back to README](../README.md)


