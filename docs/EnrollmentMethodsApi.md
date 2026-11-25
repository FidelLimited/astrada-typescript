# EnrollmentMethodsApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getEnrollmentMethods**](#getenrollmentmethods) | **POST** /enrollment-methods | List the available enrollment methods given a card BIN |


<a id="getenrollmentmethods"></a>
## getEnrollmentMethods

`getEnrollmentMethods(params): Promise<EnrollmentMethodsResult>`

List the available enrollment methods given a card BIN

List the available enrollment methods given a card BIN.

The Unified Enrollment SDK v2 calls this endpoint for each card: when a person presses **Continue** on the card number screen, with the first 8 to 11 digits they typed (8 by default), and on an employee page that opens on the card form, once 8 digits are typed there. It sends the session's `subaccountId` with the digits, and asks again with the digits alone when that answers `400` or `403`. It routes the session from the answer together with `GET /bin-lookup`. The SDK token therefore needs `enrollment-methods:write`. If your own backend calls it, send up to 11 digits for the most precise answer.

Send `subaccountId` to ask whether that subaccount can enroll this card one at a time with `POST /card-subscriptions`. The response then adds `singleDecision`, from the single-enrollment controls that create runs for the subaccount, and `singleEligible` and `availableEnrollmentMethods` follow it. Create also checks the `country` sent with the card; this request has no country, so `singleDecision` does not cover that check. Without `subaccountId`, the response is about the card alone and no subaccount is read.

When Mastercard's live card data is temporarily unavailable, the response falls back to Astrada's stored card data instead of failing, and `binInfo` comes from that stored data. `bulkLikelihood` is then capped at `medium`, except for BINs with proven bulk history, which stay `proven`, so `network-bulk` is then offered only for those proven BINs. When nothing decides the grade, `bulkLikelihood` is omitted and `unavailable` lists it; `singleEligible` is then `true` and `availableEnrollmentMethods` is `["cardholder-single"]`, unless `singleDecision` refuses the card. Retry later for a full answer.

### Example

```ts
import { Configuration, EnrollmentMethodsApi } from '@astrada.co/ts-astrada-sdk';
import { EnrollmentMethodsParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new EnrollmentMethodsApi(config);

const result = await api.getEnrollmentMethods({
  enrollmentMethodsParams: EnrollmentMethodsParamsFromJSON({
  "bin": "42424242"
}),
});
console.log(result);
```

### Parameters


- **enrollmentMethodsParams** ([EnrollmentMethodsParams](EnrollmentMethodsParams.md), required)

### Returns

[EnrollmentMethodsResult](EnrollmentMethodsResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "availableEnrollmentMethods": [
    "cardholder-single"
  ],
  "bulkLikelihood": "none",
  "singleEligible": true
}
```

### Scopes

`enrollment-methods:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Successful operation |
| **400** | The request failed validation, for example a `bin` that is not 6 to 11 digits or a `subaccountId` that is not a UUID. A `subaccountId` that is not one of your account\'s subaccounts also gets `400`, with the detail `Given subaccount is not valid`. |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **413** | Content Too Large |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

