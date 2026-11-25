
# SubaccountConfigurationAMEXSingleEnrollment

## Properties

### `countries`

`Array<string>`, required

List of countries supported for AMEX single enrollment

One of: `USA`, `CAN`, `GBR`, `ITA`, `SWE`. A value the SDK does not know yet is passed through as a plain string.

### `blockedCardTypes`

`Array<string>`, required

Card types blocked for AMEX single enrollment. The account's defaults for this network and enrollment mode are always added, so the stored list can include values that were not sent.

One of: `CONSUMER`. A value the SDK does not know yet is passed through as a plain string.

### `blockedFundingCardTypes`

`Array<string>`, required

Funding card types blocked for AMEX single enrollment. The account's defaults for this network and enrollment mode are always added, so the stored list can include values that were not sent.

One of: `DEBIT`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../README.md)


