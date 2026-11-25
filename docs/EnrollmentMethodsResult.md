
# EnrollmentMethodsResult

## Properties

### `availableEnrollmentMethods`

`Array<string>`, required

The enrollment methods this card can use: `network-bulk` when `bulkLikelihood` is present and not `none` (for Visa and Mastercard cards, only `high` or `proven`), and `cardholder-single` when `singleEligible` is `true`. Empty when neither applies, for example for a card from a country Astrada doesn't cover for its network.

One of: `network-bulk`, `cardholder-single`. A value the SDK does not know yet is passed through as a plain string.

### `bulkLikelihood`

`string`, optional

Graded likelihood that network-bulk enrollment will succeed for this BIN. A country-coverage veto forces `none`. Omitted when it could not be determined for this request; `unavailable` then lists it. `none` is only returned when it was established, never because the data was unavailable. Whether `network-bulk` is offered is in `availableEnrollmentMethods`: for Visa and Mastercard cards it needs `high` or `proven`.

One of: `proven`, `high`, `medium`, `low`, `none`. A value the SDK does not know yet is passed through as a plain string.

### `singleEligible`

`boolean`, optional

Whether cardholder-single enrollment is supported for this BIN. When the response has `singleDecision`, it equals `singleDecision.allowed`.

### `singleDecision`

[EnrollmentMethodsResultSingleDecision](EnrollmentMethodsResultSingleDecision.md), optional

### `binInfo`

[EnrollmentMethodsResultBinInfo](EnrollmentMethodsResultBinInfo.md), optional

### `unavailable`

`Array<string>`, optional

Response fields whose value could not be determined for this request, for example when live card data was temporarily unavailable and the stored card data doesn't decide the grade. Today it can only contain `bulkLikelihood`; more values may be added, so ignore any you don't recognize. Omitted when every field was determined.

One of: `bulkLikelihood`. A value the SDK does not know yet is passed through as a plain string.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "availableEnrollmentMethods": [
    "cardholder-single"
  ],
  "bulkLikelihood": "none",
  "singleEligible": true
}
```

[Back to top](#) · [Back to README](../README.md)


