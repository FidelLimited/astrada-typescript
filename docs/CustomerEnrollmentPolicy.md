
# CustomerEnrollmentPolicy

The customer-writable subset of the enrollment policy: the three unified-SDK
rails. All other fields (`linkAnotherCard`, `bankEnrollmentLocked`, and the
deprecated `bulkEnrollmentEnabled`) are managed on the internal
enrollment-policy endpoints and are ignored if sent here. The `200` names
every ignored key, these and misspelled ones alike, in `ignoredFields`.

Fields are optional and nullable; absent fields leave the current value
unchanged, explicit `null` clears the subaccount-level value. A cleared
rail falls back to the account-level value when one is set; only when
neither level sets the rail does it disappear from reads, letting the
host page's client configuration and then the SDK's card-only default
apply.


## Properties

### `cardEnrollment`

`boolean`, optional, can be `null`

Whether the unified SDK offers manual card enrollment (PAN entry + 3DS
verification).


### `bankEnrollment`

`string`, optional, can be `null`

Whether the unified SDK offers bank linking. In SDK v2 the bank link is a route after the card number, not a separate tile: `on` offers it for every network that can link a bank (SDK v1 shows a chooser tile instead); `amex-only` keeps it reachable only via the American Express card number; `amex-visa` is the American Express route plus a Visa rule: a Visa card enrolls through `POST /card-subscriptions` only when it is classified as business, and the SDK sends every other Visa card to the bank route, except a debit or prepaid one (a temporary mode for programs whose Visa approval is pending: expect it to be retired once approval lands; do not build long-lived integrations on it); `off` disables it (American Express cards then can't enroll unless a bulk program qualifies).

Before setting `amex-visa`, confirm with your Astrada contact that the
SDK release supporting it is live: older SDK bundles treat unknown rail
values as `off`, which disables bank linking entirely, the existing
American Express pivot included.

Astrada can lock the account's `bankEnrollment`: the subaccount's
`enrollmentPolicy` then returns `bankEnrollmentLocked: true`. While it is
locked, the account's value applies. The value you set here is kept, and
has no effect until the lock is removed.

An `amex-visa` set on the account applies to every subaccount in the same way, without a lock: the subaccount's `enrollmentPolicy` returns `amex-visa` whatever value you set here. The value you set is kept, and has no effect while the account's value is `amex-visa`.


One of: `off`, `amex-only`, `amex-visa`, `on`. A value the SDK does not know yet is passed through as a plain string.

### `bulkEnrollment`

`string`, optional, can be `null`

Whether the unified SDK offers network bulk-feed enrollment for
bulk-capable programs. In SDK v2 the bulk flow is the kickoff form, reached
from the program screen or the callout after the card number (SDK v1 shows a
bulk wizard). `suggested` offers it next to a connect-this-card-now option;
`forced` makes it the only path for bulk-capable cards; `off` skips bulk
routing entirely (direct card form).


One of: `off`, `suggested`, `forced`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../README.md)


