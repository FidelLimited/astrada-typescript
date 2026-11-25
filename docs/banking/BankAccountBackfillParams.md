
# BankAccountBackfillParams

## Properties

### `startDate`

`Date`, optional

Start of the range in YYYY-MM-DD format. Defaults to 90 days before `endDate`.

### `endDate`

`Date`, optional

End of the range in YYYY-MM-DD format. Defaults to today.

### `loadHistoric`

`boolean`, optional

Mastercard accounts at US banks (`provider: mastercard`, `countryCode: USA`) only. Triggers the provider's billable deep-history generation (up to 2 years) for this account before the import. Generation is asynchronous; re-run the window without the flag if rows are missing. Providers without the capability return `400`.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "startDate": "2026-06-13",
  "endDate": "2026-06-27"
}
```

[Back to top](#) · [Back to README](../../README.md)


