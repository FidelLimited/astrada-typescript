
# SubaccountEnrollmentPolicy

## Properties

### `linkAnotherCard`

`boolean`, optional, can be `null`

Whether the unified SDK's success screen offers the "Link another card" secondary CTA.
Absent / `null` = not configured: enabled by default (the SDK falls back to the host
page's `open()` configuration, then its built-in default: shown).

Resolution (fail-open): subaccount GETs return the **effective**
value: `false` when either the account or the subaccount stores an explicit `false`,
`true` when either side stores `true` and neither stores `false`, omitted when neither
level sets it. Resolves live on every read (no create-time snapshot), so an account-level
`false` immediately hides the CTA for every subaccount and clearing it restores stored
subaccount values. No account gate on writes: any value is accepted on the subaccount
regardless of the account's value.


### `bulkEnrollmentEnabled`

`boolean`, optional, can be `null`

**Deprecated:** superseded by the `bulkEnrollment` tri-state rail (the SDK maps
`true` to `suggested`, `false` to `off`, and prefers the tri-state when present).

Whether the unified enrollment SDK offers bulk-enrollment steering (BIN eligibility
check + bulk feed wizard) for this account/subaccount. `false` = the SDK skips the
eligibility check entirely and opens the card form directly (American Express cards
pivot to the bank-linking flow). Absent / `null` = not configured: the SDK falls
back to the host page's client configuration, then its card-only default (bulk off).

Resolution: plain override-fallback: a subaccount value overrides the account value
when set (no master gate). An explicit `bulkEnrollment`
flag in the SDK's `open()` config wins over this policy in SDK v1. In SDK v2 the
server value wins field by field over `open()`; the boolean is read only when
`bulkEnrollment` is absent (`true` is `suggested`, `false` is `off`), and a boolean
`bulkEnrollment` in `open()` is itself read as a set of rails (`true` is card on,
bank `on`, bulk `suggested`; `false` is card on, bank `amex-only`, bulk `off`).


### `cardEnrollment`

`boolean`, optional, can be `null`

Unified-SDK rail: offer manual card enrollment (PAN entry + 3DS verification).
Resolution: live per-field override-fallback (subaccount value if set, else account).


### `bankEnrollment`

`string`, optional, can be `null`

Unified-SDK rail: offer bank linking. `on` = offered for every network that can link a bank (a route after the card number in SDK v2, a chooser tile in SDK v1); `amex-only` = reachable only via the American Express card number; `amex-visa` = the American Express route plus the Visa rule below (an interim mode while a program's Visa approval is pending; still reachable only through the card number; expected to be retired once approval lands: do not build long-lived integrations on it); `off` = disabled. Resolution: live per-field override-fallback, except for the two account settings at the end of this description.

Under `amex-visa`, `POST /card-subscriptions` single-enrolls a Visa card only when its BIN is classified as business: a `cardCategory` of `BUSINESS`, `CORPORATE`, `FLEET` or `PURCHASING`, or, when `cardCategory` is absent or `UNKNOWN`, a `type` of `COMMERCIAL`, `CORPORATE` or `SMALL_BUSINESS` (the fields `GET /bin-lookup` returns). It refuses every other Visa card with `403`. Unless another enrollment control refuses the card first, the code is `card_subscription.subaccount_blocking_card_type` and the body adds `reasonCode: card_subscription.bank_enrollment_required` and `cardClass`, the class the rule read (`CONSUMER`, `PREPAID`, `GIFT`, `SPECIALTY`, or `UNCLASSIFIED` when the BIN has no class). A refused credit card can enroll through bank linking (`POST /bank-links`) instead, and the unified SDK sends it there itself; the SDK offers no bank route to a debit or prepaid Visa card. `POST /enrollment-methods` with a `subaccountId` names this refusal `bank-enrollment-required` in `singleDecision.reason`. Bulk enrollment is not affected.

Rollout note for `amex-visa`: SDK bundles released before this value treat it as
`off` (lenient parsing turns an unknown rail value into the safest mode), and
`off` disables bank linking ENTIRELY: a program sitting on `amex-only` that is
flipped early does not merely miss the new Visa pivot, it loses its existing
American Express pivot and Amex cards cannot enroll at all. The SDK deploy must
precede flipping any account or subaccount to this value, and rolling the SDK
bundle back while accounts still carry `amex-visa` re-opens the same hazard in
reverse.

Astrada can lock the account's value: while `bankEnrollmentLocked` is `true`, the
account's `bankEnrollment` applies to every subaccount.

An `amex-visa` set on the account applies to every subaccount too, with or without the lock: subaccount reads return `amex-visa` whatever the subaccount stores. Stored subaccount values are kept.


One of: `off`, `amex-only`, `amex-visa`, `on`. A value the SDK does not know yet is passed through as a plain string.

### `bankEnrollmentLocked`

`boolean`, optional, can be `null`, read only

Read-only. `true` while the account has locked `bankEnrollment`, and the account's
`bankEnrollment` then applies whatever value the subaccount stores. Absent otherwise.
A subaccount accepts no value for it: the lock is set on the account only.


### `bulkEnrollment`

`string`, optional, can be `null`

Unified-SDK rail: offer network bulk-feed enrollment for bulk-capable programs.
`suggested` = the bulk flow (the kickoff form in SDK v2, a wizard in SDK v1) offered
next to a connect-this-card-now option; `forced` = the bulk flow
is the only path for bulk-capable cards; `off` = no bulk routing (direct card
form). Supersedes the deprecated `bulkEnrollmentEnabled` boolean; when both are
set, the SDK prefers this field. Resolution: live per-field override-fallback.


One of: `off`, `suggested`, `forced`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../README.md)


