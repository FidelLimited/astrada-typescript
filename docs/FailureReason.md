
# FailureReason

Normalized, customer-facing reason a card verification failed. Present only when the
verification `state` is `failed`. `category`, `description` and `retryable` are always
present; `issuerMessage` and `acsReferences` appear only when the issuer returned them
(typically on a frictionless decline; when the issuer renders its own challenge UI no
per-attempt message is available).


## Properties

### `category`

`string`, required

Stable, provider-agnostic failure category an integrator can branch on without
enumerating raw issuer codes.


One of: `authentication_declined`, `authentication_canceled`, `cvc_check_failed`, `card_declined`, `contact_issuer`, `card_blocked`, `too_many_attempts`, `not_supported`, `temporary_issue`, `processing_error`. A value the SDK does not know yet is passed through as a plain string.

### `description`

`string`, required

Human-readable explanation of the failure, safe to relay to the cardholder.

### `retryable`

`boolean`, required

Whether the cardholder can retry now and plausibly succeed.

### `issuerMessage`

`string`, optional

The issuer's own cardholder-facing message, when provided (frictionless declines only).

### `code`

`string`, optional

Raw provider reason code (e.g. a 3DS `transStatusReason` or a Stripe `decline_code`),
surfaced for support escalation.


### `providerMessage`

`string`, optional

The payment provider's cardholder-safe message for the specific failure code (e.g.
"Your card does not support this type of purchase."). Finer-grained than the
category-level `description`; absent when the provider supplied none.


### `adviceCode`

`string`, optional

The issuer's advice code on authorization declines, verbatim from the payment
provider. Documented values: `try_again_later`, `do_not_try_again`,
`confirm_card_data`; values the provider introduces later pass through unchanged.
Absent when the issuer gave no advice (e.g. 3-D Secure authentication failures).


### `acsReferences`

[FailureReasonAcsReferences](FailureReasonAcsReferences.md), optional

[Back to top](#) · [Back to README](../README.md)


