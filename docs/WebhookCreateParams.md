
# WebhookCreateParams

## Properties

### `url`

`string`, required

### `description`

`string`, optional

### `eventTypes`

`Array<string>`, required

One of: `cardsubscription.created`, `cardsubscription.updated`, `cardholder.updated`, `transaction.created`, `transaction.updated`, `transactionmessage.created`, `networkbulkfeed.statechanged`, `enrichment.merchant.created`, `banklink.completed`, `bankaccount.state_changed`, `banktransaction.created`, `banktransaction.deleted`, `transaction.match.created`, `transaction.match.deleted`. A value the SDK does not know yet is passed through as a plain string.

### `subaccountId`

`string`, required

### `enabled`

`boolean`, optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "url": "https://example-api.com/path",
  "description": "Example of Webhook description",
  "eventTypes": [
    "transactionmessage.created"
  ],
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5"
}
```

[Back to top](#) · [Back to README](../README.md)


