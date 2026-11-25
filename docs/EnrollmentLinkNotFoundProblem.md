
# EnrollmentLinkNotFoundProblem

## Properties

### `title`

`string`, required

One of: `Not Found`. A value the SDK does not know yet is passed through as a plain string.

### `detail`

`string`, required

### `code`

`string`, required

One of: `ENROLLMENT_LINK_NOT_FOUND`. A value the SDK does not know yet is passed through as a plain string.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Not Found",
  "detail": "Enrollment link with the given ID was not found.",
  "code": "ENROLLMENT_LINK_NOT_FOUND"
}
```

[Back to top](#) · [Back to README](../README.md)


