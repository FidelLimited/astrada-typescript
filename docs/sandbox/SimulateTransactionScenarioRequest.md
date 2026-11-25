
# SimulateTransactionScenarioRequest

## Properties

### `scenario`

`string`, required

The predefined scenario to simulate.

One of: `simple_purchase`, `split_shipment`, `tip_adjustment`, `expired_auth`, `refund`, `hotel_preauth`, `car_rental`, `gas_pump`, `partial_clearing`, `recurring_subscription`, `fx_conversion`, `amex_auth_baseline`, `amex_auth_adjustment`, `amex_auth_reversal`, `uber_canada_reversal`, `uber_netherlands_positive_advice`, `uber_turkey_dual_auth`, `uber_brazil_cancelled`, `uber_korea_settle_at_auth`, `uber_turkey_fx_reversal`, `uber_india_fx_clearing`. A value the SDK does not know yet is passed through as a plain string.

### `cardId`

`string`, required

The identifier of the enrolled card to transact against.

### `subaccountId`

`string`, required

The subaccount identifier the card belongs to.

### `amount`

`number`, optional

Optional transaction amount in minor units (cents). When omitted, the
scenario's default amount is used.


### `currency`

`string`, optional

Optional ISO 4217 three-letter currency code, case insensitive.
A code that is not a currency transactions can be made in is
rejected with `400`. When omitted, the scenario's default
currency is used.


### `network`

`string`, optional

Optional card network override, so one scenario can be run
against any network. When omitted, the scenario's own default
network is used.


One of: `VISA`, `MASTERCARD`, `AMEX`. A value the SDK does not know yet is passed through as a plain string.

### `source`

`string`, optional

Optional ingestion-source tag applied to every message the
scenario emits, so simulated activity can be attributed to a
given network feed. When omitted, defaults to the scenario's own
source if it sets one (the `amex_auth_*` scenarios default to
`amexrta`), else `tns`, or `amexgl` when the resolved network is
AMEX.


One of: `amexgl`, `amexrta`, `smartdata`, `tns`, `vbds`, `vcf`, `vop`. A value the SDK does not know yet is passed through as a plain string.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "scenario": "simple_purchase",
  "cardId": "24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c",
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "amount": 1500,
  "currency": "USD"
}
```

[Back to top](#) · [Back to README](../../README.md)


