
# ValidationProblem

A `400 Bad Request` body. `errors`, when present, lists each problem found in the request.


## Properties

### `detail`

`string`, required

### `title`

`string`, required

A short summary of the status, `Bad Request` on this response.

### `errors`

[Array<ValidationProblemItem>](ValidationProblemItem.md), optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Bad Request",
  "detail": "Request object failed validation."
}
```

[Back to top](#) · [Back to README](../README.md)


