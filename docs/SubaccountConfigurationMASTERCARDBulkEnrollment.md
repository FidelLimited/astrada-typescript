
# SubaccountConfigurationMASTERCARDBulkEnrollment

## Properties

### `countries`

`Array<string>`, required

List of countries supported for Mastercard bulk enrollment

One of: `USA`, `CAN`, `GBR`, `IRL`, `SWE`, `DEU`, `NLD`, `DNK`, `ITA`, `POL`, `FIN`, `BEL`, `ESP`, `FRA`, `AUT`, `NOR`, `CHE`, `ISR`, `AUS`, `NZL`, `SGP`. A value the SDK does not know yet is passed through as a plain string.

### `blockedCardTypes`

`Array<string>`, required

Card types blocked for Mastercard bulk enrollment. The account's defaults for this network and enrollment mode are always added, so the stored list can include values that were not sent.

One of: `CONSUMER`. A value the SDK does not know yet is passed through as a plain string.

### `blockedFundingCardTypes`

`Array<string>`, required

Funding card types blocked for Mastercard bulk enrollment. The account's defaults for this network and enrollment mode are always added, so the stored list can include values that were not sent.

One of: `DEBIT`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../README.md)


