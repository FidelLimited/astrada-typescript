
# EnrollmentMethodsResultBinInfo

Best-effort card metadata for the looked-up BIN, resolved server-side. Present only when the issuer name is known and omitted otherwise; the other fields are best-effort and may each be omitted even when `binInfo` is present. Lets integrators read this data without the `cards:read` scope that `GET /bin-lookup` requires (it rides on this endpoint's `enrollment-methods:write` scope); the SDK surfaces it on the bulk-enrollment success payload.

## Properties

### `issuerName`

`string`, required

The issuing bank's name for this BIN.

### `issuerCountry`

`string`, optional

The country of the issuing bank following ISO 3166-1 alpha-3, for example `USA`. Omitted when the reference data does not record it.

### `type`

`string`, optional

The card type (e.g., COMMERCIAL, CORPORATE, CONSUMER, SMALL_BUSINESS). Omitted when the reference data does not classify the BIN.

One of: `COMMERCIAL`, `CORPORATE`, `CONSUMER`, `SMALL_BUSINESS`. A value the SDK does not know yet is passed through as a plain string.

### `fundingType`

`string`, optional

The card funding type (e.g., prepaid, debit, credit). Omitted when the reference data does not classify the BIN.

One of: `CREDIT`, `DEBIT`, `PREPAID`. A value the SDK does not know yet is passed through as a plain string.

### `cardCategory`

`string`, optional

The card's classification, with the values of `cardCategory` on `GET /bin-lookup`. More specific than `type`, and set for many BINs where `type` is omitted. `UNKNOWN` means the card data does not classify the BIN. Omitted when there is no value. For Mastercard it is present only when the response falls back to stored card data.

One of: `CONSUMER`, `BUSINESS`, `CORPORATE`, `FLEET`, `PURCHASING`, `GIFT`, `PREPAID`, `SPECIALTY`, `UNKNOWN`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../README.md)


