
# Conflict

## Properties

### `detail`

`string`, required

### `title`

`string`, optional

One of: `Conflict`. A value the SDK does not know yet is passed through as a plain string.

### `currentValue`

`string`, optional

Current value for the property causing the conflict

### `requestedValue`

`string`, optional

Requested value for the property causing the conflict

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Conflict",
  "detail": "The resource state does not allow this operation",
  "currentValue": "expired",
  "requestedValue": "deactivated"
}
```

[Back to top](#) · [Back to README](../README.md)


