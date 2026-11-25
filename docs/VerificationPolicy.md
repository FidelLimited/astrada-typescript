
# VerificationPolicy

Admin-managed overrides controlling how card verification is performed for an account or subaccount.
Fields are optional and nullable; absent fields leave the current value unchanged, explicit `null` clears an override.


## Properties

### `stripeValidationLevel`

`string`, optional, can be `null`

Routes card verifications through Stripe at the specified risk tier when set.
`null` (or absent) routes through Astrada's default card check for the network.

Tiers (increasing strictness):
  * `LOW`: internal-only; 3DS engaged only when risk/regulation requires it; issuer-unsupported
    soft declines are tolerated. Cannot be self-assigned via this endpoint.
  * `MEDIUM`: 3DS when the card provider's checks or regulation call for it; the standard tier
    to opt into.
  * `HIGH`: 3DS plus a transient authorization hold (no settled charge) and added fraud signals.
  * `HIGHEST`: 3DS challenge; if the issuer approves frictionlessly, a two-hold confirmation
    becomes a mandatory second factor. See the "HIGHEST Verification" guide.

Network note: Visa uses Stripe at every set tier; Mastercard uses its network 3DS at all tiers and
engages Stripe only at `HIGHEST` (for the two-hold second factor).

Resolution: the subaccount value is operative at request time; the account-level value is the
inheritance source applied when a subaccount is created, not a live fallback.


One of: `HIGHEST`, `HIGH`, `MEDIUM`, `LOW`. A value the SDK does not know yet is passed through as a plain string.

### `sandbox`

`boolean`, optional, can be `null`

Test flag, settable by the customer via `PATCH /subaccounts` (and internally via the
verification-policy endpoints). When `true`, card verifications on this subaccount route KNOWN
test PANs through the card providers' test modes (real cards still go live), and new bank links
are created against Plaid Sandbox (Plaid test fixtures only; real bank credentials require the
flag off), so an integrator can deterministically test against a provisioned subaccount.
On the production API, absent / `null` / `false` → live processing only.


### `failedAttemptLockout`

`boolean`, optional, can be `null`

When `true`, ENFORCE the cross-network attempt lockout for this tenant: a card with too many recent
hard verification failures is refused at create (`400` `verification.attempts_locked`) before any
provider is called. Account-level fallback (set once for all partner subaccounts), overridable per
subaccount. A new subaccount starts with a copy of the account's value; send `null` on the
subaccount to make it follow the account again. When the value that applies is absent, `null` or
`false`, the lockout is not enforced (failures are still recorded; only enforcement is gated).


[Back to top](#) · [Back to README](../README.md)


