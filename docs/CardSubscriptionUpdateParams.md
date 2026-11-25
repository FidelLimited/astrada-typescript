
# CardSubscriptionUpdateParams

## Properties

### `state`

`string`, optional

One of: `deactivated`. A value the SDK does not know yet is passed through as a plain string.

### `deactivationReason`

[CardSubscriptionDeactivationReason](CardSubscriptionDeactivationReason.md), optional

Optional reason for the deactivation. Only accepted together with `state: deactivated`;
sending it on its own returns `400`. Returned in the `deactivationReason` field of the card subscription.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "state": "deactivated",
  "deactivationReason": "cardholder_offboarded"
}
```

[Back to top](#) · [Back to README](../README.md)


