
# CardVerificationUnlockParams

## Properties

### `cardId`

`string`, required

Identifier of the card whose attempt lockout to clear.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "cardId": "00cdba2d-01f0-46bb-b34a-c76d9699e991"
}
```

[Back to top](#) · [Back to README](../README.md)


