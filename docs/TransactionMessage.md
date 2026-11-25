
# TransactionMessage

## Properties

### `_links`

[TransactionMessageLinks](TransactionMessageLinks.md), required

### `id`

`string`, required

The unique identifier of this transaction message entity.

### `acceptor`

[TransactionMessageAcceptor](TransactionMessageAcceptor.md), required

### `approvalCode`

`string`, optional, can be `null`

Unique code that authorizes a transaction message, sent by the card issuer/issuer-processor when approving a transaction. Always absent on bank-only messages; no card authorization occurred (its absence, together with the `bank_`-prefixed transactionReference, is the marker of a bank-only message).

### `traceId`

`string`, optional, can be `null`

The American Express trace identifier for this transaction message. Populated only when `network` is `AMEX`, where it is the reconciliation handle used to match against Amex settlement data. Amex real-time authorizations are not observed to carry an `approvalCode`, so `traceId` is the identifier to reconcile on. The value is a numeric string and leading zeros are significant, so treat it as an opaque string and never parse it as a number; its width can vary by Amex feed, so do not assume a fixed length. Null on every other network; Visa and Mastercard authorizations correlate on `transactionReference` / `approvalCode` instead. Treat null as normal, not as an error.

### `discountAmount`

`number`, optional, can be `null`

The issuer-reported discount that the merchant netted from the settled amount. Today this is populated for Corpay fleet fuel coupons on Mastercard SmartData clearings. It is a positive amount in the message's `cardholderBillingCurrency`. The parent transaction's `cardholderBillingSettledAmount` is grossed up to the pre-discount statement figure, so `discountAmount` is informational. Use it to reconcile the settled amount against the receipt or fuel-card statement, which shows the discounted figure. Null on every other message, including authorizations and clearings with no coupon. Treat null as normal, not as an error.

### `bankData`

[TransactionMessageBankData](TransactionMessageBankData.md), optional, can be `null`

### `cardId`

`string`, required, can be `null`

The unique identifier of the card related to this entity. Null only for bank-sourced messages from a bank account with no linked cards (the card-less unified feed).

### `cardType`

`string`, optional

The type of card used in the transaction. The only available value is 'virtual' and the field is nullable.

### `cardholderBillingAmount`

`number`, required

The amount in the currency of the country of issuance. The transactionAmount and cardholderBillingAmount values may differ in case of international transactions.

### `cardholderBillingCurrency`

`string`, required

The currency of the country of issuance following ISO 4217 alpha-3 format.

### `createdDateTime`

`Date`, required

Date and time when this resource was created, in UTC, following ISO 8601 format.

### `dateTime`

`TransactionDateTime`, required: `raw`, the local date and time parts, `offsetMinutes` (`null` when the API sent no offset) and `toDate()` (null without an offset). See "Reading transaction times" in the README.

The timestamp of the transaction message (e.g. authorization, movement of funds, etc) following ISO 8601 format. The timezone depends on the card network:
- **Visa/Amex**: UTC (suffixed with `Z`)
- **Mastercard**: Local time zone of the merchant/acquirer (no `Z` suffix, timezone offset not included)

The presence or absence of the `Z` suffix indicates whether the value is UTC or local time.

Some messages carry an end-of-day value rather than the moment they happened:
- **Visa clearings** (`FINL_ADVC`, `FINL_REQU`): the settlement date at `23:59:59Z`.
- **Visa reversals** (`AUTH_ADVC` with a negative `transactionAmount`): `23:59:59Z` on the UTC day Astrada received the reversal.
- **Amex clearings**: the business date at `23:59:59Z`.

For the date of the purchase itself, use the transaction's `transactionOccurrenceDate`.


### `messageType`

`string`, required

The type of operation this transaction message represents. [Learn More](https://docs.astrada.co/docs/transaction-message)

One of: `AUTH_ADVC`, `AUTH_REQU`, `FINL_ADVC`, `CBCK_ADVC`, `FINL_REQU`. A value the SDK does not know yet is passed through as a plain string.

### `network`

`string`, required

The rail that processed this payment. `OPEN_BANKING` marks a bank-sourced message with no card-network involvement (the concrete provider is in `bankData.provider`).

One of: `VISA`, `MASTERCARD`, `AMEX`, `OPEN_BANKING`. A value the SDK does not know yet is passed through as a plain string.

### `subaccountId`

`string`, required

The unique identifier of the subaccount related to this entity.

### `result`

`string`, required

The issuer's decision on whether the transaction message is authorized.

One of: `APPROVED`, `DECLINED`. A value the SDK does not know yet is passed through as a plain string.

### `transactionAmount`

`number`, required

The amount of the transaction message in the currency it was charged in. In the case of international transactions, the transactionAmount and cardholderBillingAmount may differ due to being in different currencies.

### `transactionCurrency`

`string`, required

The currency in which the transaction took place following ISO 4217 alpha-3 format.

### `transactionReference`

`string`, required

Identification of the Transaction that has to be unique for a time period.

### `transactionType`

`string`, required, can be `null`

Types provide additional information about the transaction message, describing the effect that it had on the customer account and the type of accounts affected. [Learn More](https://docs.astrada.co/docs/transaction-message)

One of: `DEBIT_01`, `DEBIT_02`, `DEBIT_19`, `CREDIT_01`, `CREDIT_02`, `CREDIT_08`, `INQUIRY_01`, `TRANSFER_01`, `ADMIN_01`, `ADMIN_02`. A value the SDK does not know yet is passed through as a plain string.

### `transmissionDateTime`

`Date`, required, can be `null`

The timestamp of when the transaction message was received by the data source (i.e. Mastercard or Visa), in UTC, following ISO 8601 format.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

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

[Back to top](#) · [Back to README](../README.md)


