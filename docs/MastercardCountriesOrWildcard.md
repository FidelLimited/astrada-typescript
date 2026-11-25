
# MastercardCountriesOrWildcard

Either an array of ISO 3166 alpha-3 country codes (the contracted regional areas for
Mastercard), each listed once, or the string `"*"`, which inherits all countries from
the parent account's MASTERCARD capabilities.

Accepted codes: `USA`, `CAN`, `GBR`, `IRL`, `SWE`, `DEU`, `NLD`, `DNK`, `ITA`, `POL`,
`FIN`, `BEL`, `ESP`, `FRA`, `PRT`, `AUT`, `GRC`, `MLT`, `NOR`, `CHE`, `ISR`, `AUS`, `NZL`,
`SGP`.


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


