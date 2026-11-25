
# TransactionList

## Properties

### `_links`

[PageLinks](PageLinks.md), required

### `_embedded`

[TransactionListEmbedded](TransactionListEmbedded.md), required

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/transactions"
    }
  },
  "_embedded": {
    "transactions": [
      {
        "_links": {
          "messages": [
            {
              "href": "/transaction-messages/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b4"
            },
            {
              "href": "/transaction-messages/934f8701-53e3-4a2b-a000-6bb52195d2ea"
            }
          ],
          "card": {
            "href": "/subaccounts/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b6"
          },
          "subaccount": {
            "href": "/subaccounts/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b5"
          },
          "self": {
            "href": "/transactions/f4b24a0a-6a37-4ce3-8845-ddf0b604a9b4"
          }
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
        "networkBulkFeedId": "2fd4d402-b759-479c-87a6-58d85e345356",
        "status": "SETTLED",
        "subaccountId": "c6d5e036-361e-4773-a514-b9496cf2d2b5",
        "supersededMessageIds": [],
        "transactionCurrency": "USD",
        "transactionHoldAmount": 0,
        "transactionOccurrenceDate": "2024-05-01",
        "transactionSettledAmount": 1,
        "transactionType": "DEBIT_01",
        "updatedAt": "2024-05-02T08:41:43.810Z"
      }
    ]
  }
}
```

[Back to top](#) · [Back to README](../README.md)


