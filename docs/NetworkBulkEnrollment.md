
# NetworkBulkEnrollment

## Properties

### `_links`

[NetworkBulkEnrollmentLinks](NetworkBulkEnrollmentLinks.md), required

### `id`

`string`, required

The unique identifier of this network bulk enrollment.

### `subaccountId`

`string`, required

The unique identifier of the subaccount the card program enrolls into.

### `network`

`string`, required

The network of the card program.

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

`requested` until a network bulk feed is registered with this enrollment's id,
then `feed-created`. Astrada does not set `cancelled` today. A kickoff that is never
followed by a feed keeps `requested`, also after its 90 days (see
`POST /network-bulk-enrollments`).


One of: `requested`, `feed-created`, `cancelled`. A value the SDK does not know yet is passed through as a plain string.

### `networkBulkFeedId`

`string`, required, can be `null`

The network bulk feed registered with this enrollment's id on `POST /network-bulk-feeds`. `null` until then.

### `customerReferenceId`

`string`, required, can be `null`

An optional id passed by the customer to associate a context with the enrollment. `null` when not provided.

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


