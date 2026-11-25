
# BinLookup

## Properties

### `bin`

`string`, required

The 6-digit Bank Identification Number (BIN) the answer was found under. It is always
the first 6 digits of the `bin` you sent, even when you sent more; the rest of your
input is never echoed back.


### `network`

`string`, required

The card network (e.g., VISA, MASTERCARD, AMERICAN_EXPRESS). American Express is `AMERICAN_EXPRESS` here; other endpoints spell it `AMEX`.

### `type`

`string`, optional, can be `null`

The card type (e.g., COMMERCIAL, CORPORATE, CONSUMER, SMALL_BUSINESS )

One of: `COMMERCIAL`, `CORPORATE`, `CONSUMER`, `SMALL_BUSINESS`, ``. A value the SDK does not know yet is passed through as a plain string.

### `fundingType`

`string`, required

The card funding type (e.g., prepaid, debit, credit)

One of: `CREDIT`, `DEBIT`, `PREPAID`. A value the SDK does not know yet is passed through as a plain string.

### `cardCategory`

`string`, optional, can be `null`

The card's commercial classification, carried through from the BIN reference dataset.
More specific than `type`: it separates `FLEET`, `PURCHASING` and `GIFT` cards that
`type` reports as `COMMERCIAL` or `CORPORATE`, and it is populated for many BINs where
`type` is absent. `UNKNOWN` means the reference data does not classify the BIN; treat
it as "not determined", not as "consumer".


One of: `CONSUMER`, `BUSINESS`, `CORPORATE`, `FLEET`, `PURCHASING`, `GIFT`, `PREPAID`, `SPECIALTY`, `UNKNOWN`, ``. A value the SDK does not know yet is passed through as a plain string.

### `cardFundingType`

`string`, optional, can be `null`

How the card is funded, carried through from the BIN reference dataset. Broader than
`fundingType`: it separates `CHARGE` cards (which `fundingType` reports as `CREDIT`)
and `GIFT` cards (which `fundingType` reports as `PREPAID` or `DEBIT`). `UNKNOWN` means
the reference data does not classify the BIN.


One of: `CREDIT`, `CHARGE`, `DEBIT`, `PREPAID`, `GIFT`, `UNKNOWN`, ``. A value the SDK does not know yet is passed through as a plain string.

### `issuerName`

`string`, optional

The name of the issuing bank. For a Mastercard card, this can be more specific to the
digits sent than the 6-digit BIN's issuer name (see `issuerCountry`).


### `issuerCountry`

`string`, optional, can be `null`

The country of the issuing bank following ISO 3166 alpha-3. May be `null` when the
BIN is known but the reference data does not record its issuing country (an unknown
BIN returns 404, not `null`).

For a Mastercard card, this is checked against the digits sent and can differ from what
the first 6 digits alone would give, because one BIN can be shared by issuers in several
countries. Send more digits (up to 11) for a more precise issuer country; never send the
full card number.


### `issuerCountryAmbiguous`

`boolean`, optional

Present, and always `true`, only when the digits sent match card ranges in more than
one country. `issuerCountry` is then the 6-digit BIN's value and may not be this card's
country; `issuerCountryCandidates` lists the possible countries and `warnings` explains
what to do. With fewer than 11 digits, sending more can resolve it. Omitted in every
other case.


### `issuerCountryCandidates`

`Array<string>`, optional

The possible issuer countries (ISO 3166 alpha-3, sorted, at least two) when the digits
sent match card ranges in more than one country. Present only together with
`issuerCountryAmbiguous: true`.


### `issuerRegion`

`string`, optional, can be `null`

The region of the issuing bank, derived from the issuer country. `EU` covers Europe
and `MEA` covers the Middle East & Africa. These are separate buckets; there is no
combined `EMEA` value. `UNKNOWN` means the issuer country is missing or not mapped
to a region; treat it as "not determined". It always matches the returned
`issuerCountry`.


One of: `NA`, `LATAM`, `EU`, `APAC`, `MEA`, `UNKNOWN`, ``. A value the SDK does not know yet is passed through as a plain string.

### `warnings`

[Array<BinLookupWarning>](BinLookupWarning.md), optional

Notes about the answer that a caller may want to act on. Present only when there is
something to report, and never empty. Branch on `code`; `message` is for people and
may change.

Today the only code is `ISSUER_COUNTRY_NOT_CONFIRMED`, sent together with
`issuerCountryAmbiguous: true` when the digits sent match card ranges in more than one
country. With fewer than 11 digits, sending more digits (up to 11) may confirm the
issuer country. With 11 digits, the issuer country could not be confirmed.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "bin": "411111",
  "network": "VISA",
  "type": "COMMERCIAL",
  "fundingType": "CREDIT",
  "cardCategory": "PURCHASING",
  "cardFundingType": "CREDIT",
  "issuerName": "Example Bank",
  "issuerCountry": "USA",
  "issuerRegion": "NA"
}
```

[Back to top](#) · [Back to README](../README.md)


