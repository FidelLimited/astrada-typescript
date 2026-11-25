
# RawTransactionMessage

## Properties

### `_links`

[RawTransactionMessageLinks](RawTransactionMessageLinks.md), required

### `raw`

`object`, required

The raw payload from the network that originated the underlying transaction message (will vary by network and message).

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

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

[Back to top](#) · [Back to README](../README.md)


