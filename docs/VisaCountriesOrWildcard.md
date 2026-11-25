
# VisaCountriesOrWildcard

Either an array of ISO 3166 alpha-3 country codes (the contracted regional areas for
Visa), each listed once, or the string `"*"`, which inherits all countries from
the parent account's VISA capabilities.

Accepted codes: `USA`, `CAN`, `IRL`, `DEU`, `CZE`, `SWE`, `NLD`, `LTU`, `GBR`, `SVN`,
`LUX`, `POL`, `SVK`, `HUN`, `ITA`, `ROU`, `FIN`, `DNK`, `MLT`, `LVA`, `GRC`, `AUT`, `HRV`,
`CHE`, `NOR`, `ISL`, `FRA`, `ESP`, `ISR`, `SMR`, `VAT`, `AND`, `GIB`, `AUS`, `NZL`, `PRT`,
`BEL`, `SGP`.


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


