
# BankLink

## Properties

### `_links`

[BankLinkLinks](BankLinkLinks.md), required

### `id`

`string`, required

The client-provided identifier of the bank link. Must be alphanumeric with hyphens and underscores only.

### `accountId`

`string`, required

The unique identifier of the account that owns this bank link.

### `subaccountId`

`string`, required

The unique identifier of the subaccount associated with this bank link.

### `state`

`string`, required

Current state of the bank link.
- `pending`: The link has been created and is awaiting user enrollment.
- `completed`: The user has successfully connected their bank account.
- `expired`: The link has expired without being completed.


One of: `pending`, `completed`, `expired`. A value the SDK does not know yet is passed through as a plain string.

### `provider`

`string`, optional

Open-banking provider this link was created on. Fixed at creation: every later operation on the link uses this value. Links created before provider selection existed are `plaid`.


One of: `plaid`, `mastercard`. A value the SDK does not know yet is passed through as a plain string.

### `hostedLink`

`string`, required, can be `null`

The hosted URL where the user can complete the bank enrollment. This link expires after 4 hours and is automatically refreshed when retrieved via GET.

### `linkExpiresAt`

`Date`, required, can be `null`

Date and time when the hosted link expires, in UTC, following ISO 8601 format.

### `completedAt`

`Date`, optional

Date and time when the bank link enrollment was completed, in UTC, following ISO 8601 format. Only present when state is `completed`.

### `lastRejection`

[BankLinkLastRejection](BankLinkLastRejection.md), optional, can be `null`

### `lastMintFailure`

[BankLinkLastMintFailure](BankLinkLastMintFailure.md), optional, can be `null`

### `filters`

[BankLinkFilters](BankLinkFilters.md), optional

### `bankAccounts`

[Array<BankLinkBankAccount>](BankLinkBankAccount.md), optional

Summary of bank accounts created from this link. Only present when state is `completed` and accounts exist.

### `createdAt`

`Date`, required

Date and time when this resource was created, in UTC, following ISO 8601 format.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/bank-links/enrollment_abc123"
    }
  },
  "id": "enrollment_abc123",
  "accountId": "8f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "subaccountId": "50cced63-ee4e-4ff7-a469-aaa989f220f2",
  "state": "pending",
  "provider": "plaid",
  "hostedLink": "https://hosted.plaid.com/link/abc123",
  "linkExpiresAt": "2025-10-03T14:25:27.000Z",
  "createdAt": "2025-10-03T10:25:27.069Z"
}
```

[Back to top](#) · [Back to README](../../README.md)


