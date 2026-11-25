
# BankLinkCreateParamsFilters

Optional per-link narrowing of the account's bank-linking policy. Values may only NARROW what the policy allows; the current system default is `accountTypes: [credit]` (credit-card accounts only). Requests widening beyond the policy are rejected with `400`. Account-type enforcement is applied by the provider at link-token creation and also filters the institution-select list.


## Properties

### `accountTypes`

`Array<string>`, optional

Account types selectable during this hosted session.

One of: `checking`, `savings`, `credit`. A value the SDK does not know yet is passed through as a plain string.

### `linkCustomizationName`

`string`, optional

Name of an allowlisted provider (Plaid) Link customization to apply to this hosted session, such as `amex_only` to surface an Amex-first institution list with a tailored headline for card-enrollment connections. Only `amex_only` is accepted; any other name is rejected with `400` (`INVALID_LINK_FILTERS`). A requested customization takes the place of the bank-linking policy's. Institution steering is by account-type filtering plus the customization's Dashboard configuration; the provider does not support hard institution pre-selection for hosted sessions.

With `amex_only` the link completes only at American Express: a sign-in at another institution leaves the link `pending` with `lastRejection`. Send `bin6` with it only when it starts with `3`: a link with another `bin6` is refused at American Express and cannot complete.


[Back to top](#) · [Back to README](../../README.md)


