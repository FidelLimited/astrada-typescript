# BinLookupApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**lookupBin**](#lookupbin) | **GET** /bin-lookup | Lookup card information by BIN |


<a id="lookupbin"></a>
## lookupBin

`lookupBin(params): Promise<BinLookup>`

Lookup card information by BIN

Retrieve card information such as network, type, and issuing bank by providing the card's
BIN (Bank Identification Number): the first 6 to 11 digits of the card number. Never send
the full card number; more than 11 digits is rejected with `400`.

The card details are found under the first 6 digits. One 6-digit BIN can be shared by
issuers in several countries, so for a Mastercard card looked up with 6 to 11 digits,
Astrada also runs a more precise issuer-country check on the digits sent. That check can
return a different `issuerCountry`, `issuerRegion` and `issuerName` than the first 6
digits alone would. Send more digits (up to 11) for a more precise issuer country; never
send the full card number.

When the digits sent match card ranges in more than one country, the response keeps the
6-digit values and adds `issuerCountryAmbiguous`, `issuerCountryCandidates`, and a
`warnings` entry with code `ISSUER_COUNTRY_NOT_CONFIRMED`. In every other case none of
these three fields is present.

Lookups for every other network are unaffected. If the precise check gives no answer, the
request still succeeds with the 6-digit values. In sandbox the precise check is not run,
so sandbox responses never include these fields.


### Example

```ts
import { Configuration, BinLookupApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new BinLookupApi(config);

const result = await api.lookupBin({
  bin: '55891900000',
});
console.log(result);
```

### Parameters


- **bin** (`string`, required): The first 6 to 11 digits of the card number. Send digits only, and never the full card
number. Input that is shorter than 6 digits, longer than 11 digits, or contains anything
other than digits is rejected with `400`; longer input is not truncated.

For a Mastercard card, send more digits (up to 11) for a more precise issuer country. 11
digits gives the most precise answer.


### Returns

[BinLookup](BinLookup.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

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

### Scopes

`cards:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The `bin` is not 6 to 11 digits (too short, too long, or not digits only).  |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

