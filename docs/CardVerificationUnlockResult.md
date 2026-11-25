
# CardVerificationUnlockResult

## Properties

### `unlocked`

`boolean`, required

Always `true` on success.

### `cleared`

`boolean`, required

Whether an active lock actually existed and was cleared. `false`
when the card had no active lock (the idempotent no-op case).


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "unlocked": true,
  "cleared": true
}
```

[Back to top](#) · [Back to README](../README.md)


