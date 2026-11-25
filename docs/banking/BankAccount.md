
# BankAccount

## Properties

### `_links`

[BankAccountLinks](BankAccountLinks.md), required

### `id`

`string`, required

The unique identifier of the bank account.

### `accountId`

`string`, required

The unique identifier of the account that owns this bank account.

### `subaccountId`

`string`, required

The unique identifier of the subaccount associated with this bank account.

### `bankLinkId`

`string`, optional, can be `null`

The identifier of the bank link that created this account. Null for accounts that predate persisted link attribution.

### `externalId`

`string`, required

The provider account ID for the connected account.

### `cardIds`

`Array<string>`, required

The identifiers of cards linked to this bank account for transaction matching, always current. A card links when its last 4 digits match this account's mask (the same rule applied at bank-link completion and by a scheduled sweep that re-checks each cardless credit account every few hours), or when set manually via PATCH. Cards must belong to the same subaccount.

### `noLinkReason`

`string`, optional, can be `null`

Why this credit account has no card. Present ONLY while the account is still cardless; once any card links, the field disappears, so it can never contradict `cardIds`. See the identically-named field on the bank link response for the full meaning of each value.


One of: `bulk_card_owns_mask`, `mask_ambiguous_accounts`, `mask_ambiguous_cards`, `card_linked_elsewhere`, `card_not_attachable`, `no_institution_id`, `mask_matches_no_plausible_card`. A value the SDK does not know yet is passed through as a plain string.

### `cards`

[Array<BankFeedCard>](BankFeedCard.md), required

Cards MATERIALIZED from this bank account (`bank-feed` enrollments minted at bank-link completion for credit accounts whose mask matched no already-enrolled card). Distinct from `cardIds`, which is the link surface: a mask-matched card appears in `cardIds` only, while a minted card appears in both. Empty for depository and mask-matched-only accounts.


### `institutionName`

`string`, required

The name of the connected financial institution.

### `institutionId`

`string`, optional, can be `null`

The provider identifier of the connected institution (Plaid `ins_*`). Null for connections made before this field was captured.

### `name`

`string`, required

The display name of the bank account (e.g. "Checking", "Savings").

### `mask`

`string`, optional, can be `null`

The last 4 digits of the account number. For `credit` accounts this is the card number's last 4; the per-card identity for bank-connected (e.g. American Express) card enrollments. Not guaranteed to be per-card when the institution combines multiple cards into a single account.

### `type`

`string`, required

The normalized type of bank account. (Correction: the service has always returned normalized values; the previous `depository`/`credit` enum understated live behavior. Codegen consumers should regenerate.)

One of: `checking`, `savings`, `prepaid`, `credit`, `loan`, `investment`, `other`. A value the SDK does not know yet is passed through as a plain string.

### `subtype`

`string`, optional, can be `null`

The raw provider account subtype (e.g. Plaid `credit card`, `checking`). Null when the provider did not supply one or for accounts connected before this field was captured.

### `currency`

`string`, required

The currency of the account following ISO 4217 format.

### `state`

`string`, required

Current state of the bank account.
- `active`: The account is connected and functioning normally.
- `auth_required`: The account requires re-authentication.
- `disconnected`: The account has been disconnected from the provider.


One of: `active`, `auth_required`, `disconnected`. A value the SDK does not know yet is passed through as a plain string.

### `subscriptionState`

`string`, optional, can be `null`

The health of the underlying aggregator connection backing this account. The account `state` above can read `active` while the connection has errored or needs re-auth, so this field can read "active but dead". Null if no subscription is linked.


One of: `active`, `error`, `auth_required`, `disconnected`. A value the SDK does not know yet is passed through as a plain string.

### `lastSyncedAt`

`Date`, optional, can be `null`

Last successful sync of the backing connection, in UTC, following ISO 8601 format. Pairs with `subscriptionState` as the freshness signal. Null until the first sync.

### `createdAt`

`Date`, required

Date and time when this resource was created, in UTC, following ISO 8601 format.

### `updatedAt`

`Date`, required

Date and time when this resource was last updated, in UTC, following ISO 8601 format.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/bank-accounts/3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
    },
    "transactions": {
      "href": "/bank-transactions/1fcb895e-9217-4a6f-9d10-5a7dcef86c11?bankAccountId=3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c"
    },
    "bankLink": {
      "href": "/bank-links/enrollment_792dcb7d"
    }
  },
  "id": "3a8f2c1d-5e7b-4d9a-b6c8-9f0e1d2a3b4c",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "1fcb895e-9217-4a6f-9d10-5a7dcef86c11",
  "bankLinkId": "enrollment_792dcb7d",
  "externalId": "plaid_acc_792dcb7d",
  "cardIds": [
    "5dec2c49-0aa5-4683-a317-427eb5d115f3"
  ],
  "cards": [],
  "institutionName": "Chase",
  "name": "Checking",
  "mask": "1234",
  "type": "checking",
  "currency": "USD",
  "state": "active",
  "subscriptionState": "active",
  "lastSyncedAt": "2025-10-03T11:12:07.000Z",
  "createdAt": "2025-10-03T10:55:42.000Z",
  "updatedAt": "2025-10-03T10:55:42.000Z"
}
```

[Back to top](#) · [Back to README](../../README.md)


