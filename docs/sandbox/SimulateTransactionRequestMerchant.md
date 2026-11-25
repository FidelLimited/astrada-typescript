
# SimulateTransactionRequestMerchant

The merchant (card acceptor) on the message. Defaults to a fixed sandbox
coffee-shop merchant in the United States.


## Properties

### `name`

`string`, required

Merchant name, emitted as the transaction descriptor.

### `mcc`

`string`, required

Four-digit merchant category code.

### `city`

`string`, optional

Merchant city.

### `country`

`string`, optional

Merchant country as an ISO 3166-1 alpha-3 code (for example `USA`,
`GBR`, `FRA`), case insensitive; any other value is rejected with
`400`. Defaults to `USA`.


[Back to top](#) · [Back to README](../../README.md)


