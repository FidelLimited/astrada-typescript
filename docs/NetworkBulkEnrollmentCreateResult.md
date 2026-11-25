
# NetworkBulkEnrollmentCreateResult

## Properties

### `_links`

[NetworkBulkEnrollmentSummaryLinks](NetworkBulkEnrollmentSummaryLinks.md), required

### `id`

`string`, required

The unique identifier of the open kickoff.

### `subaccountId`

`string`, required

The subaccount of the open kickoff, the same as the request's.

### `network`

`string`, required

The network of the open kickoff, the same as the request's.

One of: `AMEX`, `MASTERCARD`, `VISA`. A value the SDK does not know yet is passed through as a plain string.

### `bin`

`string`, required

The leading 6 to 11 digits of the card that opened the kickoff, exactly as submitted.

### `binInfo`

[NetworkBulkEnrollmentBinInfo](NetworkBulkEnrollmentBinInfo.md), required, can be `null`

### `company`

[NetworkBulkEnrollmentCompany](NetworkBulkEnrollmentCompany.md), required

### `cardAdmin`

[NetworkBulkEnrollmentCardAdmin](NetworkBulkEnrollmentCardAdmin.md), required

### `bankContact`

[NetworkBulkBankContact](NetworkBulkBankContact.md), required, can be `null`

### `cardCountBand`

`string`, required, can be `null`

The estimated number of cards in the program, as a band. `null` when not provided.

One of: `1-50`, `51-250`, `251-1000`, `1001-5000`, `5001-25000`, `25000+`, ``. A value the SDK does not know yet is passed through as a plain string.

### `outreach`

`string`, required

Who contacts the bank. `astrada`: Astrada reaches out to the bank, copying the
company and the card admin. `self`: the company emails the bank itself and copies
onboarding@astrada.co so Astrada can guide the setup.


One of: `astrada`, `self`. A value the SDK does not know yet is passed through as a plain string.

### `consent`

[NetworkBulkEnrollmentConsent](NetworkBulkEnrollmentConsent.md), required

### `state`

`string`, required

The open kickoff's state. `requested`: it was created less than 90 days ago and no
feed has been registered against it yet. `feed-created`: a feed was registered against
it and that feed is live.


One of: `requested`, `feed-created`. A value the SDK does not know yet is passed through as a plain string.

### `networkBulkFeedId`

`string`, required, can be `null`

The live feed registered against the open kickoff. `null` while the kickoff is `requested`.

### `customerReferenceId`

`string`, required, can be `null`

An optional id passed by the customer to associate a context with the enrollment. `null` when not provided.

### `createdAt`

`Date`, required

When the open kickoff was created, in UTC, following ISO 8601 format. Its 90-day window counts from this time.

### `updatedAt`

`Date`, required

Date and time when this resource was last updated, in UTC, following ISO 8601 format.

### `alreadyOpen`

`boolean`, required

Always `true`. Tells this summary apart from the full enrollment.

### `requestId`

`string`, required, can be `null`

The `requestId` this request sent, or `null` when it sent none. It is never the
`requestId` the open kickoff was stored under.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/network-bulk-enrollments/9c1f0c4e-2f0e-4a9c-9a1b-0c1d2e3f4a5b"
    }
  },
  "id": "9c1f0c4e-2f0e-4a9c-9a1b-0c1d2e3f4a5b",
  "subaccountId": "24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c",
  "network": "MASTERCARD",
  "bin": "51075500",
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
  "cardCountBand": "251-1000",
  "outreach": "astrada",
  "consent": {
    "acceptedAt": "2026-09-10T21:30:00.000Z",
    "version": "kickoff-consent-v1"
  },
  "state": "requested",
  "networkBulkFeedId": null,
  "customerReferenceId": "ledgerly-customer-8842",
  "createdAt": "2026-09-10T21:30:00.000Z",
  "updatedAt": "2026-09-10T21:30:00.000Z"
}
```

[Back to top](#) · [Back to README](../README.md)


