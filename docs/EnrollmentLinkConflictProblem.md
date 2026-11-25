
# EnrollmentLinkConflictProblem

## Properties

### `title`

`string`, required

One of: `Conflict`. A value the SDK does not know yet is passed through as a plain string.

### `detail`

`string`, required

### `code`

`string`, required

One of: `ENROLLMENT_LINKS_NOT_ENABLED`, `CARD_ENROLLMENT_OFF`. A value the SDK does not know yet is passed through as a plain string.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Conflict",
  "detail": "Enrollment links are not enabled for this account.",
  "code": "ENROLLMENT_LINKS_NOT_ENABLED"
}
```

[Back to top](#) · [Back to README](../README.md)


