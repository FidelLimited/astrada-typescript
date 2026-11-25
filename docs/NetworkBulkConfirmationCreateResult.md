
# NetworkBulkConfirmationCreateResult

## Properties

### `id`

`string`, required

The unique identifier of the open confirmation request.

### `requestId`

`string`, required

The `requestId` this request sent. It is never the `requestId` the open request was stored under.

### `subaccountId`

`string`, required

The subaccount of the open request, the same as the request's.

### `network`

`string`, required

The network of the open request, the same as the request's.

One of: `AMEX`, `MASTERCARD`, `VISA`. A value the SDK does not know yet is passed through as a plain string.

### `bin`

`string`, required

The first 8 digits of the card, exactly as submitted.

### `grade`

`string`, required

The bulk likelihood grade the client saw for this BIN, as sent on the create request. `unchecked` when the request had no grade because it could not be determined.

One of: `proven`, `high`, `medium`, `low`, `none`, `unchecked`. A value the SDK does not know yet is passed through as a plain string.

### `binInfo`

[NetworkBulkConfirmationBinInfo](NetworkBulkConfirmationBinInfo.md), required, can be `null`

### `company`

[NetworkBulkConfirmationCompany](NetworkBulkConfirmationCompany.md), required

### `cardAdmin`

[NetworkBulkConfirmationCardAdmin](NetworkBulkConfirmationCardAdmin.md), required

### `bankContact`

[NetworkBulkBankContact](NetworkBulkBankContact.md), required, can be `null`

### `state`

`string`, required

The state of the open request. `requested` is the only state for now.

One of: `requested`. A value the SDK does not know yet is passed through as a plain string.

### `customerReferenceId`

`string`, required, can be `null`

An optional id passed by the customer to associate a context with the confirmation. `null` when not provided.

### `createdAt`

`Date`, required

When the open request was created, in UTC, following ISO 8601 format. Its 30-day window counts from this time.

### `alreadyOpen`

`boolean`, required

Always `true`. Tells this summary apart from the full confirmation.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "id": "0d8e5b3a-7c42-4f19-b6a0-3e1f9c2d8a74",
  "requestId": "c3f1a7e2-5b94-4d0a-8e6f-2a9d4b7c1e35",
  "subaccountId": "24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c",
  "network": "MASTERCARD",
  "bin": "51075500",
  "grade": "high",
  "binInfo": {
    "issuerName": "Jack Henry And Associates",
    "issuerCountry": "USA",
    "type": "COMMERCIAL",
    "fundingType": "CREDIT"
  },
  "company": {
    "legalName": "Vertex Industries, Inc."
  },
  "cardAdmin": {
    "name": "Dana Whitfield",
    "email": "dana.whitfield@vertexind.com"
  },
  "bankContact": {
    "name": "Sam Lee",
    "email": "sam.lee@bank.example"
  },
  "state": "requested",
  "customerReferenceId": "ledgerly-customer-8842",
  "createdAt": "2026-10-26T16:45:00.000Z"
}
```

[Back to top](#) · [Back to README](../README.md)


