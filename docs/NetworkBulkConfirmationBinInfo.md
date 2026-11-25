
# NetworkBulkConfirmationBinInfo

A snapshot of the issuer details shown to the person who asked for the confirmation,
kept for display only. `null` when the request carried none. The fields use the
`GET /bin-lookup` vocabulary.


## Properties

### `issuerName`

`string`, optional, can be `null`

The name of the issuing bank.

### `issuerCountry`

`string`, optional, can be `null`

The country of the issuing bank, ISO 3166-1 alpha-3.

### `type`

`string`, optional, can be `null`

The card type, for example `COMMERCIAL`.

### `fundingType`

`string`, optional, can be `null`

The card funding type, for example `CREDIT`.

[Back to top](#) · [Back to README](../README.md)


