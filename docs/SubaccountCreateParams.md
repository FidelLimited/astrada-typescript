
# SubaccountCreateParams

## Properties

### `name`

`string`, required

The name of the subaccount

### `configurations`

[CreateSubaccountConfigurations](CreateSubaccountConfigurations.md), required

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "name": "Subaccount A",
  "configurations": {
    "VISA": {
      "countries": [
        "USA",
        "CAN"
      ]
    },
    "MASTERCARD": {
      "countries": [
        "USA"
      ]
    }
  }
}
```

[Back to top](#) · [Back to README](../README.md)


