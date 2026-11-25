
# EnrollmentLinkForbiddenProblem

## Properties

### `title`

`string`, required

One of: `Forbidden`. A value the SDK does not know yet is passed through as a plain string.

### `detail`

`string`, required

### `code`

`string`, optional

One of: `LINK_SESSION_FORBIDDEN`. A value the SDK does not know yet is passed through as a plain string.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Forbidden",
  "detail": "An enrollment link session cannot call this route.",
  "code": "LINK_SESSION_FORBIDDEN"
}
```

[Back to top](#) · [Back to README](../README.md)


