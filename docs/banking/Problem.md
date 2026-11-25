
# Problem

An error body in the problem details format (`application/problem+json`). Every error response without its own fields uses it.


## Properties

### `type`

`string`, optional

### `instance`

`string`, optional

### `detail`

`string`, required

### `title`

`string`, required

A short summary of the status, for example `Unauthorized`, `Forbidden`, `Not Found` or `Internal Server Error`. Each response's example shows its value.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Unauthorized",
  "detail": "Authentication credentials were either missing or incorrect."
}
```

[Back to top](#) · [Back to README](../../README.md)


