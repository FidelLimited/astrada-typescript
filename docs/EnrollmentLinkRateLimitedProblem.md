
# EnrollmentLinkRateLimitedProblem

## Properties

### `title`

`string`, required

One of: `Too Many Requests`. A value the SDK does not know yet is passed through as a plain string.

### `detail`

`string`, required

### `code`

`string`, required

One of: `RATE_LIMITED`. A value the SDK does not know yet is passed through as a plain string.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Too Many Requests",
  "detail": "Too many requests. Retry later.",
  "code": "RATE_LIMITED"
}
```

[Back to top](#) · [Back to README](../README.md)


