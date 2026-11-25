
# EnrollmentMethodsParams

## Properties

### `bin`

`string`, required

The card's Bank Identification Number (BIN), consisting of the first 6 to 11 digits of the card number. Providing more digits yields more precise results: for example, two cards that share the same 6-digit BIN may support different enrollment methods. Send as many digits as you have, up to 11. For Mastercard, 8 digits or fewer can match several card ranges; when those ranges disagree, `bulkLikelihood` is capped at `medium` (a `proven` BIN keeps `proven`), and at `medium` a Mastercard card is not offered `network-bulk`.

### `subaccountId`

`string`, optional

The subaccount the card would enroll under. With it, the response adds `singleDecision` when the subaccount's controls can be run. It must be one of your account's subaccounts, otherwise the request gets `400`. With an enrollment link session's token it must be the session's own subaccount, otherwise the request gets `403`.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "bin": "42424242"
}
```

[Back to top](#) · [Back to README](../README.md)


