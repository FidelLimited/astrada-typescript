
# BankSubscriptionInstitutionHealth

The bank data provider's health figures for this connection's bank. Null when the provider publishes none.

## Properties

### `success`

`number`, optional

The share of the provider's recent transaction updates for this bank that succeeded, from 0 to 1.

### `errorInstitution`

`number`, optional

The share that failed because of the bank, from 0 to 1.

### `errorProvider`

`number`, optional

The share that failed because of the provider, from 0 to 1.

### `refreshInterval`

`string`, optional, can be `null`

Whether the provider is refreshing this bank on schedule (`NORMAL`), late (`DELAYED`) or not at all (`STOPPED`).

One of: `NORMAL`, `DELAYED`, `STOPPED`, ``. A value the SDK does not know yet is passed through as a plain string.

### `incidents`

[Array<BankInstitutionIncident>](BankInstitutionIncident.md), optional

The provider's published outages and maintenance for this bank.

### `observedAt`

`Date`, optional

When Astrada read these figures, in UTC, following ISO 8601 format.

[Back to top](#) · [Back to README](../../README.md)


