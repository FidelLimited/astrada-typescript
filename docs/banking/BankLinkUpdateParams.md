
# BankLinkUpdateParams

## Properties

### `state`

`string`, required

The target state for the bank link. Only `completed` is accepted.

One of: `completed`. A value the SDK does not know yet is passed through as a plain string.

### `consent`

[BankLinkConsent](BankLinkConsent.md), optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "state": "completed"
}
```

[Back to top](#) · [Back to README](../../README.md)


