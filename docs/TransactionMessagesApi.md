# TransactionMessagesApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getRawTransactionMessage**](#getrawtransactionmessage) | **GET** /transaction-messages/{transactionMessageId}/raw | Retrieve the raw transaction message |
| [**getTransactionMessage**](#gettransactionmessage) | **GET** /transaction-messages/{transactionMessageId} | Retrieve transaction message |


<a id="getrawtransactionmessage"></a>
## getRawTransactionMessage

`getRawTransactionMessage(params): Promise<RawTransactionMessage>`

Retrieve the raw transaction message

Return a raw transaction message by the transaction message unique identifier.

### Example

```ts
import { Configuration, TransactionMessagesApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new TransactionMessagesApi(config);

const result = await api.getRawTransactionMessage({
  transactionMessageId: '9340721f-bdce-4afa-bd9d-26cceb9d2176',
});
console.log(result);
```

### Parameters


- **transactionMessageId** (`string`, required)

### Returns

[RawTransactionMessage](RawTransactionMessage.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/transaction-messages/80b08eeb-c4cc-4e5c-8d0b-15bc2e04b4dc/raw"
    },
    "message": {
      "href": "/transaction-messages/80b08eeb-c4cc-4e5c-8d0b-15bc2e04b4dc"
    }
  },
  "raw": {
    "messageTypeIndicator": "0100",
    "primaryAccountNumber": "444444******0000",
    "processingCode": "000000",
    "transactionAmount": "000000000145",
    "transmissionDateTime": "0425000000",
    "systemsTraceAuditNumber": "537254",
    "localTransactionTime": "133945",
    "localTransactionDate": "0424",
    "merchantType": "5734",
    "acquiringInstitutionIdentificationCode": "KWGBYTEI4FL0QQQ",
    "retrievalReferenceNumber": "IWVQ22_2024-04-24",
    "authorizationIdentificationResponse": "537254",
    "responseCode": "00",
    "cardAcceptorTerminalIdentification": "TERMINAL01",
    "cardAcceptorIdentificationCode": "KWGBYTEI4FL0QQQ",
    "cardAcceptorNameLocation": "Uber                    LONDON      LNDGBR",
    "transactionCurrencyCode": "840",
    "cardholderBillingAmount": "000000000118",
    "cardholderBillingCurrency": "826",
    "networkManagementInformationCode": "MASTERCARD"
  }
}
```

### Scopes

`transaction-messages:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Raw transaction message retrieved successfully |
| **204** | The request has been successfully processed and there is no content to return |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="gettransactionmessage"></a>
## getTransactionMessage

`getTransactionMessage(params): Promise<TransactionMessage>`

Retrieve transaction message

Return a transaction message by its unique identifier, including details about the transaction's type and relevant transactional data.

Transaction messages are also delivered embedded in the transaction payload: `transaction.created` and `transaction.updated` webhook payloads include a projection of every correlated message under `_embedded.messages[]`, each entry carrying its financial fields plus a per-message `superseded` marker. See [Event Types](https://docs.astrada.co/reference/event-types) for the full payload structure.


### Example

```ts
import { Configuration, TransactionMessagesApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new TransactionMessagesApi(config);

const result = await api.getTransactionMessage({
  transactionMessageId: '9340721f-bdce-4afa-bd9d-26cceb9d2176',
});
console.log(result);
```

### Parameters


- **transactionMessageId** (`string`, required)

### Returns

[TransactionMessage](TransactionMessage.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_links": {
    "self": {
      "href": "/transaction-messages/80b08eeb-c4cc-4e5c-8d0b-15bc2e04b4dc"
    },
    "raw": {
      "href": "/transaction-messages/80b08eeb-c4cc-4e5c-8d0b-15bc2e04b4dc/raw"
    }
  },
  "acceptor": {
    "acquirerId": null,
    "city": "LONDON",
    "country": "GBR",
    "id": "KWGBYTEI4FL0QQQ",
    "mcc": "5734",
    "name": "Uber",
    "state": "LND"
  },
  "accountId": "a49fdf13-62ce-4704-80bf-82f317cc215e",
  "approvalCode": "537254",
  "bankData": null,
  "cardId": "bf4d1e23-0f5a-42a7-81f2-bc66f392a98c",
  "cardType": "virtual",
  "cardholderBillingAmount": 1.18,
  "cardholderBillingCurrency": "GBP",
  "createdDateTime": "2024-04-26T01:41:22.544Z",
  "dateTime": "2024-04-24T13:39:45Z",
  "discountAmount": null,
  "id": "80b08eeb-c4cc-4e5c-8d0b-15bc2e04b4dc",
  "messageType": "FINL_ADVC",
  "network": "MASTERCARD",
  "result": "APPROVED",
  "subaccountId": "cb4d801e-a10a-4f42-b9de-1c51685ffd8a",
  "traceId": null,
  "transactionAmount": 1.45,
  "transactionCurrency": "USD",
  "transactionReference": "IWVQ22_2024-04-24",
  "transactionType": "DEBIT_01",
  "transmissionDateTime": "2024-04-25T00:00:00.000Z"
}
```

### Scopes

`transaction-messages:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Transaction message retrieved successfully |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

