
# SimulateTransactionAccepted

## Properties

### `messageId`

`string`, required

The id of the transaction message that was published. Once it has been
processed, use `GET /transaction-messages/{transactionMessageId}` to
retrieve it, or `GET /transactions?transactionMessageId=` to find the
transaction it created or updated.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "messageId": "9b2e6c4a-1f3d-4e8b-9a7c-2d5f8e1b4c6a"
}
```

[Back to top](#) · [Back to README](../../README.md)


