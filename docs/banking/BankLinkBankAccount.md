
# BankLinkBankAccount

A bank account created from a bank link, in summary.

## Properties

### `id`

`string`, optional

The bank account identifier.

### `name`

`string`, optional

The display name of the bank account.

### `institutionName`

`string`, optional, can be `null`

Display name of the connected institution. Present on this API response; not included on the `banklink.completed` event payload.


### `mask`

`string`, optional, can be `null`

Last 4 digits of the account number. For `credit` accounts this is the card number's last 4; the per-card identity for bank-connected (e.g. American Express) enrollments. Not guaranteed per-card when the institution combines multiple cards into one account.


### `type`

`string`, optional, can be `null`

Normalized account type (e.g. `checking`, `savings`, `credit`).

### `cardIds`

`Array<string>`, optional

Identifiers of already-enrolled cards linked to this account, matched when an enrolled card's last 4 equals a credit account's mask (applied at completion and by a scheduled sweep that re-checks each cardless credit account every few hours). A link is an association to an EXISTING card, not a new enrollment.


### `cards`

[Array<BankFeedCard>](BankFeedCard.md), optional

Cards created from this account at completion (`bank-feed` enrollments), each paired with its subscription. Present only on credit accounts that created a card; a created card also appears in `cardIds`.


### `noLinkReason`

`string`, optional, can be `null`

Why this credit account has no card. Present on this API response; not included on the `banklink.completed` event payload. Present ONLY while the account is still cardless; once any card links, the field disappears.

A credit account can legitimately finish linking with no card, and this says which case it was rather than leaving an unexplained empty `cardIds`:
  - `bulk_card_owns_mask`: a bulk-enrolled card is the live owner of this last 4. It correctly suppresses a duplicate card, and a bulk subscription cannot take an automatic bank-account link.
  - `mask_ambiguous_accounts`: several accounts on this link share the mask, so no automatic link is safe.
  - `mask_ambiguous_cards`: several enrolled cards share the mask, and card-number (BIN) evidence could not narrow them to one.
  - `card_linked_elsewhere`: the matching card is already linked to another bank account.
  - `card_not_attachable`: the matching card has no active subscription to attach to.
  - `no_institution_id`: the provider reported no institution, so no stable card identity can be derived.
  - `mask_matches_no_plausible_card`: enrolled cards share the mask, but BIN evidence ruled every one of them out for the connected institution (wrong issuing bank, or debit/prepaid funding), so nothing linked rather than linking a known-wrong card.

The scheduled mask sweep and a manual `PATCH cardIds` both remain available; the field describes the state at completion, not a permanent verdict.


One of: `bulk_card_owns_mask`, `mask_ambiguous_accounts`, `mask_ambiguous_cards`, `card_linked_elsewhere`, `card_not_attachable`, `no_institution_id`, `mask_matches_no_plausible_card`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../../README.md)


