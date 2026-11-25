
# BinLookupValidationProblem

## Properties

### `detail`

`string`, required

### `title`

`string`, required

### `errors`

[Array<BinLookupValidationProblemItem>](BinLookupValidationProblemItem.md), optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Bad Request",
  "detail": "Request parameters are invalid",
  "errors": [
    {
      "instance": "/bin",
      "title": "Invalid Parameter",
      "detail": "bin must be between 6 and 11 digits"
    }
  ]
}
```

[Back to top](#) · [Back to README](../README.md)


