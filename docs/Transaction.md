
# Transaction

## Properties

### `_links`

[TransactionLinks](TransactionLinks.md), required

### `_embedded`

[TransactionEmbedded](TransactionEmbedded.md), optional

### `acceptor`

[TransactionAcceptor](TransactionAcceptor.md), required

### `cardId`

`string`, required, can be `null`

The unique identifier of the card related to this entity. Null only for bank-sourced transactions on a bank account with no linked cards (the card-less unified feed); the `_links.card` link is omitted in that case.

### `cardholderBillingCurrency`

`string`, required

The currency of the country of issuance following ISO 4217 alpha-3 format.

### `cardholderBillingHoldAmount`

`number`, required

This amount models the hold on the cardholder account, in the card's issued currency, that occurs after an authorization and before a financial message. This amount will change as both authorization and financial messages are added to the Transaction in order to reflect the remaining hold amount. A pending refund (an approved credit authorization) reflects its signed amount here as a negative hold while pending, released back to zero once the clearing financial message settles it.

### `cardholderBillingSettledAmount`

`number`, required

The settled amount models the bottom line impact to the customer's bank statement in the card's issued currency. This amount will change as financial messages are added to the Transaction.

### `controlAccountNumber`

`string`, optional

The American Express Basic Control Account number associated with the card, as provided by the Amex real-time authorization (RTA) and General Ledger (GL) feeds. Treat it as an opaque string and keep it exactly as returned: it is numeric today and may contain leading zeros, so never parse it as a number. Present only on American Express transactions where the feed supplies it; absent for all other networks and for transactions ingested before this field was introduced. It is never returned as null or an empty string. This is an account identifier, not a card number.

### `descriptor`

`string`, required, can be `null`

Cleansed merchant name.

### `id`

`string`, required

The unique identifier of this transaction entity.

### `network`

`string`, required

The card network that processed this payment.

### `networkBulkFeedId`

`string`, optional

The network bulk feed that delivered this transaction's first feed-carrying message (SmartData for Mastercard, VBDS for Visa clearing). Present only on transactions sourced from a network bulk feed; absent otherwise. Transactions delivered before the producers began emitting this field, or never delivered via a bulk feed, omit it entirely. It is never returned as null or an empty string.

### `subaccountId`

`string`, required

The unique identifier of the subaccount related to this entity.

### `supersededMessageIds`

`Array<string>`, optional

Message ids from `_links.messages` whose financial contribution was superseded during aggregation; typically duplicate deliveries of the same clearing across network feeds, or a provisional bank-sourced settlement replaced by the network clearing. Superseded messages stay listed in `_links.messages` for audit but do not count toward the settled amounts, so exclude them when deriving totals from individual messages (or better, use `transactionSettledAmount` / `cardholderBillingSettledAmount` directly). Always a subset of `_links.messages`. Each payload carries the full current set (a snapshot, not a delta). Transactions last updated before this field was introduced report `[]` until their next update.

### `status`

`string`, required

A semantic understanding of the state of the transaction within the transaction lifecycle. `VOIDED` is not final: a clearing can still arrive after a full reversal, and the transaction then moves to `SETTLED` at the cleared amount. [Learn More](https://docs.astrada.co/docs/transaction)

One of: `PENDING`, `VOIDED`, `DECLINED`, `SETTLED`. A value the SDK does not know yet is passed through as a plain string.

### `transactionCurrency`

`string`, required

The currency in which the transaction took place following ISO 4217 alpha-3 format.

### `transactionHoldAmount`

`number`, required

This amount models the hold on the cardholder account, in the currency the transaction was conducted in, that occurs after an authorization and before a financial message. This amount will change as both authorization and financial messages are added to the Transaction in order to reflect the remaining hold amount. A pending refund (an approved credit authorization) reflects its signed amount here as a negative hold while pending, released back to zero once the clearing financial message settles it.

### `transactionOccurrenceDate`

`Date`, required, can be `null`

The UTC date when the transaction took place, following ISO 8601 format (YYYY-MM-DD). This is a date-only field with no time component.

### `transactionSettledAmount`

`number`, required

The settled amount models the bottom line impact to the customer's bank statement in the currency the transaction was conducted in. This amount will change as financial messages are added to the Transaction.

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
    "card": {
      "href": "/cards/4d1ff59f-4286-4209-9662-92e174193562"
    },
    "subaccount": {
      "href": "/subaccounts/c6d5e036-361e-4773-a514-b9496cf2d2b5"
    },
    "self": {
      "href": "/transactions/8697df0c-9011-47ca-a52b-8d2a7a4ad903"
    },
    "messages": [
      {
        "href": "/transaction-messages/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b4"
      },
      {
        "href": "/transaction-messages/934f8701-53e3-4a2b-a000-6bb52195d2ea"
      }
    ]
  },
  "acceptor": {
    "city": "LONDON",
    "country": "GBR",
    "mcc": "5734",
    "state": "LND"
  },
  "cardId": "4d1ff59f-4286-4209-9662-92e174193562",
  "cardholderBillingCurrency": "GBP",
  "cardholderBillingHoldAmount": 0,
  "cardholderBillingSettledAmount": 0.81,
  "createdAt": "2024-05-01T06:41:43.810Z",
  "descriptor": "Uber",
  "id": "8697df0c-9011-47ca-a52b-8d2a7a4ad903",
  "network": "MASTERCARD",
  "status": "SETTLED",
  "subaccountId": "c6d5e036-361e-4773-a514-b9496cf2d2b5",
  "supersededMessageIds": [],
  "transactionCurrency": "USD",
  "transactionHoldAmount": 0,
  "transactionOccurrenceDate": "2024-05-01",
  "transactionSettledAmount": 1,
  "updatedAt": "2024-05-02T08:41:43.810Z"
}
```

[Back to top](#) · [Back to README](../README.md)


