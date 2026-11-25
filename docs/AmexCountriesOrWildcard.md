
# AmexCountriesOrWildcard

Either an array of ISO 3166 alpha-3 country codes (the contracted regional areas for
American Express), each listed once, or the string `"*"`, which inherits all countries from
the parent account's AMEX capabilities.

Accepted codes: `USA`, `CAN`, `GBR`, `ITA`, `SWE`, `AUS`, `NZL`.


## Properties

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
[
  "USA",
  "CAN"
]
```

[Back to top](#) · [Back to README](../README.md)


