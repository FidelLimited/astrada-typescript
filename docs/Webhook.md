
# Webhook

Astrada's Webhook resource.

## Properties

### `_links`

[SelfLinks](SelfLinks.md), required

### `id`

`string`, required

### `url`

`string`, required

### `description`

`string`, required, can be `null`

### `eventTypes`

`Array<string>`, required

One of: `cardsubscription.created`, `cardsubscription.updated`, `cardholder.updated`, `transaction.created`, `transaction.updated`, `transactionmessage.created`, `networkbulkfeed.statechanged`, `enrichment.merchant.created`, `banklink.completed`, `bankaccount.state_changed`, `banktransaction.created`, `banktransaction.deleted`, `transaction.match.created`, `transaction.match.deleted`. A value the SDK does not know yet is passed through as a plain string.

### `subaccountId`

`string`, required

### `createdAt`

`Date`, required

Date and time when this resource was created, in UTC, following ISO 8601 format.

### `updatedAt`

`Date`, required

Date and time when this resource was last updated, in UTC, following ISO 8601 format.

### `enabled`

`boolean`, optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/webhooks/3a45ba7f-8d8f-4f6a-86a5-a17ea0328241"
    }
  },
  "id": "3a45ba7f-8d8f-4f6a-86a5-a17ea0328241",
  "url": "https://example-api.com/path",
  "description": "Example of Webhook description",
  "eventTypes": [
    "transactionmessage.created"
  ],
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "createdAt": "2023-12-19T14:45:00Z",
  "updatedAt": "2023-12-19T14:45:00Z",
  "enabled": true
}
```

[Back to top](#) · [Back to README](../README.md)


