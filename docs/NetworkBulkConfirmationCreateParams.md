
# NetworkBulkConfirmationCreateParams

## Properties

### `requestId`

`string`, required

Your idempotency key for this confirmation, unique per account. Repeating the
request with a `requestId` that was already used returns the stored confirmation,
whole and unchanged, with `200` instead of creating a second one with `201`. A new
`requestId` for a program that already has an open request answers `200` with that
request's summary.


### `subaccountId`

`string`, required

The subaccount the card program belongs to. Must belong to the calling account; an unknown subaccount answers `400`.

### `network`

`string`, required

The network of the card program.

One of: `AMEX`, `MASTERCARD`, `VISA`. A value the SDK does not know yet is passed through as a plain string.

### `bin`

`string`, required

Exactly the first 8 digits of the card number. Never send the full card number.

### `grade`

`string`, optional

The bulk likelihood grade your client saw for this BIN, as returned in `bulkLikelihood` by `POST /enrollment-methods`. Send it whenever that response had one. Leave it out (or send `unchecked`) only when the response had no `bulkLikelihood` because it could not be determined; the request is then stored as `unchecked`.

One of: `proven`, `high`, `medium`, `low`, `none`, `unchecked`. A value the SDK does not know yet is passed through as a plain string.

### `binInfo`

[NetworkBulkConfirmationCreateParamsBinInfo](NetworkBulkConfirmationCreateParamsBinInfo.md), optional

### `company`

[NetworkBulkCompanyParams](NetworkBulkCompanyParams.md), required

### `cardAdmin`

[NetworkBulkConfirmationCreateParamsCardAdmin](NetworkBulkConfirmationCreateParamsCardAdmin.md), required

### `bankContact`

[NetworkBulkBankContactParams](NetworkBulkBankContactParams.md), optional

### `customerReferenceId`

`string`, optional

Optional. Your own id for this confirmation, echoed back on the resource.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
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
  "customerReferenceId": "ledgerly-customer-8842"
}
```

[Back to top](#) · [Back to README](../README.md)


