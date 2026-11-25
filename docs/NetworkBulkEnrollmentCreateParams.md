
# NetworkBulkEnrollmentCreateParams

## Properties

### `requestId`

`string`, optional

Optional. Your idempotency key for this enrollment, unique per account. Repeating the
request with a `requestId` that was already used returns the stored enrollment, whole
and unchanged, with `200` instead of creating a second one with `201`. A request
without a `requestId` is never a replay: it creates a new enrollment unless its
program already has an open kickoff, which answers `200` with that kickoff's summary.


### `subaccountId`

`string`, required

The subaccount the card program enrolls into. Must belong to the calling account.

### `network`

`string`, required

The network of the card program.

One of: `AMEX`, `MASTERCARD`, `VISA`. A value the SDK does not know yet is passed through as a plain string.

### `bin`

`string`, required

The leading 6 to 11 digits of the card that opened the kickoff.

### `binInfo`

[NetworkBulkEnrollmentCreateParamsBinInfo](NetworkBulkEnrollmentCreateParamsBinInfo.md), optional

### `company`

[NetworkBulkCompanyParams](NetworkBulkCompanyParams.md), required

### `cardAdmin`

[NetworkBulkEnrollmentCreateParamsCardAdmin](NetworkBulkEnrollmentCreateParamsCardAdmin.md), required

### `bankContact`

[NetworkBulkBankContactParams](NetworkBulkBankContactParams.md), optional

### `cardCountBand`

`string`, optional

Optional. The estimated number of cards in the program, as a band. An estimate helps the bank size the file.

One of: `1-50`, `51-250`, `251-1000`, `1001-5000`, `5001-25000`, `25000+`. A value the SDK does not know yet is passed through as a plain string.

### `cardCount`

`number`, optional

Optional. The estimated number of cards in the program. When sent, it decides the stored `cardCountBand`, even if `cardCountBand` is also sent.

### `outreach`

`string`, required

Who contacts the bank. `astrada`: Astrada reaches out to the bank, copying the
company and the card admin. `self`: the company emails the bank itself and
copies onboarding@astrada.co so Astrada can guide the setup.


One of: `astrada`, `self`. A value the SDK does not know yet is passed through as a plain string.

### `consent`

[NetworkBulkEnrollmentCreateParamsConsent](NetworkBulkEnrollmentCreateParamsConsent.md), required

### `customerReferenceId`

`string`, optional

Optional. Your own id for this enrollment, echoed back on the resource.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "requestId": "3f8a1c52-7d4e-4b19-9c06-5e2b8d7a9f14",
  "subaccountId": "24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c",
  "network": "MASTERCARD",
  "bin": "51075500",
  "binInfo": {
    "issuerName": "Example Bank",
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
  "cardCountBand": "251-1000",
  "cardCount": 400,
  "outreach": "astrada",
  "consent": {
    "accepted": true,
    "version": "kickoff-consent-v2"
  },
  "customerReferenceId": "ledgerly-customer-8842"
}
```

[Back to top](#) · [Back to README](../README.md)


