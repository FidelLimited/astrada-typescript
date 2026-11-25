
# ConsentPolicy

Which consent records `POST /card-subscriptions` accepts for this subaccount. Astrada sets
it, on the account as a default and on the subaccount as an override; there is no route to
change it. The value is the effective one: each field comes from the subaccount when it sets
one, otherwise from the account, except that an account `mode` of `off` turns the mode off
for every subaccount. Absent (never `null`) when neither level sets a field.

A subaccount with no `consentPolicy` behaves as `log` with every channel allowed. Which mode
a new or existing account starts in: [When consent is required](https://docs.astrada.co/docs/direct-api-card-enrollment-integration#when-consent-is-required).


## Properties

### `allowedChannels`

`Array<string>`, optional

The channels a consent may come from. A consent from any other channel fails with `consent_channel_not_allowed`.

One of: `sdk-unified`, `sdk-legacy`, `api`. A value the SDK does not know yet is passed through as a plain string.

### `mode`

`string`, optional

`off` records nothing, `log` records without refusing, `enforce` refuses a missing or
failing consent. What each mode answers: [When consent is required](https://docs.astrada.co/docs/direct-api-card-enrollment-integration#when-consent-is-required).


One of: `off`, `log`, `enforce`. A value the SDK does not know yet is passed through as a plain string.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "allowedChannels": [
    "sdk-unified",
    "api"
  ],
  "mode": "log"
}
```

[Back to top](#) · [Back to README](../README.md)


