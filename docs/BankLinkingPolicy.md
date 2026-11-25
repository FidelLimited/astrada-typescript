
# BankLinkingPolicy

Admin-managed policy controlling which account types and institutions are offered when
linking bank accounts via the hosted (Plaid) flow. Fields are optional and nullable;
absent fields leave the current value unchanged, explicit `null` clears a field.

Resolution is per-field and LIVE: a subaccount field applies when set; when absent/`null`
the parent account's value applies; when neither is set the field reads `null` and the
system default is applied downstream at bank-link creation
(`accountTypes: [credit]`: credit-card accounts only, the historical behavior).
Subaccount GETs return these EFFECTIVE resolved values (nulls included; the default is
never materialized in reads).

Bank-link creation uses a copy of the policy read at most 60 seconds earlier, so a change
can take up to a minute to apply. When that read fails, the create uses the system default
for that call.


## Properties

### `accountTypes`

`Array<string>`, optional, can be `null`

Account types selectable during bank linking. Enforced by the provider at link-token
creation (Plaid account_filters: checking/savings → depository subtypes, credit →
credit card); institutions offering none of the allowed types are hidden from
institution search. Default: `[credit]`.


One of: `checking`, `savings`, `credit`. A value the SDK does not know yet is passed through as a plain string.

### `pinnedInstitutionId`

`string`, optional, can be `null`

Provider institution id to pre-select at link creation (e.g. `ins_10` for American
Express). NOTE: Plaid's `institution_id` pre-selection is currently rejected on
production (`INVALID_INSTITUTION`); this field is stored and forwarded only behind a
provider capability flag; until the provider supports it, institution limiting is
achieved with `plaidLinkCustomizationName` plus account-type filtering.


### `plaidLinkCustomizationName`

`string`, optional, can be `null`

Name of a Plaid Dashboard Link customization to pin on created link tokens
(institution shortlist, Account Select mode). The customization must already exist for
the account's Plaid client in the Plaid Dashboard. A `POST /bank-links` may name
`amex_only` in `filters.linkCustomizationName`, which then takes this value's place,
and a policy `amex_only` is not applied to a link whose `bin6` does not start with `3`.
If Plaid refuses the name, `POST /bank-links` answers `403`
`PLAID_CUSTOMIZATION_NOT_PROVISIONED`, except for `amex_only`, which is first retried
once with the environment's pinned customization in its place, or with none.


### `providers`

`Array<string>`, optional, can be `null`

Open-banking provider allowlist for bank-link creation. Unset/`null` = unrestricted:
the client's requested `provider` governs, bounded only by which providers are
enabled on the platform. Set: a `POST /bank-links` requesting a provider outside the
list is rejected with `400`.

The `mastercard` provider is not yet available in every environment. In an environment
without it, a `mastercard` link is refused with `400` `PROVIDER_NOT_SUPPORTED_FOR_COUNTRY`.


One of: `plaid`, `mastercard`. A value the SDK does not know yet is passed through as a plain string.

### `defaultProvider`

`string`, optional, can be `null`

Provider used when `POST /bank-links` doesn't name one. Unset/`null` = the system
default (`plaid`).


One of: `plaid`, `mastercard`. A value the SDK does not know yet is passed through as a plain string.

### `defaultCountryCode`

`string`, optional, can be `null`

ISO 3166-1 alpha-3 country used when `POST /bank-links` doesn't name one.
Unset/`null` = the system default (`USA`).


[Back to top](#) · [Back to README](../README.md)


