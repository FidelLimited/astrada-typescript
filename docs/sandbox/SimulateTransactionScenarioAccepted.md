
# SimulateTransactionScenarioAccepted

## Properties

### `transactions`

[Array<SimulateTransactionScenarioTransaction>](SimulateTransactionScenarioTransaction.md), required

The transactions created by the scenario. Each entry lists the
ids of the transaction messages published for that transaction;
use `GET /transaction-messages/{transactionMessageId}` to
retrieve each message once it has been processed.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "transactions": [
    {
      "messageIds": [
        "9b2e6c4a-1f3d-4e8b-9a7c-2d5f8e1b4c6a",
        "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
      ]
    }
  ]
}
```

[Back to top](#) · [Back to README](../../README.md)


