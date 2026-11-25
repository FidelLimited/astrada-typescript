
# UnprocessableEntity

## Properties

### `detail`

`string`, required

### `title`

`string`, required

One of: `Unprocessable Entity`. A value the SDK does not know yet is passed through as a plain string.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Unprocessable Entity",
  "detail": "The state of a bulk enrolled subscription cannot be changed"
}
```

[Back to top](#) · [Back to README](../README.md)


