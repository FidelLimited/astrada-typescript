
# EnrollmentLinkCreateValidationProblem

## Properties

### `title`

`string`, required

One of: `Bad Request`. A value the SDK does not know yet is passed through as a plain string.

### `detail`

`string`, required

### `code`

`string`, optional

One of: `LINK_NAME_NOT_ALLOWED`. A value the SDK does not know yet is passed through as a plain string.

### `errors`

[Array<ValidationProblemItem>](ValidationProblemItem.md), optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "title": "Bad Request",
  "detail": "Request failed validation"
}
```

[Back to top](#) · [Back to README](../README.md)


