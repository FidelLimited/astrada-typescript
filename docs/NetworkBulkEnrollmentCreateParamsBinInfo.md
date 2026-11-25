
# NetworkBulkEnrollmentCreateParamsBinInfo

Optional. The issuer details shown to the person submitting the kickoff, in
the `GET /bin-lookup` vocabulary. Stored as a display snapshot only; every
field is optional.


## Properties

### `issuerName`

`string`, optional

The name of the issuing bank.

### `issuerCountry`

`string`, optional

The country of the issuing bank, ISO 3166 alpha-3. Stored as sent; its format is not checked. `GET /bin-lookup` gives it as ISO 3166 alpha-3.

### `type`

`string`, optional

The card type, for example `COMMERCIAL`.

### `fundingType`

`string`, optional

The card funding type, for example `CREDIT`.

[Back to top](#) · [Back to README](../README.md)


