
# SubaccountAmexProduct

The American Express data Astrada has turned on for your account, the same on every subaccount. Only Astrada sets it; `null` means neither is on. `clearing` is transactions from American Express's card file; `realTimeAuth` is American Express authorizations as they happen (US only, by approval).


## Properties

### `clearing`

[SubaccountAmexProductClearing](SubaccountAmexProductClearing.md), optional, can be `null`

### `realTimeAuth`

[SubaccountAmexProductRealTimeAuth](SubaccountAmexProductRealTimeAuth.md), optional, can be `null`

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "clearing": {
    "enabled": true
  },
  "realTimeAuth": null
}
```

[Back to top](#) · [Back to README](../README.md)


